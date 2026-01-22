import React from 'react';

/**
 * Credits Allocated to You Email Template
 * Sent to a team member when an admin allocates credits to them
 */
export default function CreditsAllocatedToYouEmail({
  member_firstName,
  admin_name,
  credits_allocated,
  allocation_date,
  new_personal_balance,
  org_pool_available,
  send_note_url,
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
                    <div style={{
                      fontSize: '32px',
                      marginBottom: '12px'
                    }}>
                      🎁
                    </div>
                    <h1 style={{
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      lineHeight: '1.3',
                      margin: '0'
                    }}>
                      Credits Allocated
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
                      Hi {member_firstName},
                    </p>
                    
                    <p style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0 0 8px 0'
                    }}>
                      🎉 You've been allocated {credits_allocated} credits!
                    </p>

                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0 0 32px 0'
                    }}>
                      {admin_name} allocated credits to you on {allocation_date}
                    </p>

                    {/* Balance Display */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      backgroundColor: '#dcfce7',
                      borderRadius: '8px',
                      padding: '24px',
                      marginBottom: '32px',
                      border: '2px solid #10B981'
                    }}>
                      <tr>
                        <td>
                          <p style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#065f46',
                            margin: '0 0 8px 0',
                            textAlign: 'center'
                          }}>
                            Your new balance: {new_personal_balance} credits
                          </p>
                          <p style={{
                            fontSize: '14px',
                            color: '#047857',
                            margin: '0',
                            textAlign: 'center'
                          }}>
                            (Plus {org_pool_available} available from organization pool)
                          </p>
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
                            padding: '16px 48px',
                            borderRadius: '8px',
                            fontSize: '18px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            boxShadow: '0 4px 6px rgba(255, 122, 0, 0.3)'
                          }}>
                            Send a Note
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* How Credits Work */}
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
                            fontSize: '13px',
                            color: '#6b7280',
                            margin: '0',
                            textAlign: 'center'
                          }}>
                            💡 Your personal credits are used first, then organization pool credits.
                          </p>
                        </td>
                      </tr>
                    </table>

                    {/* Encouragement */}
                    <p style={{
                      fontSize: '15px',
                      color: '#4b5563',
                      textAlign: 'center',
                      margin: '0'
                    }}>
                      Start building relationships with authentic handwritten notes!
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
export const creditsAllocatedToYouPlainText = ({
  member_firstName,
  admin_name,
  credits_allocated,
  allocation_date,
  new_personal_balance,
  org_pool_available,
  send_note_url
}) => `
Hi ${member_firstName},

🎉 You've been allocated ${credits_allocated} credits!

${admin_name} allocated credits to you on ${allocation_date}

Your new balance: ${new_personal_balance} credits
(Plus ${org_pool_available} available from organization pool)

Send a Note: ${send_note_url}

💡 Your personal credits are used first, then organization pool credits.

Start building relationships with authentic handwritten notes!

© 2024 NurturInk. All rights reserved.
`;