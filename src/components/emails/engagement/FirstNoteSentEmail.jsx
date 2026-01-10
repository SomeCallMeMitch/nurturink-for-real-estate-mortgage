import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * First Note Sent Celebration Email
 * Subject: You sent your first note!
 */
export default function FirstNoteSentEmail({
  firstName,
  email,
  clientName,
  dashboardUrl,
  logoUrl
}) {
  return (
    <EmailWrapper preheader="Congratulations! You just sent your first handwritten note through NurturInk.">
      <EmailHeader 
        title="You Sent Your First Note!"
        subtitle="This is a big moment"
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.success}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Congratulations! You just sent your first handwritten note through NurturInk.
          </p>

          {/* Celebration Box */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: '8px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <tr>
              <td style={{ padding: '32px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                <p style={{ margin: '0', fontSize: '16px', color: BRAND_COLORS.dark }}>
                  This is a big moment. You're now part of a community of professionals who 
                  understand that <strong>personal connection drives real business results</strong>.
                </p>
              </td>
            </tr>
          </table>

          <p style={textStyles.body}>
            Your note to <strong>{clientName}</strong> is on its way and will be delivered 
            in 3-7 business days.
          </p>

          {/* What's Next */}
          <h2 style={textStyles.heading2}>What's next?</h2>
          <table role="presentation" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
            <tr>
              <td style={{ paddingBottom: '8px' }}>
                <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>Track delivery in your dashboard</span>
              </td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '8px' }}>
                <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>Plan a follow-up call or email</span>
              </td>
            </tr>
            <tr>
              <td>
                <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>Send more notes to other clients</span>
              </td>
            </tr>
          </table>

          {/* CTA */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <EmailButton href={dashboardUrl}>View Dashboard</EmailButton>
          </div>

          {/* Pro Tips */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '600', color: BRAND_COLORS.dark }}>
                  Pro Tips for Success:
                </p>
                <ol style={{ margin: '0', paddingLeft: '20px', color: BRAND_COLORS.muted, fontSize: '14px', lineHeight: '1.8' }}>
                  <li>Send notes consistently (aim for 5-10 per month)</li>
                  <li>Personalize each message—no generic templates</li>
                  <li>Follow up within a week of delivery</li>
                  <li>Track which notes lead to responses</li>
                </ol>
              </td>
            </tr>
          </table>

          <p style={textStyles.body}>
            Your first note is just the beginning. Keep the momentum going!
          </p>

          <p style={textStyles.body}>
            Cheers to meaningful connections,<br />
            <strong>The NurturInk Team</strong>
          </p>
        </td>
      </tr>
      
      <EmailFooter 
        recipientEmail={email}
        showUnsubscribe={true}
      />
    </EmailWrapper>
  );
}

// Plain text version
export const firstNoteSentEmailPlainText = ({
  firstName,
  email,
  clientName,
  dashboardUrl
}) => `
You sent your first note! 🎉

Hi ${firstName},

Congratulations! You just sent your first handwritten note through NurturInk.

This is a big moment. You're now part of a community of professionals who understand that personal connection drives real business results.

Your note to ${clientName} is on its way and will be delivered in 3-7 business days.

What's next?
• Track delivery in your dashboard
• Plan a follow-up call or email
• Send more notes to other clients

View Dashboard: ${dashboardUrl}

Pro Tips for Success:
1. Send notes consistently (aim for 5-10 per month)
2. Personalize each message—no generic templates
3. Follow up within a week of delivery
4. Track which notes lead to responses

Your first note is just the beginning. Keep the momentum going!

Cheers to meaningful connections,
The NurturInk Team
${emailFooterPlainText({ recipientEmail: email })}
`;