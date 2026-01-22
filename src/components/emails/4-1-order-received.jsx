import React from 'react';

/**
 * Order Received Confirmation Email Template
 * Sent when an order is successfully placed
 */
export default function OrderReceivedEmail({
  user_firstName,
  user_fullName,
  order_id,
  order_date,
  number_of_notes,
  total_cents,
  price_display,
  print_estimated_date,
  shipping_method,
  estimated_delivery_window,
  order_details_url,
  send_more_url,
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
                      ORDER RECEIVED
                    </div>
                    <h1 style={{
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      lineHeight: '1.3',
                      margin: '0'
                    }}>
                      Order Received
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
                      margin: '0 0 32px 0'
                    }}>
                      Thank you for placing your handwritten note order! We've received your order <strong>#{order_id}</strong> on {order_date}. We're excited to start preparing your notes.
                    </p>

                    {/* Order Summary Table */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      marginBottom: '24px'
                    }}>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <td style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#6b7280',
                          fontWeight: '600',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          Number of notes
                        </td>
                        <td style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#111827',
                          textAlign: 'right',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          {number_of_notes}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#ffffff' }}>
                        <td style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#6b7280',
                          fontWeight: '600',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          Shipping method
                        </td>
                        <td style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#111827',
                          textAlign: 'right',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          {shipping_method}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <td style={{
                          padding: '12px',
                          fontSize: '15px',
                          color: '#10B981',
                          fontWeight: 'bold'
                        }}>
                          Total paid
                        </td>
                        <td style={{
                          padding: '12px',
                          fontSize: '18px',
                          color: '#10B981',
                          fontWeight: 'bold',
                          textAlign: 'right'
                        }}>
                          {price_display}
                        </td>
                      </tr>
                    </table>

                    <p style={{
                      fontSize: '15px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: '0 0 32px 0'
                    }}>
                      We'll print your notes around <strong>{print_estimated_date}</strong> and mail them soon after. With {shipping_method} shipping, they should arrive within <strong>{estimated_delivery_window}</strong>.
                    </p>

                    {/* Primary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '16px' }}>
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

                    {/* Secondary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
                      <tr>
                        <td align="center">
                          <a href={send_more_url} style={{
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
                            Send Another Note
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* Support */}
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      textAlign: 'center',
                      margin: '0 0 16px 0'
                    }}>
                      If you have any questions about your order, feel free to reach out to our support team.
                    </p>

                    {/* Closing */}
                    <p style={{
                      fontSize: '15px',
                      color: '#4b5563',
                      textAlign: 'center',
                      margin: '0'
                    }}>
                      Thanks for choosing NurturInk,<br />
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
export const orderReceivedPlainText = ({
  user_firstName,
  order_id,
  order_date,
  number_of_notes,
  price_display,
  print_estimated_date,
  shipping_method,
  estimated_delivery_window,
  order_details_url,
  send_more_url
}) => `
Hi ${user_firstName},

Order Received

Thank you for placing your handwritten note order! We've received your order #${order_id} on ${order_date}. We're excited to start preparing your notes.

Order Summary:
• Number of notes: ${number_of_notes}
• Shipping method: ${shipping_method}
• Total paid: ${price_display}

We'll print your notes around ${print_estimated_date} and mail them soon after. With ${shipping_method} shipping, they should arrive within ${estimated_delivery_window}.

View Order Details: ${order_details_url}

Send Another Note: ${send_more_url}

If you have any questions about your order, feel free to reach out to our support team.

Thanks for choosing NurturInk,
The NurturInk Team

© 2024 NurturInk. All rights reserved.
`;