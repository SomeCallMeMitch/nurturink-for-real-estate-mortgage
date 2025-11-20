import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const createReceiptHTML = ({
  user_firstName,
  order_number,
  transaction_id,
  purchase_date,
  credits_purchased,
  price_paid,
  original_price,
  discount_amount,
  coupon_code,
  payment_method,
  new_balance,
  send_note_url,
  receipt_url,
  app_logo_url
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Purchase Receipt</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 100%;">
          
          <!-- Header with Receipt Badge -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: left;">
                    <img src="${app_logo_url}" alt="RoofScribe" style="height: 40px; max-width: 200px;" />
                  </td>
                  <td style="text-align: right;">
                    <span style="display: inline-block; background-color: #FF7A00; color: #ffffff; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold;">RECEIPT</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Thank You Message -->
          <tr>
            <td style="padding: 20px 40px 30px;">
              <h1 style="margin: 0 0 10px; font-size: 24px; font-weight: bold; color: #111827;">Thanks for your purchase, ${user_firstName}!</h1>
              <p style="margin: 0; font-size: 16px; color: #374151;">Your credits have been added to your account and are ready to use.</p>
            </td>
          </tr>
          
          <!-- Transaction Details Table -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px;">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Receipt #</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${order_number}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Transaction ID</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${transaction_id}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Date</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${purchase_date}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Credits Purchased</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${credits_purchased}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Payment Method</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">•••• ${payment_method}</td>
                </tr>
                ${discount_amount > 0 ? `
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Original Price</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">$${(original_price / 100).toFixed(2)}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #059669; border-bottom: 1px solid #e5e7eb;">Discount (${coupon_code || 'Applied'})</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #059669; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">-$${(discount_amount / 100).toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr style="background-color: #fed7aa;">
                  <td style="padding: 16px 20px; font-size: 16px; color: #111827; font-weight: bold;">Total Paid</td>
                  <td style="padding: 16px 20px; font-size: 20px; color: #111827; text-align: right; font-weight: bold;">$${(price_paid / 100).toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Current Balance Display -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #FF7A00 0%, #ea580c 100%); border-radius: 8px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #ffffff; opacity: 0.9;">Your new balance</p>
                    <p style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff;">${new_balance} credits</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Primary CTA -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="${send_note_url}" style="display: inline-block; background-color: #FF7A00; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">Send Your ${new_balance > credits_purchased ? 'Next' : 'First'} Note</a>
            </td>
          </tr>
          
          <!-- What's Included -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Each credit includes a handwritten card, envelope, postage, and mailing.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Receipt Download -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="${receipt_url}" style="color: #FF7A00; text-decoration: none; font-size: 16px;">Download Receipt (PDF) →</a>
            </td>
          </tr>
          
          <!-- Support -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Questions about your purchase? Contact <a href="mailto:billing@roofscribe.com" style="color: #FF7A00; text-decoration: none;">billing@roofscribe.com</a></p>
            </td>
          </tr>
          
          <!-- Billing Footer -->
          <tr>
            <td style="padding: 40px 20px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #FF7A00;">RoofScribe</p>
              <p style="margin: 0 0 15px; font-size: 14px; color: #6b7280;">Authentic handwritten notes that build real relationships</p>
              <p style="margin: 0 0 15px; font-size: 14px; color: #6b7280;">Billing questions? Contact us at <a href="mailto:billing@roofscribe.com" style="color: #FF7A00; text-decoration: none;">billing@roofscribe.com</a></p>
              <p style="margin: 0 0 15px; font-size: 12px; color: #9ca3af;">This is a transactional email. Credits are non-refundable once used.</p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2024 RoofScribe. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const createReceiptText = (props) => `
RoofScribe - Purchase Receipt

Thanks for your purchase, ${props.user_firstName}!

Your credits have been added to your account and are ready to use.

TRANSACTION DETAILS:
Receipt #: ${props.order_number}
Transaction ID: ${props.transaction_id}
Date: ${props.purchase_date}
Credits Purchased: ${props.credits_purchased}
Payment Method: •••• ${props.payment_method}
${props.discount_amount > 0 ? `
Original Price: $${(props.original_price / 100).toFixed(2)}
Discount (${props.coupon_code || 'Applied'}): -$${(props.discount_amount / 100).toFixed(2)}
` : ''}
Total Paid: $${(props.price_paid / 100).toFixed(2)}

YOUR NEW BALANCE: ${props.new_balance} credits

Each credit includes a handwritten card, envelope, postage, and mailing.

Send Your Note: ${props.send_note_url}
Download Receipt: ${props.receipt_url}

Questions about your purchase? Contact billing@roofscribe.com

This is a transactional email. Credits are non-refundable once used.
© 2024 RoofScribe. All rights reserved.
`;

Deno.serve(async (req) => {
  try {
    const data = await req.json();
    const {
      user_firstName,
      user_email,
      order_number,
      transaction_id,
      purchase_date,
      credits_purchased,
      price_paid,
      original_price,
      discount_amount = 0,
      coupon_code,
      payment_method,
      new_balance,
      send_note_url,
      receipt_url,
      app_logo_url
    } = data;

    if (!user_firstName || !user_email || !order_number) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailData = {
      user_firstName,
      order_number,
      transaction_id: transaction_id || 'N/A',
      purchase_date: purchase_date || new Date().toLocaleString('en-US'),
      credits_purchased,
      price_paid,
      original_price: original_price || price_paid,
      discount_amount,
      coupon_code,
      payment_method,
      new_balance,
      send_note_url: send_note_url || `${Deno.env.get("APP_URL")}/FindClients`,
      receipt_url: receipt_url || `${Deno.env.get("APP_URL")}/receipts/${order_number}`,
      app_logo_url: app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`
    };

    const result = await resend.emails.send({
      from: 'RoofScribe <billing@roofscribe.com>',
      to: user_email,
      subject: `Your RoofScribe Credit Purchase - Receipt #${order_number}`,
      html: createReceiptHTML(emailData),
      text: createReceiptText(emailData)
    });

    return Response.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Personal credit purchase receipt sent' 
    });

  } catch (error) {
    console.error('Error sending personal credit receipt:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});