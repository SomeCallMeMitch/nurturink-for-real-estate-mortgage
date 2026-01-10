import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Credit Purchase Confirmation Email
 * Subject: Receipt: [X] credits added to your account
 */
export default function CreditPurchaseReceiptEmail({
  firstName,
  email,
  transactionId,
  purchaseDate,
  creditsPurchased,
  amountPaid,
  paymentMethod,
  newBalance,
  invoiceUrl,
  transactionHistoryUrl,
  sendNoteUrl,
  logoUrl
}) {
  return (
    <EmailWrapper preheader={`Thank you! ${creditsPurchased} credits have been added to your account.`}>
      <EmailHeader 
        title="Thank You for Your Purchase!"
        subtitle={`${creditsPurchased} credits added`}
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.success}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Thank you for your purchase! Your credits have been added.
          </p>

          {/* Receipt Box */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            border: `1px solid ${BRAND_COLORS.border}`,
            borderRadius: '8px',
            marginBottom: '24px',
            overflow: 'hidden'
          }}>
            {/* Receipt Header */}
            <tr>
              <td style={{ 
                backgroundColor: BRAND_COLORS.light, 
                padding: '16px 20px',
                borderBottom: `1px solid ${BRAND_COLORS.border}`
              }}>
                <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td>
                      <p style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: BRAND_COLORS.dark }}>
                        RECEIPT #{transactionId}
                      </p>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0', fontSize: '14px', color: BRAND_COLORS.neutral }}>
                        {purchaseDate}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            {/* Receipt Details */}
            <tr>
              <td style={{ padding: '20px' }}>
                <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '12px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Credits Purchased:</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', fontWeight: '600', float: 'right' }}>
                        {creditsPurchased} credits
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '12px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Amount Paid:</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', fontWeight: '600', float: 'right' }}>
                        ${amountPaid}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '12px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Payment Method:</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', float: 'right' }}>
                        {paymentMethod}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      paddingTop: '12px',
                      borderTop: `1px dashed ${BRAND_COLORS.border}`
                    }}>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '16px', fontWeight: '600' }}>New Balance:</span>
                      <span style={{ color: BRAND_COLORS.accent, fontSize: '20px', fontWeight: 'bold', float: 'right' }}>
                        {newBalance} credits
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          {/* Action Buttons */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
            <tr>
              <td align="center">
                <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingRight: '12px' }}>
                      <EmailButton href={invoiceUrl} variant="secondary">Download Invoice</EmailButton>
                    </td>
                    <td>
                      <EmailButton href={transactionHistoryUrl} variant="secondary">View Transaction History</EmailButton>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          {/* CTA */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '15px', color: BRAND_COLORS.muted }}>
                  Ready to make an impact? Start sending notes now.
                </p>
                <EmailButton href={sendNoteUrl}>Send a Note</EmailButton>
              </td>
            </tr>
          </table>

          <p style={textStyles.small}>
            Questions about your purchase? Reply to this email or check your account settings.
          </p>

          <p style={textStyles.body}>
            Thank you for using NurturInk!<br />
            <strong>The NurturInk Team</strong>
          </p>
        </td>
      </tr>
      
      <EmailFooter 
        recipientEmail={email}
        type="billing"
        showUnsubscribe={false}
      />
    </EmailWrapper>
  );
}

// Plain text version
export const creditPurchaseReceiptEmailPlainText = ({
  firstName,
  email,
  transactionId,
  purchaseDate,
  creditsPurchased,
  amountPaid,
  paymentMethod,
  newBalance,
  invoiceUrl,
  transactionHistoryUrl,
  sendNoteUrl
}) => `
Receipt: ${creditsPurchased} credits added to your account

Hi ${firstName},

Thank you for your purchase! Your credits have been added.

RECEIPT #${transactionId}
Date: ${purchaseDate}

Credits Purchased: ${creditsPurchased} credits
Amount Paid: $${amountPaid}
Payment Method: ${paymentMethod}

New Balance: ${newBalance} credits

Download Invoice: ${invoiceUrl}
View Transaction History: ${transactionHistoryUrl}

Ready to make an impact? Start sending notes now: ${sendNoteUrl}

Questions about your purchase? Reply to this email or check your account settings.

Thank you for using NurturInk!
The NurturInk Team
${emailFooterPlainText({ recipientEmail: email, type: 'billing' })}
`;