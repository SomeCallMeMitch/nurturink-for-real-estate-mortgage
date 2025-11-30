import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createOrderPrintedHTML = ({
  user_firstName,
  order_id,
  printed_date,
  number_of_notes,
  estimated_shipping_date,
  order_details_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Printed</title>
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
                Your Notes Are Printed!
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">Hi ${user_firstName},</p>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                Your handwritten notes have been printed and are being prepared for shipping.
              </p>
              
              <!-- Status Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border: 2px solid #10B981; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #065f46;">Order #${order_id}</p>
                    <p style="margin: 0 0 12px; font-size: 24px; font-weight: bold; color: #065f46;">${number_of_notes} Notes Printed</p>
                    <p style="margin: 0; font-size: 14px; color: #065f46;">Printed on ${printed_date}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Timeline -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 12px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background-color: #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <span style="color: white; font-size: 14px;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 14px; color: #065f46; font-weight: bold;">Order Received</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background-color: #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <span style="color: white; font-size: 14px;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 14px; color: #065f46; font-weight: bold;">Printed</p>
                          <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">Completed ${printed_date}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background-color: #e5e7eb; border-radius: 50%;"></div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 14px; color: #6b7280;">Shipping</p>
                          <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">Expected ${estimated_shipping_date}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background-color: #e5e7eb; border-radius: 50%;"></div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; font-size: 14px; color: #6b7280;">Delivered</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                We'll send you another email with tracking information once your order ships.
              </p>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <a href="${order_details_url}" style="display: inline-block; background-color: #10B981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">View Order Details</a>
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

const createOrderPrintedText = (props) => `
RoofScribe - Your Notes Are Printed!

Hi ${props.user_firstName},

Your handwritten notes have been printed and are being prepared for shipping.

ORDER STATUS:
Order #: ${props.order_id}
Notes Printed: ${props.number_of_notes}
Printed On: ${props.printed_date}
Expected Shipping: ${props.estimated_shipping_date}

We'll send you another email with tracking information once your order ships.

View Order Details: ${props.order_details_url}

Questions? Email us at orders@roofscribe.com
© 2024 RoofScribe. All rights reserved.
`;

Deno.serve(async (req) => {
  try {
    const data = await req.json();

    const emailData = {
      user_firstName: data.user_firstName,
      order_id: data.order_id,
      printed_date: data.printed_date || new Date().toLocaleDateString('en-US'),
      number_of_notes: data.number_of_notes,
      estimated_shipping_date: data.estimated_shipping_date || 'Within 1-2 business days',
      order_details_url: data.order_details_url || `${Deno.env.get("APP_URL")}/Order?id=${data.order_id}`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'RoofScribe <notifications@roofscribe.com>',
      to: data.user_email,
      subject: `Your order has been printed (#${data.order_id})`,
      html: createOrderPrintedHTML(emailData),
      text: createOrderPrintedText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Order printed notification sent' 
    });

  } catch (error) {
    console.error('Error sending order printed email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});