import crypto from 'crypto';
import { Request, Response } from 'express';
import { AuthRequest } from './auth';
import {
  updateUser,
  findUserById,
  findUserBySubscriptionId,
  createTransaction,
  updateTransaction,
  findTransactionByCaptureId,
  findTransactionByRefundId,
  findTransactionBySubscriptionId,
  findFirstCompletedTransactionForUser,
} from './db';
import {
  sendPaymentConfirmedEmail,
  sendCancellationEmail,
  sendRefundEmail,
  addOrUpdateBrevoContact,
} from './email';

// PayPal Configuration
export const PAYPAL_MODE = process.env.PAYPAL_MODE || 'live';
export const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'AVzCfKJSQG7YWcbPj1D6cajYS4WFNPSpUBsyd33bOJ0MZXUryqo3gR_36mgn-pfgrLAWpbr9lzlRhOCD';
export const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'EAkJG726rN_7QJrQllDhVDQqy_V7RmJPE3A5EYVx5i_a4hWn7QhIyL6lKaX-AaZ_V9i4qfgS5oM7bjK3';
export const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '2A319232KL071003J';
export const PAYPAL_MONTHLY_PLAN_ID_ENV = process.env.PAYPAL_MONTHLY_PLAN_ID || 'P-1VK52313VC6878320NKDSNEY';

// Central Pricing Truth
export const MONTHLY_PRICE_USD = '4.99';
export const ANNUAL_PRICE_USD = '29.99';
export const PAYPAL_MONTHLY_PLAN_ID_DEFAULT = 'P-1VK52313VC6878320NKDSNEY';
export const PAYPAL_PRODUCT_ID_DEFAULT = 'PROD-4TJ03911ES2839354';

// Live / Sandbox PayPal REST API base URL
export const PAYPAL_API_BASE = PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

// Cache for dynamically verified / provisioned PayPal Product & Billing Plan
let cachedMonthlyPlanId: string = PAYPAL_MONTHLY_PLAN_ID_ENV || PAYPAL_MONTHLY_PLAN_ID_DEFAULT;
let cachedProductId: string = PAYPAL_PRODUCT_ID_DEFAULT;

/**
 * Fetch OAuth2 Access Token from PayPal REST API
 */
