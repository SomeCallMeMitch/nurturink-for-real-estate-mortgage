import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Support Request Received Email
 * Subject: We received your message - Ticket #[Number]
 */
export default function SupportRequestReceivedEmail({
  firstName,
  email,
  ticketNumber,
  subject,
  priority = 'Normal',
  expectedResponse = '24 hours',
  messagePreview,
  ticketStatusUrl,
  helpCenterUrl,
  videoTutorialsUrl,
  faqUrl,
  phoneNumber,
  logoUrl
}) {
  // Truncate message preview
  const truncatedMessage = messagePreview?.length > 100 
    ? messagePreview.substring(0, 100) + '...' 
    : messagePreview;

  return (
    <EmailWrapper preheader={`We've received your support request. Ticket #${ticketNumber}`}>
      <EmailHeader 
        title="We Received Your Message"
        subtitle={`Ticket #${ticketNumber}`}
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.primary}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Thanks for reaching out! We've received your message and a member of our support 
            team will respond shortly.
          </p>

          {/* Ticket Details */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Your Ticket:</span>
                      <span style={{ color: BRAND_COLORS.accent, fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
                        #{ticketNumber}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Subject:</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', marginLeft: '8px' }}>
                        {subject}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Priority:</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', marginLeft: '8px' }}>
                        {priority}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Expected Response:</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
                        Within {expectedResponse}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          {/* Message Preview */}
          {truncatedMessage && (
            <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
              border: `1px solid ${BRAND_COLORS.border}`,
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <tr>
                <td style={{ padding: '16px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: BRAND_COLORS.neutral }}>
                    What we received:
                  </p>
                  <p style={{ margin: '0', fontSize: '14px', color: BRAND_COLORS.muted, fontStyle: 'italic' }}>
                    "{truncatedMessage}"
                  </p>
                </td>
              </tr>
            </table>
          )}

          {/* CTA */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <EmailButton href={ticketStatusUrl}>View Ticket Status</EmailButton>
          </div>

          {/* Helpful Resources */}
          <p style={textStyles.body}>
            In the meantime, these resources might help:
          </p>
          <table role="presentation" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
            <tr>
              <td style={{ paddingBottom: '8px' }}>
                <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                <a href={helpCenterUrl} style={{ color: BRAND_COLORS.accent, textDecoration: 'none', fontSize: '14px' }}>
                  Help Center
                </a>
              </td>
            </tr>
            {videoTutorialsUrl && (
              <tr>
                <td style={{ paddingBottom: '8px' }}>
                  <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                  <a href={videoTutorialsUrl} style={{ color: BRAND_COLORS.accent, textDecoration: 'none', fontSize: '14px' }}>
                    Video Tutorials
                  </a>
                </td>
              </tr>
            )}
            {faqUrl && (
              <tr>
                <td>
                  <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                  <a href={faqUrl} style={{ color: BRAND_COLORS.accent, textDecoration: 'none', fontSize: '14px' }}>
                    FAQ
                  </a>
                </td>
              </tr>
            )}
          </table>

          {phoneNumber && (
            <p style={textStyles.small}>
              Need urgent help? Call us at {phoneNumber} (Mon-Fri, 9am-6pm ET)
            </p>
          )}

          <p style={textStyles.body}>
            We're here for you,<br />
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
export const supportRequestReceivedEmailPlainText = ({
  firstName,
  email,
  ticketNumber,
  subject,
  priority,
  expectedResponse,
  messagePreview,
  ticketStatusUrl,
  helpCenterUrl,
  phoneNumber
}) => `
We received your message - Ticket #${ticketNumber}

Hi ${firstName},

Thanks for reaching out! We've received your message and a member of our support team will respond shortly.

Your Ticket: #${ticketNumber}
Subject: ${subject}
Priority: ${priority}
Expected Response: Within ${expectedResponse}

${messagePreview ? `What we received:
"${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? '...' : ''}"
` : ''}

View Ticket Status: ${ticketStatusUrl}

In the meantime, these resources might help:
• Help Center: ${helpCenterUrl}

${phoneNumber ? `Need urgent help? Call us at ${phoneNumber} (Mon-Fri, 9am-6pm ET)` : ''}

We're here for you,
The NurturInk Support Team
${emailFooterPlainText({ recipientEmail: email })}
`;