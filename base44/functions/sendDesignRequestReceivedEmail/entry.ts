import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createDesignRequestHTML = ({
  user_firstName,
  design_request_id,
  request_date,
  design_description,
  estimated_review_time,
  design_request_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design Request Received</title>
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
                We've Received Your Design Request!
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">Hi ${user_firstName},</p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                Thank you for submitting your custom design request! Our design team is excited to bring your vision to life.
              </p>
              
              <!-- Request Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Request ID</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${design_request_id}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Submitted</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${request_date}</td>
                </tr>
                <tr style="background-color: #f5f3ff;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #5b21b6; font-weight: bold;">Est. Review Time</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #5b21b6; text-align: right; font-weight: bold;">${estimated_review_time}</td>
                </tr>
              </table>
              
              <!-- Description Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-size: 14px; font-weight: bold; color: #1f2937;">Your Request:</p>
                    <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">${design_description}</p>
                  </td>
                </tr>
              </table>
              
              <!-- What's Next -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f3ff; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 15px; font-size: 16px; font-weight: bold; color: #5b21b6;">What happens next:</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #374151;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #8b5cf6; color: white; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 12px; font-size: 12px;">1</span>
                          Our design team will review your request
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #374151;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #8b5cf6; color: white; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 12px; font-size: 12px;">2</span>
                          We'll create a mockup for your approval
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #374151;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #8b5cf6; color: white; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 12px; font-size: 12px;">3</span>
                          You'll receive an email when it's ready to review
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <a href="${design_request_url}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);">View Request Status</a>
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

const createDesignRequestText = (props) => `
NurturInk - Design Request Received

Hi ${props.user_firstName},

Thank you for submitting your custom design request! Our design team is excited to bring your vision to life.

REQUEST DETAILS:
Request ID: ${props.design_request_id}
Submitted: ${props.request_date}
Est. Review Time: ${props.estimated_review_time}

YOUR REQUEST:
${props.design_description}

WHAT HAPPENS NEXT:
1. Our design team will review your request
2. We'll create a mockup for your approval
3. You'll receive an email when it's ready to review

View Request Status: ${props.design_request_url}

Questions? Email us at design@nurturink.com
© 2024 NurturInk. All rights reserved.
`;

Deno.serve(async (req) => {
  try {
    const data = await req.json();

    const emailData = {
      user_firstName: data.user_firstName,
      design_request_id: data.design_request_id,
      request_date: data.request_date || new Date().toLocaleDateString('en-US'),
      design_description: data.design_description,
      estimated_review_time: data.estimated_review_time || '2-3 business days',
      design_request_url: data.design_request_url || `${Deno.env.get("APP_URL")}/designs/${data.design_request_id}`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'NurturInk <design@nurturink.com>',
      to: data.user_email,
      subject: `We've received your custom design request`,
      html: createDesignRequestHTML(emailData),
      text: createDesignRequestText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Design request confirmation sent' 
    });

  } catch (error) {
    console.error('Error sending design request email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});