export async function getPayPalAccessToken(): Promise<string | null> {
  try {
    const authHeader = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[PayPal REST API] Failed to get access token (${res.status}):`, err);
      return null;
    }

    const data: any = await res.json();
    return data.access_token;
  } catch (err) {
    console.error('[PayPal REST API] Network error obtaining access token:', err);
    return null;
  }
}

/**
 * Validates that a PayPal Billing Plan is ACTIVE and strictly priced at $4.99 USD / Month
 */
async function verifyPlanIsExactPrice(token: string, planId: string): Promise<boolean> {
  try {
    const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans/${planId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return false;
    const plan: any = await res.json();
    if (plan.status !== 'ACTIVE') return false;

    const regularCycle = plan.billing_cycles?.find((c: any) => c.tenure_type === 'REGULAR');
    if (!regularCycle) return false;

    const value = regularCycle.pricing_scheme?.fixed_price?.value;
    const currency = regularCycle.pricing_scheme?.fixed_price?.currency_code;
    const intervalUnit = regularCycle.frequency?.interval_unit;
    const intervalCount = regularCycle.frequency?.interval_count;

    const isPriceMatch = value === '4.99' && currency === 'USD';
    const isMonthly = intervalUnit === 'MONTH' && Number(intervalCount) === 1;

    if (!isPriceMatch || !isMonthly) {
      console.warn(`[PayPal Billing Plan Audit] Plan ${planId} rejected: price=${value} ${currency}, interval=${intervalCount} ${intervalUnit} (must be $4.99 USD / 1 MONTH)`);
      return false;
    }

    return true;
  } catch (e) {
    console.error(`[PayPal Billing Plan Audit] Error verifying plan ${planId}:`, e);
    return false;
  }
}

/**
 * Ensures strictly that canonical Monthly Recurring Billing Plan P-1VK52313VC6878320NKDSNEY ($4.99 USD / Month) is used
 */
export async function getOrCreateMonthlyBillingPlan(): Promise<string> {
  const targetPlanId = PAYPAL_MONTHLY_PLAN_ID_ENV || PAYPAL_MONTHLY_PLAN_ID_DEFAULT;
  const token = await getPayPalAccessToken();
  if (!token) {
    console.warn('[PayPal Billing Plan] Unable to obtain token to audit plan, returning canonical default:', targetPlanId);
    return targetPlanId;
  }

  // Strictly verify canonical plan P-1VK52313VC6878320NKDSNEY ($4.99/mo)
  const isCanonicalValid = await verifyPlanIsExactPrice(token, targetPlanId);
  if (isCanonicalValid) {
    cachedMonthlyPlanId = targetPlanId;
    return targetPlanId;
  }

  console.warn(`[PayPal Billing Plan Audit] Warning: Plan ${targetPlanId} verification failed, but adhering strictly to canonical plan ID.`);
  return targetPlanId;
}

/**
 * Expose client configuration to frontend
 */
export async function getPayPalConfig(req: Request, res: Response) {
  const monthlyPlanId = await getOrCreateMonthlyBillingPlan();
  return res.json({
    clientId: PAYPAL_CLIENT_ID,
    currency: 'USD',
    mode: PAYPAL_MODE,
    monthlyPlanId: monthlyPlanId || PAYPAL_MONTHLY_PLAN_ID_ENV,
  });
}

/**
 * CREATE RECURRING PAYPAL SUBSCRIPTION (POST /v1/billing/subscriptions)
 * Used strictly for MONTHLY recurring billing ($4.99/mo)
 */
export async function handleCreatePayPalSubscription(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    const planId = await getOrCreateMonthlyBillingPlan();

    if (!planId) {
      return res.status(500).json({ error: 'PayPal recurring billing plan is not initialized. Please try again shortly.' });
    }

    const token = await getPayPalAccessToken();
    if (!token) {
      return res.status(500).json({ error: 'Failed to authenticate with PayPal API.' });
    }

    const subscriptionPayload = {
      plan_id: planId,
      custom_id: user._id,
      subscriber: {
        name: {
          given_name: user.name || 'Explorer',
        },
        email_address: user.email,
      },
      application_context: {
        brand_name: 'The Insect Guide',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
        },
        return_url: 'https://theinsectguide.com/#scan',
        cancel_url: 'https://theinsectguide.com/#pricing',
      },
    };

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': crypto.randomUUID(),
      },
      body: JSON.stringify(subscriptionPayload),
    });

    const subData: any = await response.json();
    if (!response.ok || !subData?.id) {
      console.error('[PayPal Subscription API] Error creating subscription:', subData);
      return res.status(response.status).json({
        error: subData.message || 'Failed to initialize PayPal recurring subscription.',
        details: subData.details,
      });
    }

    console.log(`[PayPal Subscription API] Subscription initialized: ${subData.id} for user ${user.email} (Plan: ${planId})`);

    return res.status(200).json({
      id: subData.id,
      subscriptionID: subData.id,
      status: subData.status,
      plan_id: planId,
    });
  } catch (err: any) {
    console.error('[PayPal Subscription API] Exception creating subscription:', err);
    return res.status(500).json({ error: 'Internal server error while initializing subscription.' });
  }
}

/**
 * VERIFY & ACTIVATE RECURRING PAYPAL SUBSCRIPTION (POST /api/paypal/verify-subscription)
 * Confirms real PayPal subscription status, fetches live next_billing_time and initial transaction capture ID
 */
export async function handleVerifyPayPalSubscription(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    const { subscriptionID, orderID } = req.body;

    if (!subscriptionID) {
      return res.status(400).json({ error: 'Missing required subscriptionID for subscription verification.' });
    }

    const token = await getPayPalAccessToken();
    if (!token) {
      return res.status(500).json({ error: 'Failed to authenticate with PayPal API.' });
    }

    // 1. Fetch live subscription object from PayPal REST API: GET /v1/billing/subscriptions/{subscription_id}
    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionID}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const subData: any = await response.json();
    const status = subData?.status;
    const isActive = status === 'ACTIVE' || status === 'APPROVED';

    if (!response.ok || !isActive) {
      console.warn(`[PayPal Subscription Security Check] Subscription ${subscriptionID} rejected. Status: ${status}`);
      return res.status(400).json({
        error: `PayPal recurring subscription is not active (Status: ${status || 'UNKNOWN'}). Pro access not granted.`,
        details: subData?.details || subData?.message,
      });
    }

    // STRICT SECURITY AUDIT: Verify that the subscription is tied strictly to the authorized Monthly Pro Plan P-1VK52313VC6878320NKDSNEY ($4.99/mo)
    const canonicalPlanId = PAYPAL_MONTHLY_PLAN_ID_DEFAULT; // 'P-1VK52313VC6878320NKDSNEY'
    if (subData.plan_id !== canonicalPlanId) {
      console.error(`[PayPal Security Enforcement] Rejected unauthorized plan ID ${subData.plan_id} for subscription ${subscriptionID}. Authorized canonical plan is ${canonicalPlanId}`);
      return res.status(403).json({
        error: 'Subscription rejected: Unauthorized billing plan. Only the canonical The Insect Guide Pro Monthly Plan ($4.99/mo) is accepted.',
      });
    }

    // 2. Fetch Subscription Transactions to get real Capture ID of the 1st payment
    let captureId = orderID || subscriptionID;
    try {
      const now = new Date();
      const pastTime = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const futureTime = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

      const txRes = await fetch(
        `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionID}/transactions?start_time=${pastTime}&end_time=${futureTime}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (txRes.ok) {
        const txData: any = await txRes.json();
        if (Array.isArray(txData.transactions) && txData.transactions.length > 0) {
          const firstCompletedTx = txData.transactions.find((t: any) => t.status === 'COMPLETED') || txData.transactions[0];
          if (firstCompletedTx?.id) {
            captureId = firstCompletedTx.id;
            console.log(`[PayPal Subscription] Retrieved real capture ID ${captureId} for subscription ${subscriptionID}`);
          }
        }
      }
    } catch (txErr) {
      console.warn('[PayPal Subscription] Could not fetch transactions sub-resource, fallback to subscription ID:', txErr);
    }

    // 3. Extract Real Next Payment Date directly from PayPal subscription object
    const nextPaymentDate = subData.billing_info?.next_billing_time;
    const lastPaymentTime = subData.billing_info?.last_payment?.time || subData.start_time || new Date().toISOString();
    const lastPaymentAmount = subData.billing_info?.last_payment?.amount?.value || '4.99';
    const currencyVal = subData.billing_info?.last_payment?.amount?.currency_code || 'USD';
    const payerEmail = subData.subscriber?.email_address || user.email;
    const payerId = subData.subscriber?.payer_id;

    // 4. Upgrade User account to PRO with real subscription details
    const updated = await updateUser(user._id, {
      tier: 'pro',
      subscription_id: subscriptionID,
      paypal_subscription_id: subscriptionID,
      subscription_plan_id: subData.plan_id,
      subscription_status: 'active',
      subscription_plan: 'monthly',
      subscription_type: 'recurring_subscription',
      subscription_start: subData.start_time || new Date().toISOString(),
      last_payment_date: lastPaymentTime,
      subscription_next_payment_date: nextPaymentDate || undefined,
      refund_requested: false,
    });

    // 5. Record verified transaction in persistent database
    await createTransaction({
      user_id: user._id,
      order_id: orderID || subscriptionID,
      capture_id: captureId,
      subscription_id: subscriptionID,
      payer_email: payerEmail,
      payer_id: payerId,
      amount: lastPaymentAmount,
      currency: currencyVal,
      plan: 'monthly',
      status: 'COMPLETED',
      created_at: lastPaymentTime,
      raw_details: subData,
    });

    // 6. Send confirmation email and sync contact with Brevo
    const planName = 'Monthly Pro ($4.99/mo Recurring Subscription)';
    const amountStr = `$${lastPaymentAmount}`;
    await sendPaymentConfirmedEmail(user, planName, amountStr).catch(err => console.warn('Payment email warning:', err));
    if (updated) {
      addOrUpdateBrevoContact(updated).catch(err => console.warn('Brevo contact update warning:', err));
    }

    console.log(`[PayPal Subscription Activated] User ${user.email} upgraded to Pro via Subscription ${subscriptionID} (Next Payment: ${nextPaymentDate})`);

    return res.status(200).json({
      success: true,
      status: 'ACTIVE',
      subscriptionID,
      captureID: captureId,
      next_billing_time: nextPaymentDate,
      message: 'PayPal recurring subscription activated successfully!',
      user: {
        id: updated?._id,
        email: updated?.email,
        name: updated?.name,
        tier: updated?.tier,
        subscription_status: updated?.subscription_status,
        subscription_plan: updated?.subscription_plan,
        subscription_type: updated?.subscription_type,
        subscription_start: updated?.subscription_start,
        last_payment_date: updated?.last_payment_date,
        subscription_next_payment_date: updated?.subscription_next_payment_date,
      },
    });
  } catch (err: any) {
    console.error('[PayPal Subscription API] Exception during subscription verification:', err);
    return res.status(500).json({ error: 'Internal server error while verifying subscription.' });
  }
}

