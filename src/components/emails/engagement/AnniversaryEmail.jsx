import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Anniversary Email
 * Subject: Happy Anniversary! One year with NurturInk
 */
export default function AnniversaryEmail({
  firstName,
  email,
  yearsCount = 1,
  totalNotesSent,
  uniqueClientsReached,
  avgDeliveryRate,
  longestStreak,
  mostActiveMonth,
  firstNoteDate,
  firstNoteClient,
  biggestBatchCount,
  biggestBatchDate,
  mostUsedTemplate,
  bonusCredits = 0,
  journeyUrl,
  logoUrl
}) {
  const yearText = yearsCount === 1 ? 'One Year' : `${yearsCount} Years`;

  return (
    <EmailWrapper preheader={`It's been ${yearsCount} year${yearsCount > 1 ? 's' : ''} since you joined NurturInk! Here's your journey.`}>
      <EmailHeader 
        title={`Happy Anniversary!`}
        subtitle={`${yearText} with NurturInk`}
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.accent}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            It's been {yearsCount === 1 ? 'one year' : `${yearsCount} years`} since you joined NurturInk! 🎂
          </p>
          
          <p style={textStyles.body}>
            Thank you for trusting us to help you build meaningful client relationships. 
            Here's what you've accomplished together:
          </p>

          {/* Year in Review Header */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.accent,
            borderRadius: '8px 8px 0 0',
            marginTop: '24px'
          }}>
            <tr>
              <td style={{ padding: '16px', textAlign: 'center' }}>
                <p style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  YOUR {yearsCount === 1 ? 'YEAR' : `${yearsCount} YEARS`} IN REVIEW
                </p>
              </td>
            </tr>
          </table>

          {/* Stats Grid */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            border: `1px solid ${BRAND_COLORS.border}`,
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '16px' }}>
                      <span style={{ fontSize: '24px', marginRight: '12px' }}>📬</span>
                      <span style={{ color: BRAND_COLORS.accent, fontSize: '24px', fontWeight: 'bold' }}>{totalNotesSent}</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '15px', marginLeft: '8px' }}>total notes sent</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '16px' }}>
                      <span style={{ fontSize: '24px', marginRight: '12px' }}>👥</span>
                      <span style={{ color: BRAND_COLORS.accent, fontSize: '24px', fontWeight: 'bold' }}>{uniqueClientsReached}</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '15px', marginLeft: '8px' }}>unique clients reached</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '16px' }}>
                      <span style={{ fontSize: '24px', marginRight: '12px' }}>📈</span>
                      <span style={{ color: BRAND_COLORS.accent, fontSize: '24px', fontWeight: 'bold' }}>{avgDeliveryRate}%</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '15px', marginLeft: '8px' }}>average delivery rate</span>
                    </td>
                  </tr>
                  {longestStreak && (
                    <tr>
                      <td style={{ paddingBottom: '16px' }}>
                        <span style={{ fontSize: '24px', marginRight: '12px' }}>⭐</span>
                        <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>Longest streak: </span>
                        <span style={{ color: BRAND_COLORS.dark, fontSize: '15px', fontWeight: '600' }}>{longestStreak} days</span>
                      </td>
                    </tr>
                  )}
                  {mostActiveMonth && (
                    <tr>
                      <td>
                        <span style={{ fontSize: '24px', marginRight: '12px' }}>🏆</span>
                        <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>Most active month: </span>
                        <span style={{ color: BRAND_COLORS.dark, fontSize: '15px', fontWeight: '600' }}>{mostActiveMonth}</span>
                      </td>
                    </tr>
                  )}
                </table>
              </td>
            </tr>
          </table>

          {/* Impact Moments */}
          <h2 style={textStyles.heading2}>Impact Moments:</h2>
          <table role="presentation" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
            {firstNoteDate && (
              <tr>
                <td style={{ paddingBottom: '8px' }}>
                  <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                  <span style={{ color: BRAND_COLORS.muted, fontSize: '14px' }}>
                    First note sent: <strong style={{ color: BRAND_COLORS.dark }}>{firstNoteDate}</strong>
                    {firstNoteClient && ` to ${firstNoteClient}`}
                  </span>
                </td>
              </tr>
            )}
            {biggestBatchCount && (
              <tr>
                <td style={{ paddingBottom: '8px' }}>
                  <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                  <span style={{ color: BRAND_COLORS.muted, fontSize: '14px' }}>
                    Biggest batch: <strong style={{ color: BRAND_COLORS.dark }}>{biggestBatchCount} notes</strong>
                    {biggestBatchDate && ` on ${biggestBatchDate}`}
                  </span>
                </td>
              </tr>
            )}
            {mostUsedTemplate && (
              <tr>
                <td>
                  <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                  <span style={{ color: BRAND_COLORS.muted, fontSize: '14px' }}>
                    Most-used template: <strong style={{ color: BRAND_COLORS.dark }}>{mostUsedTemplate}</strong>
                  </span>
                </td>
              </tr>
            )}
          </table>

          {/* Bonus Credits */}
          {bonusCredits > 0 && (
            <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
              backgroundColor: '#dcfce7',
              border: '1px solid #86efac',
              borderRadius: '8px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <tr>
                <td style={{ padding: '20px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: BRAND_COLORS.dark }}>
                    As a thank you, here's a gift:
                  </p>
                  <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: BRAND_COLORS.success }}>
                    🎁 {bonusCredits} bonus credits added to your account
                  </p>
                </td>
              </tr>
            </table>
          )}

          {/* CTA */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <EmailButton href={journeyUrl}>View Your Full Journey</EmailButton>
          </div>

          <p style={textStyles.body}>
            Here's to another year of meaningful connections!
          </p>

          <p style={textStyles.body}>
            With gratitude,<br />
            <strong>The NurturInk Team</strong>
          </p>

          <p style={{ ...textStyles.small, marginTop: '24px', fontStyle: 'italic' }}>
            P.S. We'd love to hear your story. Reply with how NurturInk has impacted your 
            business—we might feature you in our success stories!
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
export const anniversaryEmailPlainText = ({
  firstName,
  email,
  yearsCount = 1,
  totalNotesSent,
  uniqueClientsReached,
  avgDeliveryRate,
  longestStreak,
  mostActiveMonth,
  firstNoteDate,
  firstNoteClient,
  biggestBatchCount,
  biggestBatchDate,
  mostUsedTemplate,
  bonusCredits,
  journeyUrl
}) => `
Happy Anniversary! ${yearsCount === 1 ? 'One Year' : `${yearsCount} Years`} with NurturInk 🎂

Hi ${firstName},

It's been ${yearsCount === 1 ? 'one year' : `${yearsCount} years`} since you joined NurturInk!

Thank you for trusting us to help you build meaningful client relationships. Here's what you've accomplished together:

YOUR ${yearsCount === 1 ? 'YEAR' : `${yearsCount} YEARS`} IN REVIEW

📬 ${totalNotesSent} total notes sent
👥 ${uniqueClientsReached} unique clients reached
📈 ${avgDeliveryRate}% average delivery rate
${longestStreak ? `⭐ Longest streak: ${longestStreak} days` : ''}
${mostActiveMonth ? `🏆 Most active month: ${mostActiveMonth}` : ''}

Impact Moments:
${firstNoteDate ? `• First note sent: ${firstNoteDate}${firstNoteClient ? ` to ${firstNoteClient}` : ''}` : ''}
${biggestBatchCount ? `• Biggest batch: ${biggestBatchCount} notes${biggestBatchDate ? ` on ${biggestBatchDate}` : ''}` : ''}
${mostUsedTemplate ? `• Most-used template: ${mostUsedTemplate}` : ''}

${bonusCredits > 0 ? `As a thank you, here's a gift:
🎁 ${bonusCredits} bonus credits added to your account
` : ''}

View Your Full Journey: ${journeyUrl}

Here's to another year of meaningful connections!

With gratitude,
The NurturInk Team

P.S. We'd love to hear your story. Reply with how NurturInk has impacted your business—we might feature you in our success stories!
${emailFooterPlainText({ recipientEmail: email })}
`;