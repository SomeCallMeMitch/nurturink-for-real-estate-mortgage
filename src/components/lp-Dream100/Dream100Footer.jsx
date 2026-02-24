import React from 'react';

/**
 * Dream100Footer — site footer
 * HTML spec: navy bg, centered 13px muted text, gold links
 */
export default function Dream100Footer() {
  return (
    <footer style={{
      background: 'var(--d100-navy)',
      color: 'rgba(255,255,255,0.45)',
      textAlign: 'center',
      padding: '22px 20px',
      fontSize: 13,
      lineHeight: 1.7,
    }}>
      <p>
        This free tool is brought to you by{' '}
        <a href="https://nurturink.com" target="_blank" rel="noreferrer" style={{ color: 'rgba(201,151,58,0.8)', textDecoration: 'none' }}>
          NurturInk
        </a>{' '}
        — the handwritten follow-up system for relationship-driven sales professionals.
      </p>
      <p style={{ marginTop: 5 }}>
        © 2025 NurturInk &nbsp;·&nbsp;{' '}
        <a href="https://nurturink.com/realestate" target="_blank" rel="noreferrer" style={{ color: 'rgba(201,151,58,0.8)', textDecoration: 'none' }}>
          Real Estate Solutions
        </a>
      </p>
    </footer>
  );
}