import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Password Reset Email
 * Subject: Reset your NurturInk password
 */
export default function PasswordResetEmail({
  firstName,
  email,
  resetUrl,
  expiresIn = '1 hour',
  logoUrl
}) {
  return (
    <EmailWrapper preheader="We received a request to reset your NurturInk password.">
      <EmailHeader 
        title="Reset Your Password"
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.primary}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            We received a request to reset your NurturInk password.
          </p>

          {/* CTA Button */}
          <div style={{ margin: '32px 0', textAlign: 'center' }}>
            <EmailButton href={resetUrl}>Reset Password</EmailButton>
          </div>

          {/* Security Notice */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '16px' }}>
                <p style={{ margin: '0', fontSize: '14px', color: '#92400e' }}>
                  <strong>This link expires in {expiresIn}</strong> for security purposes.
                </p>
              </td>
            </tr>
          </table>

          <p style={textStyles.body}>
            If you didn't request this reset, please ignore this email. Your password will 
            remain unchanged.
          </p>

          <p style={textStyles.small}>
            For security reasons, never share your password with anyone, including NurturInk staff.
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
                  {resetUrl}
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
export const passwordResetEmailPlainText = ({
  firstName,
  email,
  resetUrl,
  expiresIn = '1 hour'
}) => `
Reset your NurturInk password

Hi ${firstName},

We received a request to reset your NurturInk password.

Reset Password: ${resetUrl}

This link expires in ${expiresIn} for security purposes.

If you didn't request this reset, please ignore this email. Your password will remain unchanged.

For security reasons, never share your password with anyone, including NurturInk staff.

The NurturInk Team
${emailFooterPlainText({ recipientEmail: email })}
`;