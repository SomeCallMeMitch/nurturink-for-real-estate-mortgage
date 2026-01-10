import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Credits Depleted Email
 * Subject: No Credits Remaining - Refill to Continue
 */
export default function CreditsDepletedEmail({
  firstName,
  email,
  refillCreditsUrl,
  pricingUrl,
  autoRefillUrl,
  logoUrl
}) {
  return (
    <EmailWrapper preheader="Your NurturInk credit balance is now at zero. Refill to continue sending notes.">
      <EmailHeader 
        title="No Credits Remaining"
        subtitle="Refill to continue sending notes"
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.error}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Your NurturInk credit balance is now at zero.
          </p>

          {/* Zero Balance Display */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <tr>
              <td style={{ padding: '32px' }}>
                <div style={{ fontSize: '64px', marginBottom: '8px' }}>🛑</div>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#991b1b' }}>Current Balance</p>
                <p style={{ margin: '0', fontSize: '48px', fontWeight: 'bold', color: '#991b1b' }}>0</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#991b1b' }}>credits</p>
              </td>
            </tr>
          </table>

          <p style={textStyles.body}>
            You cannot send new notes until you add more credits. Don't worry—your account 
            and all your data are safe.
          </p>

          {/* CTA Button */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <EmailButton href={refillCreditsUrl}>Refill Credits</EmailButton>
          </div>

          {/* Why customers love credits */}
          <h2 style={textStyles.heading2}>Why customers love our credit packs:</h2>
          <table role="presentation" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
            <tr>
              <td style={{ paddingBottom: '8px' }}>
                <span style={{ color: BRAND_COLORS.success, marginRight: '8px' }}>✓</span>
                <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>No expiration dates</span>
              </td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '8px' }}>
                <span style={{ color: BRAND_COLORS.success, marginRight: '8px' }}>✓</span>
                <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>No monthly fees</span>
              </td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '8px' }}>
                <span style={{ color: BRAND_COLORS.success, marginRight: '8px' }}>✓</span>
                <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>Only pay for what you use</span>
              </td>
            </tr>
            <tr>
              <td>
                <span style={{ color: BRAND_COLORS.success, marginRight: '8px' }}>✓</span>
                <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>Volume discounts on larger packs</span>
              </td>
            </tr>
          </table>

          {/* Secondary CTA */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <EmailButton href={pricingUrl} variant="secondary">View Pricing Options</EmailButton>
          </div>

          {/* Auto-refill suggestion */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: BRAND_COLORS.muted }}>
                  Set up auto-refill to prevent this in the future:
                </p>
                <a href={autoRefillUrl} style={{
                  color: BRAND_COLORS.accent,
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}>
                  Enable Auto-Refill →
                </a>
              </td>
            </tr>
          </table>

          <p style={textStyles.small}>
            Questions? We're here to help.
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
export const creditsDepletedEmailPlainText = ({
  firstName,
  email,
  refillCreditsUrl,
  pricingUrl,
  autoRefillUrl
}) => `
No Credits Remaining - Refill to Continue

Hi ${firstName},

Your NurturInk credit balance is now at zero.

Current Balance: 0 credits

You cannot send new notes until you add more credits. Don't worry—your account and all your data are safe.

Refill Credits: ${refillCreditsUrl}

Why customers love our credit packs:
✓ No expiration dates
✓ No monthly fees
✓ Only pay for what you use
✓ Volume discounts on larger packs

View Pricing Options: ${pricingUrl}

Set up auto-refill to prevent this in the future: ${autoRefillUrl}

Questions? We're here to help.

The NurturInk Team
${emailFooterPlainText({ recipientEmail: email, type: 'billing' })}
`;