import React from 'react';
import REHeroStatCard from './REHeroStatCard';

/**
 * REHero — SECTION 2: HERO
 * Real Estate: dark navy bg, blue accent, RE-specific copy & stats
 */
// Change 5: Updated stats per brief v2
const stats = [
  { value: '90%+', label: "of past clients say they'd use their agent again — most never call because agents stop reaching out (NAR 2025)" },
  { value: '66%', label: 'of sellers find their agent through referral or a past relationship (NAR 2025)' },
  { value: '65%', label: 'repeat client rate for agents who send handwritten thank-yous vs. 40-50% industry average' },
  { value: '5x', label: 'more likely to refer when clients feel a personal connection (Deloitte)' },
];

export default function REHero() {
  return (
    <section style={{ background: '#0f1623', padding: '88px 40px 80px', position: 'relative', overflow: 'hidden' }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,123,255,0.1) 0%, transparent 68%)',
        pointerEvents: 'none',
      }} />

      <div className="re-hero-inner" style={{ maxWidth: '1060px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '72px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        {/* Left column */}
        <div>
          <div style={{
            display: 'inline-block', background: 'rgba(0,123,255,0.1)',
            border: '1px solid rgba(0,123,255,0.3)', color: '#007bff',
            fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '6px 14px', borderRadius: '3px', marginBottom: '24px',
          }}>
            Real Estate Agents &amp; Teams
          </div>

          {/* Change 2: Updated headline */}
          <h1 className="font-sora" style={{
            fontSize: 'clamp(2rem, 3.8vw, 3rem)', fontWeight: 900,
            lineHeight: 1.12, color: '#ffffff', marginBottom: '20px',
          }}>
            What Would Two Extra Referrals<br/>Per Year Be Worth to You?
          </h1>

          {/* Change 3: Updated subhead */}
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, marginBottom: '36px', maxWidth: '480px' }}>
            NAR's 2025 data shows 66% of sellers and 61% of buyers choose their agent through a referral or past relationship. More than 9 in 10 say they would use their agent again. The ones who don't call back aren't unhappy — they just haven't heard from you. Two extra referrals a year at average commission covers years of this program.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <REBtnBlue href="#get-sample">Get Your Free Sample Card</REBtnBlue>
            {/* Change 4: Updated secondary button text */}
            <REBtnOutline href="#calculator">Run the Numbers</REBtnOutline>
          </div>
        </div>

        {/* Right column — stats */}
        <div className="re-hero-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {stats.map((s, i) => <REHeroStatCard key={i} value={s.value} label={s.label} />)}
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .re-hero-inner { grid-template-columns: 1fr !important; }
          .re-hero-stats { display: none !important; }
        }
        @media (max-width: 768px) {
          section { padding: 64px 24px !important; }
        }
      `}</style>
    </section>
  );
}

/* Shared button helpers — blue scheme */
function REBtnBlue({ href, children }) {
  return (
    <a href={href} className="font-inter" style={{
      display: 'inline-block', padding: '13px 28px', borderRadius: '4px',
      fontSize: '15px', fontWeight: 700, letterSpacing: '0.02em',
      textDecoration: 'none', border: '2px solid transparent',
      background: '#007bff', color: '#ffffff',
      boxShadow: '0 3px 12px rgba(0,123,255,0.3)',
      transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = '#0056b3'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,123,255,0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#007bff'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,123,255,0.3)'; e.currentTarget.style.transform = 'none'; }}
    >{children}</a>
  );
}

function REBtnOutline({ href, children }) {
  return (
    <a href={href} className="font-inter" style={{
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