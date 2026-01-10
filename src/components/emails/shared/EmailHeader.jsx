import React from 'react';
import { BRAND_COLORS } from './EmailWrapper';

/**
 * Email Header Component
 * Consistent header with logo and optional title
 */
export default function EmailHeader({ 
  title,
  subtitle,
  logoUrl,
  backgroundColor = BRAND_COLORS.accent,
  showLogo = true
}) {
  return (
    <tr>
      <td style={{
        backgroundColor: backgroundColor,
        padding: '40px 40px 30px 40px',
        textAlign: 'center'
      }}>
        {showLogo && logoUrl && (
          <img 
            src={logoUrl} 
            alt="NurturInk" 
            style={{
              height: '40px',
              marginBottom: '20px'
            }} 
          />
        )}
        {showLogo && !logoUrl && (
          <div style={{
            marginBottom: '20px'
          }}>
            <span style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#ffffff',
              letterSpacing: '-0.5px'
            }}>
              NurturInk
            </span>
          </div>
        )}
        {title && (
          <h1 style={{
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: 'bold',
            lineHeight: '1.3',
            margin: '0'
          }}>
            {title}
          </h1>
        )}
        {subtitle && (
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '16px',
            margin: '12px 0 0 0',
            lineHeight: '1.5'
          }}>
            {subtitle}
          </p>
        )}
      </td>
    </tr>
  );
}

// Plain text header
export const emailHeaderPlainText = (title) => `
================================
NurturInk
================================
${title ? `\n${title}\n` : ''}
`;