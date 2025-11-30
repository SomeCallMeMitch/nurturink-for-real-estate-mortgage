import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createAutoRefillHTML = ({
  user_firstName,
  organization_name,
  credits_purchased,
  price_paid,
  trigger_balance,
  new_balance,
  transaction_id,
  refill_date,
  manage_settings_url,
  transaction_history_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auto-Refill Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; max-width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #FF7A00; padding: 40px 40px 30px; text-align: center;">
              <img src="${app_logo_url}" alt="RoofScribe" style="height: 40px; margin-bottom: 20px;" />
              <span style="display: inline-block; background-color: rgba(255,255,255,0.2); color: #ffffff; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold;">AUTO-REFILL</span>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">Hi ${user_firstName},</p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                Your auto-refill was triggered because ${organization_name ? `${organization_name}'s` : 'your'} credit balance dropped below ${trigger_balance} credits. We've automatically added more credits to keep your team productive.
              </p>
              
              <!-- Refill Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #FF7A00 0%, #ea580c 100%); border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: rgba(255,255,255,0.9);">Auto-Refill Complete</p>
                    <p style="margin: 0 0 8px; font-size: 32px; font-weight: bold; color: #ffffff;">+${credits_purchased} Credits</p>
                    <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.9);">$${(price_paid / 100).toFixed(2)} charged</p>
                  </td>
                </tr>
              </table>
              
              <!-- Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Transaction ID</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${transaction_id}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Date</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${refill_date}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Trigger Threshold</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${trigger_balance} credits</td>
                </tr>
                <tr style="background-color: #ecfdf5;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #065f46; font-weight: bold;">New Balance</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #065f46; text-align: right; font-weight: bold;">${new_balance} credits</td>
                </tr>
              </table>
              
              <!-- CTAs -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 15px;">
                    <a href="${manage_settings_url}" style="display: inline-block; background-color: #FF7A00; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(255, 122, 0, 0.3);">Manage Auto-Refill Settings</a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center;">
                    <a href="${transaction_history_url}" style="color: #FF7A00; text-decoration: none; font-size: 16px;">View Transaction History →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">
                <strong style="color: #FF7A00;">RoofScribe</strong><br>
                Authentic handwritten notes that build real relationships
              </p>
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
                Billing questions? Contact us at <a href="mailto:billing@roofscribe.com" style="color: #FF7A00; text-decoration: none;">billing@roofscribe.com</a>
              </p>
              <p style="color: #9ca3af; font-size: 11px; line-height: 1.4; margin: 0 0 8px 0;">
                This is a transactional email. Credits are non-refundable once used.
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                © 2024 RoofScribe. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const createAutoRefillText = (props) => `
RoofScribe - Auto-Refill Confirmation

Hi ${props.user_firstName},

Your auto-refill was triggered because ${props.organization_name ? `${props.organization_name}'s` : 'your'} credit balance dropped below ${props.trigger_balance} credits. We've automatically added more credits to keep your team productive.

AUTO-REFILL SUMMARY:
Credits Added: +${props.credits_purchased}
Amount Charged: $${(props.price_paid / 100).toFixed(2)}
Transaction ID: ${props.transaction_id}
Date: ${props.refill_date}
Trigger Threshold: ${props.trigger_balance} credits
New Balance: ${props.new_balance} credits

Manage Auto-Refill Settings: ${props.manage_settings_url}
View Transaction History: ${props.transaction_history_url}

Billing questions? Contact billing@roofscribe.com
© 2024 RoofScribe. All rights reserved.
`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const emailData = {
      user_firstName: data.user_firstName,
      organization_name: data.organization_name || null,
      credits_purchased: data.credits_purchased,
      price_paid: data.price_paid,
      trigger_balance: data.trigger_balance,
      new_balance: data.new_balance,
      transaction_id: data.transaction_id,
      refill_date: data.refill_date || new Date().toLocaleString('en-US'),
      manage_settings_url: data.manage_settings_url || `${Deno.env.get("APP_URL")}/SettingsOrganization`,
      transaction_history_url: data.transaction_history_url || `${Deno.env.get("APP_URL")}/Credits`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'RoofScribe <billing@roofscribe.com>',
      to: data.user_email,
      subject: `Auto-refill: ${data.credits_purchased} credits added to your account`,
      html: createAutoRefillHTML(emailData),
      text: createAutoRefillText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Auto-refill confirmation sent' 
    });

  } catch (error) {
    console.error('Error sending auto-refill email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});