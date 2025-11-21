import React from 'react';

/**
 * Payment Failed Email Template
 * Sent when a credit purchase payment fails
 */

// Helper function to format currency
const formatCurrency = (cents) => {
  return `$${(cents / 100).toFixed(2)}`;
};

export default function PaymentFailedEmail({
  user_firstName,
  is_org_purchase,
  organization_name,
  credits_attempted,
  amount_attempted,
  failure_reason,
  failure_code,
  payment_method,
  attempt_timestamp,
  retry_url,
  update_payment_url,
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
                    backgroundColor: '#dc2626',
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
                      ❌ PAYMENT FAILED
                    </div>
                    <h1 style={{
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      lineHeight: '1.3',
                      margin: '0'
                    }}>
                      Payment Failed - Action Required
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
                      We were unable to process your {is_org_purchase ? `${organization_name} ` : ''}credit purchase. Please review the details below and take action to complete your purchase.
                    </p>

                    {/* Failed Transaction Details */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      marginBottom: '24px'
                    }}>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <td style={{
                          padding: '12px',
                          fontSize: '13px',
                          color: '#6b7280',
                          fontWeight: '600',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          {is_org_purchase ? 'Organization' : 'Purchase Type'}
                        </td>
                        <td style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#111827',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'right'
                        }}>
                          {is_org_purchase ? organization_name : 'Personal'}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#ffffff' }}>
                        <td style={{
                          padding: '12px',
                          fontSize: '13px',
                          color: '#6b7280',
                          fontWeight: '600',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          Credits Attempted
                        </td>
                        <td style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#111827',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'right'
                        }}>
                          {credits_attempted}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <td style={{
                          padding: '12px',
                          fontSize: '13px',
                          color: '#6b7280',
                          fontWeight: '600',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          Amount Attempted
                        </td>
                        <td style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#111827',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'right'
                        }}>
                          {formatCurrency(amount_attempted)}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#ffffff' }}>
                        <td style={{
                          padding: '12px',
                          fontSize: '13px',
                          color: '#6b7280',
                          fontWeight: '600',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          Payment Method
                        </td>
                        <td style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#111827',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'right'
                        }}>
                          •••• {payment_method}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <td style={{
                          padding: '12px',
                          fontSize: '13px',
                          color: '#6b7280',
                          fontWeight: '600'
                        }}>
                          Attempt Time
                        </td>
                        <td style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#111827',
                          textAlign: 'right'
                        }}>
                          {attempt_timestamp}
                        </td>
                      </tr>
                    </table>

                    {/* Failure Reason */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      backgroundColor: '#fee2e2',
                      border: '2px solid #ef4444',
                      borderRadius: '8px',
                      padding: '20px',
                      marginBottom: '32px'
                    }}>
                      <tr>
                        <td>
                          <p style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#991b1b',
                            margin: '0 0 8px 0'
                          }}>
                            Reason for failure:
                          </p>
                          <p style={{
                            fontSize: '14px',
                            color: '#7f1d1d',
                            margin: '0 0 8px 0'
                          }}>
                            {failure_reason}
                          </p>
                          <p style={{
                            fontSize: '12px',
                            color: '#991b1b',
                            margin: '0'
                          }}>
                            Error code: {failure_code}
                          </p>
                        </td>
                      </tr>
                    </table>

                    {/* What to do next */}
                    <div style={{ marginBottom: '32px' }}>
                      <p style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0 0 12px 0'
                      }}>
                        What to do next:
                      </p>
                      <ul style={{
                        fontSize: '14px',
                        color: '#4b5563',
                        lineHeight: '1.8',
                        paddingLeft: '20px',
                        margin: '0'
                      }}>
                        <li style={{ marginBottom: '8px' }}>
                          Try your purchase again (sometimes temporary issues resolve quickly)
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                          Update your payment method if there's an issue with your card
                        </li>
                        <li>
                          Contact your bank if you continue to experience issues
                        </li>
                      </ul>
                    </div>

                    {/* Primary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '16px' }}>
                      <tr>
                        <td align="center">
                          <a href={retry_url} style={{
                            display: 'inline-block',
                            backgroundColor: '#FF7A00',
                            color: '#ffffff',
                            padding: '14px 32px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            boxShadow: '0 4px 6px rgba(255, 122, 0, 0.3)'
                          }}>
                            Try Purchase Again
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* Secondary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
                      <tr>
                        <td align="center">
                          <a href={update_payment_url} style={{
                            display: 'inline-block',
                            backgroundColor: '#ffffff',
                            color: '#FF7A00',
                            padding: '14px 32px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            border: '2px solid #FF7A00'
                          }}>
                            Update Payment Method
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* Support Link */}
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      textAlign: 'center',
                      margin: '0'
                    }}>
                      Need help? <a href={support_url} style={{ color: '#FF7A00', textDecoration: 'none' }}>Contact our support team</a>
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
export const paymentFailedPlainText = ({
  user_firstName,
  is_org_purchase,
  organization_name,
  credits_attempted,
  amount_attempted,
  failure_reason,
  failure_code,
  payment_method,
  attempt_timestamp,
  retry_url,
  update_payment_url,
  support_url
}) => `
Hi ${user_firstName},

❌ PAYMENT FAILED - Action Required

We were unable to process your ${is_org_purchase ? `${organization_name} ` : ''}credit purchase. Please review the details below and take action to complete your purchase.

Failed Transaction Details:
• ${is_org_purchase ? 'Organization' : 'Purchase Type'}: ${is_org_purchase ? organization_name : 'Personal'}
• Credits Attempted: ${credits_attempted}
• Amount Attempted: ${formatCurrency(amount_attempted)}
• Payment Method: •••• ${payment_method}
• Attempt Time: ${attempt_timestamp}

Reason for failure:
${failure_reason}
Error code: ${failure_code}

What to do next:
• Try your purchase again (sometimes temporary issues resolve quickly)
• Update your payment method if there's an issue with your card
• Contact your bank if you continue to experience issues

Try Purchase Again: ${retry_url}

Update Payment Method: ${update_payment_url}

Need help? Contact our support team: ${support_url}

© 2024 RoofScribe. All rights reserved.
`;