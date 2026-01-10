import React from 'react';
import EmailWrapper, { BRAND_COLORS } from '../shared/EmailWrapper';
import EmailHeader from '../shared/EmailHeader';
import EmailFooter, { emailFooterPlainText } from '../shared/EmailFooter';
import EmailButton from '../shared/EmailButton';
import { ChecklistItem, textStyles } from '../shared/EmailComponents';

/**
 * Welcome Email - Sent when user signs up
 * Subject: Welcome to NurturInk - Let's Make Meaningful Connections
 */
export default function WelcomeEmail({
  firstName,
  email,
  starterCredits = 5,
  dashboardUrl,
  sendNoteUrl,
  templatesUrl,
  helpCenterUrl,
  logoUrl
}) {
  return (
    <EmailWrapper preheader="Welcome to NurturInk! Start building meaningful connections with handwritten notes.">
      <EmailHeader 
        title="Welcome to NurturInk!"
        subtitle="Let's Make Meaningful Connections"
        logoUrl={logoUrl}
      />
      
      <tr>
        <td style={{ padding: '40px' }}>
          <p style={textStyles.body}>
            Hi {firstName},
          </p>
          
          <p style={textStyles.body}>
            Welcome to NurturInk! We're thrilled to have you here.
          </p>
          
          <p style={textStyles.body}>
            In a world of digital noise, you're choosing something different—the power of a 
            handwritten note. Studies show that handwritten notes have a <strong>99% open rate</strong> and 
            build lasting relationships that emails simply can't match.
          </p>

          {/* Getting Started Steps */}
          <h2 style={textStyles.heading2}>Here's how to get started:</h2>
          
          <table role="presentation" cellSpacing="0" cellPadding="0" border="0" style={{ marginBottom: '24px' }}>
            <tr>
              <td style={{ paddingBottom: '16px' }}>
                <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: BRAND_COLORS.accent,
                      borderRadius: '50%',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>1</td>
                    <td style={{ paddingLeft: '16px' }}>
                      <p style={{ margin: '0', fontWeight: '600', color: BRAND_COLORS.dark }}>Import Your Clients</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: BRAND_COLORS.neutral }}>
                        Add your contacts manually, upload a CSV, or connect via API
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '16px' }}>
                <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: BRAND_COLORS.accent,
                      borderRadius: '50%',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>2</td>
                    <td style={{ paddingLeft: '16px' }}>
                      <p style={{ margin: '0', fontWeight: '600', color: BRAND_COLORS.dark }}>Choose Your Style</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: BRAND_COLORS.neutral }}>
                        Select from dozens of card designs and handwriting styles
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td>
                <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
                  <tr>
                    <td style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: BRAND_COLORS.accent,
                      borderRadius: '50%',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>3</td>
                    <td style={{ paddingLeft: '16px' }}>
                      <p style={{ margin: '0', fontWeight: '600', color: BRAND_COLORS.dark }}>Send Your First Note</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: BRAND_COLORS.neutral }}>
                        Craft a message and we'll print, address, and mail it for you
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          {/* CTA Button */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <EmailButton href={sendNoteUrl}>Get Started</EmailButton>
          </div>

          {/* Credits Info */}
          <table role="presentation" width="100%" cellSpacing="0" cellPadding="0" border="0" style={{
            backgroundColor: BRAND_COLORS.light,
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <tr>
              <td style={{ padding: '20px' }}>
                <p style={{ margin: '0', fontSize: '15px', color: BRAND_COLORS.muted }}>
                  Your account comes with <strong style={{ color: BRAND_COLORS.accent }}>{starterCredits} starter credits</strong>—enough 
                  to send your first few notes and see the impact firsthand.
                </p>
              </td>
            </tr>
          </table>

          {/* Closing */}
          <p style={textStyles.body}>
            Questions? Just hit reply. We're here to help you succeed.
          </p>
          
          <p style={textStyles.body}>
            Best regards,<br />
            <strong>The NurturInk Team</strong>
          </p>

          <p style={{ ...textStyles.small, marginTop: '24px', fontStyle: 'italic' }}>
            P.S. Want inspiration? Check out our <a href={templatesUrl} style={textStyles.link}>template library</a> with 
            proven messages for every occasion.
          </p>
        </td>
      </tr>
      
      <EmailFooter 
        recipientEmail={email}
        helpCenterUrl={helpCenterUrl}
        showUnsubscribe={false}
      />
    </EmailWrapper>
  );
}

// Plain text version
export const welcomeEmailPlainText = ({
  firstName,
  email,
  starterCredits = 5,
  sendNoteUrl,
  templatesUrl,
  dashboardUrl
}) => `
Hi ${firstName},

Welcome to NurturInk! We're thrilled to have you here.

In a world of digital noise, you're choosing something different—the power of a handwritten note. Studies show that handwritten notes have a 99% open rate and build lasting relationships that emails simply can't match.

HERE'S HOW TO GET STARTED:

1. Import Your Clients
   Add your contacts manually, upload a CSV, or connect via API

2. Choose Your Style
   Select from dozens of card designs and handwriting styles

3. Send Your First Note
   Craft a message and we'll print, address, and mail it for you

Get Started: ${sendNoteUrl}

Your account comes with ${starterCredits} starter credits—enough to send your first few notes and see the impact firsthand.

Questions? Just hit reply. We're here to help you succeed.

Best regards,
The NurturInk Team

P.S. Want inspiration? Check out our template library with proven messages for every occasion: ${templatesUrl}
${emailFooterPlainText({ recipientEmail: email })}
`;