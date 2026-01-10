import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton, { EmailButtonGroup } from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Onboarding Completion Email
 * Subject: You're All Set! Time to Send Your First Note
 */
export default function OnboardingCompleteEmail({
  firstName,
  email,
  industry,
  creditBalance,
  teamInvited = false,
  sendNoteUrl,
  templatesUrl,
  dashboardUrl,
  logoUrl
}) {
  return (
    <EmailWrapper preheader="Congratulations! Your NurturInk account is ready. Start sending meaningful notes today.">
      <EmailHeader 
        title="You're All Set!"
        subtitle="Time to Send Your First Note"
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.success}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Congratulations! You've completed your account setup.
          </p>

          {/* Completion Checklist */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '8px' }}>
                      <span style={{ color: BRAND_COLORS.success, marginRight: '12px', fontSize: '18px' }}>✓</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '15px' }}>Profile created</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '8px' }}>
                      <span style={{ color: BRAND_COLORS.success, marginRight: '12px', fontSize: '18px' }}>✓</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '15px' }}>
                        Industry selected {industry && `(${industry})`}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '8px' }}>
                      <span style={{ color: BRAND_COLORS.success, marginRight: '12px', fontSize: '18px' }}>✓</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '15px' }}>Writing style chosen</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ color: BRAND_COLORS.success, marginRight: '12px', fontSize: '18px' }}>✓</span>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '15px' }}>
                        {teamInvited ? 'Team invited' : 'Ready to start'}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style={{ ...textStyles.body, textAlign: 'center' }}>
            You're now ready to start building stronger relationships with handwritten notes.
          </p>

          {/* Credit Balance */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: BRAND_COLORS.neutral }}>
                  Current Credit Balance
                </p>
                <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: BRAND_COLORS.accent }}>
                  {creditBalance} credits
                </p>
              </td>
            </tr>
          </table>

          {/* CTA Buttons */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <EmailButton href={sendNoteUrl}>Send Your First Note</EmailButton>
          </div>

          {/* Template Suggestions */}
          <p style={textStyles.body}>
            Not sure what to write? Browse our template library organized by:
          </p>
          
          <ul style={{ 
            paddingLeft: '20px', 
            marginBottom: '24px',
            color: BRAND_COLORS.muted,
            lineHeight: '1.8'
          }}>
            <li>Thank you notes</li>
            <li>Follow-ups</li>
            <li>Birthdays & celebrations</li>
            <li>Re-engagement messages</li>
            <li>Industry-specific templates</li>
          </ul>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <EmailButton href={templatesUrl} variant="secondary">Browse Templates</EmailButton>
          </div>

          <p style={textStyles.body}>
            Here's to meaningful connections,<br />
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
export const onboardingCompleteEmailPlainText = ({
  firstName,
  email,
  industry,
  creditBalance,
  teamInvited,
  sendNoteUrl,
  templatesUrl
}) => `
Hi ${firstName},

Congratulations! You've completed your account setup.

✓ Profile created
✓ Industry selected ${industry ? `(${industry})` : ''}
✓ Writing style chosen
✓ ${teamInvited ? 'Team invited' : 'Ready to start'}

You're now ready to start building stronger relationships with handwritten notes.

Current Credit Balance: ${creditBalance} credits

Send Your First Note: ${sendNoteUrl}

Not sure what to write? Browse our template library organized by:
- Thank you notes
- Follow-ups
- Birthdays & celebrations
- Re-engagement messages
- Industry-specific templates

Browse Templates: ${templatesUrl}

Here's to meaningful connections,
The NurturInk Team
${emailFooterPlainText({ recipientEmail: email })}
`;