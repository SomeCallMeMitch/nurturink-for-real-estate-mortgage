import React from 'react';

/**
 * Standard Footer Component
 * Used for general emails (Authentication, Team, Orders, Notifications)
 */
export default function StandardFooter({ support_url, show_unsubscribe = false }) {
  return (
    <tr>
      <td style={{
        backgroundColor: '#f9fafb',
        padding: '30px 40px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <table role="presentation" style={{ width: '100%', textAlign: 'center' }} cellSpacing="0" cellPadding="0" border="0">
          <tr>
            <td>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: '0 0 12px 0'
              }}>
                <strong style={{ color: '#FF7A00' }}>NurturInk</strong><br />
                Authentic handwritten notes that build real relationships
              </p>
              <p style={{
                color: '#9ca3af',
                fontSize: '12px',
                lineHeight: '1.6',
                margin: '0 0 8px 0'
              }}>
                Questions? Email us at <a href="mailto:support@nurturink.com" style={{ color: '#FF7A00', textDecoration: 'none' }}>support@nurturink.com</a>
              </p>
              <p style={{
                color: '#9ca3af',
                fontSize: '11px',
                margin: '0'
              }}>
                © 2024 NurturInk. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  );
}

// Plain text version
export const standardFooterPlainText = () => `
NurturInk
Authentic handwritten notes that build real relationships

Questions? Email us at support@nurturink.com

© 2024 NurturInk. All rights reserved.
`;