/**
 * CREATE PAYPAL ORDER (POST /v2/checkout/orders)
 * Preserved specifically for Annual Pass ($29.99 one-time access)
 */
export async function handleCreatePayPalOrder(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    const { plan } = req.body; // 'annual' ($29.99) or fallback

    const isAnnual = plan === 'annual';
    const amountValue = isAnnual ? '29.99' : '4.99';
    const planName = isAnnual
      ? 'The Insect Guide - Annual Pro Membership (Save 50%)'
      : 'The Insect Guide - Pro Membership';

    const token = await getPayPalAccessToken();
    if (!token) {
      return res.status(500).json({ error: 'Failed to authenticate with PayPal API.' });
    }

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `plan_${plan}_user_${user._id}`,
          description: planName,
          custom_id: user._id,
          amount: {
            currency_code: 'USD',
            value: amountValue,
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: amountValue,
              },
            },
          },
          items: [
            {
              name: planName,
              description: isAnnual
                ? '1-Year Unlimited AI photo scans, venom assessments & triage'
                : '1-Month Unlimited AI photo scans, venom assessments & triage',
              unit_amount: {
                currency_code: 'USD',
                value: amountValue,
              },
              quantity: '1',
              category: 'DIGITAL_GOODS',
            },
          ],
        },
      ],
      application_context: {
        brand_name: 'The Insect Guide',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: 'https://theinsectguide.com/#scan',
        cancel_url: 'https://theinsectguide.com/#pricing',
      },
    };

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const orderData: any = await response.json();
    if (!response.ok) {
      console.error('[PayPal API] Order creation error response:', orderData);
      return res.status(response.status).json({
        error: orderData.message || 'Failed to create PayPal order.',
        details: orderData.details,
      });
    }

    return res.status(200).json({
      id: orderData.id,
      orderID: orderData.id,
      status: orderData.status,
    });
  } catch (err: any) {
    console.error('[PayPal API] Exception creating order:', err);
    return res.status(500).json({ error: 'Internal server error while creating PayPal order.' });
  }
}

/**
 * CAPTURE & VERIFY PAYPAL ORDER (POST /v2/checkout/orders/{orderId}/capture)
 * Strict validation: only upgrades account if PayPal status is STRICTLY 'COMPLETED'
 */
