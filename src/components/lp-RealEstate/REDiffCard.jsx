import React from 'react';

/**
 * REDiffCard — individual differentiator card
 * Real Estate: blue accent border-top and icon bg
 */
export default function REDiffCard({ icon: Icon, title, body }) {
  return (
    <div
      style={{
        background: '#ffffff', border: '1px solid #dde1e7',
        borderTop: '4px solid #007bff', borderRadius: '5px',
        padding: '26px 22px', transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
        <div style={{
          width: '48px', height: '48px', background: 'rgba(0,123,255,0.1)',
          borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#007bff', flexShrink: 0,
        }}>
          <Icon size={24} />
        </div>
        <h3 className="font-sora" style={{ fontSize: '1.08rem', fontWeight: 800, color: '#1a2d4a', lineHeight: 1.3 }}>
          {title}
        </h3>
      </div>
      <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.5 }}>{body}</p>
    </div>
  );
}