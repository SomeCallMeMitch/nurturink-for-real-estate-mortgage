import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createOrderReceivedHTML = ({
  user_firstName,
  order_id,
  order_date,
  number_of_notes,
  price_display,
  print_estimated_date,
  estimated_delivery_window,
  order_details_url,
  send_more_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Received</title>
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
                We've Received Your Order!
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">Hi ${user_firstName},</p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                Great news! We've received your order and our team is getting ready to create your handwritten notes.
              </p>
              
              <!-- Order Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: rgba(255,255,255,0.9);">Order #${order_id}</p>
                    <p style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff;">${number_of_notes} Notes</p>
                  </td>
                </tr>
              </table>
              
              <!-- Order Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Order Date</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${order_date}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Number of Notes</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${number_of_notes}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Credits Used</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${price_display}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Est. Print Date</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${print_estimated_date}</td>
                </tr>
                <tr style="background-color: #ecfdf5;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #065f46; font-weight: bold;">Est. Delivery</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #065f46; text-align: right; font-weight: bold;">${estimated_delivery_window}</td>
                </tr>
              </table>
              
              <!-- What's Next -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 15px; font-size: 16px; font-weight: bold; color: #1f2937;">What happens next:</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #374151;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #10B981; color: white; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 12px; font-size: 12px;">1</span>
                          Your notes will be handwritten by our team
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #374151;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #10B981; color: white; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 12px; font-size: 12px;">2</span>
                          We'll notify you when they're printed
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #374151;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #10B981; color: white; border-radius: 50%; text-align: center; line-height: 24px; margin-right: 12px; font-size: 12px;">3</span>
                          We'll send tracking when they ship
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTAs -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 20px;">
                    <a href="${order_details_url}" style="display: inline-block; background-color: #10B981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">View Order Details</a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center;">
                    <a href="${send_more_url}" style="color: #10B981; text-decoration: none; font-size: 16px;">Send More Notes →</a>
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

const createOrderReceivedText = (props) => `
RoofScribe - Order Received!

Hi ${props.user_firstName},

Great news! We've received your order and our team is getting ready to create your handwritten notes.

ORDER SUMMARY:
Order #: ${props.order_id}
Order Date: ${props.order_date}
Number of Notes: ${props.number_of_notes}
Credits Used: ${props.price_display}
Est. Print Date: ${props.print_estimated_date}
Est. Delivery: ${props.estimated_delivery_window}

WHAT HAPPENS NEXT:
1. Your notes will be handwritten by our team
2. We'll notify you when they're printed
3. We'll send tracking when they ship

View Order Details: ${props.order_details_url}
Send More Notes: ${props.send_more_url}

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
      order_date: data.order_date || new Date().toLocaleDateString('en-US'),
      number_of_notes: data.number_of_notes,
      price_display: data.price_display || `${data.number_of_notes} credits`,
      print_estimated_date: data.print_estimated_date || 'Within 2-3 business days',
      estimated_delivery_window: data.estimated_delivery_window || '7-10 business days',
      order_details_url: data.order_details_url || `${Deno.env.get("APP_URL")}/Order?id=${data.order_id}`,
      send_more_url: data.send_more_url || `${Deno.env.get("APP_URL")}/FindClients`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'RoofScribe <orders@roofscribe.com>',
      to: data.user_email,
      subject: `We've received your order! (#${data.order_id})`,
      html: createOrderReceivedHTML(emailData),
      text: createOrderReceivedText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Order received confirmation sent' 
    });

  } catch (error) {
    console.error('Error sending order received email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});