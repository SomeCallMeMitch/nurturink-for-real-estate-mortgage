import React from 'react';

/**
 * Dream100Nav — sticky nav bar
 * HTML spec: background #1B2A4A (--navy), logo-mark gold box + "NurturInk" white/gold-light text,
 * right CTA "See How It Works →" — gold bordered pill link
 */
export default function Dream100Nav() {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--d100-navy)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Logo */}
        <a
          href="https://nurturink.com"
          target="_blank"
          rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}
        >
          {/* Logo mark — gold box with "N" */}
          <div style={{
            width: 30, height: 30,
            background: 'var(--d100-gold)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 800,
            color: 'var(--d100-navy)',
            flexShrink: 0,
          }}>N</div>
          {/* Logo text */}
          <span style={{ color: 'var(--d100-white)', fontSize: 15, fontWeight: 600 }}>
            Nurtur<span style={{ color: 'var(--d100-gold-light)' }}>Ink</span>
          </span>
        </a>

        {/* CTA */}
        <a
          href="https://nurturink.com/realestate"
          target="_blank"
          rel="noreferrer"
          style={{
            color: 'var(--d100-gold-light)',
            fontSize: 13, fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid rgba(201,151,58,0.45)',
            padding: '7px 14px',
            borderRadius: 20,
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,151,58,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          See How It Works →
        </a>
      </div>
    </div>
  );
}