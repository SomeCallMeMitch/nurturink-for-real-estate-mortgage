import React from 'react';

/**
 * Role Changed Email Template
 * Sent when a user's role is updated in an organization
 */
export default function RoleChangedEmail({
  user_firstName,
  user_fullName,
  new_role,
  new_role_display,
  old_role,
  isPromotion,
  changed_by_name,
  org_name,
  role_management_url,
  help_center_url,
  support_url,
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
                    background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                    padding: '40px 40px 30px 40px',
                    textAlign: 'center'
                  }}>
                    {app_logo_url && (
                      <img src={app_logo_url} alt="NurturInk" style={{
                        height: '40px',
                        marginBottom: '20px'
                      }} />
                    )}
                    <div style={{
                      display: 'inline-block',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '16px'
                    }}>
                      ROLE UPDATED
                    </div>
                    <h1 style={{
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      lineHeight: '1.3',
                      margin: '0'
                    }}>
                      Your role has been updated
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
                      Hi {user_firstName},
                    </p>
                    
                    <p style={{
                      fontSize: '16px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: '0 0 24px 0'
                    }}>
                      {changed_by_name} has updated your role on {org_name} to <strong style={{ color: '#3B82F6' }}>{new_role_display}</strong>.
                    </p>

                    {/* Conditional Content */}
                    {isPromotion ? (
                      <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                        backgroundColor: '#dbeafe',
                        border: '2px solid #3B82F6',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '24px'
                      }}>
                        <tr>
                          <td>
                            <p style={{
                              fontSize: '15px',
                              color: '#1e40af',
                              lineHeight: '1.6',
                              margin: '0'
                            }}>
                              🎉 Congratulations on your new Admin privileges! As an Admin you can now manage team members, allocate credits, view team analytics, and adjust organization settings.
                            </p>
                          </td>
                        </tr>
                      </table>
                    ) : (
                      <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
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
                              Your role has changed to Member. You can continue sending handwritten notes, view templates, and use your allocated credits. Administrative features like managing members and credits are no longer available.
                            </p>
                          </td>
                        </tr>
                      </table>
                    )}

                    <p style={{
                      fontSize: '15px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: '0 0 32px 0'
                    }}>
                      To see your updated permissions and explore next steps, head over to your team dashboard.
                    </p>

                    {/* Primary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '32px' }}>
                      <tr>
                        <td align="center">
                          <a href={role_management_url} style={{
                            display: 'inline-block',
                            backgroundColor: '#3B82F6',
                            color: '#ffffff',
                            padding: '14px 32px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
                          }}>
                            {isPromotion ? 'Go to Admin Dashboard' : 'View Team Dashboard'}
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* Resources Section */}
                    <div style={{ marginBottom: '24px' }}>
                      <p style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0 0 8px 0'
                      }}>
                        Need help understanding your role?
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: '#4b5563',
                        margin: '0'
                      }}>
                        Check out our <a href={help_center_url} style={{ color: '#3B82F6', textDecoration: 'none' }}>Role & Permissions guide</a> or reach out to us if you have questions.
                      </p>
                    </div>

                    {/* Closing */}
                    <p style={{
                      fontSize: '15px',
                      color: '#4b5563',
                      margin: '0'
                    }}>
                      Cheers,<br />
                      The NurturInk Team
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
export const roleChangedPlainText = ({
  user_firstName,
  new_role_display,
  isPromotion,
  changed_by_name,
  org_name,
  role_management_url,
  help_center_url
}) => `
Hi ${user_firstName},

Your role has been updated

${changed_by_name} has updated your role on ${org_name} to ${new_role_display}.

${isPromotion 
  ? `🎉 Congratulations on your new Admin privileges! As an Admin you can now manage team members, allocate credits, view team analytics, and adjust organization settings.`
  : `Your role has changed to Member. You can continue sending handwritten notes, view templates, and use your allocated credits. Administrative features like managing members and credits are no longer available.`
}

To see your updated permissions and explore next steps, head over to your team dashboard.

${isPromotion ? 'Go to Admin Dashboard' : 'View Team Dashboard'}: ${role_management_url}

Need help understanding your role?
Check out our Role & Permissions guide: ${help_center_url}

Cheers,
The NurturInk Team

© 2024 NurturInk. All rights reserved.
`;