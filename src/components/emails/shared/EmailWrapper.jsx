import React from 'react';

/**
 * Email Wrapper Component
 * Base container for all NurturInk emails with consistent styling
 * Anti-spam best practices:
 * - Clean HTML structure
 * - Proper meta tags
 * - Consistent branding
 * - Physical address included
 */
export default function EmailWrapper({ 
  children, 
  preheader = '',
  backgroundColor = '#f4f4f5'
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>NurturInk</title>
        {/* Preheader text for email clients */}
        {preheader && (
          <span style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
            {preheader}
            {/* Padding to push other content out of preheader */}
            &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
          </span>
        )}
      </head>
      <body style={{
        margin: '0',
        padding: '0',
        width: '100%',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: backgroundColor,
        WebkitTextSizeAdjust: '100%',
        MsTextSizeAdjust: '100%'
      }}>
        <table 
          role="presentation" 
          width="100%" 
          cellSpacing="0" 
          cellPadding="0" 
          border="0" 
          style={{
            width: '100%',
            backgroundColor: backgroundColor,
            padding: '40px 20px'
          }}
        >
          <tr>
            <td align="center">
              <table 
                role="presentation" 
                style={{
                  maxWidth: '600px',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  overflow: 'hidden'
                }} 
                cellSpacing="0" 
                cellPadding="0" 
                border="0"
              >
                {children}
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

// Brand colors for NurturInk
export const BRAND_COLORS = {
  primary: '#2563eb',      // Blue
  accent: '#f97316',       // Orange
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Amber
  error: '#ef4444',        // Red
  neutral: '#6b7280',      // Gray
  dark: '#111827',         // Near black
  muted: '#4b5563',        // Dark gray
  light: '#f9fafb',        // Light gray bg
  border: '#e5e7eb'        // Border gray
};

// Button styles
export const buttonStyles = {
  primary: {
    display: 'inline-block',
    backgroundColor: BRAND_COLORS.accent,
    color: '#ffffff',
    padding: '14px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    boxShadow: '0 4px 6px rgba(249, 115, 22, 0.3)'
  },
  secondary: {
    display: 'inline-block',
    backgroundColor: '#ffffff',
    color: BRAND_COLORS.accent,
    padding: '12px 28px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    border: `2px solid ${BRAND_COLORS.accent}`
  },
  outline: {
    display: 'inline-block',
    backgroundColor: 'transparent',
    color: BRAND_COLORS.primary,
    padding: '12px 28px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    border: `2px solid ${BRAND_COLORS.border}`
  }
};