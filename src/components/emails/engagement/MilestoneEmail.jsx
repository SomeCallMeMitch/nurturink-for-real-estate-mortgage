import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Milestone Achievement Email
 * Subject: Milestone reached: [X] notes sent!
 */
export default function MilestoneEmail({
  firstName,
  email,
  milestone, // 10, 50, 100, 500, 1000
  notesDelivered,
  uniqueClients,
  longestStreak,
  mostActiveMonth,
  statsUrl,
  sendNoteUrl,
  referralUrl,
  bonusCredits = 0,
  logoUrl
}) {
  return (
    <EmailWrapper preheader={`Congratulations! You've sent ${milestone} notes through NurturInk.`}>
      <EmailHeader 
        title={`${milestone} Notes Sent!`}
        subtitle="Major milestone achieved"
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.accent}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            You've hit a major milestone—<strong>{milestone} notes sent!</strong> 🏆
          </p>

          {/* Stats Box */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '24px' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: BRAND_COLORS.dark }}>
                  Your Impact:
                </p>
                <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <span style={{ fontSize: '20px', marginRight: '8px' }}>📬</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>
                        <strong style={{ color: BRAND_COLORS.dark }}>{notesDelivered}</strong> notes delivered
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '10px' }}>
                      <span style={{ fontSize: '20px', marginRight: '8px' }}>👥</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>
                        <strong style={{ color: BRAND_COLORS.dark }}>{uniqueClients}</strong> unique clients reached
                      </span>
                    </td>
                  </tr>
                  {longestStreak && (
                    <tr>
                      <td style={{ paddingBottom: '10px' }}>
                        <span style={{ fontSize: '20px', marginRight: '8px' }}>⭐</span>
                        <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>
                          Longest streak: <strong style={{ color: BRAND_COLORS.dark }}>{longestStreak} days</strong>
                        </span>
                      </td>
                    </tr>
                  )}
                  {mostActiveMonth && (
                    <tr>
                      <td>
                        <span style={{ fontSize: '20px', marginRight: '8px' }}>🏆</span>
                        <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>
                          Most active month: <strong style={{ color: BRAND_COLORS.dark }}>{mostActiveMonth}</strong>
                        </span>
                      </td>
                    </tr>
                  )}
                </table>
              </td>
            </tr>
          </table>

          <p style={textStyles.body}>
            You're building something special. Each note you send strengthens relationships, 
            opens doors, and sets you apart from the competition.
          </p>

          {/* CTA */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <EmailButton href={statsUrl}>View Your Stats</EmailButton>
          </div>

          {/* What top performers do */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '600', color: BRAND_COLORS.dark }}>
                  What top performers do differently:
                </p>
                <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '6px' }}>
                      <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '14px' }}>They send notes consistently, not sporadically</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '6px' }}>
                      <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '14px' }}>They personalize every message</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '6px' }}>
                      <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '14px' }}>They follow up strategically</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '14px' }}>They track what works</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style={{ ...textStyles.body, textAlign: 'center' }}>
            Ready for the next milestone? Keep going!
          </p>

          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <EmailButton href={sendNoteUrl}>Send Another Note</EmailButton>
          </div>

          <p style={textStyles.body}>
            Celebrating your success,<br />
            <strong>The NurturInk Team</strong>
          </p>

          {referralUrl && (
            <p style={{ ...textStyles.small, marginTop: '24px', fontStyle: 'italic' }}>
              P.S. Share your NurturInk experience with colleagues and earn bonus credits! 
              <a href={referralUrl} style={{ color: BRAND_COLORS.accent, textDecoration: 'none', marginLeft: '4px' }}>
                Get Referral Link
              </a>
            </p>
          )}
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
export const milestoneEmailPlainText = ({
  firstName,
  email,
  milestone,
  notesDelivered,
  uniqueClients,
  longestStreak,
  mostActiveMonth,
  statsUrl,
  sendNoteUrl,
  referralUrl
}) => `
Milestone reached: ${milestone} notes sent! 🏆

Hi ${firstName},

You've hit a major milestone—${milestone} notes sent!

Your Impact:
📬 ${notesDelivered} notes delivered
👥 ${uniqueClients} unique clients reached
${longestStreak ? `⭐ Longest streak: ${longestStreak} days` : ''}
${mostActiveMonth ? `🏆 Most active month: ${mostActiveMonth}` : ''}

You're building something special. Each note you send strengthens relationships, opens doors, and sets you apart from the competition.

View Your Stats: ${statsUrl}

What top performers do differently:
• They send notes consistently, not sporadically
• They personalize every message
• They follow up strategically
• They track what works

Ready for the next milestone? Keep going!

Send Another Note: ${sendNoteUrl}

Celebrating your success,
The NurturInk Team

${referralUrl ? `P.S. Share your NurturInk experience with colleagues and earn bonus credits! ${referralUrl}` : ''}
${emailFooterPlainText({ recipientEmail: email })}
`;