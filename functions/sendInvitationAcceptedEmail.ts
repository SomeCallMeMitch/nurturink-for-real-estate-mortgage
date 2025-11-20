import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createAcceptedEmailHTML = ({
  admin_firstName,
  new_member_fullName,
  new_member_email,
  new_member_role_display,
  organization_name,
  joined_timestamp,
  team_management_url,
  member_profile_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Member Joined</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px; text-align: center;">
              <img src="${app_logo_url}" alt="RoofScribe" style="height: 40px; max-width: 200px;" />
            </td>
          </tr>
          
          <!-- Notification Message -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h1 style="margin: 0 0 10px; font-size: 24px; font-weight: bold; color: #111827;">Hi ${admin_firstName},</h1>
              <p style="margin: 0 0 10px; font-size: 20px; font-weight: bold; color: #1f2937;">🎉 ${new_member_fullName} has joined ${organization_name}</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Joined on ${joined_timestamp}</p>
            </td>
          </tr>
          
          <!-- Member Details Card -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; font-size: 16px; color: #374151;"><strong>Name:</strong> ${new_member_fullName}</p>
                    <p style="margin: 0 0 8px; font-size: 16px; color: #374151;"><strong>Email:</strong> ${new_member_email}</p>
                    <p style="margin: 0; font-size: 16px; color: #374151;"><strong>Role:</strong> ${new_member_role_display}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Suggested Next Steps -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 15px; font-size: 20px; font-weight: bold; color: #1f2937;">Suggested next steps:</h2>
              <ul style="margin: 0; padding: 0 0 0 20px; font-size: 16px; line-height: 1.8; color: #374151;">
                <li>Allocate credits for ${new_member_fullName} (if applicable)</li>
                <li>Share your organization's templates</li>
                <li>Set expectations for note-sending cadence</li>
              </ul>
            </td>
          </tr>
          
          <!-- Primary CTA -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="${team_management_url}" style="display: inline-block; background-color: #FF7A00; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">View Team</a>
            </td>
          </tr>
          
          <!-- Secondary CTA -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${member_profile_url}" style="color: #FF7A00; text-decoration: none; font-size: 16px;">View ${new_member_fullName}'s profile →</a>
            </td>
          </tr>
          
          <!-- Footer -->
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

const createAcceptedEmailText = ({
  admin_firstName,
  new_member_fullName,
  new_member_email,
  new_member_role_display,
  organization_name,
  joined_timestamp,
  team_management_url,
  member_profile_url
}) => `
Hi ${admin_firstName},

🎉 ${new_member_fullName} has joined ${organization_name}

Joined on ${joined_timestamp}

MEMBER DETAILS:
Name: ${new_member_fullName}
Email: ${new_member_email}
Role: ${new_member_role_display}

SUGGESTED NEXT STEPS:
• Allocate credits for ${new_member_fullName} (if applicable)
• Share your organization's templates
• Set expectations for note-sending cadence

View Team: ${team_management_url}
View ${new_member_fullName}'s profile: ${member_profile_url}

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

    const {
      admin_email,
      admin_firstName,
      new_member_fullName,
      new_member_email,
      new_member_role_display,
      organization_name,
      joined_timestamp,
      team_management_url,
      member_profile_url,
      app_logo_url
    } = await req.json();

    if (!admin_email || !admin_firstName || !new_member_fullName || !new_member_email || !organization_name) {
      return Response.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const emailData = {
      admin_firstName,
      new_member_fullName,
      new_member_email,
      new_member_role_display: new_member_role_display || 'Member',
      organization_name,
      joined_timestamp: joined_timestamp || new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric' 
      }),
      team_management_url: team_management_url || `${Deno.env.get("APP_URL") || "https://app.base44.com"}/TeamManagement`,
      member_profile_url: member_profile_url || `${Deno.env.get("APP_URL") || "https://app.base44.com"}/TeamManagement`,
      app_logo_url: app_logo_url || `${Deno.env.get("APP_URL") || "https://app.base44.com"}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'RoofScribe <notifications@roofscribe.com>',
      to: admin_email,
      subject: `${new_member_fullName} joined your team on RoofScribe`,
      html: createAcceptedEmailHTML(emailData),
      text: createAcceptedEmailText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Invitation accepted notification sent successfully' 
    });

  } catch (error) {
    console.error('Error sending invitation accepted email:', error);
    return Response.json({ 
      error: error.message || 'Failed to send invitation accepted email' 
    }, { status: 500 });
  }
});