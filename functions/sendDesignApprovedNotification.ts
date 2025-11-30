import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createDesignApprovedHTML = ({
  admin_firstName,
  requester_fullName,
  design_request_id,
  design_name,
  approved_date,
  next_steps,
  design_request_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design Approved</title>
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
              <span style="display: inline-block; background-color: rgba(255,255,255,0.2); color: #ffffff; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold;">APPROVED</span>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">Hi ${admin_firstName},</p>
              
              <h2 style="margin: 0 0 20px; font-size: 20px; font-weight: bold; color: #1f2937;">
                ${requester_fullName} approved the custom design
              </h2>
              
              <!-- Approval Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border: 2px solid #10B981; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #065f46;">Design Approved</p>
                    <p style="margin: 0; font-size: 20px; font-weight: bold; color: #065f46;">${design_name}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Request ID</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${design_request_id}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Approved By</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${requester_fullName}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280;">Approved On</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right;">${approved_date}</td>
                </tr>
              </table>
              
              ${next_steps ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-size: 14px; font-weight: bold; color: #5b21b6;">Next Steps:</p>
                    <p style="margin: 0; font-size: 14px; color: #374151;">${next_steps}</p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <a href="${design_request_url}" style="color: #8b5cf6; text-decoration: none; font-size: 16px;">View Design Details →</a>
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

const createDesignApprovedText = (props) => `
RoofScribe - Design Approved

Hi ${props.admin_firstName},

${props.requester_fullName} approved the custom design

DETAILS:
Design Name: ${props.design_name}
Request ID: ${props.design_request_id}
Approved By: ${props.requester_fullName}
Approved On: ${props.approved_date}

${props.next_steps ? `NEXT STEPS:\n${props.next_steps}` : ''}

View Design Details: ${props.design_request_url}

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
      admin_firstName: data.admin_firstName || 'there',
      requester_fullName: data.requester_fullName,
      design_request_id: data.design_request_id,
      design_name: data.design_name,
      approved_date: data.approved_date || new Date().toLocaleDateString('en-US'),
      next_steps: data.next_steps || null,
      design_request_url: data.design_request_url || `${Deno.env.get("APP_URL")}/admin/designs/${data.design_request_id}`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'RoofScribe <notifications@roofscribe.com>',
      to: data.admin_email,
      subject: `${data.requester_fullName} approved the custom design`,
      html: createDesignApprovedHTML(emailData),
      text: createDesignApprovedText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Design approved notification sent' 
    });

  } catch (error) {
    console.error('Error sending design approved notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});