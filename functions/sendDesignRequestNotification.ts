import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createDesignNotifHTML = ({
  admin_firstName,
  requester_fullName,
  requester_email,
  design_request_id,
  request_date,
  design_description,
  design_request_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Design Request</title>
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
              <span style="display: inline-block; background-color: rgba(255,255,255,0.2); color: #ffffff; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold;">NEW REQUEST</span>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">Hi ${admin_firstName},</p>
              
              <h2 style="margin: 0 0 20px; font-size: 20px; font-weight: bold; color: #1f2937;">
                New custom design request from ${requester_fullName}
              </h2>
              
              <!-- Request Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Request ID</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${design_request_id}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Requester</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${requester_fullName}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Email</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${requester_email}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280;">Submitted</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right;">${request_date}</td>
                </tr>
              </table>
              
              <!-- Description -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-size: 14px; font-weight: bold; color: #5b21b6;">Design Description:</p>
                    <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">${design_description}</p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <a href="${design_request_url}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);">Review Request</a>
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

const createDesignNotifText = (props) => `
RoofScribe - New Design Request

Hi ${props.admin_firstName},

New custom design request from ${props.requester_fullName}

REQUEST DETAILS:
Request ID: ${props.design_request_id}
Requester: ${props.requester_fullName}
Email: ${props.requester_email}
Submitted: ${props.request_date}

DESIGN DESCRIPTION:
${props.design_description}

Review Request: ${props.design_request_url}

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
      requester_email: data.requester_email,
      design_request_id: data.design_request_id,
      request_date: data.request_date || new Date().toLocaleDateString('en-US'),
      design_description: data.design_description,
      design_request_url: data.design_request_url || `${Deno.env.get("APP_URL")}/admin/designs/${data.design_request_id}`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'RoofScribe <notifications@roofscribe.com>',
      to: data.admin_email,
      subject: `New custom design request from ${data.requester_fullName}`,
      html: createDesignNotifHTML(emailData),
      text: createDesignNotifText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Design request notification sent to admin' 
    });

  } catch (error) {
    console.error('Error sending design request notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});