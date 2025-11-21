import React from 'react';

/**
 * Low Personal Credit Warning Email Template
 * Sent when a user's personal credit balance is running low
 */
export default function LowPersonalCreditWarningEmail({
  user_firstName,
  current_personal_balance,
  org_pool_available,
  is_first_warning,
  warning_count,
  last_note_sent,
  purchase_credits_url,
  contact_admin_url,
  app_logo_url,
  is_org_member
}) {
  const total_available = current_personal_balance + (org_pool_available || 0);

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
                    <div style={{
                      fontSize: '32px',
                      marginBottom: '12px'
                    }}>
                      ⚠️
                    </div>
                    <h1 style={{
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      lineHeight: '1.3',
                      margin: '0'
                    }}>
                      Low Credit Alert
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
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0 0 16px 0'
                    }}>
                      You're running low on credits
                    </p>

                    {is_first_warning ? (
                      <p style={{
                        fontSize: '15px',
                        color: '#4b5563',
                        lineHeight: '1.6',
                        margin: '0 0 24px 0'
                      }}>
                        We wanted to let you know that your credit balance is getting low. To keep sending handwritten notes without interruption, consider purchasing more credits{is_org_member ? ' or requesting an allocation from your admin' : ''}.
                      </p>
                    ) : (
                      <p style={{
                        fontSize: '15px',
                        color: '#4b5563',
                        lineHeight: '1.6',
                        margin: '0 0 24px 0'
                      }}>
                        This is a friendly reminder that your credit balance is still low.
                      </p>
                    )}

                    {/* Current Balance Display */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      backgroundColor: '#fef3c7',
                      border: '2px solid #fbbf24',
                      borderRadius: '8px',
                      padding: '20px',
                      marginBottom: '16px'
                    }}>
                      <tr>
                        <td>
                          <table role="presentation" cellSpacing="0" cellPadding="0" border="0" width="100%">
                            <tr>
                              <td style={{
                                fontSize: '14px',
                                color: '#92400e',
                                paddingBottom: '4px'
                              }}>
                                Personal credits:
                              </td>
                              <td style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#92400e',
                                textAlign: 'right',
                                paddingBottom: '4px'
                              }}>
                                {current_personal_balance}
                              </td>
                            </tr>
                            {is_org_member && (
                              <tr>
                                <td style={{
                                  fontSize: '14px',
                                  color: '#92400e',
                                  paddingBottom: '4px',
                                  paddingTop: '4px'
                                }}>
                                  Organization pool:
                                </td>
                                <td style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: '#92400e',
                                  textAlign: 'right',
                                  paddingBottom: '4px',
                                  paddingTop: '4px'
                                }}>
                                  {org_pool_available}
                                </td>
                              </tr>
                            )}
                            <tr>
                              <td style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#92400e',
                                paddingTop: '8px',
                                borderTop: '1px solid #fbbf24'
                              }}>
                                Total available:
                              </td>
                              <td style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#92400e',
                                textAlign: 'right',
                                paddingTop: '8px',
                                borderTop: '1px solid #fbbf24'
                              }}>
                                {total_available}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    {/* Impact Statement */}
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      textAlign: 'center',
                      margin: '0 0 32px 0'
                    }}>
                      You can send approximately {total_available} more notes
                    </p>

                    {/* Primary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: is_org_member ? '16px' : '24px' }}>
                      <tr>
                        <td align="center">
                          <a href={purchase_credits_url} style={{
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
                            Purchase More Credits
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* Secondary CTA for org members */}
                    {is_org_member && (
                      <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
                        <tr>
                          <td align="center">
                            <a href={contact_admin_url} style={{
                              display: 'inline-block',
                              backgroundColor: '#ffffff',
                              color: '#FF7A00',
                              padding: '14px 32px',
                              borderRadius: '8px',
                              fontSize: '16px',
                              fontWeight: '600',
                              textDecoration: 'none',
                              border: '2px solid #FF7A00'
                            }}>
                              Contact Your Admin
                            </a>
                          </td>
                        </tr>
                      </table>
                    )}

                    {/* Credit Usage Context */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <tr>
                        <td>
                          <p style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            margin: '0',
                            textAlign: 'center'
                          }}>
                            Last note sent: {last_note_sent}
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
                      margin: '0'
                    }}>
                      © 2024 RoofScribe. All rights reserved.
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
export const lowPersonalCreditWarningPlainText = ({
  user_firstName,
  current_personal_balance,
  org_pool_available,
  is_first_warning,
  last_note_sent,
  purchase_credits_url,
  contact_admin_url,
  is_org_member
}) => {
  const total_available = current_personal_balance + (org_pool_available || 0);
  
  return `
Hi ${user_firstName},

⚠️ Low Credit Alert

You're running low on credits

${is_first_warning 
  ? `We wanted to let you know that your credit balance is getting low. To keep sending handwritten notes without interruption, consider purchasing more credits${is_org_member ? ' or requesting an allocation from your admin' : ''}.`
  : 'This is a friendly reminder that your credit balance is still low.'
}

Current Balance:
• Personal credits: ${current_personal_balance}
${is_org_member ? `• Organization pool: ${org_pool_available}` : ''}
• Total available: ${total_available}

You can send approximately ${total_available} more notes

Purchase More Credits: ${purchase_credits_url}

${is_org_member ? `Contact Your Admin: ${contact_admin_url}\n` : ''}
Last note sent: ${last_note_sent}

© 2024 RoofScribe. All rights reserved.
`;
};