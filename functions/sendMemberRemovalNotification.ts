import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createRemovalNotifHTML = ({
  admin_firstName,
  user_fullName,
  user_email,
  previous_role_display,
  removed_by_name,
  removal_date,
  org_name,
  team_management_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Member Removed</title>
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
              <span style="display: inline-block; background-color: rgba(255,255,255,0.2); color: #ffffff; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold;">TEAM UPDATE</span>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">Hi ${admin_firstName},</p>
              
              <h2 style="margin: 0 0 20px; font-size: 20px; font-weight: bold; color: #1f2937;">
                ${user_fullName} has been removed from ${org_name}
              </h2>
              
              <!-- Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Member</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${user_fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Email</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${user_email}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Previous Role</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${previous_role_display}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Removed By</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${removed_by_name}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280;">Date</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right;">${removal_date}</td>
                </tr>
              </table>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <a href="${team_management_url}" style="color: #3B82F6; text-decoration: none; font-size: 16px;">View Team Dashboard →</a>
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

const createRemovalNotifText = (props) => `
RoofScribe - Team Member Removed

Hi ${props.admin_firstName},

${props.user_fullName} has been removed from ${props.org_name}

DETAILS:
Member: ${props.user_fullName}
Email: ${props.user_email}
Previous Role: ${props.previous_role_display}
Removed By: ${props.removed_by_name}
Date: ${props.removal_date}

View Team Dashboard: ${props.team_management_url}

Questions? Email us at support@roofscribe.com
© 2024 RoofScribe. All rights reserved.
`;

Deno.serve(async (req) => {
  try {
    const data = await req.json();

    if (!data.other_admins_emails || data.other_admins_emails.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No other admins to notify' 
      });
    }

    const emailData = {
      admin_firstName: data.admin_firstName || 'there',
      user_fullName: data.user_fullName,
      user_email: data.user_email,
      previous_role_display: data.previous_role_display,
      removed_by_name: data.removed_by_name,
      removal_date: data.removal_date || new Date().toLocaleDateString('en-US'),
      org_name: data.org_name,
      team_management_url: data.team_management_url || `${Deno.env.get("APP_URL")}/TeamManagement`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const emailPromises = data.other_admins_emails.map(email =>
      resend.emails.send({
        from: 'RoofScribe <notifications@roofscribe.com>',
        to: email,
        subject: `${data.user_fullName} has been removed from ${data.org_name}`,
        html: createRemovalNotifHTML(emailData),
        text: createRemovalNotifText(emailData)
      })
    );

    await Promise.all(emailPromises);

    return Response.json({ 
      success: true, 
      message: `Removal notification sent to ${data.other_admins_emails.length} admin(s)` 
    });

  } catch (error) {
    console.error('Error sending member removal notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});