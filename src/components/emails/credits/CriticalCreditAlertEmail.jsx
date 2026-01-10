import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Critical Credit Alert Email
 * Subject: Almost Out: [X] credits left
 */
export default function CriticalCreditAlertEmail({
  firstName,
  email,
  currentBalance,
  pricingTiers = [],
  addCreditsUrl,
  autoRefillUrl,
  logoUrl
}) {
  return (
    <EmailWrapper preheader={`URGENT: You're almost out of credits. Only ${currentBalance} remaining.`}>
      <EmailHeader 
        title="Almost Out of Credits"
        subtitle="Action required"
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.error}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={{ ...textStyles.body, fontWeight: '600' }}>
            URGENT: You're almost out of credits.
          </p>

          {/* Balance Display */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <tr>
              <td style={{ padding: '24px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#991b1b' }}>Current Balance</p>
                <p style={{ margin: '0 0 8px 0', fontSize: '56px', fontWeight: 'bold', color: '#991b1b' }}>
                  {currentBalance}
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: '#991b1b' }}>credits remaining</p>
              </td>
            </tr>
          </table>

          <p style={textStyles.body}>
            You won't be able to send new notes once your credits reach zero. 
            Any notes currently in progress will complete normally.
          </p>

          {/* CTA Button */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <EmailButton href={addCreditsUrl}>Add Credits Now</EmailButton>
          </div>

          {/* Pricing Options */}
          {pricingTiers.length > 0 && (
            <>
              <h2 style={textStyles.heading2}>Pricing Options:</h2>
              <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                marginBottom: '24px'
              }}>
                {pricingTiers.map((tier, index) => (
                  <tr key={index}>
                    <td style={{ 
                      paddingBottom: '8px',
                      color: BRAND_COLORS.muted,
                      fontSize: '15px'
                    }}>
                      <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                      <strong style={{ color: BRAND_COLORS.dark }}>{tier.name}:</strong> {tier.credits} credits - ${tier.price}
                      {tier.isBestValue && (
                        <span style={{ 
                          backgroundColor: BRAND_COLORS.success,
                          color: '#ffffff',
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          marginLeft: '8px'
                        }}>Best Value</span>
                      )}
                    </td>
                  </tr>
                ))}
              </table>
            </>
          )}

          {/* Auto-refill CTA */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '15px', color: BRAND_COLORS.muted }}>
                  Avoid interruptions—set up auto-refill:
                </p>
                <EmailButton href={autoRefillUrl} variant="secondary">Enable Auto-Refill</EmailButton>
              </td>
            </tr>
          </table>

          <p style={textStyles.small}>
            Need help? Reply to this email or contact our support team.
          </p>

          <p style={textStyles.body}>
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
export const criticalCreditAlertEmailPlainText = ({
  firstName,
  email,
  currentBalance,
  pricingTiers = [],
  addCreditsUrl,
  autoRefillUrl
}) => `
URGENT: Almost Out - ${currentBalance} credits left

Hi ${firstName},

URGENT: You're almost out of credits.

Current Balance: ${currentBalance} credits remaining

You won't be able to send new notes once your credits reach zero. Any notes currently in progress will complete normally.

Add Credits Now: ${addCreditsUrl}

${pricingTiers.length > 0 ? `Pricing Options:
${pricingTiers.map(tier => `• ${tier.name}: ${tier.credits} credits - $${tier.price}${tier.isBestValue ? ' (Best Value)' : ''}`).join('\n')}
` : ''}

Avoid interruptions—set up auto-refill: ${autoRefillUrl}

Need help? Reply to this email or contact our support team.

The NurturInk Team
${emailFooterPlainText({ recipientEmail: email, type: 'billing' })}
`;