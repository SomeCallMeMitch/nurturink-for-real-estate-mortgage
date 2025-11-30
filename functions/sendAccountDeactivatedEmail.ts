import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createDeactivatedHTML = ({
  user_firstName,
  deactivation_date,
  reason,
  remaining_credits,
  reactivation_url,
  support_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Deactivated</title>
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
              <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; line-height: 1.3;">
                Account Deactivated
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">Hi ${user_firstName},</p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                Your RoofScribe account has been deactivated as of ${deactivation_date}.
              </p>
              
              ${reason ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; font-weight: bold; color: #1f2937;">Reason:</p>
                    <p style="margin: 0; font-size: 14px; color: #374151;">${reason}</p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              ${remaining_credits > 0 ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; font-weight: bold; color: #92400e;">Important:</p>
                    <p style="margin: 0; font-size: 14px; color: #92400e;">You have ${remaining_credits} unused credits. These will be preserved if you reactivate your account within 90 days.</p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dbeafe; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #1e40af;">Want to come back?</p>
                    <p style="margin: 0; font-size: 14px; color: #1e40af;">We'd love to have you! You can reactivate your account at any time within the next 90 days.</p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <a href="${reactivation_url}" style="display: inline-block; background-color: #FF7A00; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(255, 122, 0, 0.3);">Reactivate Account</a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center;">
                    <a href="${support_url}" style="color: #FF7A00; text-decoration: none; font-size: 16px;">Contact Support →</a>
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
                Questions? Email us at <a href="mailto:support@roofscribe.com" style="color: #FF7A00; text-decoration: none;">support@roofscribe.com</a>
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

const createDeactivatedText = (props) => `
RoofScribe - Account Deactivated

Hi ${props.user_firstName},

Your RoofScribe account has been deactivated as of ${props.deactivation_date}.

${props.reason ? `Reason: ${props.reason}` : ''}

${props.remaining_credits > 0 ? `IMPORTANT: You have ${props.remaining_credits} unused credits. These will be preserved if you reactivate your account within 90 days.` : ''}

WANT TO COME BACK?
We'd love to have you! You can reactivate your account at any time within the next 90 days.

Reactivate Account: ${props.reactivation_url}
Contact Support: ${props.support_url}

Questions? Email us at support@roofscribe.com
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
      deactivation_date: data.deactivation_date || new Date().toLocaleDateString('en-US'),
      reason: data.reason || null,
      remaining_credits: data.remaining_credits || 0,
      reactivation_url: data.reactivation_url || `${Deno.env.get("APP_URL")}/reactivate`,
      support_url: data.support_url || `${Deno.env.get("APP_URL")}/support`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'RoofScribe <hello@roofscribe.com>',
      to: data.user_email,
      subject: `Your RoofScribe account has been deactivated`,
      html: createDeactivatedHTML(emailData),
      text: createDeactivatedText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Account deactivation email sent' 
    });

  } catch (error) {
    console.error('Error sending deactivation email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});