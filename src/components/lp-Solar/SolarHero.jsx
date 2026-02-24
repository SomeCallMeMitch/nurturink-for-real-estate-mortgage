import React from 'react';
import SolarHeroStatCard from './SolarHeroStatCard';

/**
 * SolarHero — SECTION 2: HERO
 * bg #213659, glow, 2-col grid (content + stat cards)
 * Mobile (<960px): single column, hide stats
 * Changes: top padding reduced ~60% (88px → 35px), paragraph line-height 1.55 → 1.25
 */
const stats = [
  { value: '99%', label: 'open rate vs. 22% for email (DMA 2024)' },
  { value: '7x', label: 'higher response rate than printed mail' },
  { value: '$2.50', label: 'per card, including postage' },
  { value: '70%', label: 'higher brand recall vs. digital (Canada Post)' },
];

export default function SolarHero() {
  return (
    <section style={{ background: '#213659', padding: '35px 40px 80px', position: 'relative', overflow: 'hidden' }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 68%)',
        pointerEvents: 'none',
      }} />

      <div className="solar-hero-inner" style={{ maxWidth: '1060px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '72px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        {/* Left column */}
        <div>
          <div style={{
            display: 'inline-block', background: 'rgba(245,158,11,0.15)',
            border: '1px solid rgba(245,158,11,0.35)', color: '#f59e0b',
            fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '6px 14px', borderRadius: '3px', marginBottom: '24px',
          }}>
            Solar Sales Professionals
          </div>

          <h1 className="font-sora" style={{
            fontSize: 'clamp(2rem, 3.8vw, 3rem)', fontWeight: 900,
            lineHeight: 1.12, color: '#ffffff', marginBottom: '20px',
          }}>
            You Just Installed a 25-Year Asset. They'll Forget You in{' '}
            <em style={{ color: '#f59e0b', fontStyle: 'normal' }}>90 Days.</em>
          </h1>

          {/* line-height reduced from 1.55 → 1.25 */}
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.25, marginBottom: '36px', maxWidth: '480px' }}>
            Solar customers make one of the largest purchases of their lives. Then they go back to their neighborhood where their neighbors are asking who did it. A handwritten card makes sure they remember your name when that conversation happens.
          </p>

          {/* Orange btn → #get-sample (SolarSampleForm) */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <SolarBtnOrange href="#get-sample">Get Your Free Sample Card</SolarBtnOrange>
            <SolarBtnOutline href="#calculator">See the ROI Math</SolarBtnOutline>
          </div>
        </div>

        {/* Right column — stats */}
        <div className="solar-hero-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {stats.map((s, i) => <SolarHeroStatCard key={i} value={s.value} label={s.label} />)}
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .solar-hero-inner { grid-template-columns: 1fr !important; }
          .solar-hero-stats { display: none !important; }
        }
        @media (max-width: 768px) {
          section { padding: 64px 24px !important; }
        }
      `}</style>
    </section>
  );
}

/* Shared button helpers */
function SolarBtnOrange({ href, children }) {
  return (
    <a href={href} className="font-lato" style={{
      display: 'inline-block', padding: '13px 28px', borderRadius: '4px',
      fontSize: '15px', fontWeight: 700, letterSpacing: '0.02em',
      textDecoration: 'none', border: '2px solid transparent',
      background: '#FF7A00', color: '#ffffff',
      boxShadow: '0 3px 12px rgba(255,122,0,0.3)',
      transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = '#e86e00'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,122,0,0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#FF7A00'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(255,122,0,0.3)'; e.currentTarget.style.transform = 'none'; }}
    >{children}</a>
  );
}

function SolarBtnOutline({ href, children }) {
  return (
    <a href={href} className="font-lato" style={{
      display: 'inline-block', padding: '13px 28px', borderRadius: '4px',
      fontSize: '15px', fontWeight: 700, letterSpacing: '0.02em',
      textDecoration: 'none', border: '2px solid rgba(255,255,255,0.45)',
      background: 'transparent', color: '#ffffff',
      transition: 'transform 0.18s ease, border-color 0.18s ease, background 0.18s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.9)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; }}
    >{children}</a>
  );
}