import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createPasswordResetHTML = ({
  user_firstName,
  reset_url,
  expires_in,
  expiry_timestamp,
  request_ip,
  request_timestamp,
  support_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
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
          
          <!-- Main Message -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h1 style="margin: 0 0 10px; font-size: 24px; font-weight: bold; color: #111827;">Hi ${user_firstName || 'there'},</h1>
              <h2 style="margin: 0 0 15px; font-size: 20px; font-weight: bold; color: #1f2937;">Reset your password</h2>
              <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #374151;">We received a request to reset your RoofScribe password. Click the button below to choose a new password.</p>
            </td>
          </tr>
          
          <!-- Primary CTA -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="${reset_url}" style="display: inline-block; background-color: #FF7A00; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">Reset Password</a>
            </td>
          </tr>
          
          <!-- Expiration Notice -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0; font-size: 16px; color: #92400e;">⏰ This link expires in ${expires_in} (at ${expiry_timestamp})</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Alternative Link -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">Button not working? Copy and paste this link into your browser:</p>
              <p style="margin: 0; font-size: 14px; color: #374151; word-break: break-all;">${reset_url}</p>
            </td>
          </tr>
          
          <!-- Security Information -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #1f2937;">Security details:</p>
                    <p style="margin: 0 0 5px; font-size: 14px; color: #6b7280;">Request from IP: ${request_ip}</p>
                    <p style="margin: 0 0 15px; font-size: 14px; color: #6b7280;">Request time: ${request_timestamp}</p>
                    <p style="margin: 0; font-size: 14px; color: #374151;">If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Help Section -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <p style="margin: 0; font-size: 16px; text-align: center; color: #374151;">Need help? <a href="${support_url}" style="color: #FF7A00; text-decoration: none;">Contact our support team</a></p>
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

const createPasswordResetText = ({
  user_firstName,
  reset_url,
  expires_in,
  expiry_timestamp,
  request_ip,
  request_timestamp,
  support_url
}) => `
Hi ${user_firstName || 'there'},

RESET YOUR PASSWORD

We received a request to reset your RoofScribe password. Click the link below to choose a new password.

Reset Password: ${reset_url}

⏰ This link expires in ${expires_in} (at ${expiry_timestamp})

SECURITY DETAILS:
Request from IP: ${request_ip}
Request time: ${request_timestamp}

If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.

Need help? Contact our support team: ${support_url}

© 2024 RoofScribe. All rights reserved.
`;

Deno.serve(async (req) => {
  try {
    const {
      user_firstName,
      user_email,
      reset_token,
      expires_in,
      request_ip,
      support_url,
      app_logo_url
    } = await req.json();

    if (!user_email || !reset_token) {
      return Response.json({ 
        error: 'Missing required fields: user_email, reset_token' 
      }, { status: 400 });
    }

    const now = new Date();
    const expiryDate = new Date(now.getTime() + (60 * 60 * 1000)); // 1 hour from now
    
    const emailData = {
      user_firstName: user_firstName || null,
      reset_url: `${Deno.env.get("APP_URL") || "https://app.base44.com"}/reset-password?token=${reset_token}`,
      expires_in: expires_in || '1 hour',
      expiry_timestamp: expiryDate.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric' 
      }),
      request_ip: request_ip || 'Unknown',
      request_timestamp: now.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric' 
      }),
      support_url: support_url || `${Deno.env.get("APP_URL") || "https://app.base44.com"}/support`,
      app_logo_url: app_logo_url || `${Deno.env.get("APP_URL") || "https://app.base44.com"}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'RoofScribe Security <security@roofscribe.com>',
      to: user_email,
      subject: 'Reset your RoofScribe password',
      html: createPasswordResetHTML(emailData),
      text: createPasswordResetText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Password reset email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending password reset email:', error);
    return Response.json({ 
      error: error.message || 'Failed to send password reset email' 
    }, { status: 500 });
  }
});