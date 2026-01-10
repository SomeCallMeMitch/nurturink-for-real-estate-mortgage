import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Batch Mailing Started Email
 * Subject: Your batch mailing of [X] notes has started
 */
export default function BatchStartedEmail({
  firstName,
  email,
  recipientCount,
  totalCredits,
  estimatedDelivery,
  batchStatusUrl,
  logoUrl
}) {
  return (
    <EmailWrapper preheader={`Your batch mailing of ${recipientCount} notes is now processing!`}>
      <EmailHeader 
        title="Batch Mailing Started"
        subtitle={`${recipientCount} notes are being processed`}
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.primary}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Your batch mailing is now processing!
          </p>

          {/* Batch Details */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: BRAND_COLORS.dark }}>
                  Batch Details:
                </h3>
                <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '12px' }}>
                      <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>
                        Recipients: <strong style={{ color: BRAND_COLORS.dark }}>{recipientCount} clients</strong>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '12px' }}>
                      <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>
                        Total Credits: <strong style={{ color: BRAND_COLORS.dark }}>{totalCredits}</strong>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>
                        Estimated Delivery: <strong style={{ color: BRAND_COLORS.dark }}>{estimatedDelivery}</strong>
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          {/* CTA Button */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <EmailButton href={batchStatusUrl}>View Batch Status</EmailButton>
          </div>

          <p style={textStyles.small}>
            We'll send you a summary once all notes in this batch have been processed.
            In the meantime, you can track individual note progress in your dashboard.
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
export const batchStartedEmailPlainText = ({
  firstName,
  email,
  recipientCount,
  totalCredits,
  estimatedDelivery,
  batchStatusUrl
}) => `
Batch Mailing Started

Hi ${firstName},

Your batch mailing is now processing!

Batch Details:
• Recipients: ${recipientCount} clients
• Total Credits: ${totalCredits}
• Estimated Delivery: ${estimatedDelivery}

View Batch Status: ${batchStatusUrl}

We'll send you a summary once all notes in this batch have been processed.
In the meantime, you can track individual note progress in your dashboard.

Best regards,
The NurturInk Team
${emailFooterPlainText({ recipientEmail: email })}
`;