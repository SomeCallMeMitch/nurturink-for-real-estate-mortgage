import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Email Verification Email
 * Subject: Verify your email for NurturInk
 */
export default function EmailVerificationEmail({
  firstName,
  email,
  verifyUrl,
  expiresIn = '24 hours',
  logoUrl
}) {
  return (
    <EmailWrapper preheader="Please verify your email address to complete your NurturInk account setup.">
      <EmailHeader 
        title="Verify Your Email"
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.primary}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Please verify your email address to complete your NurturInk account setup.
          </p>

          {/* CTA Button */}
          <div style={{ margin: '32px 0', textAlign: 'center' }}>
            <EmailButton href={verifyUrl}>Verify Email</EmailButton>
          </div>

          <p style={{ ...textStyles.small, textAlign: 'center', marginBottom: '24px' }}>
            This link expires in {expiresIn}.
          </p>

          {/* Why Verify */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '600', color: BRAND_COLORS.dark }}>
                  Why verify?
                </p>
                <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '8px' }}>
                      <span style={{ color: BRAND_COLORS.success, marginRight: '8px' }}>•</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '14px' }}>Secure your account</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '8px' }}>
                      <span style={{ color: BRAND_COLORS.success, marginRight: '8px' }}>•</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '14px' }}>Receive important notifications</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ color: BRAND_COLORS.success, marginRight: '8px' }}>•</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '14px' }}>Enable password recovery</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style={textStyles.small}>
            If you didn't create this account, please ignore this email.
          </p>

          <p style={textStyles.body}>
            <strong>The NurturInk Team</strong>
          </p>

          {/* Fallback Link */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: `1px solid ${BRAND_COLORS.border}`
          }}>
            <tr>
              <td>
                <p style={{ margin: '0', fontSize: '12px', color: BRAND_COLORS.neutral }}>
                  Having trouble? Copy and paste this link:
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: BRAND_COLORS.accent, wordBreak: 'break-all' }}>
                  {verifyUrl}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <EmailFooter 
        recipientEmail={email}
        showUnsubscribe={false}
      />
    </EmailWrapper>
  );
}

// Plain text version
export const emailVerificationEmailPlainText = ({
  firstName,
  email,
  verifyUrl,
  expiresIn = '24 hours'
}) => `
Verify your email for NurturInk

Hi ${firstName},

Please verify your email address to complete your NurturInk account setup.

Verify Email: ${verifyUrl}

This link expires in ${expiresIn}.

Why verify?
• Secure your account
• Receive important notifications
• Enable password recovery

If you didn't create this account, please ignore this email.

The NurturInk Team
${emailFooterPlainText({ recipientEmail: email })}
`;