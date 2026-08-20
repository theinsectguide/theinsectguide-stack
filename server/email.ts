import { UserDoc } from './types';

const BREVO_SENDER_EMAIL = 'contact@theinsectguide.com';
const BREVO_SENDER_NAME = 'The Insect Guide';
const rawListId = (process.env.BREVO_LIST_ID || '2').replace(/[^0-9]/g, '');
const BREVO_LIST_ID = parseInt(rawListId, 10) || 2;

/**
 * Sends a transactional email using Brevo's v3 SMTP API.
 */
export async function sendEmailWithBrevo(
  toEmail: string,
  toName: string,
  subject: string,
  htmlContent: string
): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey || apiKey.trim().length < 5) {
    console.log(`[Brevo Simulation] Email to ${toEmail} | From: ${BREVO_SENDER_EMAIL} | Subject: "${subject}"`);
    return true;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: BREVO_SENDER_NAME,
          email: BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: toEmail.trim(),
            name: toName || 'Explorer',
          },
        ],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Brevo SMTP API Error:', response.status, err);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to send transactional email via Brevo:', error);
    return false;
  }
}

/**
 * Adds or updates a contact in Brevo Contacts List #2 with custom attributes.
 */
export async function addOrUpdateBrevoContact(user: {
  email: string;
  name?: string;
  region?: string;
  tier?: string;
  subscription_plan?: string;
  subscription_status?: string;
}): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey || apiKey.trim().length < 5) {
    console.log(`[Brevo Simulation] Synced contact ${user.email} into Brevo List #${BREVO_LIST_ID}`);
    return true;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email: user.email.toLowerCase().trim(),
        attributes: {
          FIRSTNAME: user.name || 'Explorer',
          REGION: user.region || 'UK',
          TIER: user.tier || 'free',
          PLAN: user.subscription_plan || 'none',
          STATUS: user.subscription_status || 'active',
        },
        listIds: [BREVO_LIST_ID],
        updateEnabled: true,
      }),
    });

    if (!response.ok && response.status !== 204 && response.status !== 201 && response.status !== 200) {
      const err = await response.text();
      console.warn('Brevo Contacts API response warning:', response.status, err);
      return false;
    }
    console.log(`[Brevo Contact] Successfully synced ${user.email} into List #${BREVO_LIST_ID}`);
    return true;
  } catch (error) {
    console.error('Failed to sync contact with Brevo List #2:', error);
    return false;
  }
}

// Common Email Container Wrapper
function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>The Insect Guide</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f0f1c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #1a1a2e; border: 1px solid #2e2e50; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <!-- Header -->
        <tr>
          <td style="padding: 28px 32px; background-color: #141424; border-bottom: 1px solid #2e2e50; text-align: left;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                    THE INSECT <span style="color: #10b981;">GUIDE</span>
                  </span>
                </td>
                <td align="right">
                  <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; background-color: #10b98120; border: 1px solid #10b98150; font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase;">
                    Official Dispatch
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Main Content -->
        <tr>
          <td style="padding: 32px 32px 24px 32px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 24px 32px; background-color: #141424; border-top: 1px solid #2e2e50; text-align: center;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">
              The Insect Guide &bull; Outdoor Safety, Identification & Medical Triage
            </p>
            <p style="margin: 0 0 12px 0; font-size: 11px; color: #64748b;">
              Need help? Contact our entomology support team at <a href="mailto:${BREVO_SENDER_EMAIL}" style="color: #2e86ff; text-decoration: none;">${BREVO_SENDER_EMAIL}</a>
            </p>
            <p style="margin: 0; font-size: 11px; color: #475569;">
              &copy; ${new Date().getFullYear()} <a href="https://theinsectguide.com" style="color: #94a3b8; text-decoration: none;">theinsectguide.com</a>. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * 1. Email de bienvenue (après inscription)
 */
