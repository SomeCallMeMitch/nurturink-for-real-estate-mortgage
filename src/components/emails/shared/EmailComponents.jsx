import React from 'react';
import { BRAND_COLORS } from './EmailWrapper';

/**
 * Reusable email components for consistent styling
 */

// Info Box - Highlighted information section
export function InfoBox({ 
  children, 
  variant = 'default', // 'default', 'warning', 'success', 'error'
  style = {} 
}) {
  const variants = {
    default: { bg: BRAND_COLORS.light, border: BRAND_COLORS.border },
    warning: { bg: '#fef3c7', border: '#fbbf24' },
    success: { bg: '#dcfce7', border: '#86efac' },
    error: { bg: '#fee2e2', border: '#fca5a5' },
    info: { bg: '#dbeafe', border: '#93c5fd' }
  };
  
  const colors = variants[variant] || variants.default;
  
  return (
    <table 
      role="presentation" 
      width="100%" 
      cellSpacing="0" 
      cellPadding="0" 
      border="0" 
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        marginBottom: '24px',
        ...style
      }}
    >
      <tr>
        <td style={{ padding: '20px' }}>
          {children}
        </td>
      </tr>
    </table>
  );
}

// Checklist Item
export function ChecklistItem({ children, checked = true }) {
  return (
    <tr>
      <td style={{ paddingBottom: '8px' }}>
        <span style={{ 
          color: checked ? BRAND_COLORS.success : BRAND_COLORS.neutral, 
          marginRight: '8px' 
        }}>
          {checked ? '✓' : '○'}
        </span>
        <span style={{ color: BRAND_COLORS.muted, fontSize: '15px' }}>
          {children}
        </span>
      </td>
    </tr>
  );
}

// Progress Step
export function ProgressStep({ 
  number, 
  title, 
  status = 'pending' // 'completed', 'current', 'pending'
}) {
  const statusColors = {
    completed: { bg: BRAND_COLORS.success, text: '#ffffff' },
    current: { bg: BRAND_COLORS.accent, text: '#ffffff' },
    pending: { bg: BRAND_COLORS.border, text: BRAND_COLORS.neutral }
  };
  
  const colors = statusColors[status];
  
  return (
    <tr>
      <td style={{ paddingBottom: '12px' }}>
        <table role="presentation" cellSpacing="0" cellPadding="0" border="0">
          <tr>
            <td style={{
              width: '28px',
              height: '28px',
              backgroundColor: colors.bg,
              borderRadius: '50%',
              textAlign: 'center',
              verticalAlign: 'middle',
              marginRight: '12px'
            }}>
              <span style={{ 
                color: colors.text, 
                fontSize: '14px', 
                fontWeight: 'bold' 
              }}>
                {status === 'completed' ? '✓' : number}
              </span>
            </td>
            <td style={{ paddingLeft: '12px' }}>
              <span style={{ 
                color: status === 'pending' ? BRAND_COLORS.neutral : BRAND_COLORS.dark,
                fontSize: '15px',
                fontWeight: status === 'current' ? '600' : '400'
              }}>
                {title}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  );
}

// Stat Box - For displaying metrics
export function StatBox({ label, value, subtext }) {
  return (
    <td style={{ 
      textAlign: 'center', 
      padding: '16px',
      borderRight: `1px solid ${BRAND_COLORS.border}` 
    }}>
      <p style={{ 
        fontSize: '28px', 
        fontWeight: 'bold', 
        color: BRAND_COLORS.accent,
        margin: '0 0 4px 0'
      }}>
        {value}
      </p>
      <p style={{ 
        fontSize: '14px', 
        color: BRAND_COLORS.dark, 
        fontWeight: '600',
        margin: '0 0 2px 0'
      }}>
        {label}
      </p>
      {subtext && (
        <p style={{ 
          fontSize: '12px', 
          color: BRAND_COLORS.neutral,
          margin: '0'
        }}>
          {subtext}
        </p>
      )}
    </td>
  );
}

// Divider
export function Divider({ style = {} }) {
  return (
    <tr>
      <td style={{ padding: '16px 0', ...style }}>
        <hr style={{ 
          border: 'none', 
          borderTop: `1px solid ${BRAND_COLORS.border}`,
          margin: '0'
        }} />
      </td>
    </tr>
  );
}

// Text styles
export const textStyles = {
  heading1: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
    lineHeight: '1.3',
    margin: '0 0 16px 0'
  },
  heading2: {
    fontSize: '18px',
    fontWeight: '600',
    color: BRAND_COLORS.dark,
    lineHeight: '1.4',
    margin: '0 0 12px 0'
  },
  body: {
    fontSize: '16px',
    color: BRAND_COLORS.muted,
    lineHeight: '1.6',
    margin: '0 0 16px 0'
  },
  small: {
    fontSize: '14px',
    color: BRAND_COLORS.neutral,
    lineHeight: '1.5',
    margin: '0 0 12px 0'
  },
  link: {
    color: BRAND_COLORS.accent,
    textDecoration: 'none'
  }
};