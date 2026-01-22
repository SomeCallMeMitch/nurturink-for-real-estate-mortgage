import React from 'react';

/**
 * Credit Allocation Team Notification Email Template
 * Sent to other org admins when someone allocates credits to team members
 */
export default function CreditAllocationTeamNotificationEmail({
  admin_firstName,
  allocating_admin_name,
  organization_name,
  allocation_date,
  allocations,
  total_credits_allocated,
  remaining_org_pool,
  team_management_url,
  app_logo_url
}) {
  const showDetailedAllocations = allocations && allocations.length <= 5;

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
                      {allocating_admin_name} allocated credits to team members
                    </p>

                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0 0 24px 0'
                    }}>
                      {allocation_date}
                    </p>

                    {/* Allocation Summary */}
                    <div style={{ marginBottom: '24px' }}>
                      <p style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0 0 12px 0'
                      }}>
                        Allocation Summary:
                      </p>

                      {showDetailedAllocations ? (
                        <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          overflow: 'hidden'
                        }}>
                          {allocations.map((allocation, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                              <td style={{
                                padding: '12px',
                                fontSize: '14px',
                                color: '#111827',
                                borderBottom: index === allocations.length - 1 ? 'none' : '1px solid #e5e7eb'
                              }}>
                                {allocation.member_name}
                              </td>
                              <td style={{
                                padding: '12px',
                                fontSize: '14px',
                                color: '#6b7280',
                                textAlign: 'right',
                                borderBottom: index === allocations.length - 1 ? 'none' : '1px solid #e5e7eb'
                              }}>
                                {allocation.credits_allocated} credits
                              </td>
                            </tr>
                          ))}
                        </table>
                      ) : (
                        <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '16px'
                        }}>
                          <tr>
                            <td>
                              <p style={{
                                fontSize: '14px',
                                color: '#4b5563',
                                margin: '0 0 4px 0'
                              }}>
                                Allocated to {allocations.length} team members
                              </p>
                              <p style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0'
                              }}>
                                Total: {total_credits_allocated} credits
                              </p>
                            </td>
                          </tr>
                        </table>
                      )}
                    </div>

                    {/* Remaining Pool */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      backgroundColor: '#fff7ed',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '24px',
                      border: '2px solid #FF7A00'
                    }}>
                      <tr>
                        <td align="center">
                          <p style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#FF7A00',
                            margin: '0'
                          }}>
                            Remaining organization pool: {remaining_org_pool} credits
                          </p>
                        </td>
                      </tr>
                    </table>

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
export const creditAllocationTeamNotificationPlainText = ({
  admin_firstName,
  allocating_admin_name,
  allocation_date,
  allocations,
  total_credits_allocated,
  remaining_org_pool,
  team_management_url
}) => {
  const showDetailedAllocations = allocations && allocations.length <= 5;
  
  return `
Hi ${admin_firstName},

Team Update

${allocating_admin_name} allocated credits to team members

${allocation_date}

Allocation Summary:
${showDetailedAllocations 
  ? allocations.map(a => `• ${a.member_name}: ${a.credits_allocated} credits`).join('\n')
  : `Allocated to ${allocations.length} team members\nTotal: ${total_credits_allocated} credits`
}

Remaining organization pool: ${remaining_org_pool} credits

View Team Dashboard: ${team_management_url}

© 2024 NurturInk. All rights reserved.
`;
};