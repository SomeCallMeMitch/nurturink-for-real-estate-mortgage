import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Note Queued for Printing Email
 * Subject: Your note to [Client Name] is on its way
 */
export default function NoteQueuedEmail({
  firstName,
  email,
  clientName,
  cardDesignName,
  messagePreview,
  creditsUsed = 1,
  remainingBalance,
  noteDetailsUrl,
  logoUrl
}) {
  // Truncate message preview
  const truncatedMessage = messagePreview?.length > 50 
    ? messagePreview.substring(0, 50) + '...' 
    : messagePreview;

  return (
    <EmailWrapper preheader={`Great news! Your handwritten note to ${clientName} is being processed.`}>
      <EmailHeader 
        title="Your Note is On Its Way!"
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.primary}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Great news! Your handwritten note has been queued for printing.
          </p>

          {/* Note Details */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '12px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Recipient:</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
                        {clientName}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '12px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Card Design:</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', marginLeft: '8px' }}>
                        {cardDesignName}
                      </span>
                    </td>
                  </tr>
                  {truncatedMessage && (
                    <tr>
                      <td>
                        <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Message Preview:</span>
                        <span style={{ color: BRAND_COLORS.muted, fontSize: '14px', fontStyle: 'italic', marginLeft: '8px' }}>
                          "{truncatedMessage}"
                        </span>
                      </td>
                    </tr>
                  )}
                </table>
              </td>
            </tr>
          </table>

          {/* Timeline */}
          <h2 style={textStyles.heading2}>Timeline:</h2>
          
          <table role="presentation" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
            <tr>
              <td style={{ paddingBottom: '12px' }}>
                <span style={{ color: BRAND_COLORS.success, marginRight: '12px', fontSize: '16px' }}>✓</span>
                <span style={{ color: BRAND_COLORS.dark, fontSize: '15px', fontWeight: '600' }}>Queued</span>
                <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px', marginLeft: '8px' }}>- Today</span>
              </td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '12px' }}>
                <span style={{ color: BRAND_COLORS.neutral, marginRight: '12px', fontSize: '16px' }}>○</span>
                <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>Printing</span>
                <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px', marginLeft: '8px' }}>- Within 24 hours</span>
              </td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '12px' }}>
                <span style={{ color: BRAND_COLORS.neutral, marginRight: '12px', fontSize: '16px' }}>○</span>
                <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>Mailed</span>
                <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px', marginLeft: '8px' }}>- 1-2 business days</span>
              </td>
            </tr>
            <tr>
              <td>
                <span style={{ color: BRAND_COLORS.neutral, marginRight: '12px', fontSize: '16px' }}>○</span>
                <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>Delivered</span>
                <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px', marginLeft: '8px' }}>- 3-7 business days</span>
              </td>
            </tr>
          </table>

          {/* Credits Info */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            border: `1px solid ${BRAND_COLORS.border}`,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '16px', borderRight: `1px solid ${BRAND_COLORS.border}`, textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: BRAND_COLORS.neutral }}>Credits Used</p>
                <p style={{ margin: '0', fontSize: '20px', fontWeight: 'bold', color: BRAND_COLORS.dark }}>{creditsUsed}</p>
              </td>
              <td style={{ padding: '16px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: BRAND_COLORS.neutral }}>Remaining Balance</p>
                <p style={{ margin: '0', fontSize: '20px', fontWeight: 'bold', color: BRAND_COLORS.accent }}>{remainingBalance}</p>
              </td>
            </tr>
          </table>

          {/* CTA Button */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <EmailButton href={noteDetailsUrl}>View Note Details</EmailButton>
          </div>

          <p style={textStyles.small}>
            We'll send you updates as your note progresses through printing and delivery.
          </p>

          <p style={textStyles.body}>
            Best regards,<br />
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
export const noteQueuedEmailPlainText = ({
  firstName,
  email,
  clientName,
  cardDesignName,
  messagePreview,
  creditsUsed,
  remainingBalance,
  noteDetailsUrl
}) => `
Your Note is On Its Way!

Hi ${firstName},

Great news! Your handwritten note has been queued for printing.

Recipient: ${clientName}
Card Design: ${cardDesignName}
${messagePreview ? `Message Preview: "${messagePreview.substring(0, 50)}..."` : ''}

Timeline:
✓ Queued - Today
○ Printing - Within 24 hours
○ Mailed - 1-2 business days
○ Delivered - 3-7 business days

Credits Used: ${creditsUsed}
Remaining Balance: ${remainingBalance} credits

View Note Details: ${noteDetailsUrl}

We'll send you updates as your note progresses through printing and delivery.

Best regards,
The NurturInk Team
${emailFooterPlainText({ recipientEmail: email })}
`;