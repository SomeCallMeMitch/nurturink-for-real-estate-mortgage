import React from 'react';

/**
 * Organization Credit Purchase Notification Email Template
 * Sent to other org admins when someone purchases credits for the company pool
 */
export default function OrgCreditPurchaseNotificationEmail({
  admin_firstName,
  purchasing_admin_name,
  organization_name,
  credits_purchased,
  purchase_date,
  new_org_pool_balance,
  team_management_url,
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
                      display: 'inline-block',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '16px'
                    }}>
                      📢 NOTIFICATION
                    </div>
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
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0 0 8px 0'
                    }}>
                      {purchasing_admin_name} purchased {credits_purchased} credits for {organization_name}
                    </p>

                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0 0 24px 0'
                    }}>
                      {purchase_date}
                    </p>

                    {/* Current Balance Box */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      backgroundColor: '#fff7ed',
                      borderRadius: '8px',
                      padding: '20px',
                      marginBottom: '24px',
                      border: '2px solid #FF7A00'
                    }}>
                      <tr>
                        <td align="center">
                          <p style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#FF7A00',
                            margin: '0'
                          }}>
                            Organization pool: {new_org_pool_balance} credits
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style={{
                      fontSize: '15px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: '0 0 24px 0',
                      textAlign: 'center'
                    }}>
                      Your team can now send more handwritten notes.
                    </p>

                    {/* Optional CTA */}
                    <p style={{
                      fontSize: '14px',
                      textAlign: 'center',
                      margin: '0'
                    }}>
                      <a href={team_management_url} style={{
                        color: '#FF7A00',
                        textDecoration: 'none'
                      }}>
                        View Team Dashboard
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
export const orgCreditPurchaseNotificationPlainText = ({
  admin_firstName,
  purchasing_admin_name,
  organization_name,
  credits_purchased,
  purchase_date,
  new_org_pool_balance,
  team_management_url
}) => `
Hi ${admin_firstName},

Team Update

${purchasing_admin_name} purchased ${credits_purchased} credits for ${organization_name}

${purchase_date}

Organization pool: ${new_org_pool_balance} credits

Your team can now send more handwritten notes.

View Team Dashboard: ${team_management_url}

© 2024 NurturInk. All rights reserved.
`;