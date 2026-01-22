import React from 'react';

/**
 * Order Printed Email Template
 * Sent when an order has been printed
 */
export default function OrderPrintedEmail({
  user_firstName,
  order_id,
  printed_date,
  shipping_method,
  estimated_shipping_date,
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
                      PRINTED
                    </div>
                    <h1 style={{
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      lineHeight: '1.3',
                      margin: '0'
                    }}>
                      Your notes have been printed
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
                      Great news! Your order <strong>#{order_id}</strong> was printed on {printed_date}. Our team is now preparing your notes for mailing.
                    </p>

                    <p style={{
                      fontSize: '15px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: '0 0 32px 0'
                    }}>
                      Your selected shipping method is <strong>{shipping_method}</strong>. We expect to hand your package over to the carrier by <strong>{estimated_shipping_date}</strong>.
                    </p>

                    {/* Primary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
                      <tr>
                        <td align="center">
                          <a href={order_details_url} style={{
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
                      Thank you for your patience,<br />
                      The NurturInk Team
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
export const orderPrintedPlainText = ({
  user_firstName,
  order_id,
  printed_date,
  shipping_method,
  estimated_shipping_date,
  order_details_url
}) => `
Hi ${user_firstName},

Your notes have been printed

Great news! Your order #${order_id} was printed on ${printed_date}. Our team is now preparing your notes for mailing.

Your selected shipping method is ${shipping_method}. We expect to hand your package over to the carrier by ${estimated_shipping_date}.

View Order Details: ${order_details_url}

Thank you for your patience,
The NurturInk Team

© 2024 NurturInk. All rights reserved.
`;