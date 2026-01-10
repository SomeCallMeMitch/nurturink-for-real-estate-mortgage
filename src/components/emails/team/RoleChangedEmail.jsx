import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { InfoBox, textStyles } from '../shared/EmailComponents';

/**
 * Role Change Notification Email
 * Subject: Your role in [Organization] has been updated
 */
export default function RoleChangedEmail({
  firstName,
  email,
  organizationName,
  oldRole,
  newRole,
  newRoleDisplay,
  changedByName,
  isPromotion = false,
  dashboardUrl,
  logoUrl
}) {
  return (
    <EmailWrapper preheader={`Your role in ${organizationName} has been updated to ${newRoleDisplay}`}>
      <EmailHeader 
        title="Your Role Has Been Updated"
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.primary}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Your role in <strong>{organizationName}</strong> has been updated by {changedByName}.
          </p>

          {/* Role Change Box */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '24px', textAlign: 'center' }}>
                <table role="presentation" cellSpacing="0" cellPadding="0" border="0" style={{ margin: '0 auto' }}>
                  <tr>
                    <td style={{ textAlign: 'center' }}>
                      <p style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '12px', 
                        color: BRAND_COLORS.neutral,
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>Previous Role</p>
                      <p style={{ 
                        margin: '0', 
                        fontSize: '18px', 
                        color: BRAND_COLORS.neutral,
                        textDecoration: 'line-through'
                      }}>{oldRole}</p>
                    </td>
                    <td style={{ padding: '0 24px' }}>
                      <span style={{ fontSize: '24px', color: BRAND_COLORS.neutral }}>→</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <p style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '12px', 
                        color: BRAND_COLORS.neutral,
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>New Role</p>
                      <p style={{ 
                        margin: '0', 
                        fontSize: '18px', 
                        fontWeight: '600',
                        color: BRAND_COLORS.accent
                      }}>{newRoleDisplay}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          {/* What this means */}
          {newRole === 'admin' || newRole === 'organization_owner' ? (
            <InfoBox variant="info">
              <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: BRAND_COLORS.dark }}>
                What this means for you:
              </p>
              <ul style={{ margin: '0', paddingLeft: '20px', color: BRAND_COLORS.muted, fontSize: '14px' }}>
                <li>You can now manage team members</li>
                <li>You can allocate credits to team members</li>
                <li>You have access to organization settings</li>
                <li>You can view all team activity and reports</li>
              </ul>
            </InfoBox>
          ) : (
            <InfoBox variant="default">
              <p style={{ margin: '0', fontSize: '14px', color: BRAND_COLORS.muted }}>
                Your permissions have been updated. You can continue to send notes and access 
                your client list as usual.
              </p>
            </InfoBox>
          )}

          {/* CTA Button */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <EmailButton href={dashboardUrl}>View Dashboard</EmailButton>
          </div>

          <p style={textStyles.small}>
            If you have questions about this change, please contact {changedByName} or reply to this email.
          </p>

          <p style={textStyles.body}>
            Best regards,<br />
            <strong>The NurturInk Team</strong>
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
export const roleChangedEmailPlainText = ({
  firstName,
  email,
  organizationName,
  oldRole,
  newRoleDisplay,
  changedByName,
  dashboardUrl
}) => `
Your Role Has Been Updated

Hi ${firstName},

Your role in ${organizationName} has been updated by ${changedByName}.

Previous Role: ${oldRole}
New Role: ${newRoleDisplay}

View Dashboard: ${dashboardUrl}

If you have questions about this change, please contact ${changedByName} or reply to this email.

Best regards,
The NurturInk Team
${emailFooterPlainText({ recipientEmail: email })}
`;