import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createTemplateRejectedHTML = ({
  creator_firstName,
  template_name,
  template_id,
  rejected_date,
  rejection_reason,
  edit_template_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template Feedback</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; max-width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 40px 30px; text-align: center;">
              <img src="${app_logo_url}" alt="RoofScribe" style="height: 40px; margin-bottom: 20px;" />
              <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; line-height: 1.3;">
                Template Review Feedback
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">Hi ${creator_firstName},</p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                Thank you for submitting your template for review. After careful consideration, we weren't able to approve it in its current form. But don't worry – we'd love to help you make it work!
              </p>
              
              <!-- Template Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Template Name</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">"${template_name}"</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280;">Reviewed On</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right;">${rejected_date}</td>
                </tr>
              </table>
              
              <!-- Feedback Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-size: 14px; font-weight: bold; color: #5b21b6;">Feedback from our team:</p>
                    <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">${rejection_reason}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Encouragement -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dbeafe; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #1e40af;">What you can do:</p>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
                      <li>Review the feedback above</li>
                      <li>Make adjustments to your template</li>
                      <li>Resubmit for another review</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <a href="${edit_template_url}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);">Edit & Resubmit Template</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Support Note -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #374151;">Need help? Our support team is happy to provide guidance on creating effective templates.</p>
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

const createTemplateRejectedText = (props) => `
RoofScribe - Template Review Feedback

Hi ${props.creator_firstName},

Thank you for submitting your template for review. After careful consideration, we weren't able to approve it in its current form. But don't worry – we'd love to help you make it work!

TEMPLATE DETAILS:
Template Name: "${props.template_name}"
Reviewed On: ${props.rejected_date}

FEEDBACK FROM OUR TEAM:
${props.rejection_reason}

WHAT YOU CAN DO:
1. Review the feedback above
2. Make adjustments to your template
3. Resubmit for another review

Edit & Resubmit Template: ${props.edit_template_url}

Need help? Our support team is happy to provide guidance on creating effective templates.

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
      creator_firstName: data.creator_firstName,
      template_name: data.template_name,
      template_id: data.template_id,
      rejected_date: data.rejected_date || new Date().toLocaleDateString('en-US'),
      rejection_reason: data.rejection_reason,
      edit_template_url: data.edit_template_url || `${Deno.env.get("APP_URL")}/EditTemplate?id=${data.template_id}`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'RoofScribe <notifications@roofscribe.com>',
      to: data.creator_email,
      subject: `Your template "${data.template_name}" was not approved`,
      html: createTemplateRejectedHTML(emailData),
      text: createTemplateRejectedText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Template rejected notification sent' 
    });

  } catch (error) {
    console.error('Error sending template rejected email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});