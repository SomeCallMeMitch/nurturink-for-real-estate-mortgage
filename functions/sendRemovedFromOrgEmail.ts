import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createRemovedHTML = ({
  user_firstName,
  removed_by_name,
  removal_date,
  org_name,
  reason,
  personal_dashboard_url,
  support_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Removed from Organization</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; max-width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%); padding: 40px 40px 30px; text-align: center;">
              <img src="${app_logo_url}" alt="RoofScribe" style="height: 40px; margin-bottom: 20px;" />
              <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; line-height: 1.3;">
                Organization Membership Update
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">Hi ${user_firstName},</p>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                This email is to inform you that you have been removed from <strong>${org_name}</strong> by ${removed_by_name} on ${removal_date}.
              </p>
              
              ${reason ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280; font-weight: bold;">Reason provided:</p>
                    <p style="margin: 0; font-size: 16px; color: #374151;">${reason}</p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dbeafe; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-size: 16px; color: #1e40af; font-weight: bold;">What this means:</p>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
                      <li>You no longer have access to ${org_name}'s resources</li>
                      <li>Your personal RoofScribe account remains active</li>
                      <li>Any personal credits you purchased are still available</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <a href="${personal_dashboard_url}" style="display: inline-block; background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">Go to Your Dashboard</a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center;">
                    <a href="${support_url}" style="color: #3B82F6; text-decoration: none; font-size: 16px;">Contact Support →</a>
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

const createRemovedText = (props) => `
RoofScribe - Organization Membership Update

Hi ${props.user_firstName},

This email is to inform you that you have been removed from ${props.org_name} by ${props.removed_by_name} on ${props.removal_date}.

${props.reason ? `Reason provided: ${props.reason}` : ''}

What this means:
- You no longer have access to ${props.org_name}'s resources
- Your personal RoofScribe account remains active
- Any personal credits you purchased are still available

Go to Your Dashboard: ${props.personal_dashboard_url}
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
      removed_by_name: data.removed_by_name,
      removal_date: data.removal_date || new Date().toLocaleDateString('en-US'),
      org_name: data.org_name,
      reason: data.reason || null,
      personal_dashboard_url: data.personal_dashboard_url || `${Deno.env.get("APP_URL")}/Home`,
      support_url: data.support_url || `${Deno.env.get("APP_URL")}/support`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'RoofScribe <notifications@roofscribe.com>',
      to: data.user_email,
      subject: `You've been removed from ${data.org_name} on RoofScribe`,
      html: createRemovedHTML(emailData),
      text: createRemovedText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Removal notification sent' 
    });

  } catch (error) {
    console.error('Error sending removal email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});