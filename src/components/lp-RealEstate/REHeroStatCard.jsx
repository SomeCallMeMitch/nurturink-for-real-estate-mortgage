import React from 'react';

/**
 * REHeroStatCard — individual stat card in the hero 2×2 grid
 * Real Estate: blue accent for value text
 */
export default function REHeroStatCard({ value, label }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.13)',
        borderRadius: '6px', padding: '22px 18px',
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.11)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
    >
      <span className="font-sora" style={{
        fontSize: '2.5rem', fontWeight: 900, color: '#007bff',
        display: 'block', lineHeight: 1, marginBottom: '8px',
      }}>
        {value}
      </span>
      <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.45 }}>
        {label}
      </span>
    </div>
  );
}