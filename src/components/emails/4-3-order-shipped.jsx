import React from 'react';

/**
 * Order Shipped Notification Email Template
 * Sent when an order has been shipped
 */
export default function OrderShippedEmail({
  user_firstName,
  order_id,
  shipping_date,
  tracking_number,
  tracking_url,
  estimated_delivery_date,
  number_of_notes,
  order_details_url,
  support_url,
  app_logo_url
}) {
  const hasTracking = tracking_number && tracking_url;

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
                      SHIPPED
                    </div>
                    <h1 style={{
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      lineHeight: '1.3',
                      margin: '0'
                    }}>
                      Your order has shipped
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
                      margin: '0 0 24px 0'
                    }}>
                      Exciting news! Your order <strong>#{order_id}</strong> shipped on {shipping_date}. Your {number_of_notes} handwritten notes are on their way.
                    </p>

                    {/* Conditional Tracking Section */}
                    {hasTracking && (
                      <>
                        <p style={{
                          fontSize: '15px',
                          color: '#4b5563',
                          lineHeight: '1.6',
                          margin: '0 0 16px 0'
                        }}>
                          Your tracking number is <strong>{tracking_number}</strong>. Click the button below to see real-time updates.
                        </p>

                        {/* Track Package Button */}
                        <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
                          <tr>
                            <td align="center">
                              <a href={tracking_url} style={{
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
                                Track Your Package
                              </a>
                            </td>
                          </tr>
                        </table>
                      </>
                    )}

                    <p style={{
                      fontSize: '15px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: '0 0 32px 0'
                    }}>
                      Estimated delivery date: <strong>{estimated_delivery_date}</strong>.
                    </p>

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
                      Thank you for using RoofScribe,<br />
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
export const orderShippedPlainText = ({
  user_firstName,
  order_id,
  shipping_date,
  tracking_number,
  tracking_url,
  estimated_delivery_date,
  number_of_notes,
  order_details_url
}) => {
  const hasTracking = tracking_number && tracking_url;
  
  return `
Hi ${user_firstName},

Your order has shipped

Exciting news! Your order #${order_id} shipped on ${shipping_date}. Your ${number_of_notes} handwritten notes are on their way.

${hasTracking ? `Your tracking number is ${tracking_number}.

Track Your Package: ${tracking_url}
` : ''}
Estimated delivery date: ${estimated_delivery_date}.

View Order Details: ${order_details_url}

Thank you for using RoofScribe,
The RoofScribe Team

© 2024 RoofScribe. All rights reserved.
`;
};