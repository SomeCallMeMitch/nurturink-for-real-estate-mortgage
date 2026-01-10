import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { InfoBox, textStyles } from '../shared/EmailComponents';

/**
 * Team Invitation Email
 * Subject: [Inviter Name] invited you to join [Organization] on NurturInk
 */
export default function TeamInvitationEmail({
  inviterFirstName,
  inviterFullName,
  recipientEmail,
  organizationName,
  role,
  roleDisplay,
  acceptUrl,
  expiresIn = '7 days',
  isAdmin = false,
  logoUrl
}) {
  return (
    <EmailWrapper preheader={`${inviterFirstName} invited you to join ${organizationName} on NurturInk`}>
      <EmailHeader 
        title={`${inviterFirstName} invited you to join ${organizationName}`}
        logoUrl={logoUrl}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi there,
          </p>
          
          <p style={textStyles.body}>
            {inviterFullName} has invited you to join <strong>{organizationName}</strong> on 
            NurturInk—a platform for sending personalized, handwritten notes to clients.
          </p>

          {/* What you can do */}
          <h2 style={textStyles.heading2}>As a team member, you'll be able to:</h2>
          
          <table role="presentation" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
            <tr>
              <td style={{ paddingBottom: '8px' }}>
                <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>Access the shared client database</span>
              </td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '8px' }}>
                <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>Send notes using company templates and branding</span>
              </td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '8px' }}>
                <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>Track your sent notes and engagement</span>
              </td>
            </tr>
            <tr>
              <td>
                <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>Collaborate with teammates on client outreach</span>
              </td>
            </tr>
          </table>

          {/* Role Box */}
          <InfoBox variant="info">
            <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: BRAND_COLORS.dark }}>
              Your Role: {roleDisplay}
            </p>
            <p style={{ margin: '0', fontSize: '14px', color: BRAND_COLORS.muted }}>
              {isAdmin ? (
                `As an Admin, you'll be able to manage team members, allocate credits, and oversee all notes sent by your organization.`
              ) : (
                `As a Member, you'll be able to send handwritten notes on behalf of ${organizationName} and access shared resources.`
              )}
            </p>
          </InfoBox>

          {/* CTA Button */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <EmailButton href={acceptUrl}>Accept Invitation</EmailButton>
          </div>

          {/* Expiration Warning */}
          <InfoBox variant="warning">
            <p style={{ margin: '0', fontSize: '14px', color: '#92400e' }}>
              <strong>This invitation expires in {expiresIn}.</strong> Accept soon to join the team!
            </p>
          </InfoBox>

          <p style={{ ...textStyles.small, marginTop: '24px' }}>
            Questions about NurturInk? Visit our help center or reply to this email.
          </p>

          <p style={textStyles.body}>
            Best regards,<br />
            <strong>The NurturInk Team</strong>
          </p>
        </td>
      </tr>
      
      <EmailFooter 
        recipientEmail={recipientEmail}
        showUnsubscribe={false}
      />
    </EmailWrapper>
  );
}

// Plain text version
export const teamInvitationEmailPlainText = ({
  inviterFullName,
  recipientEmail,
  organizationName,
  roleDisplay,
  acceptUrl,
  expiresIn,
  isAdmin
}) => `
${inviterFullName} invited you to join ${organizationName}

Hi there,

${inviterFullName} has invited you to join ${organizationName} on NurturInk—a platform for sending personalized, handwritten notes to clients.

As a team member, you'll be able to:
• Access the shared client database
• Send notes using company templates and branding
• Track your sent notes and engagement
• Collaborate with teammates on client outreach

Your Role: ${roleDisplay}
${isAdmin 
  ? `As an Admin, you'll be able to manage team members, allocate credits, and oversee all notes sent by your organization.`
  : `As a Member, you'll be able to send handwritten notes on behalf of ${organizationName} and access shared resources.`
}

Accept Invitation: ${acceptUrl}

This invitation expires in ${expiresIn}. Accept soon to join the team!

Questions about NurturInk? Visit our help center or reply to this email.

Best regards,
The NurturInk Team
${emailFooterPlainText({ recipientEmail })}
`;