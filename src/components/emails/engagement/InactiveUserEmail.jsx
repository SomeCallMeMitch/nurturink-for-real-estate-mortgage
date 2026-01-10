import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { textStyles } from '../shared/EmailComponents';

/**
 * Inactive User Re-engagement Email
 * Subject: We miss you! Here's what's new at NurturInk
 */
export default function InactiveUserEmail({
  firstName,
  email,
  daysSinceLastNote,
  creditsAvailable,
  clientCount,
  templatesReady,
  newFeatures = [], // Array of { icon, title }
  popularTemplates = [], // Array of { name, useCase }
  sendNoteUrl,
  pauseAccountUrl,
  feedbackUrl,
  logoUrl
}) {
  return (
    <EmailWrapper preheader={`It's been a while since you sent a note. We wanted to check in and see if we can help.`}>
      <EmailHeader 
        title="We Miss You!"
        subtitle="Let's reconnect"
        logoUrl={logoUrl}
        backgroundColor={BRAND_COLORS.primary}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            It's been a while since you sent a note. We wanted to check in and see if we can 
            help you get back to building meaningful client relationships.
          </p>

          {/* What's New */}
          {newFeatures.length > 0 && (
            <>
              <h2 style={textStyles.heading2}>What's new since you were last here:</h2>
              <table role="presentation" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
                {newFeatures.map((feature, index) => (
                  <tr key={index}>
                    <td style={{ paddingBottom: '8px' }}>
                      <span style={{ marginRight: '8px' }}>{feature.icon}</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>{feature.title}</span>
                    </td>
                  </tr>
                ))}
              </table>
            </>
          )}

          {/* Account Status */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '600', color: BRAND_COLORS.dark }}>
                  Your account is ready to go:
                </p>
                <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{ paddingBottom: '6px' }}>
                      <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '14px' }}>
                        Credits available: <strong style={{ color: BRAND_COLORS.dark }}>{creditsAvailable}</strong>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingBottom: '6px' }}>
                      <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '14px' }}>
                        Clients in database: <strong style={{ color: BRAND_COLORS.dark }}>{clientCount}</strong>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style={{ color: BRAND_COLORS.accent, marginRight: '8px' }}>•</span>
                      <span style={{ color: BRAND_COLORS.muted, fontSize: '14px' }}>
                        Templates ready to use: <strong style={{ color: BRAND_COLORS.dark }}>{templatesReady}</strong>
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          {/* CTA */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <EmailButton href={sendNoteUrl}>Send a Note Today</EmailButton>
          </div>

          {/* Popular Templates */}
          {popularTemplates.length > 0 && (
            <>
              <h2 style={textStyles.heading2}>Need inspiration? Here are our most popular templates this month:</h2>
              <ol style={{ 
                paddingLeft: '20px', 
                marginBottom: '24px',
                color: BRAND_COLORS.muted,
                lineHeight: '1.8'
              }}>
                {popularTemplates.map((template, index) => (
                  <li key={index}>{template.name} - {template.useCase}</li>
                ))}
              </ol>
            </>
          )}

          <p style={{ ...textStyles.body, fontStyle: 'italic' }}>
            Remember: Even one handwritten note can reignite a valuable relationship.
          </p>

          <p style={textStyles.body}>
            We're here if you need anything!<br />
            <strong>The NurturInk Team</strong>
          </p>

          <p style={{ ...textStyles.small, marginTop: '24px', color: BRAND_COLORS.neutral }}>
            P.S. If NurturInk isn't the right fit, we understand. You can{' '}
            <a href={pauseAccountUrl} style={{ color: BRAND_COLORS.accent, textDecoration: 'none' }}>pause your account</a>{' '}
            or{' '}
            <a href={feedbackUrl} style={{ color: BRAND_COLORS.accent, textDecoration: 'none' }}>let us know why you're leaving</a>.
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
export const inactiveUserEmailPlainText = ({
  firstName,
  email,
  creditsAvailable,
  clientCount,
  templatesReady,
  newFeatures = [],
  popularTemplates = [],
  sendNoteUrl,
  pauseAccountUrl,
  feedbackUrl
}) => `
We miss you! Here's what's new at NurturInk

Hi ${firstName},

It's been a while since you sent a note. We wanted to check in and see if we can help you get back to building meaningful client relationships.

${newFeatures.length > 0 ? `What's new since you were last here:
${newFeatures.map(f => `${f.icon} ${f.title}`).join('\n')}
` : ''}

Your account is ready to go:
• Credits available: ${creditsAvailable}
• Clients in database: ${clientCount}
• Templates ready to use: ${templatesReady}

Send a Note Today: ${sendNoteUrl}

${popularTemplates.length > 0 ? `Need inspiration? Here are our most popular templates this month:
${popularTemplates.map((t, i) => `${i + 1}. ${t.name} - ${t.useCase}`).join('\n')}
` : ''}

Remember: Even one handwritten note can reignite a valuable relationship.

We're here if you need anything!
The NurturInk Team

P.S. If NurturInk isn't the right fit, we understand. You can pause your account (${pauseAccountUrl}) or let us know why you're leaving (${feedbackUrl}).
${emailFooterPlainText({ recipientEmail: email })}
`;