import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Account Settings Changed Email
 * Subject: Your NurturInk account settings were updated
 */
export default function AccountSettingsChangedEmail({
  firstName,
  email,
  changes = [], // Array of { setting, oldValue, newValue }
  changeTimestamp,
  changeLocation,
  changeDevice,
  secureAccountUrl,
  logoUrl
}) {
  return (
    <EmailWrapper preheader="Your NurturInk account settings were recently updated. Please review.">
      <EmailHeader 
        title="Account Settings Updated"
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.primary}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Your account settings were recently updated.
          </p>

          {/* Changes Box */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: BRAND_COLORS.dark }}>
                  Changes made:
                </p>
                <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                  {changes.map((change, index) => (
                    <tr key={index}>
                      <td style={{ paddingBottom: '8px' }}>
                        <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>• </span>
                        <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', fontWeight: '600' }}>
                          {change.setting}:
                        </span>
                        <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px', marginLeft: '4px' }}>
                          {change.oldValue && `${change.oldValue} → `}{change.newValue}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ paddingTop: '12px', borderTop: `1px solid ${BRAND_COLORS.border}` }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '13px' }}>
                        Date/Time: {changeTimestamp}
                      </span>
                    </td>
                  </tr>
                  {changeLocation && (
                    <tr>
                      <td style={{ paddingTop: '4px' }}>
                        <span style={{ color: BRAND_COLORS.neutral, fontSize: '13px' }}>
                          Location: {changeLocation}
                        </span>
                      </td>
                    </tr>
                  )}
                  {changeDevice && (
                    <tr>
                      <td style={{ paddingTop: '4px' }}>
                        <span style={{ color: BRAND_COLORS.neutral, fontSize: '13px' }}>
                          Device: {changeDevice}
                        </span>
                      </td>
                    </tr>
                  )}
                </table>
              </td>
            </tr>
          </table>

          <p style={textStyles.body}>
            If you made these changes, no action is needed.
          </p>

          {/* Warning Box */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#991b1b' }}>
                  If you didn't make these changes:
                </p>
                <EmailButton href={secureAccountUrl}>Secure My Account</EmailButton>
              </td>
            </tr>
          </table>

          <p style={textStyles.small}>
            We recommend changing your password immediately and reviewing your recent account activity.
          </p>

          <p style={textStyles.body}>
            Stay secure,<br />
            <strong>The NurturInk Security Team</strong>
          </p>
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
export const accountSettingsChangedEmailPlainText = ({
  firstName,
  email,
  changes = [],
  changeTimestamp,
  changeLocation,
  changeDevice,
  secureAccountUrl
}) => `
Your NurturInk account settings were updated

Hi ${firstName},

Your account settings were recently updated.

Changes made:
${changes.map(c => `• ${c.setting}: ${c.oldValue ? `${c.oldValue} → ` : ''}${c.newValue}`).join('\n')}

Date/Time: ${changeTimestamp}
${changeLocation ? `Location: ${changeLocation}` : ''}
${changeDevice ? `Device: ${changeDevice}` : ''}

If you made these changes, no action is needed.

If you didn't make these changes, secure your account immediately: ${secureAccountUrl}

We recommend changing your password immediately and reviewing your recent account activity.

Stay secure,
The NurturInk Security Team
${emailFooterPlainText({ recipientEmail: email })}
`;