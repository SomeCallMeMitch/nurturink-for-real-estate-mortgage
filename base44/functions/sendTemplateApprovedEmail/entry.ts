import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createTemplateApprovedHTML = ({
  creator_firstName,
  template_name,
  template_id,
  approval_date,
  template_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; max-width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 40px 30px; text-align: center;">
              <img src="${app_logo_url}" alt="NurturInk" style="height: 40px; margin-bottom: 20px;" />
              <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; line-height: 1.3;">
                Your Template Has Been Approved!
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">Hi ${creator_firstName},</p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                Great news! Your template has been reviewed and approved. It's now available in your template library.
              </p>
              
              <!-- Approval Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border: 2px solid #10B981; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #065f46;">Approved</p>
                    <p style="margin: 0; font-size: 20px; font-weight: bold; color: #065f46;">"${template_name}"</p>
                  </td>
                </tr>
              </table>
              
              <!-- Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Template ID</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${template_id}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280;">Approved On</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right;">${approval_date}</td>
                </tr>
              </table>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <a href="${template_url}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);">Use This Template</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 12px 0;">
                <strong style="color: #FF7A00;">NurturInk</strong><br>
                Authentic handwritten notes that build real relationships
              </p>
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
                Questions? Email us at <a href="mailto:support@nurturink.com" style="color: #FF7A00; text-decoration: none;">support@nurturink.com</a>
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                © 2024 NurturInk. All rights reserved.
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

const createTemplateApprovedText = (props) => `
NurturInk - Template Approved!

Hi ${props.creator_firstName},

Great news! Your template has been reviewed and approved. It's now available in your template library.

TEMPLATE DETAILS:
Template Name: "${props.template_name}"
Template ID: ${props.template_id}
Approved On: ${props.approval_date}

Use This Template: ${props.template_url}

Questions? Email us at support@nurturink.com
© 2024 NurturInk. All rights reserved.
`;

Deno.serve(async (req) => {
  try {
    const data = await req.json();

    const emailData = {
      creator_firstName: data.creator_firstName,
      template_name: data.template_name,
      template_id: data.template_id,
      approval_date: data.approval_date || new Date().toLocaleDateString('en-US'),
      template_url: data.template_url || `${Deno.env.get("APP_URL")}/Templates?id=${data.template_id}`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'NurturInk <hello@nurturink.com>',
      to: data.creator_email,
      subject: `Your template "${data.template_name}" has been approved!`,
      html: createTemplateApprovedHTML(emailData),
      text: createTemplateApprovedText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Template approved notification sent' 
    });

  } catch (error) {
    console.error('Error sending template approved email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});