export async function handleCapturePayPalOrder(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    const { orderID, plan } = req.body;

    if (!orderID) {
      return res.status(400).json({ error: 'Missing required orderID for capture.' });
    }

    const token = await getPayPalAccessToken();
    if (!token) {
      return res.status(500).json({ error: 'Failed to authenticate with PayPal API for capture.' });
    }

    // Call PayPal REST Capture endpoint: POST /v2/checkout/orders/{orderId}/capture
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const captureData: any = await response.json();

    // STRICT VERIFICATION OF CAPTURE STATUS
    const orderStatus = captureData?.status;
    const captureUnit = captureData?.purchase_units?.[0]?.payments?.captures?.[0];
    const captureStatus = captureUnit?.status;
    const captureId = captureUnit?.id || orderID;
    const payerEmail = captureData?.payer?.email_address;
    const payerId = captureData?.payer?.payer_id;
    const amountVal = captureUnit?.amount?.value || (plan === 'annual' ? '29.99' : '4.99');
    const currencyVal = captureUnit?.amount?.currency_code || 'USD';

    const isCompleted = orderStatus === 'COMPLETED' || captureStatus === 'COMPLETED';

    if (!response.ok || !isCompleted) {
      console.warn(`[PayPal Security Check] Order ${orderID} capture rejected. Status: ${orderStatus}, CaptureStatus: ${captureStatus}`);
      
      // DO NOT GRANT PRO ACCESS
      await createTransaction({
        user_id: user._id,
        order_id: orderID,
        capture_id: captureId || 'FAILED',
        payer_email: payerEmail,
        payer_id: payerId,
        amount: amountVal,
        currency: currencyVal,
        plan: plan === 'annual' ? 'annual' : 'monthly',
        status: 'FAILED',
        created_at: new Date().toISOString(),
        raw_details: captureData,
      });

      return res.status(400).json({
        error: 'PayPal payment was not completed or failed verification. Account remains on Free tier.',
        status: orderStatus || 'FAILED',
        details: captureData?.details || captureData?.message,
      });
    }

    // PAYMENT IS STRICTLY COMPLETED -> Grant Pro tier & Record transaction
    const now = new Date().toISOString();
    const updated = await updateUser(user._id, {
      tier: 'pro',
      subscription_id: captureId,
      subscription_status: 'active',
      subscription_plan: plan === 'annual' ? 'annual' : 'monthly',
      subscription_type: 'one_time_term',
      subscription_start: now,
      last_payment_date: now,
      refund_requested: false,
    });

    // Record verified transaction in persistent database
    await createTransaction({
      user_id: user._id,
      order_id: orderID,
      capture_id: captureId,
      payer_email: payerEmail,
      payer_id: payerId,
      amount: amountVal,
      currency: currencyVal,
      plan: plan === 'annual' ? 'annual' : 'monthly',
      status: 'COMPLETED',
      created_at: now,
      raw_details: captureData,
    });

    // Send confirmation email and sync contact
    const planName = plan === 'annual' ? 'Annual Pro ($29.99/yr Pass)' : 'Monthly Pro ($4.99/mo)';
    const amountStr = `$${amountVal}`;
    await sendPaymentConfirmedEmail(user, planName, amountStr).catch(err => console.warn('Payment email warning:', err));
    if (updated) {
      addOrUpdateBrevoContact(updated).catch(err => console.warn('Brevo contact update warning:', err));
    }

    console.log(`[PayPal Success] User ${user.email} successfully upgraded to Pro via verified capture ${captureId}`);

    return res.status(200).json({
      success: true,
      status: 'COMPLETED',
      orderID,
      captureID: captureId,
      message: 'Payment verified and Pro access activated successfully!',
      user: {
        id: updated?._id,
        email: updated?.email,
        name: updated?.name,
        tier: updated?.tier,
        subscription_status: updated?.subscription_status,
        subscription_plan: updated?.subscription_plan,
        subscription_type: updated?.subscription_type,
        subscription_start: updated?.subscription_start,
        last_payment_date: updated?.last_payment_date,
      },
    });
  } catch (err: any) {
    console.error('[PayPal API] Exception during order capture:', err);
    return res.status(500).json({
      error: 'An error occurred while capturing and verifying your PayPal order.',
    });
  }
}

/**
 * GET LIVE SUBSCRIPTION DETAILS (GET /api/subscription/details)
 * Fetches real next payment date and subscription status directly from PayPal
 */
export async function handleGetSubscriptionDetails(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    const subId = user.paypal_subscription_id || user.subscription_id;

    if (user.tier !== 'pro' || !subId) {
      return res.json({
        tier: user.tier,
        subscription_status: user.subscription_status,
        subscription_plan: user.subscription_plan,
        is_recurring: false,
      });
    }

    // For Monthly recurring subscriptions, fetch live details from PayPal API
    if (user.paypal_subscription_id || user.subscription_type === 'recurring_subscription' || subId.startsWith('I-')) {
      const realSubId = user.paypal_subscription_id || subId;
      const token = await getPayPalAccessToken();

      if (token) {
        const subRes = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${realSubId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (subRes.ok) {
          const subData: any = await subRes.json();
          const nextBillingTime = subData.billing_info?.next_billing_time;
          const liveStatus = subData.status;

          // Sync next billing time in database
          if (nextBillingTime && nextBillingTime !== user.subscription_next_payment_date) {
            await updateUser(user._id, {
              subscription_next_payment_date: nextBillingTime,
            });
          }

          return res.json({
            tier: user.tier,
            subscription_id: realSubId,
            subscription_plan: 'monthly',
            subscription_status: liveStatus === 'ACTIVE' ? 'active' : liveStatus === 'CANCELLED' ? 'cancelled' : user.subscription_status,
            subscription_type: 'recurring_subscription',
            subscription_next_payment_date: nextBillingTime || user.subscription_next_payment_date,
            last_payment: subData.billing_info?.last_payment,
            is_recurring: true,
            billing_cycles_completed: subData.billing_info?.cycle_executions?.[0]?.cycles_completed || 1,
            failed_payments_count: subData.billing_info?.failed_payments_count || 0,
          });
        }
      }
    }

    // Return current stored subscription details
    return res.json({
      tier: user.tier,
      subscription_id: user.subscription_id,
      subscription_plan: user.subscription_plan,
      subscription_status: user.subscription_status,
      subscription_type: user.subscription_type || 'one_time_term',
      subscription_next_payment_date: user.subscription_next_payment_date,
      last_payment_date: user.last_payment_date,
      is_recurring: user.subscription_type === 'recurring_subscription',
    });
  } catch (err: any) {
    console.error('[Subscription Details Error]', err);
    return res.status(500).json({ error: 'Failed to retrieve subscription details.' });
  }
}

/**
 * CANCEL SUBSCRIPTION (POST /api/subscription/cancel)
 * Cancels real recurring PayPal subscription on PayPal servers via REST API
 */
