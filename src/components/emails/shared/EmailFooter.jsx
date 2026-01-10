import React from 'react';
import { BRAND_COLORS } from './EmailWrapper';

/**
 * Email Footer Component
 * Standard footer with unsubscribe, physical address, and contact info
 * Anti-spam compliance: CAN-SPAM requires physical address and unsubscribe option
 */
export default function EmailFooter({ 
  recipientEmail,
  showUnsubscribe = true,
  unsubscribeUrl,
  preferencesUrl,
  helpCenterUrl,
  type = 'standard' // 'standard', 'billing', 'marketing'
}) {
  const year = new Date().getFullYear();
  
  return (
    <tr>
      <td style={{
        backgroundColor: BRAND_COLORS.light,
        padding: '30px 40px',
        borderTop: `1px solid ${BRAND_COLORS.border}`
      }}>
        <table role="presentation" style={{ width: '100%', textAlign: 'center' }} cellSpacing="0" cellPadding="0" border="0">
          <tr>
            <td>
              {/* Brand */}
              <p style={{
                color: BRAND_COLORS.neutral,
                fontSize: '14px',
                lineHeight: '1.6',
                margin: '0 0 12px 0'
              }}>
                <strong style={{ color: BRAND_COLORS.accent }}>NurturInk</strong><br />
                Meaningful connections through handwritten notes
              </p>
              
              {/* Links */}
              <p style={{
                fontSize: '13px',
                margin: '0 0 16px 0'
              }}>
                {helpCenterUrl && (
                  <>
                    <a href={helpCenterUrl} style={{ color: BRAND_COLORS.accent, textDecoration: 'none' }}>Help Center</a>
                    <span style={{ color: BRAND_COLORS.neutral, margin: '0 8px' }}>|</span>
                  </>
                )}
                {preferencesUrl && (
                  <>
                    <a href={preferencesUrl} style={{ color: BRAND_COLORS.accent, textDecoration: 'none' }}>Email Preferences</a>
                    <span style={{ color: BRAND_COLORS.neutral, margin: '0 8px' }}>|</span>
                  </>
                )}
                {showUnsubscribe && unsubscribeUrl && (
                  <a href={unsubscribeUrl} style={{ color: BRAND_COLORS.neutral, textDecoration: 'underline' }}>Unsubscribe</a>
                )}
              </p>
              
              {/* Contact - varies by type */}
              <p style={{
                color: '#9ca3af',
                fontSize: '12px',
                lineHeight: '1.6',
                margin: '0 0 12px 0'
              }}>
                {type === 'billing' ? (
                  <>Billing questions? Contact us at <a href="mailto:billing@nurturink.com" style={{ color: BRAND_COLORS.accent, textDecoration: 'none' }}>billing@nurturink.com</a></>
                ) : (
                  <>Questions? Reply to this email or contact <a href="mailto:support@nurturink.com" style={{ color: BRAND_COLORS.accent, textDecoration: 'none' }}>support@nurturink.com</a></>
                )}
              </p>
              
              {/* Physical Address (CAN-SPAM requirement) */}
              <p style={{
                color: '#9ca3af',
                fontSize: '11px',
                lineHeight: '1.5',
                margin: '0 0 8px 0'
              }}>
                NurturInk, Inc.<br />
                123 Business Street, Suite 100<br />
                Austin, TX 78701
              </p>
              
              {/* Copyright and reason */}
              <p style={{
                color: '#9ca3af',
                fontSize: '11px',
                margin: '0'
              }}>
                © {year} NurturInk. All rights reserved.<br />
                {recipientEmail && (
                  <span>You're receiving this because you have an account at {recipientEmail}</span>
                )}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  );
}

// Plain text footer
export const emailFooterPlainText = ({ recipientEmail, type = 'standard' }) => {
  const year = new Date().getFullYear();
  return `
---
NurturInk
Meaningful connections through handwritten notes

${type === 'billing' 
  ? 'Billing questions? Contact billing@nurturink.com' 
  : 'Questions? Contact support@nurturink.com'}

NurturInk, Inc.
123 Business Street, Suite 100
Austin, TX 78701

© ${year} NurturInk. All rights reserved.
${recipientEmail ? `You're receiving this because you have an account at ${recipientEmail}` : ''}
`;
};