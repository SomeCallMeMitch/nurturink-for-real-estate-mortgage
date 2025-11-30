import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createOrderShippedHTML = ({
  user_firstName,
  order_id,
  shipping_date,
  tracking_number,
  tracking_url,
  estimated_delivery_date,
  number_of_notes,
  order_details_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped</title>
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
                Your Order Has Shipped!
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">Hi ${user_firstName},</p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                Your handwritten notes are on their way! They'll be delivered to your recipients soon.
              </p>
              
              <!-- Shipping Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: rgba(255,255,255,0.9);">Order #${order_id}</p>
                    <p style="margin: 0 0 12px; font-size: 24px; font-weight: bold; color: #ffffff;">${number_of_notes} Notes Shipped</p>
                    <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9);">Shipped on ${shipping_date}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Shipping Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                ${tracking_number ? `
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Tracking Number</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${tracking_number}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Ship Date</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${shipping_date}</td>
                </tr>
                <tr style="background-color: #ecfdf5;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #065f46; font-weight: bold;">Est. Delivery</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #065f46; text-align: right; font-weight: bold;">${estimated_delivery_date}</td>
                </tr>
              </table>
              
              <!-- CTAs -->
              <table width="100%" cellpadding="0" cellspacing="0">
                ${tracking_url ? `
                <tr>
                  <td style="text-align: center; padding-bottom: 15px;">
                    <a href="${tracking_url}" style="display: inline-block; background-color: #10B981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">Track Your Package</a>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="text-align: center;">
                    <a href="${order_details_url}" style="color: #10B981; text-decoration: none; font-size: 16px;">View Order Details →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Tip Box -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-size: 14px; font-weight: bold; color: #1f2937;">Pro Tip:</p>
                    <p style="margin: 0; font-size: 14px; color: #374151;">Plan your follow-up! The best time to reach out is 3-5 days after your notes are delivered.</p>
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
                Questions? Email us at <a href="mailto:orders@roofscribe.com" style="color: #FF7A00; text-decoration: none;">orders@roofscribe.com</a>
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

const createOrderShippedText = (props) => `
RoofScribe - Your Order Has Shipped!

Hi ${props.user_firstName},

Your handwritten notes are on their way! They'll be delivered to your recipients soon.

SHIPPING DETAILS:
Order #: ${props.order_id}
Notes Shipped: ${props.number_of_notes}
Ship Date: ${props.shipping_date}
${props.tracking_number ? `Tracking Number: ${props.tracking_number}` : ''}
Est. Delivery: ${props.estimated_delivery_date}

${props.tracking_url ? `Track Your Package: ${props.tracking_url}` : ''}
View Order Details: ${props.order_details_url}

PRO TIP:
Plan your follow-up! The best time to reach out is 3-5 days after your notes are delivered.

Questions? Email us at orders@roofscribe.com
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
      shipping_date: data.shipping_date || new Date().toLocaleDateString('en-US'),
      tracking_number: data.tracking_number || null,
      tracking_url: data.tracking_url || null,
      estimated_delivery_date: data.estimated_delivery_date || '5-7 business days',
      number_of_notes: data.number_of_notes,
      order_details_url: data.order_details_url || `${Deno.env.get("APP_URL")}/Order?id=${data.order_id}`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'RoofScribe <notifications@roofscribe.com>',
      to: data.user_email,
      subject: `Your order has shipped! (#${data.order_id})`,
      html: createOrderShippedHTML(emailData),
      text: createOrderShippedText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Order shipped notification sent' 
    });

  } catch (error) {
    console.error('Error sending order shipped email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});