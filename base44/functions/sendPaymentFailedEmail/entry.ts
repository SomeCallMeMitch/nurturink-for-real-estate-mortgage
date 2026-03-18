import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const getUserFriendlyFailureReason = (code) => {
  const reasons = {
    'card_declined': 'Your card was declined. Please try another payment method or contact your bank.',
    'insufficient_funds': 'Your card has insufficient funds. Please try another payment method.',
    'expired_card': 'Your card has expired. Please update your payment information.',
    'incorrect_cvc': 'The security code (CVC) was incorrect. Please try again.',
    'processing_error': 'There was a technical error processing your payment. Please try again.',
    'invalid_card': 'Your card information appears to be invalid. Please check and try again.',
    'card_not_supported': 'This card type is not supported. Please try another card.',
  };
  return reasons[code] || 'We were unable to process your payment. Please try again or contact support.';
};

const getPrimaryAction = (failureCode) => {
  const cardIssues = ['card_declined', 'insufficient_funds', 'expired_card', 'invalid_card'];
  return cardIssues.includes(failureCode) ? 'update' : 'retry';
};

const createPaymentFailedHTML = ({
  user_firstName,
  is_org_purchase,
  organization_name,
  credits_attempted,
  amount_attempted,
  failure_reason,
  failure_code,
  payment_method,
  attempt_timestamp,
  retry_url,
  update_payment_url,
  support_url,
  app_logo_url,
  primary_action
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Failed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 100%;">
          
          <!-- Header with Alert Badge -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: left;">
                    <img src="${app_logo_url}" alt="NurturInk" style="height: 40px; max-width: 200px;" />
                  </td>
                  <td style="text-align: right;">
                    <span style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: bold;">NOTICE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Clear Message -->
          <tr>
            <td style="padding: 20px 40px 30px;">
              <p style="margin: 0 0 10px; font-size: 16px; color: #374151;">Hi ${user_firstName},</p>
              <h1 style="margin: 0 0 15px; font-size: 24px; font-weight: bold; color: #111827;">Payment was unsuccessful</h1>
              <p style="margin: 0; font-size: 16px; color: #374151;">We weren't able to process your payment. Here's what happened and how to fix it.</p>
            </td>
          </tr>
          
          <!-- Details Section -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px;">
                <tr style="background-color: #f9fafb;">
                  <td colspan="2" style="padding: 16px 20px; font-size: 16px; color: #1f2937; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Transaction Details</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">What you tried to purchase</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${credits_attempted} credits${is_org_purchase ? ` for ${organization_name}` : ''}</td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Amount</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">$${(amount_attempted / 100).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Payment method</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">•••• ${payment_method}</td>
                </tr>
                <tr style="background-color: #fef3c7;">
                  <td style="padding: 12px 20px; font-size: 14px; color: #92400e; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Reason</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #92400e; text-align: right; border-bottom: 1px solid #e5e7eb;">${failure_reason}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 14px; color: #6b7280;">When</td>
                  <td style="padding: 12px 20px; font-size: 14px; color: #111827; text-align: right;">${attempt_timestamp}</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 15px; font-size: 20px; font-weight: bold; color: #1f2937;">Next steps:</h2>
              <ol style="margin: 0; padding: 0 0 0 20px; font-size: 16px; line-height: 1.8; color: #374151;">
                ${primary_action === 'update' ? `
                  <li>Update your payment method, OR</li>
                  <li>Try again with the same card, OR</li>
                  <li>Contact your bank for details</li>
                ` : `
                  <li>Retry your purchase</li>
                  <li>If problem persists, contact support</li>
                `}
              </ol>
            </td>
          </tr>
          
          <!-- Primary CTA -->
          <tr>
            <td style="padding: 0 40px 20px; text-align: center;">
              <a href="${primary_action === 'update' ? update_payment_url : retry_url}" style="display: inline-block; background-color: #FF7A00; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">${primary_action === 'update' ? 'Update Payment Method' : 'Retry Payment'}</a>
            </td>
          </tr>
          
          <!-- Secondary CTA -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="${support_url}" style="color: #FF7A00; text-decoration: none; font-size: 16px;">Contact Support →</a>
            </td>
          </tr>
          
          <!-- Assurance Box -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 16px; color: #166534;">🔒 Your account is secure. No charges were made.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Support Context -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">If you need help, reference code: <strong>${failure_code}</strong></p>
            </td>
          </tr>
          
          <!-- Billing Footer -->
          <tr>
            <td style="padding: 40px 20px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #FF7A00;">NurturInk</p>
              <p style="margin: 0 0 15px; font-size: 14px; color: #6b7280;">Authentic handwritten notes that build real relationships</p>
              <p style="margin: 0 0 15px; font-size: 14px; color: #6b7280;">Billing questions? Contact us at <a href="mailto:billing@nurturink.com" style="color: #FF7A00; text-decoration: none;">billing@nurturink.com</a></p>
              <p style="margin: 0 0 15px; font-size: 12px; color: #9ca3af;">This is a transactional email. Credits are non-refundable once used.</p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2024 NurturInk. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const createPaymentFailedText = (props) => `
NurturInk - Payment Failed

Hi ${props.user_firstName},

Payment was unsuccessful

We weren't able to process your payment. Here's what happened and how to fix it.

TRANSACTION DETAILS:
What you tried to purchase: ${props.credits_attempted} credits${props.is_org_purchase ? ` for ${props.organization_name}` : ''}
Amount: $${(props.amount_attempted / 100).toFixed(2)}
Payment method: •••• ${props.payment_method}
Reason: ${props.failure_reason}
When: ${props.attempt_timestamp}

NEXT STEPS:
${props.primary_action === 'update' ? `
1. Update your payment method, OR
2. Try again with the same card, OR
3. Contact your bank for details
` : `
1. Retry your purchase
2. If problem persists, contact support
`}

${props.primary_action === 'update' ? 'Update Payment Method' : 'Retry Payment'}: ${props.primary_action === 'update' ? props.update_payment_url : props.retry_url}
Contact Support: ${props.support_url}

🔒 Your account is secure. No charges were made.

If you need help, reference code: ${props.failure_code}

Billing questions? Contact billing@nurturink.com
© 2024 NurturInk. All rights reserved.
`;

Deno.serve(async (req) => {
  try {
    const data = await req.json();

    const failure_reason = data.failure_reason || getUserFriendlyFailureReason(data.failure_code);
    const primary_action = getPrimaryAction(data.failure_code);

    const emailData = {
      user_firstName: data.user_firstName,
      is_org_purchase: data.is_org_purchase || false,
      organization_name: data.organization_name,
      credits_attempted: data.credits_attempted,
      amount_attempted: data.amount_attempted,
      failure_reason,
      failure_code: data.failure_code,
      payment_method: data.payment_method,
      attempt_timestamp: data.attempt_timestamp || new Date().toLocaleString('en-US'),
      retry_url: data.retry_url || `${Deno.env.get("APP_URL")}/Credits`,
      update_payment_url: data.update_payment_url || `${Deno.env.get("APP_URL")}/SettingsProfile`,
      support_url: data.support_url || `${Deno.env.get("APP_URL")}/support`,
      app_logo_url: data.app_logo_url || `${Deno.env.get("APP_URL")}/logo.png`,
      primary_action
    };

    // Determine recipients based on purchase type
    const recipients = [data.user_email];
    
    // For org purchases, add org owner if different from purchaser
    if (data.is_org_purchase && data.org_owner_email && data.org_owner_email !== data.user_email) {
      recipients.push(data.org_owner_email);
    }

    const emailPromises = recipients.map(email =>
      resend.emails.send({
        from: 'NurturInk <billing@nurturink.com>',
        to: email,
        subject: 'Payment Failed - Action Required',
        html: createPaymentFailedHTML(emailData),
        text: createPaymentFailedText(emailData)
      })
    );

    await Promise.all(emailPromises);

    return Response.json({ 
      success: true, 
      message: `Payment failed notification sent to ${recipients.length} recipient(s)` 
    });

  } catch (error) {
    console.error('Error sending payment failed email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});