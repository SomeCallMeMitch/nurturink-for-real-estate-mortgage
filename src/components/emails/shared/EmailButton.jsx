import React from 'react';
import { buttonStyles, BRAND_COLORS } from './EmailWrapper';

/**
 * Email Button Component
 * Bulletproof button using padding (works in all email clients)
 */
export default function EmailButton({ 
  href, 
  children, 
  variant = 'primary',
  fullWidth = false,
  style = {}
}) {
  const baseStyle = buttonStyles[variant] || buttonStyles.primary;
  
  return (
    <table 
      role="presentation" 
      width={fullWidth ? '100%' : 'auto'}
      cellSpacing="0" 
      cellPadding="0" 
      border="0" 
      style={{ margin: '0 auto' }}
    >
      <tr>
        <td align="center">
          <a 
            href={href} 
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...baseStyle,
              ...style,
              width: fullWidth ? '100%' : 'auto',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          >
            {children}
          </a>
        </td>
      </tr>
    </table>
  );
}

// Dual button layout (e.g., "View Details" + "Send Another")
export function EmailButtonGroup({ buttons }) {
  return (
    <table 
      role="presentation" 
      cellSpacing="0" 
      cellPadding="0" 
      border="0" 
      style={{ margin: '0 auto' }}
    >
      <tr>
        {buttons.map((button, index) => (
          <td key={index} style={{ padding: index > 0 ? '0 0 0 12px' : '0' }}>
            <EmailButton 
              href={button.href} 
              variant={button.variant || 'primary'}
            >
              {button.label}
            </EmailButton>
          </td>
        ))}
      </tr>
    </table>
  );
}