export async function sendWelcomeEmail(user: UserDoc) {
  const subject = 'Welcome to The Insect Guide — Complete your Pro setup';
  const content = `
    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 16px 0;">
      Welcome to The Insect Guide, <span style="color: #10b981;">${user.name || 'Explorer'}</span>!
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin: 0 0 20px 0;">
      Your account has been successfully created for active monitoring in <strong>${user.region || 'UK'}</strong>.
    </p>

    <div style="background-color: #242442; border: 1px solid #3b3b66; border-left: 4px solid #10b981; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="color: #ffffff; font-size: 14px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
        Your Protection &amp; Field Tools:
      </h3>
      <ul style="margin: 0; padding-left: 18px; font-size: 13.5px; line-height: 1.8; color: #e2e8f0;">
        <li><strong style="color: #10b981;">Instant AI Scanner:</strong> Snap any insect or bite mark to instantly detect danger levels (0-10) and taxonomy.</li>
        <li><strong style="color: #e94560;">First Aid Protocols:</strong> Immediate triage instructions for venomous stings and allergic emergencies.</li>
        <li><strong style="color: #2e86ff;">GPS Observation Journal:</strong> Log personal sightings with coordinates on interactive satellite maps.</li>
      </ul>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 20px 0 10px 0;">
      To activate unlimited AI scanning and full emergency medical protocols, sign in below to confirm your Pro plan.
    </p>

    <!-- High-contrast Bulletproof CTA Button -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 16px 0;">
      <tr>
        <td align="center">
          <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
              <td align="center" style="background-color: #10b981; border-radius: 10px; padding: 15px 32px;">
                <a href="https://theinsectguide.com/#login" target="_blank" style="font-size: 15px; font-weight: 800; color: #ffffff !important; text-decoration: none; display: inline-block; letter-spacing: 0.2px;">
                  Sign In to Your Account &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0 0 10px 0;">
      Already selected your plan? Signing in will take you straight to your active field scanner.
    </p>
  `;

  return sendEmailWithBrevo(user.email, user.name, subject, emailWrapper(content));
}

/**
 * 2. Email de confirmation de paiement (Pro Monthly / Annual)
 */
export async function sendPaymentConfirmedEmail(user: UserDoc, planName: string, amount: string) {
  const subject = `Payment Confirmed: Your Insect Guide Pro is active (${planName})`;
  const content = `
    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 16px 0;">
      Thank You! Pro Membership Activated
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin: 0 0 20px 0;">
      We have confirmed your payment for <strong>The Insect Guide ${planName}</strong> (${amount}). Your account now has full Pro access enabled.
    </p>

    <div style="background-color: #242442; border: 1px solid #3b3b66; border-left: 4px solid #10b981; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="color: #10b981; font-size: 14px; font-weight: 700; margin: 0 0 10px 0;">
        Order &amp; Coverage Details
      </h3>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13.5px; color: #cbd5e1; line-height: 1.8;">
        <tr>
          <td style="color: #94a3b8;">Plan Type:</td>
          <td style="font-weight: 700; color: #ffffff; text-align: right;">${planName}</td>
        </tr>
        <tr>
          <td style="color: #94a3b8;">Amount Billed:</td>
          <td style="font-weight: 700; color: #ffffff; text-align: right;">${amount}</td>
        </tr>
        <tr>
          <td style="color: #94a3b8;">48-Hour Guarantee:</td>
          <td style="font-weight: 700; color: #10b981; text-align: right;">Active (100% Money-Back)</td>
        </tr>
        <tr>
          <td style="color: #94a3b8;">Access Level:</td>
          <td style="font-weight: 700; color: #2e86ff; text-align: right;">Unlimited Pro Scans &amp; High-Priority Triage</td>
        </tr>
      </table>
    </div>

    <!-- High-contrast Bulletproof CTA Button -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 16px 0;">
      <tr>
        <td align="center">
          <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
              <td align="center" style="background-color: #2e86ff; border-radius: 10px; padding: 15px 32px;">
                <a href="https://theinsectguide.com/#scan" target="_blank" style="font-size: 15px; font-weight: 800; color: #ffffff !important; text-decoration: none; display: inline-block; letter-spacing: 0.2px;">
                  Open Your Pro Dashboard &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="font-size: 12.5px; line-height: 1.6; color: #94a3b8; text-align: center;">
      You can manage your account settings or export your field journal at any time directly from the app.
    </p>
  `;

  return sendEmailWithBrevo(user.email, user.name, subject, emailWrapper(content));
}

