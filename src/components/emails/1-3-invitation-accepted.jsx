import React from 'react';

/**
 * Invitation Accepted Email Template
 * Sent to organization admin when a team member accepts an invitation
 */
export default function InvitationAcceptedEmail({
  admin_firstName,
  new_member_fullName,
  new_member_email,
  new_member_role,
  new_member_role_display,
  organization_name,
  joined_timestamp,
  team_management_url,
  member_profile_url,
  app_logo_url
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
                      <img src={app_logo_url} alt="NurturInk" style={{
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
                      Team Update
                    </h1>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ padding: '40px' }}>
                    <p style={{
                      fontSize: '16px',
                      color: '#111827',
                      margin: '0 0 12px 0'
                    }}>
                      Hi {admin_firstName},
                    </p>
                    
                    <p style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0 0 8px 0'
                    }}>
                      🎉 {new_member_fullName} has joined {organization_name}
                    </p>

                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0 0 24px 0'
                    }}>
                      Joined on {joined_timestamp}
                    </p>

                    {/* Member Details Card */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '20px',
                      marginBottom: '32px'
                    }}>
                      <tr>
                        <td>
                          <table role="presentation" cellSpacing="0" cellPadding="0" border="0" width="100%">
                            <tr>
                              <td style={{
                                fontSize: '13px',
                                color: '#6b7280',
                                fontWeight: '600',
                                paddingBottom: '4px'
                              }}>
                                Name
                              </td>
                              <td style={{
                                fontSize: '14px',
                                color: '#111827',
                                paddingBottom: '4px'
                              }}>
                                {new_member_fullName}
                              </td>
                            </tr>
                            <tr>
                              <td style={{
                                fontSize: '13px',
                                color: '#6b7280',
                                fontWeight: '600',
                                paddingBottom: '4px',
                                paddingTop: '8px'
                              }}>
                                Email
                              </td>
                              <td style={{
                                fontSize: '14px',
                                color: '#111827',
                                paddingBottom: '4px',
                                paddingTop: '8px'
                              }}>
                                {new_member_email}
                              </td>
                            </tr>
                            <tr>
                              <td style={{
                                fontSize: '13px',
                                color: '#6b7280',
                                fontWeight: '600',
                                paddingTop: '8px'
                              }}>
                                Role
                              </td>
                              <td style={{
                                fontSize: '14px',
                                color: '#111827',
                                paddingTop: '8px'
                              }}>
                                {new_member_role_display}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    {/* Suggested Next Steps */}
                    <div style={{ marginBottom: '32px' }}>
                      <p style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0 0 12px 0'
                      }}>
                        Suggested next steps:
                      </p>
                      <ul style={{
                        fontSize: '14px',
                        color: '#4b5563',
                        lineHeight: '1.8',
                        paddingLeft: '20px',
                        margin: '0'
                      }}>
                        <li style={{ marginBottom: '8px' }}>
                          Allocate credits for {new_member_fullName} (if applicable)
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                          Share your organization's templates
                        </li>
                        <li>
                          Set expectations for note-sending cadence
                        </li>
                      </ul>
                    </div>

                    {/* Primary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '20px' }}>
                      <tr>
                        <td align="center">
                          <a href={team_management_url} style={{
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
                            View Team
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* Secondary Link */}
                    <p style={{
                      fontSize: '14px',
                      textAlign: 'center',
                      margin: '0'
                    }}>
                      <a href={member_profile_url} style={{
                        color: '#FF7A00',
                        textDecoration: 'none'
                      }}>
                        View {new_member_fullName}'s profile
                      </a>
                    </p>
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
                      margin: '0'
                    }}>
                      © 2024 NurturInk. All rights reserved.
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
export const invitationAcceptedEmailPlainText = ({
  admin_firstName,
  new_member_fullName,
  new_member_email,
  new_member_role_display,
  organization_name,
  joined_timestamp,
  team_management_url,
  member_profile_url
}) => `
Hi ${admin_firstName},

🎉 ${new_member_fullName} has joined ${organization_name}

Joined on ${joined_timestamp}

Member Details:
• Name: ${new_member_fullName}
• Email: ${new_member_email}
• Role: ${new_member_role_display}

Suggested next steps:
• Allocate credits for ${new_member_fullName} (if applicable)
• Share your organization's templates
• Set expectations for note-sending cadence

View Team: ${team_management_url}

View ${new_member_fullName}'s profile: ${member_profile_url}

© 2024 NurturInk. All rights reserved.
`;