import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Auto-Refill Success Email
 * Subject: Auto-refill successful: [X] credits added
 */
export default function AutoRefillSuccessEmail({
  firstName,
  email,
  triggerThreshold,
  creditsAdded,
  amountCharged,
  paymentMethod,
  newBalance,
  transactionUrl,
  autoRefillSettingsUrl,
  logoUrl
}) {
  return (
    <EmailWrapper preheader={`Your auto-refill was triggered and ${creditsAdded} credits have been added to your account.`}>
      <EmailHeader 
        title="Auto-Refill Successful"
        subtitle={`${creditsAdded} credits added`}
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.success}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Your auto-refill was triggered and completed successfully.
          </p>

          {/* Refill Details */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: BRAND_COLORS.dark }}>
                  Auto-Refill Details:
                </h3>
                <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Trigger:</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', marginLeft: '8px' }}>
                        Balance dropped below {triggerThreshold} credits
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Credits Added:</span>
                      <span style={{ color: BRAND_COLORS.accent, fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
                        {creditsAdded} credits
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Amount Charged:</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
                        ${amountCharged}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Payment Method:</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', marginLeft: '8px' }}>
                        {paymentMethod}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          {/* New Balance */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            border: `2px solid ${BRAND_COLORS.success}`,
            borderRadius: '8px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: BRAND_COLORS.neutral }}>New Balance</p>
                <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: BRAND_COLORS.accent }}>
                  {newBalance} credits
                </p>
              </td>
            </tr>
          </table>

          {/* CTA */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <EmailButton href={transactionUrl} variant="secondary">View Transaction</EmailButton>
          </div>

          {/* Current Settings */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: BRAND_COLORS.dark }}>
                  Your auto-refill settings:
                </p>
                <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '6px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '13px' }}>• Trigger threshold: {triggerThreshold} credits</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '6px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '13px' }}>• Refill amount: {creditsAdded} credits</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ color: BRAND_COLORS.success, fontSize: '13px' }}>• Status: Active</span>
                    </td>
                  </tr>
                </table>
                <div style={{ marginTop: '12px' }}>
                  <a href={autoRefillSettingsUrl} style={{
                    color: BRAND_COLORS.accent,
                    fontSize: '13px',
                    textDecoration: 'none'
                  }}>
                    Manage Auto-Refill Settings →
                  </a>
                </div>
              </td>
            </tr>
          </table>

          <p style={textStyles.body}>
            Continue sending notes without interruption—you're all set!
          </p>

          <p style={textStyles.body}>
            <strong>The NurturInk Team</strong>
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
export const autoRefillSuccessEmailPlainText = ({
  firstName,
  email,
  triggerThreshold,
  creditsAdded,
  amountCharged,
  paymentMethod,
  newBalance,
  transactionUrl,
  autoRefillSettingsUrl
}) => `
Auto-refill successful: ${creditsAdded} credits added

Hi ${firstName},

Your auto-refill was triggered and completed successfully.

Auto-Refill Details:
• Trigger: Balance dropped below ${triggerThreshold} credits
• Credits Added: ${creditsAdded} credits
• Amount Charged: $${amountCharged}
• Payment Method: ${paymentMethod}

New Balance: ${newBalance} credits

View Transaction: ${transactionUrl}

Your auto-refill settings:
• Trigger threshold: ${triggerThreshold} credits
• Refill amount: ${creditsAdded} credits
• Status: Active

Manage Auto-Refill Settings: ${autoRefillSettingsUrl}

Continue sending notes without interruption—you're all set!

The NurturInk Team
${emailFooterPlainText({ recipientEmail: email, type: 'billing' })}
`;