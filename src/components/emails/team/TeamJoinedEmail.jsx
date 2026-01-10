import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Team Member Joined Confirmation Email
 * Subject: Welcome to [Organization]'s NurturInk Team!
 */
export default function TeamJoinedEmail({
  firstName,
  email,
  organizationName,
  role,
  roleDisplay,
  teamSize,
  sharedClients,
  orgCredits,
  adminName,
  dashboardUrl,
  logoUrl
}) {
  return (
    <EmailWrapper preheader={`You're now part of ${organizationName}'s NurturInk team!`}>
      <EmailHeader 
        title={`Welcome to ${organizationName}!`}
        subtitle="You're now part of the team"
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.success}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            You're now part of <strong>{organizationName}'s</strong> NurturInk team!
          </p>

          {/* Team Stats */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '12px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Your role:</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
                        {roleDisplay}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '12px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Team size:</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
                        {teamSize} members
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '12px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Shared clients:</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
                        {sharedClients}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Organization credits:</span>
                      <span style={{ color: BRAND_COLORS.accent, fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
                        {orgCredits}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          {/* CTA Button */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <EmailButton href={dashboardUrl}>Access Dashboard</EmailButton>
          </div>

          {/* Getting Started */}
          <h2 style={textStyles.heading2}>Get started by:</h2>
          
          <ol style={{ 
            paddingLeft: '20px', 
            marginBottom: '24px',
            color: BRAND_COLORS.muted,
            lineHeight: '2'
          }}>
            <li>Reviewing your team's client list</li>
            <li>Exploring shared templates and card designs</li>
            <li>Setting up your personal note style profile</li>
          </ol>

          <p style={textStyles.small}>
            Your teammates can see the notes you send, helping everyone stay coordinated and 
            avoid duplicate outreach.
          </p>

          <p style={{ ...textStyles.small, marginTop: '16px' }}>
            Questions? Reach out to {adminName || 'your team admin'} or our support team.
          </p>

          <p style={textStyles.body}>
            Welcome aboard!<br />
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
export const teamJoinedEmailPlainText = ({
  firstName,
  email,
  organizationName,
  roleDisplay,
  teamSize,
  sharedClients,
  orgCredits,
  adminName,
  dashboardUrl
}) => `
Welcome to ${organizationName}'s NurturInk Team!

Hi ${firstName},

You're now part of ${organizationName}'s NurturInk team!

Your role: ${roleDisplay}
Team size: ${teamSize} members
Shared clients: ${sharedClients}
Organization credits: ${orgCredits}

Access Dashboard: ${dashboardUrl}

Get started by:
1. Reviewing your team's client list
2. Exploring shared templates and card designs
3. Setting up your personal note style profile

Your teammates can see the notes you send, helping everyone stay coordinated and avoid duplicate outreach.

Questions? Reach out to ${adminName || 'your team admin'} or our support team.

Welcome aboard!
The NurturInk Team
${emailFooterPlainText({ recipientEmail: email })}
`;