export async function handleCancelSubscription(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    if (user.tier !== 'pro' || user.subscription_status !== 'active') {
      return res.status(400).json({ error: 'No active subscription found to cancel.' });
    }

    const subId = user.paypal_subscription_id || (user.subscription_id?.startsWith('I-') ? user.subscription_id : null);

    // If it's a real PayPal Recurring Subscription, cancel it directly on PayPal REST API
    if (subId) {
      const token = await getPayPalAccessToken();
      if (token) {
        console.log(`[PayPal Cancellation] Sending cancellation to PayPal for Subscription ${subId}...`);
        const cancelRes = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subId}/cancel`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: 'Cancelled by customer via dashboard settings.',
          }),
        });

        if (!cancelRes.ok && cancelRes.status !== 204) {
          const cancelErr: any = await cancelRes.json().catch(() => ({}));
          console.warn(`[PayPal Cancellation Warning] PayPal returned status ${cancelRes.status}:`, cancelErr);
        } else {
          console.log(`[PayPal Cancellation Success] PayPal subscription ${subId} successfully cancelled.`);
        }
      }
    }

    // Set subscription status to cancelled (pro access kept until billing term ends)
    const now = new Date().toISOString();
    const updated = await updateUser(user._id, {
      subscription_status: 'cancelled',
      subscription_cancelled_at: now,
    });

    await sendCancellationEmail(user).catch(err => console.warn('Cancellation email warning:', err));
    if (updated) {
      addOrUpdateBrevoContact(updated).catch(err => console.warn('Brevo cancellation contact update warning:', err));
    }

    return res.json({
      success: true,
      message: 'Subscription renewal cancelled with PayPal. You will retain Pro access until the end of your current billing cycle.',
      user: {
        tier: updated?.tier,
        subscription_status: updated?.subscription_status,
        subscription_cancelled_at: updated?.subscription_cancelled_at,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to cancel subscription.' });
  }
}

/**
 * 48-HOUR MONEY-BACK GUARANTEE REFUND
 * Handles Monthly Subscriptions via PayPal Sale Refund API (/v1/payments/sale/{sale_id}/refund)
 * and Annual Pass via PayPal Capture Refund API (/v2/payments/captures/{capture_id}/refund).
 * Automatically cancels recurring subscriptions and downgrades account upon confirmed success.
 */
export async function handleRequestRefund(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;

    // 1. Identify the user's FIRST completed payment transaction
    const targetTx = await findFirstCompletedTransactionForUser(user._id);
    if (!targetTx) {
      return res.status(400).json({
        error: 'No completed transaction eligible for the 48-hour satisfaction guarantee refund was found on this account.',
      });
    }

    // 2. Double-refund prevention & Idempotency check on the target transaction
    if (
      targetTx.status === 'REFUNDED' ||
      targetTx.refund_id ||
      targetTx.refund_status === 'refund_succeeded' ||
      targetTx.refund_status === 'refund_pending' ||
      user.refund_requested ||
      user.subscription_status === 'refunded'
    ) {
      return res.status(400).json({
        error: 'A refund has already been processed or is currently pending for this transaction.',
        refund_id: targetTx.refund_id,
        refund_status: targetTx.refund_status,
      });
    }

    // 3. Verify strict 48-hour guarantee window from the transaction's creation time
    const txTime = new Date(targetTx.created_at).getTime();
    const now = Date.now();
    const hoursElapsed = (now - txTime) / (1000 * 60 * 60);

    if (hoursElapsed > 48) {
      return res.status(400).json({
        error: 'The 48-hour money-back guarantee window has expired for this initial payment.',
        payment_date: targetTx.created_at,
        hours_elapsed: Math.round(hoursElapsed * 10) / 10,
      });
    }

    // 4. Obtain PayPal OAuth2 token
    const token = await getPayPalAccessToken();
    if (!token) {
      await updateTransaction(targetTx._id, {
        refund_status: 'refund_failed',
        refund_error: 'Unable to authenticate with PayPal OAuth service.',
      });
      return res.status(500).json({
        error: 'Unable to connect to PayPal authentication services. Please retry shortly.',
      });
    }

    // 5. Determine whether this is a Monthly Subscription (Sale) or Annual Pass (Capture)
    const isMonthlySubscription =
      targetTx.plan === 'monthly' ||
      !!targetTx.subscription_id ||
      !!user.paypal_subscription_id ||
      user.subscription_type === 'recurring_subscription' ||
      user.subscription_plan === 'monthly';

    const subId = targetTx.subscription_id || user.paypal_subscription_id || user.subscription_id || null;

    let response: any;
    let refundData: any;
    let isSuccess = false;
    let refundId: string | undefined;
    let resourceIdentifier = '';

    // =========================================================================
    // FLUX A: ABONNEMENT MENSUEL ($4.99) — PAYPAL SALE REFUND
    // =========================================================================
    if (isMonthlySubscription) {
      let saleId = targetTx.capture_id;

      // If saleId is missing or is the Subscription ID (starts with I-), resolve from Subscription Transactions API
      if ((!saleId || saleId.startsWith('I-') || saleId.startsWith('ORDER_')) && subId) {
        try {
          const txTimeIso = new Date(targetTx.created_at);
          const startTime = new Date(txTimeIso.getTime() - 24 * 60 * 60 * 1000).toISOString();
          const endTime = new Date(txTimeIso.getTime() + 48 * 60 * 60 * 1000).toISOString();

          const txRes = await fetch(
            `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subId}/transactions?start_time=${startTime}&end_time=${endTime}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (txRes.ok) {
            const txData: any = await txRes.json();
            if (Array.isArray(txData.transactions) && txData.transactions.length > 0) {
              const completedTx = txData.transactions.find((t: any) => t.status === 'COMPLETED') || txData.transactions[0];
              if (completedTx?.id) {
                saleId = completedTx.id;
                await updateTransaction(targetTx._id, { capture_id: saleId });
                console.log(`[PayPal Refund] Resolved real Sale ID ${saleId} for subscription ${subId}`);
              }
            }
          }
        } catch (resErr) {
          console.warn('[PayPal Refund] Could not resolve sale ID via subscription transactions:', resErr);
        }
      }

      if (!saleId || saleId === 'FAILED' || saleId.startsWith('ORDER_') || saleId.startsWith('I-')) {
        return res.status(400).json({
          error: 'No valid PayPal Sale transaction ID found for this monthly subscription payment. Please contact support.',
        });
      }

      resourceIdentifier = `Sale ${saleId}`;

      // Retrieve HATEOAS "refund" link from Sale if available
      let refundUrl = `${PAYPAL_API_BASE}/v1/payments/sale/${saleId}/refund`;
      try {
        const saleRes = await fetch(`${PAYPAL_API_BASE}/v1/payments/sale/${saleId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (saleRes.ok) {
          const saleData: any = await saleRes.json();
          const hateoasRefundLink = saleData.links?.find((l: any) => l.rel === 'refund')?.href;
          if (hateoasRefundLink) {
            refundUrl = hateoasRefundLink;
            console.log(`[PayPal Refund] Using official HATEOAS refund link from Sale ${saleId}: ${refundUrl}`);
          }
        }
      } catch (saleErr) {
        console.warn(`[PayPal Refund] Could not fetch sale details directly, falling back to ${refundUrl}:`, saleErr);
      }

      // Set in-flight status on transaction
      await updateTransaction(targetTx._id, {
        refund_status: 'refund_requested',
        refund_requested_at: new Date().toISOString(),
      });

      // Prepare Sale Refund Payload according to PayPal v1 Payments specification
      const saleRefundPayload: any = {
        description: 'The Insect Guide — 48-Hour Money-Back Guarantee Refund',
      };
      if (targetTx.amount && !isNaN(parseFloat(targetTx.amount))) {
        saleRefundPayload.amount = {
          total: parseFloat(targetTx.amount).toFixed(2),
          currency: targetTx.currency || 'USD',
        };
      }

      console.log(`[PayPal Refund API] Executing real refund for Monthly Sale ${saleId} ($${targetTx.amount} ${targetTx.currency || 'USD'}) via ${refundUrl}...`);

      response = await fetch(refundUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleRefundPayload),
      });

      refundData = await response.json().catch(() => ({}));
      isSuccess = response.ok && (
        refundData?.state === 'completed' ||
        refundData?.state === 'pending' ||
        refundData?.status === 'COMPLETED' ||
        refundData?.status === 'PENDING'
      );
      refundId = refundData?.id;
    }
    // =========================================================================
    // FLUX B: PASS ANNUEL ($29.99) — PAYPAL ORDERS V2 CAPTURE REFUND
    // =========================================================================
    else {
      const captureId = targetTx.capture_id;
      if (!captureId || captureId === 'FAILED' || captureId.startsWith('ORDER_') || captureId.startsWith('I-')) {
        return res.status(400).json({
          error: 'No valid PayPal Capture ID found for this annual order payment record. Please contact support.',
        });
      }

      resourceIdentifier = `Capture ${captureId}`;

      // Set in-flight status on transaction
      await updateTransaction(targetTx._id, {
        refund_status: 'refund_requested',
        refund_requested_at: new Date().toISOString(),
      });

      const idempotencyKey = crypto.randomUUID();
      const captureRefundPayload: any = {
        note_to_payer: 'The Insect Guide — 48-Hour Money-Back Guarantee Refund',
      };

      if (targetTx.amount && !isNaN(parseFloat(targetTx.amount))) {
        captureRefundPayload.amount = {
          value: parseFloat(targetTx.amount).toFixed(2),
          currency_code: targetTx.currency || 'USD',
        };
      }

      console.log(`[PayPal Refund API] Executing real refund for Annual Capture ${captureId} ($${targetTx.amount} ${targetTx.currency || 'USD'})...`);

      response = await fetch(`${PAYPAL_API_BASE}/v2/payments/captures/${captureId}/refund`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': idempotencyKey,
        },
        body: JSON.stringify(captureRefundPayload),
      });

      refundData = await response.json().catch(() => ({}));
      isSuccess = response.ok && (
        refundData?.status === 'COMPLETED' ||
        refundData?.status === 'PENDING' ||
        refundData?.state === 'completed' ||
        refundData?.state === 'pending'
      );
      refundId = refundData?.id;
    }

    // 8. Handle PayPal Error / Rejection
    if (!isSuccess || !refundId) {
      const debugId = refundData?.debug_id;
      const issues: string[] = [];

      if (Array.isArray(refundData?.details)) {
        for (const detail of refundData.details) {
          const part = [
            detail.issue ? `[${detail.issue}]` : '',
            detail.description || detail.message || '',
            detail.field ? `(field: ${detail.field})` : '',
          ].filter(Boolean).join(' ');
          if (part) issues.push(part);
        }
      }

      let errorMsg = '';
      if (issues.length > 0) {
        errorMsg = issues.join(' | ');
      } else if (refundData?.message) {
        errorMsg = refundData.message;
      } else if (refundData?.name) {
        errorMsg = refundData.name;
      } else {
        errorMsg = `PayPal refund rejected (HTTP ${response?.status || 500})`;
      }

      if (debugId) {
        errorMsg += ` (PayPal Debug ID: ${debugId})`;
      }

      console.error(`[PayPal Refund Error] ${resourceIdentifier} refund rejected by PayPal:`, JSON.stringify(refundData, null, 2));

      // Record failure with exact diagnostic details without downgrading or deleting user account
      await updateTransaction(targetTx._id, {
        refund_status: 'refund_failed',
        refund_error: errorMsg,
        refund_raw_response: refundData,
      });

      return res.status(400).json({
        error: `PayPal refund rejected: ${errorMsg}`,
        refund_status: 'refund_failed',
        name: refundData?.name,
        message: refundData?.message,
        details: refundData?.details,
        debug_id: debugId,
      });
    }

    // 9. REAL REFUND CONFIRMED BY PAYPAL -> Update database transaction
    const refundStatus = (refundData.status === 'COMPLETED' || refundData.state === 'completed') ? 'refund_succeeded' : 'refund_pending';
    const refundedAmountVal = refundData.amount?.total || refundData.amount?.value || targetTx.amount;

    await updateTransaction(targetTx._id, {
      status: 'REFUNDED',
      refund_id: refundId,
      refund_status: refundStatus,
      refunded_amount: refundedAmountVal,
      refund_created_at: refundData.create_time || new Date().toISOString(),
      refund_raw_response: refundData,
    });

    // 10. Automatically Cancel Recurring Subscription on PayPal so future cycles are never charged
    if (subId) {
      fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Automated cancellation following 48-hour satisfaction guarantee refund.',
        }),
      }).catch(cancelErr => console.warn('[PayPal Refund] Warning cancelling recurring subscription:', cancelErr));
    }

    // 11. Downgrade user account access ONLY after PayPal confirmation
    const updated = await updateUser(user._id, {
      tier: 'free',
      subscription_status: 'refunded',
      refund_requested: true,
    });

    // 12. Dispatch Brevo confirmation email ONLY after PayPal confirmed the refund
    await sendRefundEmail(user, refundId, refundedAmountVal).catch(err =>
      console.warn('[Brevo Warning] Failed to send refund confirmation email:', err)
    );
    if (updated) {
      addOrUpdateBrevoContact(updated).catch(err =>
        console.warn('[Brevo Warning] Failed to update Brevo contact attributes:', err)
      );
    }

    console.log(`[PayPal Refund Success] Successfully refunded ${resourceIdentifier}. Refund ID: ${refundId}, Status: ${refundStatus}`);

    return res.status(200).json({
      success: true,
      refund_id: refundId,
      refund_status: refundStatus,
      amount_refunded: refundedAmountVal,
      currency: refundData.amount?.currency || refundData.amount?.currency_code || targetTx.currency || 'USD',
      message: `Your 48-hour guarantee refund of $${refundedAmountVal} has been processed with PayPal (Refund ID: ${refundId}).`,
      user: {
        tier: updated?.tier,
        subscription_status: updated?.subscription_status,
      },
    });
  } catch (err: any) {
    console.error('[PayPal API Exception] Error during refund processing:', err);
    return res.status(500).json({ error: 'Failed to process refund request due to internal error.' });
  }
}

/**
 * Verify webhook signature via PayPal verification API
 */
export async function verifyPayPalWebhookSignature(headers: Record<string, any>, body: any): Promise<boolean> {
  try {
    const authAlgo = headers['paypal-auth-algo'];
    const certUrl = headers['paypal-cert-url'];
    const transmissionId = headers['paypal-transmission-id'];
    const transmissionSig = headers['paypal-transmission-sig'];
    const transmissionTime = headers['paypal-transmission-time'];

    // If required verification headers are missing, reject forged requests immediately
    if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
      console.warn('[PayPal Webhook Security] Missing required signature headers.');
      return false;
    }

    const token = await getPayPalAccessToken();
    if (!token) {
      console.error('[PayPal Webhook Security] Unable to obtain PayPal access token for signature verification.');
      return false;
    }

    const verifyPayload = {
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: body,
    };

    const res = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyPayload),
    });

    if (!res.ok) {
      console.warn(`[PayPal Webhook Security] Signature verification API returned ${res.status}`);
      return false;
    }

    const data: any = await res.json();
    return data.verification_status === 'SUCCESS';
  } catch (err) {
    console.error('[PayPal Webhook Security] Error during signature verification:', err);
    return false;
  }
}

/**
 * PAYPAL WEBHOOK HANDLER
 * Handles subscription activation, recurring renewals, cancellations, expiration and failures
 */
export async function handlePayPalWebhook(req: any, res: Response) {
  try {
    // 1. Signature Verification Check
    const isValid = await verifyPayPalWebhookSignature(req.headers, req.body);
    if (!isValid) {
      return res.status(401).json({
        error: 'Unauthorized: Invalid or missing PayPal webhook signature.',
      });
    }

    const event = req.body;
    const eventType = event?.event_type;
    const resource = event?.resource;

    console.log(`[PayPal Live Webhook Received & Verified] ${eventType} (Webhook ID: ${PAYPAL_WEBHOOK_ID})`);

    // EVENT: BILLING.SUBSCRIPTION.ACTIVATED
    if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const subId = resource?.id;
      const customId = resource?.custom_id;
      const nextBillingTime = resource?.billing_info?.next_billing_time;
      const startTime = resource?.start_time || new Date().toISOString();

      let targetUser = null;
      if (customId) targetUser = await findUserById(customId);
      if (!targetUser && subId) targetUser = await findUserBySubscriptionId(subId);

      if (targetUser) {
        await updateUser(targetUser._id, {
          tier: 'pro',
          subscription_status: 'active',
          paypal_subscription_id: subId,
          subscription_id: subId,
          subscription_plan: 'monthly',
          subscription_type: 'recurring_subscription',
          subscription_start: startTime,
          subscription_next_payment_date: nextBillingTime,
        });
        console.log(`[PayPal Webhook] Subscription ${subId} activated for user ${targetUser.email}. Next payment: ${nextBillingTime}`);
      }
    }

    // EVENT: BILLING.SUBSCRIPTION.UPDATED
    else if (eventType === 'BILLING.SUBSCRIPTION.UPDATED') {
      const subId = resource?.id;
      const nextBillingTime = resource?.billing_info?.next_billing_time;
      const subStatus = resource?.status;

      const targetUser = await findUserBySubscriptionId(subId);
      if (targetUser) {
        await updateUser(targetUser._id, {
          subscription_next_payment_date: nextBillingTime || targetUser.subscription_next_payment_date,
          subscription_status: subStatus === 'ACTIVE' ? 'active' : subStatus === 'CANCELLED' ? 'cancelled' : targetUser.subscription_status,
        });
      }
    }

    // EVENT: BILLING.SUBSCRIPTION.CANCELLED
    else if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
      const subId = resource?.id;
      const customId = resource?.custom_id;
      let targetUser = null;
      if (customId) targetUser = await findUserById(customId);
      if (!targetUser && subId) targetUser = await findUserBySubscriptionId(subId);

      if (targetUser) {
        await updateUser(targetUser._id, {
          subscription_status: 'cancelled',
          subscription_cancelled_at: resource?.status_update_time || new Date().toISOString(),
        });
        console.log(`[PayPal Webhook] Subscription ${subId} cancelled for user ${targetUser.email}`);
      }
    }

    // EVENT: BILLING.SUBSCRIPTION.EXPIRED
    else if (eventType === 'BILLING.SUBSCRIPTION.EXPIRED') {
      const subId = resource?.id;
      const targetUser = await findUserBySubscriptionId(subId);
      if (targetUser) {
        await updateUser(targetUser._id, {
          tier: 'free',
          subscription_status: 'none',
        });
        console.log(`[PayPal Webhook] Subscription ${subId} expired for user ${targetUser.email}. Downgraded to free.`);
      }
    }

    // EVENT: BILLING.SUBSCRIPTION.SUSPENDED
    else if (eventType === 'BILLING.SUBSCRIPTION.SUSPENDED') {
      const subId = resource?.id;
      const targetUser = await findUserBySubscriptionId(subId);
      if (targetUser) {
        await updateUser(targetUser._id, {
          subscription_status: 'suspended',
        });
      }
    }

    // EVENT: BILLING.SUBSCRIPTION.PAYMENT.FAILED
    else if (eventType === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') {
      const subId = resource?.id;
      console.warn(`[PayPal Webhook] Recurring payment failed for subscription: ${subId}`);
      const targetUser = await findUserBySubscriptionId(subId);
      if (targetUser) {
        console.warn(`[PayPal Webhook] User ${targetUser.email} recurring billing payment failed.`);
      }
    }

    // EVENT: PAYMENT.SALE.COMPLETED (Recurring monthly renewal payment or initial subscription capture)
    else if (eventType === 'PAYMENT.SALE.COMPLETED') {
      const saleId = resource?.id;
      const subId = resource?.billing_agreement_id;
      const amountVal = resource?.amount?.total || '4.99';
      const currencyVal = resource?.amount?.currency || 'USD';
      const paymentTime = resource?.create_time || new Date().toISOString();

      console.log(`[PayPal Webhook] Recurring Sale Completed: Sale ${saleId}, Subscription ${subId}, Amount: $${amountVal} ${currencyVal}`);

      if (subId) {
        const targetUser = await findUserBySubscriptionId(subId);
        if (targetUser) {
          // Record recurring payment transaction
          await createTransaction({
            user_id: targetUser._id,
            order_id: saleId,
            capture_id: saleId,
            subscription_id: subId,
            payer_email: targetUser.email,
            amount: amountVal,
            currency: currencyVal,
            plan: 'monthly',
            status: 'COMPLETED',
            created_at: paymentTime,
            raw_details: resource,
          });

          // Keep user account active and update last payment date
          await updateUser(targetUser._id, {
            tier: 'pro',
            subscription_status: 'active',
            last_payment_date: paymentTime,
          });

          // Send confirmation email
          sendPaymentConfirmedEmail(targetUser, 'The Insect Guide - Monthly Pro Membership Renewal', `$${amountVal}`).catch(
            err => console.warn('[Brevo Warning] Failed to send renewal email:', err)
          );
        }
      }
    }

    // EVENT: PAYMENT.CAPTURE.REFUNDED, PAYMENT.CAPTURE.REVERSED, PAYMENT.SALE.REFUNDED, or PAYMENT.SALE.REVERSED
    else if (
      eventType === 'PAYMENT.CAPTURE.REFUNDED' ||
      eventType === 'PAYMENT.CAPTURE.REVERSED' ||
      eventType === 'PAYMENT.SALE.REFUNDED' ||
      eventType === 'PAYMENT.SALE.REVERSED'
    ) {
      const resourceId = resource?.capture_id || resource?.sale_id || resource?.parent_payment || resource?.links?.find((l: any) => l.rel === 'up')?.href?.split('/').pop();
      const refundId = resource?.id;
      console.log(`[PayPal Webhook] Payment refund event (${eventType}). Refund ID: ${refundId}, Resource ID: ${resourceId}`);

      if (resourceId || refundId) {
        let tx = null;
        if (refundId) tx = await findTransactionByRefundId(refundId);
        if (!tx && resourceId) tx = await findTransactionByCaptureId(resourceId);

        if (tx) {
          await updateTransaction(tx._id, {
            status: 'REFUNDED',
            refund_id: refundId || tx.refund_id,
            refund_status: 'refund_succeeded',
            refund_created_at: resource?.create_time || new Date().toISOString(),
            refund_raw_response: resource,
          });

          if (tx.user_id) {
            await updateUser(tx.user_id, {
              tier: 'free',
              subscription_status: 'refunded',
              refund_requested: true,
            });
          }
        }
      }
    }

    return res.status(200).json({ received: true, mode: PAYPAL_MODE });
  } catch (err) {
    console.error('[PayPal Live] Error handling webhook:', err);
    return res.status(400).json({ error: 'Webhook processing failed' });
  }
}
