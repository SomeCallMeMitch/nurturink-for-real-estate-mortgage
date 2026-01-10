import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Low Credit Warning Email
 * Subject: Running Low: Only [X] credits remaining
 */
export default function LowCreditWarningEmail({
  firstName,
  email,
  currentBalance,
  notesRemaining,
  addCreditsUrl,
  autoRefillUrl,
  logoUrl
}) {
  return (
    <EmailWrapper preheader={`Heads up—your NurturInk credit balance is running low. Only ${currentBalance} credits remaining.`}>
      <EmailHeader 
        title="Running Low on Credits"
        subtitle={`Only ${currentBalance} credits remaining`}
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.warning}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Heads up—your NurturInk credit balance is running low.
          </p>

          {/* Balance Display */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <tr>
              <td style={{ padding: '24px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#92400e' }}>Current Balance</p>
                <p style={{ margin: '0 0 8px 0', fontSize: '48px', fontWeight: 'bold', color: '#92400e' }}>
                  {currentBalance}
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: '#92400e' }}>credits</p>
                <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#92400e' }}>
                  This is enough for approximately <strong>{notesRemaining} more notes</strong>.
                </p>
              </td>
            </tr>
          </table>

          <p style={textStyles.body}>
            Don't let low credits interrupt your client outreach. Refill now to keep the momentum going.
          </p>

          {/* CTA Button */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <EmailButton href={addCreditsUrl}>Add Credits</EmailButton>
          </div>

          {/* Pro Tip */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '600', color: BRAND_COLORS.dark }}>
                  💡 Pro Tip
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: BRAND_COLORS.muted }}>
                  Enable auto-refill to never run out. We'll automatically add credits when your 
                  balance drops below your set threshold.
                </p>
                <div style={{ marginTop: '16px' }}>
                  <a href={autoRefillUrl} style={{
                    color: BRAND_COLORS.accent,
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}>
                    Enable Auto-Refill →
                  </a>
                </div>
              </td>
            </tr>
          </table>

          <p style={textStyles.small}>
            Questions about credits or pricing? Check our pricing page or reply to this email.
          </p>

          <p style={textStyles.body}>
            Best regards,<br />
            <strong>The NurturInk Team</strong>
          </p>
        </td>
      </tr>
      
      <EmailFooter 
        recipientEmail={email}
        type="billing"
        showUnsubscribe={true}
      />
    </EmailWrapper>
  );
}

// Plain text version
export const lowCreditWarningEmailPlainText = ({
  firstName,
  email,
  currentBalance,
  notesRemaining,
  addCreditsUrl,
  autoRefillUrl
}) => `
Running Low: Only ${currentBalance} credits remaining

Hi ${firstName},

Heads up—your NurturInk credit balance is running low.

Current Balance: ${currentBalance} credits
This is enough for approximately ${notesRemaining} more notes.

Don't let low credits interrupt your client outreach. Refill now to keep the momentum going.

Add Credits: ${addCreditsUrl}

Pro Tip: Enable auto-refill to never run out. We'll automatically add credits when your balance drops below your set threshold.

Enable Auto-Refill: ${autoRefillUrl}

Questions about credits or pricing? Check our pricing page or reply to this email.

Best regards,
The NurturInk Team
${emailFooterPlainText({ recipientEmail: email, type: 'billing' })}
`;