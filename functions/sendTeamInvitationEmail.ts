import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createInvitationEmailHTML = ({
  inviter_firstName,
  inviter_fullName,
  organization_name,
  role_display,
  is_admin,
  accept_url,
  invitation_expires,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 100%;">
          
          <!-- Header -->
          ${app_logo_url ? `
          <tr>
            <td style="background-color: #ffffff; padding: 40px; text-align: center;">
              <img src="${app_logo_url}" alt="NurturInk" style="height: 40px; max-width: 200px;" />
            </td>
          </tr>
          ` : `
          <tr>
            <td style="background-color: #ffffff; padding: 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #FF7A00;">RoofScribe</h1>
            </td>
          </tr>
          `}
          
          <!-- Personal Invitation -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h1 style="margin: 0 0 15px; font-size: 24px; font-weight: bold; color: #111827;">${inviter_firstName} invited you to join ${organization_name}</h1>
              <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #374151;">${inviter_fullName} wants you to join their team on RoofScribe.</p>
            </td>
          </tr>
          
          <!-- What is RoofScribe -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 15px; font-size: 20px; font-weight: bold; color: #1f2937;">What is RoofScribe?</h2>
              <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #374151;">RoofScribe makes it easy to send authentic handwritten notes at scale. It's perfect for sales teams, customer success, and anyone who wants to build real relationships through thoughtful, personal outreach.</p>
            </td>
          </tr>
          
          <!-- Role Information -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #1f2937;">Your role: ${role_display}</p>
                    <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #374151;">
                      ${is_admin 
                        ? `As an Admin, you'll be able to manage team members, allocate credits, and oversee all notes sent by your organization.`
                        : `As a Member, you'll be able to send handwritten notes on behalf of ${organization_name}.`
                      }
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Primary CTA -->
          ${accept_url ? `
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="${accept_url}" style="display: inline-block; background-color: #FF7A00; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">Accept Invitation</a>
            </td>
          </tr>
          ` : ''}
          
          <!-- What Happens Next -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 15px; font-size: 20px; font-weight: bold; color: #1f2937;">What happens next?</h2>
              <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #374151;">
                ${accept_url 
                  ? `If you already have a RoofScribe account, we'll connect it to ${organization_name}. If you're new, we'll help you create your account and get started.`
                  : `You've been added to ${organization_name}. Log in to your RoofScribe account to access your organization's features.`
                }
              </p>
            </td>
          </tr>
          
          <!-- Expiration Notice -->
          ${accept_url && invitation_expires !== 'N/A' ? `
          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; font-size: 16px; color: #92400e;">⏰ This invitation expires in ${invitation_expires}. Accept soon to join the team!</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}
          
          <!-- Footer -->
          <tr>
            <td style="padding: 40px 20px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #FF7A00;">RoofScribe</p>
              <p style="margin: 0 0 15px; font-size: 14px; color: #6b7280;">Authentic handwritten notes that build real relationships</p>
              <p style="margin: 0 0 15px; font-size: 14px; color: #6b7280;">Questions? Contact us at <a href="mailto:support@nurturink.com" style="color: #FF7A00; text-decoration: none;">support@nurturink.com</a></p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2024 NurturInk. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const createInvitationEmailText = ({
  inviter_firstName,
  inviter_fullName,
  organization_name,
  role_display,
  is_admin,
  accept_url,
  invitation_expires
}) => `
${inviter_firstName} invited you to join ${organization_name}

${inviter_fullName} wants you to join their team on RoofScribe.

WHAT IS ROOFSCRIBE?
RoofScribe makes it easy to send authentic handwritten notes at scale. It's perfect for sales teams, customer success, and anyone who wants to build real relationships through thoughtful, personal outreach.

YOUR ROLE: ${role_display}
${is_admin 
  ? `As an Admin, you'll be able to manage team members, allocate credits, and oversee all notes sent by your organization.`
  : `As a Member, you'll be able to send handwritten notes on behalf of ${organization_name}.`
}

${accept_url ? `Accept Invitation: ${accept_url}` : ''}

WHAT HAPPENS NEXT?
${accept_url 
  ? `If you already have a RoofScribe account, we'll connect it to ${organization_name}. If you're new, we'll help you create your account and get started.`
  : `You've been added to ${organization_name}. Log in to your RoofScribe account to access your organization's features.`
}

${accept_url && invitation_expires !== 'N/A' ? `⏰ This invitation expires in ${invitation_expires}. Accept soon to join the team!` : ''}

Questions? Contact us at support@nurturink.com

© 2024 NurturInk. All rights reserved.
`;

Deno.serve(async (req) => {
  try {
    const {
      inviter_firstName,
      inviter_fullName,
      invitee_email,
      organization_name,
      role,
      role_display,
      invitation_token,
      invitation_expires,
      app_logo_url
    } = await req.json();

    if (!inviter_firstName || !inviter_fullName || !invitee_email || !organization_name) {
      return Response.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const is_admin = role === 'organization_owner' || role === 'admin';
    
    // Build accept URL - handle both new invitations and existing user additions
    let accept_url = '';
    if (invitation_token) {
      const baseUrl = Deno.env.get("APP_URL") || "https://app.base44.com";
      // For Base44 apps, use ?page= query parameter format
      accept_url = `${baseUrl}?page=AcceptInvitation&token=${invitation_token}`;
    }

    const emailData = {
      inviter_firstName,
      inviter_fullName,
      organization_name,
      role_display: role_display || (is_admin ? 'Admin' : 'Member'),
      is_admin,
      accept_url,
      invitation_expires: invitation_expires || '7 days',
      app_logo_url: app_logo_url || null // Only use logo if explicitly provided
    };

    const result = await resend.emails.send({
      from: 'NurturInk <support@nurturink.com>',
      to: invitee_email,
      subject: `${inviter_fullName} invited you to join ${organization_name} on RoofScribe`,
      html: createInvitationEmailHTML(emailData),
      text: createInvitationEmailText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Team invitation email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending team invitation email:', error);
    return Response.json({ 
      error: error.message || 'Failed to send team invitation email' 
    }, { status: 500 });
  }
});