/**
 * 3. Email de confirmation d'annulation d'abonnement
 */
export async function sendCancellationEmail(user: UserDoc) {
  const subject = 'Subscription Cancellation Confirmed — The Insect Guide';
  const content = `
    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 16px 0;">
      Subscription Cancellation Confirmed
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin: 0 0 20px 0;">
      Your subscription auto-renewal to <strong>The Insect Guide Pro</strong> has been cancelled per your request. You will not be charged again.
    </p>

    <div style="background-color: #242442; border: 1px solid #3b3b66; border-left: 4px solid #f5a623; border-radius: 12px; padding: 18px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #e2e8f0;">
        <strong>Good news:</strong> You will retain full access to all Pro features until the conclusion of your active billing cycle. After that, your account will revert gracefully to our free tier.
      </p>
    </div>

    <p style="font-size: 13.5px; line-height: 1.6; color: #94a3b8;">
      If you ever wish to reactivate your Pro subscription in the future, your observation history and saved sightings will remain securely in your account.
    </p>
  `;

  return sendEmailWithBrevo(user.email, user.name, subject, emailWrapper(content));
}

/**
 * 4. Email de confirmation de remboursement 48h
 */
export async function sendRefundEmail(user: UserDoc, refundId?: string, refundAmount?: string) {
  const subject = 'Refund Processed — The Insect Guide 48-Hour Guarantee';
  const amountDisplay = refundAmount ? (refundAmount.startsWith('$') ? refundAmount : `$${refundAmount}`) : '';
  const content = `
    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 16px 0;">
      48-Hour Guarantee: Refund Confirmed
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin: 0 0 20px 0;">
      Your refund request under our <strong>48-hour satisfaction guarantee</strong> has been transmitted and confirmed with PayPal.
    </p>

    <div style="background-color: #242442; border: 1px solid #3b3b66; border-left: 4px solid #10b981; border-radius: 12px; padding: 18px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.6; color: #e2e8f0;">
        ${amountDisplay ? `The refunded amount of <strong>${amountDisplay}</strong>` : 'The full payment amount'} is returning to your original payment method (PayPal or Credit/Debit card).
      </p>
      ${refundId ? `<p style="margin: 0; font-size: 13px; color: #94a3b8; font-family: monospace;">PayPal Refund Reference: <strong>${refundId}</strong></p>` : ''}
      <p style="margin: 8px 0 0 0; font-size: 12.5px; color: #64748b;">
        Depending on your bank or payment issuer, this refund will appear on your statement within 3 to 5 business days.
      </p>
    </div>

    <p style="font-size: 13.5px; line-height: 1.6; color: #94a3b8;">
      We appreciate your interest in The Insect Guide. You can continue using our essential free identification and guide tools anytime.
    </p>
  `;

  return sendEmailWithBrevo(user.email, user.name, subject, emailWrapper(content));
}

/**
 * 5. Email d'alerte saisonnière hebdomadaire (Lundi 8h UTC)
 */
