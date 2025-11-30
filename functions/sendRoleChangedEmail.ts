import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createRoleChangedHTML = ({
  user_firstName,
  new_role_display,
  old_role_display,
  isPromotion,
  changed_by_name,
  org_name,
  role_management_url,
  help_center_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Role Updated</title>
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
                ${isPromotion ? 'Congratulations!' : 'Your Role Has Been Updated'}
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">Hi ${user_firstName},</p>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                ${changed_by_name} has updated your role on <strong>${org_name}</strong>.
              </p>
              
              <!-- Role Change Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Your role changed from</p>
                    <p style="margin: 0 0 12px; font-size: 16px; color: #374151; text-decoration: line-through;">${old_role_display}</p>
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">to</p>
                    <p style="margin: 0; font-size: 24px; font-weight: bold; color: #3B82F6;">${new_role_display}</p>
                  </td>
                </tr>
              </table>
              
              ${isPromotion ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dbeafe; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 16px; color: #1e40af;">With your new role, you now have additional permissions and responsibilities.</p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <a href="${role_management_url}" style="display: inline-block; background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">View Your Dashboard</a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center;">
                    <a href="${help_center_url}" style="color: #3B82F6; text-decoration: none; font-size: 16px;">Learn About Roles →</a>
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

const createRoleChangedText = (props) => `
RoofScribe - Role Updated

Hi ${props.user_firstName},

${props.changed_by_name} has updated your role on ${props.org_name}.

Your role changed from: ${props.old_role_display}
To: ${props.new_role_display}

${props.isPromotion ? 'Congratulations! With your new role, you now have additional permissions and responsibilities.' : ''}

View Your Dashboard: ${props.role_management_url}
Learn About Roles: ${props.help_center_url}

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
      new_role_display: data.new_role_display,
      old_role_display: data.old_role_display,
      isPromotion: data.isPromotion || false,
      changed_by_name: data.changed_by_name,
      org_name: data.org_name,
      role_management_url: data.role_management_url || `${Deno.env.get("APP_URL")}/Home`,
      help_center_url: data.help_center_url || `${Deno.env.get("APP_URL")}/help`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'RoofScribe <notifications@roofscribe.com>',
      to: data.user_email,
      subject: `Your role on ${data.org_name} has been updated to ${data.new_role_display}`,
      html: createRoleChangedHTML(emailData),
      text: createRoleChangedText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Role changed notification sent' 
    });

  } catch (error) {
    console.error('Error sending role changed email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});