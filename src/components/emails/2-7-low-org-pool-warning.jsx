import React from 'react';

/**
 * Low Organization Pool Warning Email Template
 * Sent to org admins when the organization's credit pool is running low
 */
export default function LowOrgPoolWarningEmail({
  admin_firstName,
  organization_name,
  current_org_pool_balance,
  team_size,
  average_weekly_usage,
  estimated_days_remaining,
  is_first_warning,
  warning_count,
  purchase_credits_url,
  usage_report_url,
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
                      Low Credit Pool Alert
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
                      margin: '0 0 16px 0'
                    }}>
                      {organization_name}'s credit pool is running low
                    </p>

                    {is_first_warning ? (
                      <p style={{
                        fontSize: '15px',
                        color: '#4b5563',
                        lineHeight: '1.6',
                        margin: '0 0 24px 0'
                      }}>
                        Your organization's shared credit pool is getting low. To ensure your team can continue sending handwritten notes without disruption, consider purchasing more credits soon.
                      </p>
                    ) : (
                      <p style={{
                        fontSize: '15px',
                        color: '#4b5563',
                        lineHeight: '1.6',
                        margin: '0 0 24px 0'
                      }}>
                        This is a reminder that your organization's credit pool is still low.
                      </p>
                    )}

                    {/* Current Balance Display */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      backgroundColor: '#fef3c7',
                      border: '2px solid #fbbf24',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '24px'
                    }}>
                      <tr>
                        <td align="center">
                          <p style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#92400e',
                            margin: '0'
                          }}>
                            Organization pool: {current_org_pool_balance} credits
                          </p>
                        </td>
                      </tr>
                    </table>

                    {/* Usage Insights */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '20px',
                      marginBottom: '16px'
                    }}>
                      <tr>
                        <td>
                          <p style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0 0 12px 0'
                          }}>
                            Usage Insights:
                          </p>
                          <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
                            <tr>
                              <td style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                paddingBottom: '6px'
                              }}>
                                Team size:
                              </td>
                              <td style={{
                                fontSize: '14px',
                                color: '#111827',
                                fontWeight: '600',
                                paddingLeft: '20px',
                                paddingBottom: '6px'
                              }}>
                                {team_size} members
                              </td>
                            </tr>
                            <tr>
                              <td style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                paddingBottom: '6px'
                              }}>
                                Average weekly usage:
                              </td>
                              <td style={{
                                fontSize: '14px',
                                color: '#111827',
                                fontWeight: '600',
                                paddingLeft: '20px',
                                paddingBottom: '6px'
                              }}>
                                {average_weekly_usage} credits
                              </td>
                            </tr>
                            <tr>
                              <td style={{
                                fontSize: '14px',
                                color: '#6b7280'
                              }}>
                                Estimated time remaining:
                              </td>
                              <td style={{
                                fontSize: '14px',
                                color: '#dc2626',
                                fontWeight: '600',
                                paddingLeft: '20px'
                              }}>
                                ~{estimated_days_remaining} days
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    {/* Impact Statement */}
                    <p style={{
                      fontSize: '14px',
                      color: '#dc2626',
                      fontWeight: '600',
                      textAlign: 'center',
                      margin: '0 0 32px 0'
                    }}>
                      At current usage rates, your team will run out of credits soon.
                    </p>

                    {/* Primary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '16px' }}>
                      <tr>
                        <td align="center">
                          <a href={purchase_credits_url} style={{
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
                            Purchase More Credits
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* Secondary CTA */}
                    <p style={{
                      fontSize: '14px',
                      textAlign: 'center',
                      margin: '0'
                    }}>
                      <a href={usage_report_url} style={{
                        color: '#FF7A00',
                        textDecoration: 'none'
                      }}>
                        View Usage Report
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
export const lowOrgPoolWarningPlainText = ({
  admin_firstName,
  organization_name,
  current_org_pool_balance,
  team_size,
  average_weekly_usage,
  estimated_days_remaining,
  is_first_warning,
  purchase_credits_url,
  usage_report_url
}) => `
Hi ${admin_firstName},

⚠️ Low Credit Pool Alert

${organization_name}'s credit pool is running low

${is_first_warning 
  ? "Your organization's shared credit pool is getting low. To ensure your team can continue sending handwritten notes without disruption, consider purchasing more credits soon."
  : "This is a reminder that your organization's credit pool is still low."
}

Organization pool: ${current_org_pool_balance} credits

Usage Insights:
• Team size: ${team_size} members
• Average weekly usage: ${average_weekly_usage} credits
• Estimated time remaining: ~${estimated_days_remaining} days

At current usage rates, your team will run out of credits soon.

Purchase More Credits: ${purchase_credits_url}

View Usage Report: ${usage_report_url}

© 2024 RoofScribe. All rights reserved.
`;