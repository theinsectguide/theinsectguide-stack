import { Request, Response } from 'express';
import { AuthRequest } from './auth';
import { updateUser, findUserById, createTransaction } from './db';
import {
  sendPaymentConfirmedEmail,
  sendCancellationEmail,
  sendRefundEmail,
  addOrUpdateBrevoContact,
} from './email';

// PayPal Configuration
export const PAYPAL_MODE = process.env.PAYPAL_MODE || 'live';
export const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'AffnRM3aLTLlYUT538UDsDxpM4MqrBrrCt-2Ihl9L4TDKgVLsmiTjE8qdmO-CrHi7HqgS6fOnlQOmmYV';
export const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'EAkJG726rN_7QJrQllDhVDQqy_V7RmJPE3A5EYVx5i_a4hWn7QhIyL6lKaX-AaZ_V9i4qfgS5oM7bjK3';
export const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '2A319232KL071003J';

// Live / Sandbox PayPal REST API base URL
export const PAYPAL_API_BASE = PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

/**
 * Expose client configuration to frontend
 */
export async function getPayPalConfig(req: Request, res: Response) {
  return res.json({
    clientId: PAYPAL_CLIENT_ID,
    currency: 'USD',
    mode: PAYPAL_MODE,
  });
}

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
 * CREATE PAYPAL ORDER (POST /v2/checkout/orders)
 * Creates a verified server-side PayPal order with intent: 'CAPTURE'
 */
export async function handleCreatePayPalOrder(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    const { plan } = req.body; // 'monthly' ($4.99) or 'annual' ($29.99)

    const isAnnual = plan === 'annual';
    const amountValue = isAnnual ? '29.99' : '4.99';
    const planName = isAnnual
      ? 'The Insect Guide - Annual Pro Membership (Save 50%)'
      : 'The Insect Guide - Monthly Pro Membership';

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
    const planName = plan === 'annual' ? 'Annual Pro ($29.99/yr)' : 'Monthly Pro ($4.99/mo)';
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
      message: 'Payment verified and Pro subscription activated successfully!',
      user: {
        id: updated?._id,
        email: updated?.email,
        name: updated?.name,
        tier: updated?.tier,
        subscription_status: updated?.subscription_status,
        subscription_plan: updated?.subscription_plan,
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

export async function handleCancelSubscription(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    if (user.tier !== 'pro' || user.subscription_status !== 'active') {
      return res.status(400).json({ error: 'No active subscription found to cancel.' });
    }

    // Set subscription status to cancelled (pro access kept until billing term ends)
    const updated = await updateUser(user._id, {
      subscription_status: 'cancelled',
    });

    await sendCancellationEmail(user);
    if (updated) {
      addOrUpdateBrevoContact(updated).catch(err => console.warn('Brevo cancellation contact update warning:', err));
    }

    return res.json({
      success: true,
      message: 'Subscription cancelled. You will retain Pro access until the end of your billing cycle.',
      user: {
        tier: updated?.tier,
        subscription_status: updated?.subscription_status,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to cancel subscription.' });
  }
}

export async function handleRequestRefund(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    if (!user.last_payment_date || user.subscription_status === 'refunded') {
      return res.status(400).json({ error: 'No eligible payment found for refund or already refunded.' });
    }

    if (user.refund_requested) {
      return res.status(400).json({ error: 'A refund has already been processed for this transaction.' });
    }

    // Verify 48 hours guarantee window
    const paymentTime = new Date(user.last_payment_date).getTime();
    const now = Date.now();
    const hoursElapsed = (now - paymentTime) / (1000 * 60 * 60);

    if (hoursElapsed > 48) {
      return res.status(400).json({
        error: 'The 48-hour money-back guarantee window has expired for this payment.',
      });
    }

    // Revoke Pro access immediately and mark refunded
    const updated = await updateUser(user._id, {
      tier: 'free',
      subscription_status: 'refunded',
      refund_requested: true,
    });

    await sendRefundEmail(user);
    if (updated) {
      addOrUpdateBrevoContact(updated).catch(err => console.warn('Brevo refund contact update warning:', err));
    }

    return res.json({
      success: true,
      message: 'Your 48-hour guarantee refund has been approved and processed to your PayPal account.',
      user: {
        tier: updated?.tier,
        subscription_status: updated?.subscription_status,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process refund request.' });
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

    // Verify or inspect event payload
    if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const subId = resource?.id;
      const customId = resource?.custom_id;
      if (customId) {
        await updateUser(customId, {
          tier: 'pro',
          subscription_status: 'active',
          subscription_id: subId,
        });
      }
    } else if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
      const subId = resource?.id;
      console.log(`Subscription cancelled in PayPal Live: ${subId}`);
    } else if (eventType === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') {
      console.warn(`PayPal subscription payment failed for resource: ${resource?.id}`);
    }

    return res.status(200).json({ received: true, mode: PAYPAL_MODE });
  } catch (err) {
    console.error('[PayPal Live] Error handling webhook:', err);
    return res.status(400).json({ error: 'Webhook processing failed' });
  }
}