export async function sendWeeklySeasonalAlertEmail(
  user: { email: string; name?: string },
  region: string,
  alertText: string,
  topSpecies: string[] = ['Yellowjacket Wasps', 'European Hornets', 'Noble False Widows', 'Deer Ticks']
) {
  const subject = `Weekly Entomology Alert: Insects to watch for in ${region}`;
  const content = `
    <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 16px 0;">
      Weekly Regional Activity Forecast
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin: 0 0 20px 0;">
      Here is your automated weekly entomology intelligence briefing for <strong>${region}</strong> for the week starting today:
    </p>

    <div style="background-color: #242442; border: 1px solid #3b3b66; border-left: 4px solid #e94560; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="color: #e94560; font-size: 14px; font-weight: 700; margin: 0 0 10px 0; text-transform: uppercase;">
        Regional Climate &amp; Pest Advisory (${region})
      </h3>
      <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.7; color: #f1f5f9;">
        ${alertText}
      </p>

      <div style="background-color: #141424; padding: 12px 16px; border-radius: 8px; border: 1px solid #2e2e50;">
        <span style="font-size: 12px; font-weight: 700; color: #f5a623; display: block; margin-bottom: 6px;">
          HIGHEST ACTIVITY SPECIMENS THIS WEEK:
        </span>
        <span style="font-size: 13px; color: #cbd5e1;">
          ${topSpecies.join(' &bull; ')}
        </span>
      </div>
    </div>

    <div style="background-color: #141424; border: 1px solid #2e2e50; border-radius: 12px; padding: 16px; margin: 20px 0;">
      <h4 style="color: #10b981; font-size: 13px; margin: 0 0 6px 0;">Outdoor Safety Checklist:</h4>
      <p style="font-size: 12.5px; color: #94a3b8; margin: 0; line-height: 1.6;">
        &bull; Check skin &amp; pets for tick attachments after woodland walks.<br>
        &bull; Keep sweet drinks covered outdoors to avoid late-summer wasp stings.<br>
        &bull; Use our instant camera scanner if you spot unfamiliar spider species indoors.
      </p>
    </div>

    <!-- High-contrast Bulletproof CTA Button -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 16px 0;">
      <tr>
        <td align="center">
          <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
              <td align="center" style="background-color: #2e86ff; border-radius: 10px; padding: 14px 28px;">
                <a href="https://theinsectguide.com/#alerts" target="_blank" style="font-size: 14px; font-weight: 800; color: #ffffff !important; text-decoration: none; display: inline-block;">
                  Open Interactive Hazard Map &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return sendEmailWithBrevo(user.email, user.name || 'Explorer', subject, emailWrapper(content));
}

/**
 * Regional seasonal alert copy matrix
 */
export const REGIONAL_WEEKLY_ALERTS: Record<string, { text: string; species: string[] }> = {
  UK: {
    text: 'Late summer conditions are triggering elevated European Hornet and Yellowjacket nest foraging activity. Mild humidity in southern woodlands also increases False Widow and Tick presence in tall grass.',
    species: ['European Hornet', 'Common Wasp', 'Noble False Widow', 'Castor Bean Tick'],
  },
  US: {
    text: 'High heat across North America is driving intense Yellowjacket defense behavior and peak Brown Recluse migration into shaded attic/basement spaces. Deer Tick nymph activity remains elevated.',
    species: ['Yellowjacket', 'Brown Recluse', 'Black Widow', 'Deer Tick (Blacklegged)'],
  },
  CA: {
    text: 'Summer warmth in Ontario and BC corresponds with increased Bald-Faced Hornet aggression near wooded margins and peak Black Fly / Mosquito activity near water bodies.',
    species: ['Bald-Faced Hornet', 'Deer Tick', 'Yellowjacket', 'Mosquito vectors'],
  },
  AU: {
    text: 'Seasonal weather shifts in eastern states are prompting early funnel-web and redback spider movement around sheltered outdoor foliage, sheds, and garden perimeter debris.',
    species: ['Redback Spider', 'Sydney Funnel-Web', 'European Wasp', 'Paralysis Tick'],
  },
  EU: {
    text: 'Warm Mediterranean & Central European temperatures favor high Asian Hornet (Vespa velutina) flight frequencies and heightened processionary caterpillar hazard zones near pine forests.',
    species: ['Asian Hornet', 'Oak Processionary Moth', 'European Hornet', 'Ixodes Tick'],
  },
  Other: {
    text: 'Global seasonal shifts are active. Maintain vigilance around woodpiles, stagnant water, and overgrown garden areas where venomous hymenoptera and arachnids establish late-season nests.',
    species: ['Vespinae Wasps', 'Woodland Ticks', 'Urban Spiders', 'Biting Midges'],
  },
};
