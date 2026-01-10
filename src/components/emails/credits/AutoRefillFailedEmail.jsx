import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { InfoBox, textStyles } from '../shared/EmailComponents';

/**
 * Auto-Refill Failed Email
 * Subject: Auto-refill failed - Action required
 */
export default function AutoRefillFailedEmail({
  firstName,
  email,
  attemptedAmount,
  attemptedCredits,
  paymentMethod,
  failureReason, // 'insufficient_funds', 'card_declined', 'card_expired'
  currentBalance,
  updatePaymentUrl,
  addCreditsUrl,
  logoUrl
}) {
  const failureMessages = {
    insufficient_funds: 'Insufficient funds',
    card_declined: 'Card declined',
    card_expired: 'Card expired',
    payment_failed: 'Payment could not be processed'
  };

  const failureDisplay = failureMessages[failureReason] || failureReason;

  return (
    <EmailWrapper preheader="Your auto-refill payment failed. Please update your payment method to continue.">
      <EmailHeader 
        title="Auto-Refill Failed"
        subtitle="Action required"
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.error}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            We attempted to process your auto-refill but the payment failed.
          </p>

          {/* Failure Details */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <span style={{ color: '#991b1b', fontSize: '14px' }}>Attempted Charge:</span>
                      <span style={{ color: '#991b1b', fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
                        ${attemptedAmount} for {attemptedCredits} credits
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <span style={{ color: '#991b1b', fontSize: '14px' }}>Payment Method:</span>
                      <span style={{ color: '#991b1b', fontSize: '14px', marginLeft: '8px' }}>
                        {paymentMethod}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ color: '#991b1b', fontSize: '14px' }}>Reason:</span>
                      <span style={{ color: '#991b1b', fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
                        {failureDisplay}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          {/* Current Balance Warning */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <tr>
              <td style={{ padding: '16px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#92400e' }}>Current Balance</p>
                <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
                  {currentBalance} credits
                </p>
              </td>
            </tr>
          </table>

          {/* Action Required */}
          <h2 style={textStyles.heading2}>Action Required:</h2>
          <ol style={{ 
            paddingLeft: '20px', 
            marginBottom: '24px',
            color: BRAND_COLORS.muted,
            lineHeight: '1.8'
          }}>
            <li>Update your payment method</li>
            <li>Manually add credits</li>
          </ol>

          {/* CTA Buttons */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
            <tr>
              <td align="center">
                <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingRight: '12px' }}>
                      <EmailButton href={updatePaymentUrl} variant="secondary">Update Payment Method</EmailButton>
                    </td>
                    <td>
                      <EmailButton href={addCreditsUrl}>Add Credits Manually</EmailButton>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style={textStyles.small}>
            We'll try auto-refill again in 24 hours. To avoid service interruption, please 
            update your payment information as soon as possible.
          </p>

          <p style={textStyles.small}>
            Need help? Reply to this email or contact support.
          </p>

          <p style={textStyles.body}>
            <strong>The NurturInk Support Team</strong>
          </p>
        </td>
      </tr>
      
      <EmailFooter 
        recipientEmail={email}
        type="billing"
        showUnsubscribe={false}
      />
    </EmailWrapper>
  );
}

// Plain text version
export const autoRefillFailedEmailPlainText = ({
  firstName,
  email,
  attemptedAmount,
  attemptedCredits,
  paymentMethod,
  failureReason,
  currentBalance,
  updatePaymentUrl,
  addCreditsUrl
}) => `
Auto-refill failed - Action required

Hi ${firstName},

We attempted to process your auto-refill but the payment failed.

Attempted Charge: $${attemptedAmount} for ${attemptedCredits} credits
Payment Method: ${paymentMethod}
Reason: ${failureReason}

Current Balance: ${currentBalance} credits

Action Required:
1. Update your payment method
2. Manually add credits

Update Payment Method: ${updatePaymentUrl}
Add Credits Manually: ${addCreditsUrl}

We'll try auto-refill again in 24 hours. To avoid service interruption, please update your payment information as soon as possible.

Need help? Reply to this email or contact support.

The NurturInk Support Team
${emailFooterPlainText({ recipientEmail: email, type: 'billing' })}
`;