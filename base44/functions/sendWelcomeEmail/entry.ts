import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createWelcomeEmailHTML = ({
  user_firstName,
  dashboard_url,
  send_note_url,
  templates_url,
  support_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to NurturInk</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px; text-align: center;">
              <img src="${app_logo_url}" alt="NurturInk" style="height: 40px; max-width: 200px;" />
            </td>
          </tr>
          
          <!-- Hero Section -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h1 style="margin: 0 0 10px; font-size: 24px; font-weight: bold; color: #111827;">Hi ${user_firstName},</h1>
              <p style="margin: 0 0 20px; font-size: 20px; font-weight: bold; color: #1f2937;">Welcome to NurturInk! 🎉</p>
              <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #374151;">You're all set up and ready to send authentic handwritten notes that build real relationships.</p>
            </td>
          </tr>
          
          <!-- Value Proposition -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 15px; background-color: #f9fafb; border-radius: 8px;">
                    <p style="margin: 0 0 10px; font-size: 16px; color: #374151;">✍️ <strong>Real handwriting, not printed</strong></p>
                    <p style="margin: 0 0 10px; font-size: 16px; color: #374151;">⚡ <strong>Send in 2 minutes or less</strong></p>
                    <p style="margin: 0 0 10px; font-size: 16px; color: #374151;">📊 <strong>Track delivery and impact</strong></p>
                    <p style="margin: 0; font-size: 16px; color: #374151;">📝 <strong>Templates to get started fast</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Primary CTA -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="${send_note_url}" style="display: inline-block; background-color: #FF7A00; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">Send Your First Note</a>
            </td>
          </tr>
          
          <!-- Quick Start Guide -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 20px; font-size: 20px; font-weight: bold; color: #1f2937;">Get started in 3 easy steps</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; font-size: 16px; color: #374151;"><strong>1.</strong> Choose a template or start from scratch</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; font-size: 16px; color: #374151;"><strong>2.</strong> Personalize your message</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; font-size: 16px; color: #374151;"><strong>3.</strong> Hit send - we'll handwrite and mail it</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Secondary Resources -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <a href="${templates_url}" style="color: #FF7A00; text-decoration: none; font-size: 16px; margin: 0 15px;">Browse Templates</a>
                    <span style="color: #d1d5db;">•</span>
                    <a href="${dashboard_url}" style="color: #FF7A00; text-decoration: none; font-size: 16px; margin: 0 15px;">Visit Dashboard</a>
                    <span style="color: #d1d5db;">•</span>
                    <a href="${support_url}" style="color: #FF7A00; text-decoration: none; font-size: 16px; margin: 0 15px;">Get Help</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 40px 20px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #FF7A00;">NurturInk</p>
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

const createWelcomeEmailText = ({ user_firstName, send_note_url, templates_url, dashboard_url, support_url }) => `
Hi ${user_firstName},

Welcome to NurturInk! 🎉

You're all set up and ready to send authentic handwritten notes that build real relationships.

WHY ROOFSCRIBE?
✍️ Real handwriting, not printed
⚡ Send in 2 minutes or less
📊 Track delivery and impact
📝 Templates to get started fast

GET STARTED IN 3 EASY STEPS:
1. Choose a template or start from scratch
2. Personalize your message
3. Hit send - we'll handwrite and mail it

Send Your First Note: ${send_note_url}

HELPFUL RESOURCES:
Browse Templates: ${templates_url}
Visit Dashboard: ${dashboard_url}
Get Help: ${support_url}

Questions? Contact us at support@nurturink.com

© 2024 NurturInk. All rights reserved.
`;

Deno.serve(async (req) => {
  try {
    const {
      user_firstName,
      user_email,
      dashboard_url,
      send_note_url,
      templates_url,
      support_url,
      app_logo_url
    } = await req.json();

    if (!user_firstName || !user_email) {
      return Response.json({ 
        error: 'Missing required fields: user_firstName, user_email' 
      }, { status: 400 });
    }

    const emailData = {
      user_firstName,
      dashboard_url: dashboard_url || `${Deno.env.get("APP_URL") || "https://app.base44.com"}/Home`,
      send_note_url: send_note_url || `${Deno.env.get("APP_URL") || "https://app.base44.com"}/FindClients`,
      templates_url: templates_url || `${Deno.env.get("APP_URL") || "https://app.base44.com"}/Templates`,
      support_url: support_url || `${Deno.env.get("APP_URL") || "https://app.base44.com"}/support`,
      app_logo_url: app_logo_url || `${Deno.env.get("APP_URL") || "https://app.base44.com"}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'NurturInk <hello@nurturink.com>',
      to: user_email,
      subject: "Welcome to NurturInk! 🎉 Let's send your first handwritten note",
      html: createWelcomeEmailHTML(emailData),
      text: createWelcomeEmailText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Welcome email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return Response.json({ 
      error: error.message || 'Failed to send welcome email' 
    }, { status: 500 });
  }
});