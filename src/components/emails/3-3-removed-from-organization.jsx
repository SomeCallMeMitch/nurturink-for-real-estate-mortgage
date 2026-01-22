import React from 'react';

/**
 * Removed from Organization Email Template
 * Sent when a user is removed from an organization
 */
export default function RemovedFromOrganizationEmail({
  user_firstName,
  user_fullName,
  removed_by_name,
  removal_date,
  org_name,
  reason,
  personal_dashboard_url,
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
                    <h1 style={{
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      lineHeight: '1.3',
                      margin: '0'
                    }}>
                      Removed from {org_name}
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
                      This message is to let you know that you have been removed from <strong>{org_name}</strong> by {removed_by_name} on {removal_date}.
                    </p>

                    {/* Conditional Reason */}
                    {reason && (
                      <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '24px'
                      }}>
                        <tr>
                          <td>
                            <p style={{
                              fontSize: '14px',
                              color: '#6b7280',
                              margin: '0'
                            }}>
                              <strong>Reason provided:</strong> {reason}
                            </p>
                          </td>
                        </tr>
                      </table>
                    )}

                    <p style={{
                      fontSize: '15px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: '0 0 16px 0'
                    }}>
                      Your personal NurturInk account remains active. You can still log in, access your own templates and credits, and continue sending handwritten notes.
                    </p>

                    <p style={{
                      fontSize: '15px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: '0 0 32px 0'
                    }}>
                      If you believe this removal was a mistake or have questions, please reach out to {removed_by_name} or contact our support team.
                    </p>

                    {/* Primary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
                      <tr>
                        <td align="center">
                          <a href={personal_dashboard_url} style={{
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
                            Go to Your Dashboard
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* Closing */}
                    <p style={{
                      fontSize: '15px',
                      color: '#4b5563',
                      margin: '0'
                    }}>
                      Thank you for using NurturInk,<br />
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
export const removedFromOrganizationPlainText = ({
  user_firstName,
  removed_by_name,
  removal_date,
  org_name,
  reason,
  personal_dashboard_url
}) => `
Hi ${user_firstName},

Removed from ${org_name}

This message is to let you know that you have been removed from ${org_name} by ${removed_by_name} on ${removal_date}.

${reason ? `Reason provided: ${reason}\n` : ''}
Your personal NurturInk account remains active. You can still log in, access your own templates and credits, and continue sending handwritten notes.

If you believe this removal was a mistake or have questions, please reach out to ${removed_by_name} or contact our support team.

Go to Your Dashboard: ${personal_dashboard_url}

Thank you for using NurturInk,
The NurturInk Team

© 2024 NurturInk. All rights reserved.
`;