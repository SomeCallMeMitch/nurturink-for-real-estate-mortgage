import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton, { EmailButtonGroup } from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Note Delivered Confirmation Email
 * Subject: Your note to [Client Name] was delivered
 */
export default function NoteDeliveredEmail({
  firstName,
  email,
  clientName,
  deliveredDate,
  address,
  noteDetailsUrl,
  sendAnotherUrl,
  logoUrl
}) {
  return (
    <EmailWrapper preheader={`Your handwritten note to ${clientName} has been delivered!`}>
      <EmailHeader 
        title="Note Delivered!"
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.success}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Your handwritten note has been delivered!
          </p>

          {/* Delivery Details */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: BRAND_COLORS.neutral }}>
                  Successfully delivered to
                </p>
                <p style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold', color: BRAND_COLORS.dark }}>
                  {clientName}
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: BRAND_COLORS.muted }}>
                  {deliveredDate}
                </p>
                {address && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: BRAND_COLORS.neutral }}>
                    {address}
                  </p>
                )}
              </td>
            </tr>
          </table>

          <p style={textStyles.body}>
            Your note is now making an impact. Handwritten notes typically get read within 
            <strong> 24 hours</strong> and are kept for weeks or even months.
          </p>

          {/* Pro Tip */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '16px' }}>
                <p style={{ margin: '0', fontSize: '14px', color: '#92400e' }}>
                  <strong>Pro tip:</strong> Follow up with a phone call or email in 2-3 days to 
                  reference your note and deepen the connection.
                </p>
              </td>
            </tr>
          </table>

          {/* CTA Buttons */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
            <tr>
              <td align="center">
                <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingRight: '12px' }}>
                      <EmailButton href={noteDetailsUrl} variant="secondary">View Note Details</EmailButton>
                    </td>
                    <td>
                      <EmailButton href={sendAnotherUrl}>Send Another Note</EmailButton>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style={textStyles.body}>
            Keep building meaningful relationships,<br />
            <strong>The NurturInk Team</strong>
          </p>
        </td>
      </tr>
      
      <EmailFooter 
        recipientEmail={email}
        showUnsubscribe={false}
      />
    </EmailWrapper>
  );
}

// Plain text version
export const noteDeliveredEmailPlainText = ({
  firstName,
  email,
  clientName,
  deliveredDate,
  address,
  noteDetailsUrl,
  sendAnotherUrl
}) => `
Note Delivered!

Hi ${firstName},

Your handwritten note has been delivered!

Recipient: ${clientName}
Delivered: ${deliveredDate}
${address ? `Address: ${address}` : ''}

Your note is now making an impact. Handwritten notes typically get read within 24 hours and are kept for weeks or even months.

Pro tip: Follow up with a phone call or email in 2-3 days to reference your note and deepen the connection.

View Note Details: ${noteDetailsUrl}
Send Another Note: ${sendAnotherUrl}

Keep building meaningful relationships,
The NurturInk Team
${emailFooterPlainText({ recipientEmail: email })}
`;