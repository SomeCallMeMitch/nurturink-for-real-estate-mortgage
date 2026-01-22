import React from 'react';

/**
 * Welcome Email Template
 * Sent when a new user signs up for NurturInk
 */
export default function WelcomeEmail({
  user_firstName,
  user_email,
  dashboard_url,
  send_note_url,
  templates_url,
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
              {/* Card Container */}
              <table role="presentation" style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                overflow: 'hidden'
              }} cellSpacing="0" cellPadding="0" border="0">
                
                {/* Header Section */}
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
                      Welcome to NurturInk! 🎉
                    </h1>
                  </td>
                </tr>

                {/* Body Section */}
                <tr>
                  <td style={{ padding: '40px' }}>
                    <p style={{
                      fontSize: '16px',
                      color: '#111827',
                      margin: '0 0 20px 0'
                    }}>
                      Hi {user_firstName},
                    </p>
                    
                    <p style={{
                      fontSize: '16px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: '0 0 24px 0'
                    }}>
                      You're all set up and ready to send authentic handwritten notes that build real relationships.
                    </p>

                    {/* Value Proposition Box */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      padding: '20px',
                      marginBottom: '32px'
                    }}>
                      <tr>
                        <td>
                          <p style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0 0 12px 0'
                          }}>
                            Here's what you can do with NurturInk:
                          </p>
                          <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
                            <tr>
                              <td style={{ paddingBottom: '8px' }}>
                                <span style={{ color: '#10B981', marginRight: '8px' }}>✓</span>
                                <span style={{ color: '#4b5563', fontSize: '15px' }}>Real handwriting, not printed</span>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ paddingBottom: '8px' }}>
                                <span style={{ color: '#10B981', marginRight: '8px' }}>✓</span>
                                <span style={{ color: '#4b5563', fontSize: '15px' }}>Send in 2 minutes or less</span>
                              </td>
                            </tr>
                            <tr>
                              <td style={{ paddingBottom: '8px' }}>
                                <span style={{ color: '#10B981', marginRight: '8px' }}>✓</span>
                                <span style={{ color: '#4b5563', fontSize: '15px' }}>Track delivery and impact</span>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <span style={{ color: '#10B981', marginRight: '8px' }}>✓</span>
                                <span style={{ color: '#4b5563', fontSize: '15px' }}>Templates to get started fast</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    {/* Primary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '32px' }}>
                      <tr>
                        <td align="center">
                          <a href={send_note_url} style={{
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
                            Send Your First Note
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* Quick Start Guide */}
                    <div style={{ marginBottom: '32px' }}>
                      <h2 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0 0 16px 0'
                      }}>
                        Get started in 3 easy steps
                      </h2>
                      <ol style={{
                        fontSize: '15px',
                        color: '#4b5563',
                        lineHeight: '1.8',
                        paddingLeft: '20px',
                        margin: '0'
                      }}>
                        <li style={{ marginBottom: '8px' }}>Choose a template or start from scratch</li>
                        <li style={{ marginBottom: '8px' }}>Personalize your message</li>
                        <li>Hit send - we'll handwrite and mail it</li>
                      </ol>
                    </div>

                    {/* Secondary Resources */}
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0 0 12px 0'
                      }}>
                        Helpful resources:
                      </p>
                      <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
                        <tr>
                          <td style={{ paddingBottom: '8px' }}>
                            <a href={templates_url} style={{
                              color: '#FF7A00',
                              textDecoration: 'none',
                              fontSize: '15px'
                            }}>
                              Browse Templates
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ paddingBottom: '8px' }}>
                            <a href={dashboard_url} style={{
                              color: '#FF7A00',
                              textDecoration: 'none',
                              fontSize: '15px'
                            }}>
                              Visit Dashboard
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <a href={support_url} style={{
                              color: '#FF7A00',
                              textDecoration: 'none',
                              fontSize: '15px'
                            }}>
                              Get Help
                            </a>
                          </td>
                        </tr>
                      </table>
                    </div>
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
                      © 2024 NurturInk. All rights reserved.
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      textAlign: 'center',
                      margin: '0'
                    }}>
                      You're receiving this email because you signed up for NurturInk.
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
export const welcomeEmailPlainText = ({
  user_firstName,
  send_note_url,
  templates_url,
  dashboard_url,
  support_url
}) => `
Hi ${user_firstName},

Welcome to NurturInk! 🎉

You're all set up and ready to send authentic handwritten notes that build real relationships.

Here's what you can do with NurturInk:
✓ Real handwriting, not printed
✓ Send in 2 minutes or less
✓ Track delivery and impact
✓ Templates to get started fast

Send Your First Note: ${send_note_url}

Get started in 3 easy steps:
1. Choose a template or start from scratch
2. Personalize your message
3. Hit send - we'll handwrite and mail it

Helpful resources:
• Browse Templates: ${templates_url}
• Visit Dashboard: ${dashboard_url}
• Get Help: ${support_url}

© 2024 NurturInk. All rights reserved.
You're receiving this email because you signed up for NurturInk.
`;