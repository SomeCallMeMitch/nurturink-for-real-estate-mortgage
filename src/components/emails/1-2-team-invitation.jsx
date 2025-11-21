import React from 'react';

/**
 * Team Invitation Email Template
 * Sent when a user is invited to join an organization
 */
export default function TeamInvitationEmail({
  inviter_firstName,
  inviter_fullName,
  invitee_email,
  organization_name,
  invitation_token,
  accept_url,
  role,
  role_display,
  invitation_expires,
  app_logo_url,
  is_admin = false
}) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{
        margin: '0',
        padding: '0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: '#f9fafb'
      }}>
        <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
          width: '100%',
          backgroundColor: '#f9fafb',
          padding: '40px 20px'
        }}>
          <tr>
            <td align="center">
              <table role="presentation" style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                overflow: 'hidden'
              }} cellSpacing="0" cellPadding="0" border="0">
                
                {/* Header */}
                <tr>
                  <td style={{
                    backgroundColor: '#FF7A00',
                    padding: '40px 40px 30px 40px',
                    textAlign: 'center'
                  }}>
                    {app_logo_url && (
                      <img src={app_logo_url} alt="RoofScribe" style={{
                        height: '40px',
                        marginBottom: '20px'
                      }} />
                    )}
                    <h1 style={{
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      lineHeight: '1.3',
                      margin: '0'
                    }}>
                      {inviter_firstName} invited you to join {organization_name}
                    </h1>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ padding: '40px' }}>
                    <p style={{
                      fontSize: '16px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: '0 0 24px 0'
                    }}>
                      {inviter_fullName} wants you to join their team on RoofScribe.
                    </p>

                    {/* What is RoofScribe Box */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      padding: '20px',
                      marginBottom: '24px'
                    }}>
                      <tr>
                        <td>
                          <p style={{
                            fontSize: '15px',
                            color: '#4b5563',
                            lineHeight: '1.6',
                            margin: '0'
                          }}>
                            RoofScribe makes it easy to send authentic handwritten notes at scale. It's perfect for sales teams, customer success, and anyone who wants to build real relationships through thoughtful, personal outreach.
                          </p>
                        </td>
                      </tr>
                    </table>

                    {/* Role Information Box */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fbbf24',
                      borderRadius: '8px',
                      padding: '20px',
                      marginBottom: '32px'
                    }}>
                      <tr>
                        <td>
                          <p style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0 0 8px 0'
                          }}>
                            Your role: {role_display}
                          </p>
                          <p style={{
                            fontSize: '14px',
                            color: '#4b5563',
                            lineHeight: '1.6',
                            margin: '0'
                          }}>
                            {is_admin ? (
                              `As an Admin, you'll be able to manage team members, allocate credits, and oversee all notes sent by your organization.`
                            ) : (
                              `As a Member, you'll be able to send handwritten notes on behalf of ${organization_name}.`
                            )}
                          </p>
                        </td>
                      </tr>
                    </table>

                    {/* Primary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '32px' }}>
                      <tr>
                        <td align="center">
                          <a href={accept_url} style={{
                            display: 'inline-block',
                            backgroundColor: '#FF7A00',
                            color: '#ffffff',
                            padding: '14px 32px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            boxShadow: '0 4px 6px rgba(255, 122, 0, 0.3)'
                          }}>
                            Accept Invitation
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* What Happens Next */}
                    <div style={{ marginBottom: '24px' }}>
                      <p style={{
                        fontSize: '14px',
                        color: '#4b5563',
                        lineHeight: '1.6',
                        margin: '0 0 8px 0'
                      }}>
                        If you already have a RoofScribe account, we'll connect it to {organization_name}.
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: '#4b5563',
                        lineHeight: '1.6',
                        margin: '0'
                      }}>
                        If you're new, we'll help you create your account and get started.
                      </p>
                    </div>

                    {/* Expiration Warning */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fbbf24',
                      borderRadius: '8px',
                      padding: '16px'
                    }}>
                      <tr>
                        <td>
                          <p style={{
                            fontSize: '14px',
                            color: '#92400e',
                            margin: '0'
                          }}>
                            ⏰ This invitation expires in {invitation_expires}. Accept soon to join the team!
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{
                    backgroundColor: '#f9fafb',
                    padding: '24px 40px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      textAlign: 'center',
                      margin: '0 0 8px 0'
                    }}>
                      © 2024 RoofScribe. All rights reserved.
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      textAlign: 'center',
                      margin: '0'
                    }}>
                      This invitation was sent to {invitee_email} by {inviter_fullName}.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

// Plain text version
export const teamInvitationEmailPlainText = ({
  inviter_fullName,
  invitee_email,
  organization_name,
  accept_url,
  role_display,
  invitation_expires,
  is_admin
}) => `
${inviter_fullName} invited you to join ${organization_name}

${inviter_fullName} wants you to join their team on RoofScribe.

What is RoofScribe?
RoofScribe makes it easy to send authentic handwritten notes at scale. It's perfect for sales teams, customer success, and anyone who wants to build real relationships through thoughtful, personal outreach.

Your role: ${role_display}
${is_admin 
  ? `As an Admin, you'll be able to manage team members, allocate credits, and oversee all notes sent by your organization.`
  : `As a Member, you'll be able to send handwritten notes on behalf of ${organization_name}.`
}

Accept Invitation: ${accept_url}

What Happens Next:
• If you already have a RoofScribe account, we'll connect it to ${organization_name}.
• If you're new, we'll help you create your account and get started.

⏰ This invitation expires in ${invitation_expires}. Accept soon to join the team!

© 2024 RoofScribe. All rights reserved.
This invitation was sent to ${invitee_email} by ${inviter_fullName}.
`;