import React from 'react';

/**
 * Member Removal Notification Email Template
 * Sent to other org admins when a team member is removed
 */
export default function MemberRemovalNotificationEmail({
  admin_firstName,
  user_fullName,
  user_email,
  previous_role_display,
  removed_by_name,
  removal_date,
  org_name,
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
                    background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
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
                      display: 'inline-block',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '16px'
                    }}>
                      TEAM UPDATE
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
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: '0 0 12px 0'
                    }}>
                      This is to inform you that <strong>{user_fullName}</strong> ({user_email}) was removed from {org_name} by {removed_by_name} on {removal_date}.
                    </p>

                    <p style={{
                      fontSize: '15px',
                      color: '#6b7280',
                      margin: '0 0 24px 0'
                    }}>
                      They previously held the role of {previous_role_display}.
                    </p>

                    <p style={{
                      fontSize: '15px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: '0 0 32px 0'
                    }}>
                      You can review your current team members and adjust credits or permissions as needed in the Team Management dashboard.
                    </p>

                    {/* Primary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
                      <tr>
                        <td align="center">
                          <a href={team_management_url} style={{
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
                            View Team Dashboard
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
                      Thanks for staying on top of your team,<br />
                      The RoofScribe Team
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
export const memberRemovalNotificationPlainText = ({
  admin_firstName,
  user_fullName,
  user_email,
  previous_role_display,
  removed_by_name,
  removal_date,
  org_name,
  team_management_url
}) => `
Hi ${admin_firstName},

Team Update

This is to inform you that ${user_fullName} (${user_email}) was removed from ${org_name} by ${removed_by_name} on ${removal_date}.

They previously held the role of ${previous_role_display}.

You can review your current team members and adjust credits or permissions as needed in the Team Management dashboard.

View Team Dashboard: ${team_management_url}

Thanks for staying on top of your team,
The RoofScribe Team

© 2024 RoofScribe. All rights reserved.
`;