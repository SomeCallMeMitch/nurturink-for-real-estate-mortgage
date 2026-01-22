import React from 'react';

/**
 * Organization Credit Purchase Receipt Email Template
 * Sent when an organization admin purchases credits for the company pool
 */

// Helper function to format currency
const formatCurrency = (cents) => {
  return `$${(cents / 100).toFixed(2)}`;
};

export default function OrganizationCreditPurchaseReceiptEmail({
  admin_firstName,
  admin_email,
  organization_name,
  order_number,
  transaction_id,
  purchase_date,
  credits_purchased,
  price_paid,
  original_price,
  discount_amount,
  coupon_code,
  payment_method,
  new_org_pool_balance,
  team_size,
  team_management_url,
  receipt_url,
  support_url,
  app_logo_url
}) {
  const hasDiscount = discount_amount > 0;

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
                
                {/* Header with Receipt Badge */}
                <tr>
                  <td style={{
                    backgroundColor: '#FF7A00',
                    padding: '40px 40px 30px 40px'
                  }}>
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                      <tr>
                        <td align="left">
                          {app_logo_url && (
                            <img src={app_logo_url} alt="NurturInk" style={{
                              height: '40px'
                            }} />
                          )}
                        </td>
                        <td align="right">
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#ffffff',
                            color: '#FF7A00',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            border: '2px solid #FF7A00'
                          }}>
                            RECEIPT
                          </span>
                        </td>
                      </tr>
                    </table>
                    <h1 style={{
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      lineHeight: '1.3',
                      margin: '20px 0 0 0'
                    }}>
                      Organization Purchase Receipt
                    </h1>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ padding: '40px' }}>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0 0 8px 0'
                    }}>
                      Thanks for your purchase, {admin_firstName}!
                    </p>
                    
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0 0 32px 0'
                    }}>
                      {credits_purchased} credits have been added to {organization_name}'s company pool and are ready to allocate to your team.
                    </p>

                    {/* Transaction Details Table */}
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
                          Organization
                        </td>
                        <td style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#111827',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'right'
                        }}>
                          {organization_name}
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
                          Receipt #
                        </td>
                        <td style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#111827',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'right'
                        }}>
                          {order_number}
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
                          Transaction ID
                        </td>
                        <td style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#111827',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'right'
                        }}>
                          {transaction_id}
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
                          Date
                        </td>
                        <td style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#111827',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'right'
                        }}>
                          {purchase_date}
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
                          Credits Purchased
                        </td>
                        <td style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#111827',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'right'
                        }}>
                          {credits_purchased}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#ffffff' }}>
                        <td style={{
                          padding: '12px',
                          fontSize: '13px',
                          color: '#6b7280',
                          fontWeight: '600',
                          borderBottom: hasDiscount ? '1px solid #e5e7eb' : 'none'
                        }}>
                          Payment Method
                        </td>
                        <td style={{
                          padding: '12px',
                          fontSize: '14px',
                          color: '#111827',
                          borderBottom: hasDiscount ? '1px solid #e5e7eb' : 'none',
                          textAlign: 'right'
                        }}>
                          •••• {payment_method}
                        </td>
                      </tr>
                      {hasDiscount && (
                        <>
                          <tr style={{ backgroundColor: '#f9fafb' }}>
                            <td style={{
                              padding: '12px',
                              fontSize: '13px',
                              color: '#6b7280',
                              fontWeight: '600',
                              borderBottom: '1px solid #e5e7eb'
                            }}>
                              Original Price
                            </td>
                            <td style={{
                              padding: '12px',
                              fontSize: '14px',
                              color: '#111827',
                              borderBottom: '1px solid #e5e7eb',
                              textAlign: 'right'
                            }}>
                              {formatCurrency(original_price)}
                            </td>
                          </tr>
                          <tr style={{ backgroundColor: '#ffffff' }}>
                            <td style={{
                              padding: '12px',
                              fontSize: '13px',
                              color: '#10B981',
                              fontWeight: '600',
                              borderBottom: '1px solid #e5e7eb'
                            }}>
                              Discount ({coupon_code})
                            </td>
                            <td style={{
                              padding: '12px',
                              fontSize: '14px',
                              color: '#10B981',
                              borderBottom: '1px solid #e5e7eb',
                              textAlign: 'right'
                            }}>
                              -{formatCurrency(discount_amount)}
                            </td>
                          </tr>
                        </>
                      )}
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <td style={{
                          padding: '12px',
                          fontSize: '15px',
                          color: '#FF7A00',
                          fontWeight: 'bold'
                        }}>
                          Total Paid
                        </td>
                        <td style={{
                          padding: '12px',
                          fontSize: '18px',
                          color: '#FF7A00',
                          fontWeight: 'bold',
                          textAlign: 'right'
                        }}>
                          {formatCurrency(price_paid)}
                        </td>
                      </tr>
                    </table>

                    {/* Organization Pool Balance Display */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
                      backgroundColor: '#fff7ed',
                      borderRadius: '8px',
                      padding: '20px',
                      marginBottom: '24px',
                      border: '2px solid #FF7A00'
                    }}>
                      <tr>
                        <td>
                          <p style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#FF7A00',
                            margin: '0 0 8px 0',
                            textAlign: 'center'
                          }}>
                            Company Pool Balance: {new_org_pool_balance} credits
                          </p>
                          <p style={{
                            fontSize: '13px',
                            color: '#9a3412',
                            margin: '0',
                            textAlign: 'center'
                          }}>
                            Available to allocate across {team_size} team {team_size === 1 ? 'member' : 'members'}
                          </p>
                        </td>
                      </tr>
                    </table>

                    {/* Primary CTA */}
                    <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
                      <tr>
                        <td align="center">
                          <a href={team_management_url} style={{
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
                            Manage Team Credits
                          </a>
                        </td>
                      </tr>
                    </table>

                    {/* What's Included */}
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      textAlign: 'center',
                      margin: '0 0 20px 0'
                    }}>
                      Each credit includes a handwritten card, envelope, postage, and mailing.
                    </p>

                    {/* Receipt Download */}
                    <p style={{
                      fontSize: '14px',
                      textAlign: 'center',
                      margin: '0 0 20px 0'
                    }}>
                      <a href={receipt_url} style={{
                        color: '#FF7A00',
                        textDecoration: 'none'
                      }}>
                        Download Receipt (PDF)
                      </a>
                    </p>

                    {/* Support */}
                    <p style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      textAlign: 'center',
                      margin: '0'
                    }}>
                      Questions about your purchase? Contact <a href="mailto:billing@nurturink.com" style={{ color: '#FF7A00', textDecoration: 'none' }}>billing@nurturink.com</a>
                    </p>
                  </td>
                </tr>

                {/* Billing Footer */}
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
                      margin: '0 0 8px 0'
                    }}>
                      © 2024 NurturInk. All rights reserved.
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#9ca3af',
                      textAlign: 'center',
                      margin: '0'
                    }}>
                      This receipt was sent to {admin_email} on behalf of {organization_name}
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
export const organizationCreditPurchaseReceiptPlainText = ({
  admin_firstName,
  admin_email,
  organization_name,
  order_number,
  transaction_id,
  purchase_date,
  credits_purchased,
  price_paid,
  original_price,
  discount_amount,
  coupon_code,
  payment_method,
  new_org_pool_balance,
  team_size,
  team_management_url,
  receipt_url
}) => {
  const hasDiscount = discount_amount > 0;
  
  return `
ORGANIZATION PURCHASE RECEIPT

Thanks for your purchase, ${admin_firstName}!

${credits_purchased} credits have been added to ${organization_name}'s company pool and are ready to allocate to your team.

Transaction Details:
• Organization: ${organization_name}
• Receipt #: ${order_number}
• Transaction ID: ${transaction_id}
• Date: ${purchase_date}
• Credits Purchased: ${credits_purchased}
• Payment Method: •••• ${payment_method}
${hasDiscount ? `• Original Price: ${formatCurrency(original_price)}
• Discount (${coupon_code}): -${formatCurrency(discount_amount)}` : ''}
• Total Paid: ${formatCurrency(price_paid)}

Company Pool Balance: ${new_org_pool_balance} credits
Available to allocate across ${team_size} team ${team_size === 1 ? 'member' : 'members'}

Manage Team Credits: ${team_management_url}

Each credit includes a handwritten card, envelope, postage, and mailing.

Download Receipt (PDF): ${receipt_url}

Questions about your purchase? Contact billing@nurturink.com

© 2024 NurturInk. All rights reserved.
This receipt was sent to ${admin_email} on behalf of ${organization_name}
`;
};