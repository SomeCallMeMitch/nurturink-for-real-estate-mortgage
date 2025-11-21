import React from 'react';

/**
 * Billing Footer Component
 * Used for billing emails (Receipts, Payment Failed)
 */
export default function BillingFooter({ support_url }) {
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
                <strong style={{ color: '#FF7A00' }}>RoofScribe</strong><br />
                Authentic handwritten notes that build real relationships
              </p>
              <p style={{
                color: '#9ca3af',
                fontSize: '12px',
                lineHeight: '1.6',
                margin: '0 0 8px 0'
              }}>
                Billing questions? Contact us at <a href="mailto:billing@roofscribe.com" style={{ color: '#FF7A00', textDecoration: 'none' }}>billing@roofscribe.com</a>
              </p>
              <p style={{
                color: '#9ca3af',
                fontSize: '11px',
                lineHeight: '1.4',
                margin: '0 0 8px 0'
              }}>
                This is a transactional email. Credits are non-refundable once used.
              </p>
              <p style={{
                color: '#9ca3af',
                fontSize: '11px',
                margin: '0'
              }}>
                © 2024 RoofScribe. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  );
}

// Plain text version
export const billingFooterPlainText = () => `
RoofScribe
Authentic handwritten notes that build real relationships

Billing questions? Contact us at billing@roofscribe.com

This is a transactional email. Credits are non-refundable once used.

© 2024 RoofScribe. All rights reserved.
`;