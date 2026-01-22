import React from 'react';

/**
 * Password Reset Email Template
 * Sent when a user requests a password reset
 */
export default function PasswordResetEmail({
  user_firstName,
  user_email,
  reset_token,
  reset_url,
  expires_in,
  expiry_timestamp,
  request_ip,
  request_timestamp,
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
                      Reset Your Password
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
                      Hi {user_firstName || 'there'},
                    </p>
                    
                    <p style={{
                      fontSize: '16px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: '0 0 32px 0'
                    }}>
                      We received a request to reset your NurturInk password. Click the button below to choose a new password.
                    </p>

                    {/* Primary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
                      <tr>
                        <td align="center">
                          <a href={reset_url} style={{
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
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* Expiration Warning */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fbbf24',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '32px'
                    }}>
                      <tr>
                        <td>
                          <p style={{
                            fontSize: '14px',
                            color: '#92400e',
                            margin: '0'
                          }}>
                            ⏰ This link expires in {expires_in} (at {expiry_timestamp})
                          </p>
                        </td>
                      </tr>
                    </table>

                    {/* Alternative Link */}
                    <div style={{ marginBottom: '32px' }}>
                      <p style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        margin: '0 0 8px 0'
                      }}>
                        Button not working? Copy and paste this link:
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#3b82f6',
                        wordBreak: 'break-all',
                        margin: '0',
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '4px',
                        border: '1px solid #e5e7eb'
                      }}>
                        {reset_url}
                      </p>
                    </div>

                    {/* Security Information */}
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
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0 0 12px 0'
                          }}>
                            Security details:
                          </p>
                          <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
                            <tr>
                              <td style={{
                                fontSize: '13px',
                                color: '#6b7280',
                                paddingBottom: '4px'
                              }}>
                                Request from IP:
                              </td>
                              <td style={{
                                fontSize: '13px',
                                color: '#111827',
                                paddingLeft: '12px',
                                paddingBottom: '4px'
                              }}>
                                {request_ip}
                              </td>
                            </tr>
                            <tr>
                              <td style={{
                                fontSize: '13px',
                                color: '#6b7280'
                              }}>
                                Request time:
                              </td>
                              <td style={{
                                fontSize: '13px',
                                color: '#111827',
                                paddingLeft: '12px'
                              }}>
                                {request_timestamp}
                              </td>
                            </tr>
                          </table>
                          <p style={{
                            fontSize: '13px',
                            color: '#4b5563',
                            lineHeight: '1.6',
                            margin: '12px 0 0 0'
                          }}>
                            If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                          </p>
                        </td>
                      </tr>
                    </table>

                    {/* Help Section */}
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      textAlign: 'center',
                      margin: '0'
                    }}>
                      Need help? <a href={support_url} style={{ color: '#FF7A00', textDecoration: 'none' }}>Contact our support team</a>
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
export const passwordResetEmailPlainText = ({
  user_firstName,
  reset_url,
  expires_in,
  expiry_timestamp,
  request_ip,
  request_timestamp,
  support_url
}) => `
Hi ${user_firstName || 'there'},

Reset Your Password

We received a request to reset your NurturInk password. Click the link below to choose a new password:

${reset_url}

⏰ This link expires in ${expires_in} (at ${expiry_timestamp})

Security details:
• Request from IP: ${request_ip}
• Request time: ${request_timestamp}

If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.

Need help? Contact our support team: ${support_url}

© 2024 NurturInk. All rights reserved.
`;