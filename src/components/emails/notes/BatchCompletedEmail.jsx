import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Batch Mailing Completed Email
 * Subject: Your batch of [X] notes is complete
 */
export default function BatchCompletedEmail({
  firstName,
  email,
  totalNotes,
  successfullyQueued,
  currentlyPrinting,
  inMail,
  failed,
  creditsUsed,
  remainingBalance,
  reportUrl,
  logoUrl
}) {
  const hasFailures = failed > 0;

  return (
    <EmailWrapper preheader={`Your batch mailing of ${totalNotes} notes has been completed!`}>
      <EmailHeader 
        title="Batch Mailing Complete!"
        logoUrl={logoUrl}
        backgroundColor={hasFailures ? BRAND_COLORS.warning : BRAND_COLORS.success}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Your batch mailing has been completed!
          </p>

          {/* Batch Summary */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: BRAND_COLORS.dark }}>
                  Batch Summary:
                </h3>
                <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <span style={{ color: BRAND_COLORS.success, marginRight: '8px' }}>✓</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>
                        Successfully queued: <strong style={{ color: BRAND_COLORS.dark }}>{successfullyQueued} notes</strong>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <span style={{ color: BRAND_COLORS.success, marginRight: '8px' }}>✓</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>
                        Currently printing: <strong style={{ color: BRAND_COLORS.dark }}>{currentlyPrinting} notes</strong>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <span style={{ color: BRAND_COLORS.success, marginRight: '8px' }}>✓</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>
                        In mail: <strong style={{ color: BRAND_COLORS.dark }}>{inMail} notes</strong>
                      </span>
                    </td>
                  </tr>
                  {failed > 0 && (
                    <tr>
                      <td>
                        <span style={{ color: BRAND_COLORS.error, marginRight: '8px' }}>✗</span>
                        <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>
                          Failed: <strong style={{ color: BRAND_COLORS.error }}>{failed} notes</strong>
                        </span>
                      </td>
                    </tr>
                  )}
                </table>
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
            <EmailButton href={reportUrl}>View Detailed Report</EmailButton>
          </div>

          <p style={textStyles.small}>
            All successfully processed notes will be delivered within 3-7 business days. 
            We'll notify you of any delivery issues.
          </p>

          <p style={textStyles.body}>
            Keep up the great work building relationships!<br />
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
export const batchCompletedEmailPlainText = ({
  firstName,
  email,
  totalNotes,
  successfullyQueued,
  currentlyPrinting,
  inMail,
  failed,
  creditsUsed,
  remainingBalance,
  reportUrl
}) => `
Batch Mailing Complete!

Hi ${firstName},

Your batch mailing has been completed!

Batch Summary:
✓ Successfully queued: ${successfullyQueued} notes
✓ Currently printing: ${currentlyPrinting} notes
✓ In mail: ${inMail} notes
${failed > 0 ? `✗ Failed: ${failed} notes` : ''}

Credits Used: ${creditsUsed}
Remaining Balance: ${remainingBalance} credits

View Detailed Report: ${reportUrl}

All successfully processed notes will be delivered within 3-7 business days. We'll notify you of any delivery issues.

Keep up the great work building relationships!
The NurturInk Team
${emailFooterPlainText({ recipientEmail: email })}
`;