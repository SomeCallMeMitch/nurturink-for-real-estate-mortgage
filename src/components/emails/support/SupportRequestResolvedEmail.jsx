import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Support Request Resolved Email
 * Subject: Resolved: Ticket #[Number]
 */
export default function SupportRequestResolvedEmail({
  firstName,
  email,
  ticketNumber,
  subject,
  agentName,
  resolutionSummary,
  ticketDetailsUrl,
  helpfulYesUrl,
  helpfulNoUrl,
  logoUrl
}) {
  return (
    <EmailWrapper preheader={`Great news! Your support ticket #${ticketNumber} has been resolved.`}>
      <EmailHeader 
        title="Ticket Resolved"
        subtitle={`#${ticketNumber}`}
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.success}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Great news! Your support ticket has been resolved.
          </p>

          {/* Resolution Details */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Ticket:</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
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
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Resolved by:</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', marginLeft: '8px' }}>
                        {agentName}
                      </span>
                    </td>
                  </tr>
                  {resolutionSummary && (
                    <tr>
                      <td>
                        <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Resolution:</span>
                        <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', marginLeft: '8px' }}>
                          {resolutionSummary}
                        </span>
                      </td>
                    </tr>
                  )}
                </table>
              </td>
            </tr>
          </table>

          {/* CTA */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <EmailButton href={ticketDetailsUrl}>View Ticket Details</EmailButton>
          </div>

          {/* Feedback */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '24px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '15px', color: BRAND_COLORS.dark }}>
                  Was this helpful?
                </p>
                <table role="presentation" cellSpacing="0" cellPadding="0" border="0" style={{ margin: '0 auto' }}>
                  <tr>
                    <td style={{ paddingRight: '12px' }}>
                      <a href={helpfulYesUrl} style={{
                        display: 'inline-block',
                        backgroundColor: BRAND_COLORS.success,
                        color: '#ffffff',
                        padding: '10px 24px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}>
                        👍 Yes, helped
                      </a>
                    </td>
                    <td>
                      <a href={helpfulNoUrl} style={{
                        display: 'inline-block',
                        backgroundColor: BRAND_COLORS.neutral,
                        color: '#ffffff',
                        padding: '10px 24px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}>
                        👎 No, still need help
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style={textStyles.small}>
            If you have any other questions, just reply to this email or open a new ticket.
          </p>

          <p style={textStyles.body}>
            Thanks for using NurturInk!<br />
            <strong>The Support Team</strong>
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
export const supportRequestResolvedEmailPlainText = ({
  firstName,
  email,
  ticketNumber,
  subject,
  agentName,
  resolutionSummary,
  ticketDetailsUrl,
  helpfulYesUrl,
  helpfulNoUrl
}) => `
Resolved: Ticket #${ticketNumber}

Hi ${firstName},

Great news! Your support ticket has been resolved.

Ticket #${ticketNumber}: ${subject}
Resolved by: ${agentName}
${resolutionSummary ? `Resolution: ${resolutionSummary}` : ''}

View Ticket Details: ${ticketDetailsUrl}

Was this helpful?
👍 Yes, helped: ${helpfulYesUrl}
👎 No, still need help: ${helpfulNoUrl}

If you have any other questions, just reply to this email or open a new ticket.

Thanks for using NurturInk!
The Support Team
${emailFooterPlainText({ recipientEmail: email })}
`;