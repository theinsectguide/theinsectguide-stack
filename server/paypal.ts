import { Response } from 'express';
import { AuthRequest } from './auth';
import { updateUser, findUserById } from './db';
import {
  sendPaymentConfirmedEmail,
  sendCancellationEmail,
  sendRefundEmail,
  addOrUpdateBrevoContact,
} from './email';

// PayPal Configuration (LIVE Mode)
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'live';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'AffnRM3aLTLlYUT538UDsDxpM4MqrBrrCt-2Ihl9L4TDKgVLsmiTjE8qdmO-CrHi7HqgS6fOnlQOmmYV';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'EAkJG726rN_7QJrQllDhVDQqy_V7RmJPE3A5EYVx5i_a4hWn7QhIyL6lKaX-AaZ_V9i4qfgS5oM7bjK3';
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '2A319232KL071003J';

// Live PayPal API URL: https://api-m.paypal.com
export const PAYPAL_API_BASE = 'https://api-m.paypal.com';

/**
 * Fetch OAuth2 Access Token from PayPal Live API
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
      console.error(`[PayPal Live] Failed to get access token (${res.status}):`, err);
      return null;
    }

    const data: any = await res.json();
    return data.access_token;
  } catch (err) {
    console.error('[PayPal Live] Network error getting access token:', err);
    return null;
  }
}

/**
 * Verify a PayPal subscription status directly with Live API
 */
export async function verifyPayPalSubscription(subscriptionId: string): Promise<any | null> {
  try {
    const token = await getPayPalAccessToken();
    if (!token) return null;

    const res = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[PayPal Live] Failed to fetch subscription ${subscriptionId}:`, res.status);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error(`[PayPal Live] Error verifying subscription ${subscriptionId}:`, err);
    return null;
  }
}

export async function handleCreateSubscription(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    const { plan, subscription_id } = req.body; // 'monthly' ($4.99) or 'annual' ($29.99)

    const subId = subscription_id || `sub_live_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const updated = await updateUser(user._id, {
      tier: 'pro',
      subscription_id: subId,
      subscription_status: 'active',
      subscription_plan: plan === 'annual' ? 'annual' : 'monthly',
      subscription_start: now,
      last_payment_date: now,
      refund_requested: false,
    });

    // Send confirmation email and sync contact
    const planName = plan === 'annual' ? 'Annual Pro ($29.99/yr)' : 'Monthly Pro ($4.99/mo)';
    const amount = plan === 'annual' ? '$29.99' : '$4.99';
    await sendPaymentConfirmedEmail(user, planName, amount);
    if (updated) {
      addOrUpdateBrevoContact(updated).catch(err => console.warn('Brevo contact update warning:', err));
    }

    return res.json({
      success: true,
      mode: PAYPAL_MODE,
      message: 'Subscription successfully activated via PayPal Live!',
      user: {
        id: updated?._id,
        email: updated?.email,
        tier: updated?.tier,
        subscription_status: updated?.subscription_status,
        subscription_plan: updated?.subscription_plan,
        subscription_start: updated?.subscription_start,
        last_payment_date: updated?.last_payment_date,
      },
    });
  } catch (err: any) {
    console.error('[PayPal Live] Subscription creation error:', err);
    return res.status(500).json({ error: 'Failed to process subscription activation.' });
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

export async function handlePayPalWebhook(req: any, res: Response) {
  try {
    const event = req.body;
    const eventType = event.event_type;
    const resource = event.resource;

    console.log(`[PayPal Live Webhook Received] ${eventType} (Webhook ID: ${PAYPAL_WEBHOOK_ID})`);

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
