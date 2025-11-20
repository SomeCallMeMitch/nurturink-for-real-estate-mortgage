import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createWarningHTML = ({
  user_firstName,
  current_personal_balance,
  org_pool_available,
  is_first_warning,
  last_note_sent,
  purchase_credits_url,
  contact_admin_url,
  is_org_member,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Low Credit Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 100%;">
          
          <!-- Header with Warning Badge -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: left;">
                    <img src="${app_logo_url}" alt="RoofScribe" style="height: 40px; max-width: 200px;" />
                  </td>
                  <td style="text-align: right;">
                    <span style="display: inline-block; background-color: #fbbf24; color: #92400e; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold;">⚠️ WARNING</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Alert Message -->
          <tr>
            <td style="padding: 20px 40px 30px;">
              <p style="margin: 0 0 10px; font-size: 16px; color: #374151;">Hi ${user_firstName},</p>
              <h1 style="margin: 0 0 15px; font-size: 24px; font-weight: bold; color: #111827;">You're running low on credits</h1>
              ${is_first_warning ? `
                <p style="margin: 0; font-size: 16px; color: #374151;">Your personal credit balance is getting low. To continue sending handwritten notes without interruption, consider purchasing more credits${is_org_member ? ' or requesting an allocation from your admin' : ''}.</p>
              ` : `
                <p style="margin: 0; font-size: 16px; color: #374151;">This is a reminder that your personal credit balance is still low.</p>
              `}
            </td>
          </tr>
          
          <!-- Current Balance Display -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px;">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 16px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Personal credits</td>
                  <td style="padding: 16px 20px; font-size: 18px; color: #111827; text-align: right; font-weight: bold; border-bottom: 1px solid #e5e7eb;">${current_personal_balance}</td>
                </tr>
                ${is_org_member ? `
                <tr>
                  <td style="padding: 16px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">+ Organization pool</td>
                  <td style="padding: 16px 20px; font-size: 18px; color: #111827; text-align: right; font-weight: bold; border-bottom: 1px solid #e5e7eb;">${org_pool_available}</td>
                </tr>
                ` : ''}
                <tr style="background-color: #fef3c7;">
                  <td style="padding: 16px 20px; font-size: 16px; color: #92400e; font-weight: bold;">Total available</td>
                  <td style="padding: 16px 20px; font-size: 20px; color: #92400e; text-align: right; font-weight: bold;">${current_personal_balance + org_pool_available}</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Impact Statement -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 16px; color: #374151;">You can send approximately <strong>${current_personal_balance + org_pool_available} more notes</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Primary CTA -->
          <tr>
            <td style="padding: 0 40px 20px; text-align: center;">
              <a href="${purchase_credits_url}" style="display: inline-block; background-color: #FF7A00; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">Purchase More Credits</a>
            </td>
          </tr>
          
          ${is_org_member ? `
          <!-- Secondary CTA -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="${contact_admin_url}" style="color: #FF7A00; text-decoration: none; font-size: 16px;">Contact Your Admin →</a>
            </td>
          </tr>
          ` : '<tr><td style="padding: 0 0 30px;"></td></tr>'}
          
          <!-- Credit Usage Context -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280; text-align: center;">Last note sent: ${last_note_sent}</p>
            </td>
          </tr>
          
          <!-- Standard Footer -->
          <tr>
            <td style="padding: 40px 20px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #FF7A00;">RoofScribe</p>
              <p style="margin: 0 0 15px; font-size: 14px; color: #6b7280;">Authentic handwritten notes that build real relationships</p>
              <p style="margin: 0 0 15px; font-size: 14px; color: #6b7280;">Questions? Contact us at <a href="mailto:support@roofscribe.com" style="color: #FF7A00; text-decoration: none;">support@roofscribe.com</a></p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2024 RoofScribe. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const createWarningText = (props) => `
RoofScribe - Low Credit Alert

Hi ${props.user_firstName},

⚠️ You're running low on credits

${props.is_first_warning ? 
  `Your personal credit balance is getting low. To continue sending handwritten notes without interruption, consider purchasing more credits${props.is_org_member ? ' or requesting an allocation from your admin' : ''}.` :
  'This is a reminder that your personal credit balance is still low.'
}

CURRENT BALANCE:
Personal credits: ${props.current_personal_balance}
${props.is_org_member ? `+ Organization pool: ${props.org_pool_available}` : ''}
Total available: ${props.current_personal_balance + props.org_pool_available}

You can send approximately ${props.current_personal_balance + props.org_pool_available} more notes.

Last note sent: ${props.last_note_sent}

Purchase More Credits: ${props.purchase_credits_url}
${props.is_org_member ? `Contact Your Admin: ${props.contact_admin_url}` : ''}

Questions? Contact us at support@roofscribe.com
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

    const subject = data.is_first_warning
      ? `Low Credit Alert: ${data.current_personal_balance} credits remaining`
      : 'Reminder: Low Credit Balance';

    const emailData = {
      user_firstName: data.user_firstName,
      current_personal_balance: data.current_personal_balance,
      org_pool_available: data.org_pool_available || 0,
      is_first_warning: data.is_first_warning !== false,
      last_note_sent: data.last_note_sent || 'Never',
      purchase_credits_url: data.purchase_credits_url || `${Deno.env.get("APP_URL")}/Credits`,
      contact_admin_url: data.contact_admin_url || `${Deno.env.get("APP_URL")}/TeamManagement`,
      is_org_member: data.is_org_member || false,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'RoofScribe <notifications@roofscribe.com>',
      to: data.user_email,
      subject,
      html: createWarningHTML(emailData),
      text: createWarningText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Low personal credit warning sent' 
    });

  } catch (error) {
    console.error('Error sending low credit warning:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});