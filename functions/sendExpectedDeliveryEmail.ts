import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createExpectedDeliveryHTML = ({
  user_firstName,
  order_id,
  shipping_date,
  expected_delivery_start,
  expected_delivery_end,
  number_of_notes,
  follow_up_tips_url,
  order_details_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Expected Delivery</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; max-width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 40px 30px; text-align: center;">
              <img src="${app_logo_url}" alt="RoofScribe" style="height: 40px; margin-bottom: 20px;" />
              <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; line-height: 1.3;">
                Your Notes Should Be Arriving Soon!
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">Hi ${user_firstName},</p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                Based on when we shipped your order, your ${number_of_notes} handwritten notes should be arriving at their destinations soon!
              </p>
              
              <!-- Delivery Window Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border: 2px solid #10B981; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #065f46;">Order #${order_id}</p>
                    <p style="margin: 0 0 8px; font-size: 16px; color: #065f46;">Expected Delivery Window</p>
                    <p style="margin: 0; font-size: 24px; font-weight: bold; color: #065f46;">${expected_delivery_start} - ${expected_delivery_end}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Order Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Notes Sent</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${number_of_notes}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280;">Shipped On</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right;">${shipping_date}</td>
                </tr>
              </table>
              
              <!-- Follow-Up Tips -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 15px; font-size: 16px; font-weight: bold; color: #1f2937;">Time to plan your follow-up!</p>
                    <p style="margin: 0 0 15px; font-size: 14px; color: #374151;">
                      Now that your notes are arriving, here are some tips to maximize impact:
                    </p>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                      <li>Wait 3-5 days after expected delivery to follow up</li>
                      <li>Reference the note in your call or email</li>
                      <li>Keep track of responses to measure ROI</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <!-- CTAs -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 15px;">
                    <a href="${follow_up_tips_url}" style="display: inline-block; background-color: #10B981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">Get Follow-Up Tips</a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center;">
                    <a href="${order_details_url}" style="color: #10B981; text-decoration: none; font-size: 16px;">View Order Details →</a>
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

const createExpectedDeliveryText = (props) => `
RoofScribe - Your Notes Should Be Arriving Soon!

Hi ${props.user_firstName},

Based on when we shipped your order, your ${props.number_of_notes} handwritten notes should be arriving at their destinations soon!

ORDER DETAILS:
Order #: ${props.order_id}
Notes Sent: ${props.number_of_notes}
Shipped On: ${props.shipping_date}
Expected Delivery: ${props.expected_delivery_start} - ${props.expected_delivery_end}

TIME TO PLAN YOUR FOLLOW-UP!
- Wait 3-5 days after expected delivery to follow up
- Reference the note in your call or email
- Keep track of responses to measure ROI

Get Follow-Up Tips: ${props.follow_up_tips_url}
View Order Details: ${props.order_details_url}

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
      user_firstName: data.user_firstName,
      order_id: data.order_id,
      shipping_date: data.shipping_date,
      expected_delivery_start: data.expected_delivery_start,
      expected_delivery_end: data.expected_delivery_end,
      number_of_notes: data.number_of_notes,
      follow_up_tips_url: data.follow_up_tips_url || `${Deno.env.get("APP_URL")}/help/follow-up`,
      order_details_url: data.order_details_url || `${Deno.env.get("APP_URL")}/Order?id=${data.order_id}`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'RoofScribe <notifications@roofscribe.com>',
      to: data.user_email,
      subject: `Your handwritten notes should be arriving soon (#${data.order_id})`,
      html: createExpectedDeliveryHTML(emailData),
      text: createExpectedDeliveryText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Expected delivery notification sent' 
    });

  } catch (error) {
    console.error('Error sending expected delivery email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});