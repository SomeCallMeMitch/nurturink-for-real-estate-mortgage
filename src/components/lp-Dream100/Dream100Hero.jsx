import React from 'react';

/**
 * Dream100Hero — hero section shown before wizard starts.
 * HTML spec: background navy, radial gold glow, badge, h1, p, feature list,
 * CTA button (gold), sub note, credibility block at bottom.
 */
export default function Dream100Hero({ onStart }) {
  return (
    <section style={{
      background: 'var(--d100-navy)',
      padding: '36px 22px 44px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Radial gold glow behind content */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(201,151,58,0.14), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Relative content wrapper */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(201,151,58,0.15)',
          border: '1px solid rgba(201,151,58,0.35)',
          color: 'var(--d100-gold-light)',
          fontSize: 11, fontWeight: 700,
          letterSpacing: '0.07em', textTransform: 'uppercase',
          padding: '6px 14px', borderRadius: 20,
          marginBottom: 20,
        }}>
          ✦ Free Tool for Real Estate Agents
        </div>

        {/* H1 */}
        <h1 style={{
          fontSize: 26, fontWeight: 800,
          color: 'var(--d100-white)',
          lineHeight: 1.22, marginBottom: 14,
          letterSpacing: '-0.02em',
        }}>
          Find the{' '}
          <em style={{ fontStyle: 'normal', color: 'var(--d100-gold-light)' }}>10 People</em>
          {' '}Who Already Know Your Next Clients
        </h1>

        {/* Subtext */}
        <p style={{
          color: 'rgba(255,255,255,0.78)',
          fontSize: 16, fontWeight: 400,
          lineHeight: 1.6, marginBottom: 30,
          maxWidth: 440, marginLeft: 'auto', marginRight: 'auto',
        }}>
          Get a complete 7-prompt AI blueprint to build your Dream 100 referral partner system — built for your niche and your market in minutes.
        </p>

        {/* Feature list */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          textAlign: 'left', maxWidth: 340,
          margin: '0 auto 32px',
        }}>
          {[
            'Dream 10 partner map, ranked and tiered',
            'Outreach scripts, objection responses',
            '90-day relationship building system',
            'No login. Free to use. Always.',
          ].map((feat, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              color: 'rgba(255,255,255,0.85)',
              fontSize: 15, fontWeight: 500, lineHeight: 1.4,
            }}>
              {/* Check icon circle */}
              <div style={{
                width: 22, height: 22,
                background: 'rgba(201,151,58,0.2)',
                border: '1px solid rgba(201,151,58,0.35)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, flexShrink: 0, marginTop: 1,
              }}>✓</div>
              {feat}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onStart}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--d100-gold)', color: 'var(--d100-navy)',
            fontSize: 16, fontWeight: 800,
            padding: '16px 30px', borderRadius: 50, border: 'none',
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 4px 20px rgba(201,151,58,0.4)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--d100-gold-light)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--d100-gold)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          Build My Free Blueprint ⚡
        </button>

        <p style={{
          color: 'rgba(255,255,255,0.42)',
          fontSize: 12, marginTop: 12, fontWeight: 400,
        }}>
          Takes about 3 minutes · No account needed · Use it as many times as you want
        </p>

        {/* Credibility block */}
        <div style={{
          marginTop: 22, paddingTop: 18,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          maxWidth: 420, marginLeft: 'auto', marginRight: 'auto',
        }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left',
          }}>
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>🧠</span>
            <span style={{
              fontSize: 13, color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.55, fontWeight: 400,
            }}>
              Built on a framework co-developed by a leading AI strategist and a top-producing agent who's used AI to transform his real estate business — adapted by NurturInk into a tool anyone can use in minutes.
            </span>
          </div>
        </div>
      </div>

      {/* Responsive hero padding */}
      <style>{`
        @media (min-width: 600px) {
          .d100-hero-section { padding: 48px 32px 56px !important; }
          .d100-hero-section h1 { font-size: 34px !important; }
          .d100-hero-section p { font-size: 17px !important; }
        }
      `}</style>
    </section>
  );
}