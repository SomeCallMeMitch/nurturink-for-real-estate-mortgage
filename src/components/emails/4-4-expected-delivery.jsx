import React from 'react';

/**
 * Expected Delivery Notice Email Template
 * Sent 7 days after shipment as a reminder
 */
export default function ExpectedDeliveryEmail({
  user_firstName,
  order_id,
  shipping_date,
  expected_delivery_start,
  expected_delivery_end,
  number_of_notes,
  follow_up_tips_url,
  order_details_url,
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
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
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
                      DELIVERY REMINDER
                    </div>
                    <h1 style={{
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      lineHeight: '1.3',
                      margin: '0'
                    }}>
                      Expected Delivery Notice
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
                      fontSize: '16px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: '0 0 16px 0'
                    }}>
                      We hope you're having a wonderful week. We wanted to let you know that your order <strong>#{order_id}</strong> of {number_of_notes} handwritten notes is almost at its destination.
                    </p>

                    <p style={{
                      fontSize: '15px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: '0 0 16px 0'
                    }}>
                      Estimated delivery window: <strong>{expected_delivery_start} – {expected_delivery_end}</strong>. This means your recipients should start receiving their notes soon!
                    </p>

                    <p style={{
                      fontSize: '15px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: '0 0 32px 0'
                    }}>
                      Once your notes have arrived, consider reaching out to your recipients with a quick call or email. A thoughtful follow-up can make your handwritten note even more impactful.
                    </p>

                    {/* Primary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '16px' }}>
                      <tr>
                        <td align="center">
                          <a href={follow_up_tips_url} style={{
                            display: 'inline-block',
                            backgroundColor: '#10B981',
                            color: '#ffffff',
                            padding: '14px 32px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)'
                          }}>
                            Follow-Up Tips
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* Secondary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
                      <tr>
                        <td align="center">
                          <a href={order_details_url} style={{
                            display: 'inline-block',
                            backgroundColor: '#ffffff',
                            color: '#10B981',
                            padding: '14px 32px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            border: '2px solid #10B981'
                          }}>
                            View Order Details
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* Closing */}
                    <p style={{
                      fontSize: '15px',
                      color: '#4b5563',
                      textAlign: 'center',
                      margin: '0'
                    }}>
                      We're grateful to be part of your relationships,<br />
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
export const expectedDeliveryPlainText = ({
  user_firstName,
  order_id,
  expected_delivery_start,
  expected_delivery_end,
  number_of_notes,
  follow_up_tips_url,
  order_details_url
}) => `
Hi ${user_firstName},

Expected Delivery Notice

We hope you're having a wonderful week. We wanted to let you know that your order #${order_id} of ${number_of_notes} handwritten notes is almost at its destination.

Estimated delivery window: ${expected_delivery_start} – ${expected_delivery_end}. This means your recipients should start receiving their notes soon!

Once your notes have arrived, consider reaching out to your recipients with a quick call or email. A thoughtful follow-up can make your handwritten note even more impactful.

Follow-Up Tips: ${follow_up_tips_url}

View Order Details: ${order_details_url}

We're grateful to be part of your relationships,
The RoofScribe Team

© 2024 RoofScribe. All rights reserved.
`;