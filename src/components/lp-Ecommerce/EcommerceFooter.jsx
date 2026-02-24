import React from 'react';

export default function EcommerceFooter() {
  return (
    <footer style={{
      background: '#172840',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '18px 20px',
      textAlign: 'center'
    }}>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.58)' }}>
        &copy; 2025 NurturInk. Real pen, real cardstock, real results.{' '}
        <a href="#" style={{ color: 'rgba(255,255,255,0.58)' }}>Privacy</a>
        {' \u00B7 '}
        <a href="#" style={{ color: 'rgba(255,255,255,0.58)' }}>Terms</a>
      </p>
    </footer>
  );
}