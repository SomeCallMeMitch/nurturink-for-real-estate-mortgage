import React from 'react';

/**
 * RECTA — SECTION 9: CTA
 * Real Estate: blue bg, white button, RE-specific copy
 */
export default function RECTA() {
  return (
    <section id="get-sample" style={{ background: '#007bff', padding: '88px 40px', textAlign: 'center' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <h2 className="font-sora" style={{ color: '#ffffff', fontSize: 'clamp(1.8rem, 3vw, 2.7rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '14px' }}>
          {/* Change 16: Updated CTA headline */}
          Two Extra Referrals. One Year of Cards.<br /><em style={{ fontStyle: 'normal' }}>The Math Is Pretty Simple.</em>
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', maxWidth: '500px', margin: '0 auto 36px', lineHeight: 1.55 }}>
          {/* Change 17: Updated CTA subhead */}
          Get a free sample card mailed directly to you. Hold it. Read it. That is exactly what lands in your past client's mailbox — and what makes them think of you when their neighbor mentions they're thinking of selling.
        </p>
        <a
          href="https://nurturink.com"
          className="font-inter"
          style={{
            display: 'inline-block', padding: '13px 28px', borderRadius: '4px',
            fontSize: '15px', fontWeight: 700, letterSpacing: '0.02em',
            textDecoration: 'none', border: '2px solid transparent',
            background: '#ffffff', color: '#007bff',
            boxShadow: '0 3px 12px rgba(0,0,0,0.15)',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 7px 24px rgba(0,0,0,0.22)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.15)'; e.currentTarget.style.transform = 'none'; }}
        >
          Get Your Free Sample Card
        </a>
      </div>
      <style>{`
        @media (max-width: 768px) {
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}