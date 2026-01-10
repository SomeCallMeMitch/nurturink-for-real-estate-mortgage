import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Monthly Usage Summary Email
 * Subject: Your NurturInk monthly report - [Month Year]
 */
export default function MonthlyUsageSummaryEmail({
  firstName,
  email,
  monthYear, // "January 2024"
  notesSent,
  changeFromLastMonth, // percentage, can be negative
  deliveryRate,
  clientsReached,
  creditsUsed,
  topActions = [], // Array of { name, count }
  mostActiveDay,
  avgNotesPerWeek,
  benchmark,
  isAboveBenchmark,
  reportUrl,
  logoUrl
}) {
  const changeDisplay = changeFromLastMonth >= 0 
    ? `↑ ${changeFromLastMonth}%` 
    : `↓ ${Math.abs(changeFromLastMonth)}%`;
  
  const changeColor = changeFromLastMonth >= 0 ? BRAND_COLORS.success : BRAND_COLORS.error;

  return (
    <EmailWrapper preheader={`Your NurturInk activity for ${monthYear}: ${notesSent} notes sent`}>
      <EmailHeader 
        title="Your Monthly Report"
        subtitle={monthYear}
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.primary}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Here's your NurturInk activity for <strong>{monthYear}</strong>.
          </p>

          {/* Main Stats */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            border: `1px solid ${BRAND_COLORS.border}`,
            borderRadius: '8px',
            marginBottom: '24px',
            overflow: 'hidden'
          }}>
            <tr>
              <td style={{ 
                padding: '24px', 
                textAlign: 'center',
                backgroundColor: BRAND_COLORS.light
              }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: BRAND_COLORS.neutral }}>
                  NOTES SENT
                </p>
                <p style={{ margin: '0', fontSize: '48px', fontWeight: 'bold', color: BRAND_COLORS.accent }}>
                  {notesSent}
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: changeColor, fontWeight: '600' }}>
                  {changeDisplay} vs last month
                </p>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0' }}>
                <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'center',
                      borderRight: `1px solid ${BRAND_COLORS.border}`,
                      width: '33.33%'
                    }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: BRAND_COLORS.neutral }}>Delivery Rate</p>
                      <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: BRAND_COLORS.dark }}>{deliveryRate}%</p>
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'center',
                      borderRight: `1px solid ${BRAND_COLORS.border}`,
                      width: '33.33%'
                    }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: BRAND_COLORS.neutral }}>Clients Reached</p>
                      <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: BRAND_COLORS.dark }}>{clientsReached}</p>
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'center',
                      width: '33.33%'
                    }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: BRAND_COLORS.neutral }}>Credits Used</p>
                      <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: BRAND_COLORS.dark }}>{creditsUsed}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          {/* Top Actions */}
          {topActions.length > 0 && (
            <>
              <h2 style={textStyles.heading2}>Top Performing Actions:</h2>
              <table role="presentation" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
                {topActions.slice(0, 3).map((action, index) => (
                  <tr key={index}>
                    <td style={{ paddingBottom: '8px' }}>
                      <span style={{ color: BRAND_COLORS.dark, fontSize: '15px', fontWeight: '600' }}>
                        {index + 1}. {action.name}
                      </span>
                      <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px', marginLeft: '8px' }}>
                        - {action.count} notes sent
                      </span>
                    </td>
                  </tr>
                ))}
              </table>
            </>
          )}

          {/* Additional Stats */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0">
                  {mostActiveDay && (
                    <tr>
                      <td style={{ paddingBottom: '8px' }}>
                        <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Most Active Day:</span>
                        <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
                          {mostActiveDay}
                        </span>
                      </td>
                    </tr>
                  )}
                  {avgNotesPerWeek && (
                    <tr>
                      <td>
                        <span style={{ color: BRAND_COLORS.neutral, fontSize: '14px' }}>Avg. Notes Per Week:</span>
                        <span style={{ color: BRAND_COLORS.dark, fontSize: '14px', fontWeight: '600', marginLeft: '8px' }}>
                          {avgNotesPerWeek}
                        </span>
                      </td>
                    </tr>
                  )}
                </table>
              </td>
            </tr>
          </table>

          {/* CTA */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <EmailButton href={reportUrl}>View Full Report</EmailButton>
          </div>

          {/* Benchmark */}
          {benchmark && (
            <p style={textStyles.small}>
              <strong>Benchmark:</strong> Similar users send an average of {benchmark} notes per month. 
              You're <strong style={{ color: isAboveBenchmark ? BRAND_COLORS.success : BRAND_COLORS.warning }}>
                {isAboveBenchmark ? 'above' : 'below'} average
              </strong>.
            </p>
          )}

          <p style={textStyles.body}>
            Here's to another great month!<br />
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
export const monthlyUsageSummaryEmailPlainText = ({
  firstName,
  email,
  monthYear,
  notesSent,
  changeFromLastMonth,
  deliveryRate,
  clientsReached,
  creditsUsed,
  topActions = [],
  mostActiveDay,
  avgNotesPerWeek,
  benchmark,
  isAboveBenchmark,
  reportUrl
}) => `
Your NurturInk monthly report - ${monthYear}

Hi ${firstName},

Here's your NurturInk activity for ${monthYear}.

NOTES SENT: ${notesSent}
${changeFromLastMonth >= 0 ? '↑' : '↓'} ${Math.abs(changeFromLastMonth)}% vs last month

DELIVERY RATE: ${deliveryRate}%
CLIENTS REACHED: ${clientsReached} unique
CREDITS USED: ${creditsUsed}

${topActions.length > 0 ? `Top Performing Actions:
${topActions.slice(0, 3).map((a, i) => `${i + 1}. ${a.name} - ${a.count} notes sent`).join('\n')}
` : ''}

${mostActiveDay ? `Most Active Day: ${mostActiveDay}` : ''}
${avgNotesPerWeek ? `Avg. Notes Per Week: ${avgNotesPerWeek}` : ''}

View Full Report: ${reportUrl}

${benchmark ? `Benchmark: Similar users send an average of ${benchmark} notes per month. You're ${isAboveBenchmark ? 'above' : 'below'} average.` : ''}

Here's to another great month!
The NurturInk Team
${emailFooterPlainText({ recipientEmail: email })}
`;