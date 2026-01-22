import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createDesignReadyHTML = ({
  user_firstName,
  design_request_id,
  design_name,
  preview_url,
  review_url,
  uploaded_date,
  review_deadline,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design Ready for Review</title>
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
                Your Custom Design is Ready!
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">Hi ${user_firstName},</p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                Great news! Our design team has finished creating your custom card design and it's ready for your review.
              </p>
              
              <!-- Design Preview Box -->
              ${preview_url ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="text-align: center;">
                    <img src="${preview_url}" alt="Design Preview" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e5e7eb;" />
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Design Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Design Name</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${design_name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Request ID</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${design_request_id}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Ready On</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${uploaded_date}</td>
                </tr>
                ${review_deadline ? `
                <tr style="background-color: #fef3c7;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #92400e; font-weight: bold;">Review By</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #92400e; text-align: right; font-weight: bold;">${review_deadline}</td>
                </tr>
                ` : ''}
              </table>
              
              <!-- Action Options -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 15px; font-size: 16px; font-weight: bold; color: #5b21b6;">Your options:</p>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                      <li><strong>Approve</strong> - We'll add this design to your library</li>
                      <li><strong>Request Changes</strong> - Tell us what you'd like adjusted</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <a href="${review_url}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);">Review Your Design</a>
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
                Questions? Email us at <a href="mailto:design@nurturink.com" style="color: #FF7A00; text-decoration: none;">design@nurturink.com</a>
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

const createDesignReadyText = (props) => `
NurturInk - Your Custom Design is Ready!

Hi ${props.user_firstName},

Great news! Our design team has finished creating your custom card design and it's ready for your review.

DESIGN DETAILS:
Design Name: ${props.design_name}
Request ID: ${props.design_request_id}
Ready On: ${props.uploaded_date}
${props.review_deadline ? `Review By: ${props.review_deadline}` : ''}

YOUR OPTIONS:
- Approve - We'll add this design to your library
- Request Changes - Tell us what you'd like adjusted

Review Your Design: ${props.review_url}

Questions? Email us at design@nurturink.com
© 2024 NurturInk. All rights reserved.
`;

Deno.serve(async (req) => {
  try {
    const data = await req.json();

    const emailData = {
      user_firstName: data.user_firstName,
      design_request_id: data.design_request_id,
      design_name: data.design_name,
      preview_url: data.preview_url || null,
      review_url: data.review_url || `${Deno.env.get("APP_URL")}/designs/${data.design_request_id}/review`,
      uploaded_date: data.uploaded_date || new Date().toLocaleDateString('en-US'),
      review_deadline: data.review_deadline || null,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'NurturInk <design@nurturink.com>',
      to: data.user_email,
      subject: `Your custom design is ready for review`,
      html: createDesignReadyHTML(emailData),
      text: createDesignReadyText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Design ready for review notification sent' 
    });

  } catch (error) {
    console.error('Error sending design ready email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});