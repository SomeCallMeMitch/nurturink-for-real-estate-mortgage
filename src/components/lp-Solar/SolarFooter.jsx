import React from 'react';

/**
 * SolarFooter — SECTION 10: FOOTER
 * bg #172840, centered logo + copyright
 */
export default function SolarFooter() {
  return (
    <footer style={{
      background: '#172840', padding: '32px 40px', textAlign: 'center',
      borderTop: '1px solid rgba(255,255,255,0.07)',
    }}>
      <span className="font-sora" style={{ fontSize: '1.35rem', fontWeight: 900, display: 'block', marginBottom: '10px' }}>
        <span style={{ color: '#ffffff' }}>Nurtur</span>
        <span style={{ color: '#FF7A00' }}>Ink</span>
      </span>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}>
        © 2025 NurturInk — Real ink. Real paper. Real relationships.
      </p>
    </footer>
  );
}