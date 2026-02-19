import React from 'react';

/**
 * SolarWayCard — individual way-card in SECTION 5
 * Spec: each way-card bg #213659, header bg #172840
 */
export default function SolarWayCard({ num, title, body }) {
  return (
    <div
      style={{
        background: '#213659', borderRadius: '5px', overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.18)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{
        background: '#172840', padding: '16px 22px',
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        <span className="font-sora" style={{ fontSize: '1.9rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1, flexShrink: 0 }}>
          {num}
        </span>
        <span className="font-sora" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '22px' }}>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.5 }}>{body}</p>
      </div>
    </div>
  );
}