import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { InfoBox, textStyles } from '../shared/EmailComponents';

/**
 * Note Failed/Delivery Issue Email
 * Subject: Action Required: Issue with note to [Client Name]
 */
export default function NoteFailedEmail({
  firstName,
  email,
  clientName,
  issueReason, // 'invalid_address', 'return_to_sender', 'printing_error'
  issueDate,
  creditRefunded = true,
  updateAddressUrl,
  resendNoteUrl,
  logoUrl
}) {
  const issueMessages = {
    invalid_address: 'Invalid address',
    return_to_sender: 'Return to sender',
    printing_error: 'Printing error',
    undeliverable: 'Address undeliverable'
  };

  const issueDisplay = issueMessages[issueReason] || issueReason;

  return (
    <EmailWrapper preheader={`Action required: There was an issue delivering your note to ${clientName}`}>
      <EmailHeader 
        title="Action Required"
        subtitle={`Issue with note to ${clientName}`}
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.error}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            We encountered an issue delivering your note to <strong>{clientName}</strong>.
          </p>

          {/* Issue Details */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '8px' }}>
                      <span style={{ color: '#991b1b', fontSize: '14px', fontWeight: '600' }}>Issue:</span>
                      <span style={{ color: '#991b1b', fontSize: '14px', marginLeft: '8px' }}>{issueDisplay}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ color: '#991b1b', fontSize: '14px', fontWeight: '600' }}>Date:</span>
                      <span style={{ color: '#991b1b', fontSize: '14px', marginLeft: '8px' }}>{issueDate}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          {/* What happens next */}
          <h2 style={textStyles.heading2}>What happens next:</h2>
          
          <ul style={{ 
            paddingLeft: '20px', 
            marginBottom: '24px',
            color: BRAND_COLORS.muted,
            lineHeight: '1.8'
          }}>
            {creditRefunded && (
              <li><strong style={{ color: BRAND_COLORS.success }}>Your credit has been refunded</strong> to your account</li>
            )}
            <li>No further action will be taken on this note</li>
          </ul>

          {/* Resolution Steps */}
          <h2 style={textStyles.heading2}>To resolve:</h2>
          
          <ol style={{ 
            paddingLeft: '20px', 
            marginBottom: '24px',
            color: BRAND_COLORS.muted,
            lineHeight: '1.8'
          }}>
            <li>Verify the recipient's address is correct</li>
            <li>Update the address in your client database</li>
            <li>Resend the note when ready</li>
          </ol>

          {/* CTA Buttons */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
            <tr>
              <td align="center">
                <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingRight: '12px' }}>
                      <EmailButton href={updateAddressUrl} variant="secondary">Update Client Address</EmailButton>
                    </td>
                    <td>
                      <EmailButton href={resendNoteUrl}>Resend Note</EmailButton>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style={textStyles.small}>
            If you believe this is an error, please reply to this email and we'll investigate immediately.
          </p>

          <p style={textStyles.body}>
            Sorry for the inconvenience,<br />
            <strong>The NurturInk Support Team</strong>
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
export const noteFailedEmailPlainText = ({
  firstName,
  email,
  clientName,
  issueReason,
  issueDate,
  creditRefunded,
  updateAddressUrl,
  resendNoteUrl
}) => `
Action Required: Issue with note to ${clientName}

Hi ${firstName},

We encountered an issue delivering your note to ${clientName}.

Issue: ${issueReason}
Date: ${issueDate}

What happens next:
${creditRefunded ? '• Your credit has been refunded to your account' : ''}
• No further action will be taken on this note

To resolve:
1. Verify the recipient's address is correct
2. Update the address in your client database
3. Resend the note when ready

Update Client Address: ${updateAddressUrl}
Resend Note: ${resendNoteUrl}

If you believe this is an error, please reply to this email and we'll investigate immediately.

Sorry for the inconvenience,
The NurturInk Support Team
${emailFooterPlainText({ recipientEmail: email })}
`;