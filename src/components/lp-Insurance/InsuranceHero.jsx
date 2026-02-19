import React from 'react';
import InsuranceHeroStatCard from './InsuranceHeroStatCard';

/**
 * InsuranceHero — SECTION 2: HERO
 * Insurance-specific copy, stats, and CTAs
 */
const stats = [
  { value: '15%', label: 'average annual churn for insurance agencies (Insurance Back Office Hub)' },
  { value: '5-9x', label: 'more expensive to acquire a client than keep one' },
  { value: '7-11%', label: 'retention improvement from systematic handwritten touches (industry testing data)' },
  { value: '88%', label: 'of insurance customers want more personalized contact from their agent (McKinsey)' },
];

export default function InsuranceHero() {
  return (
    <section style={{ background: '#213659', padding: '88px 40px 80px', position: 'relative', overflow: 'hidden' }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 68%)',
        pointerEvents: 'none',
      }} />

      <div className="insurance-hero-inner" style={{ maxWidth: '1060px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '72px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        {/* Left column */}
        <div>
          <div style={{
            display: 'inline-block', background: 'rgba(245,158,11,0.15)',
            border: '1px solid rgba(245,158,11,0.35)', color: '#f59e0b',
            fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '6px 14px', borderRadius: '3px', marginBottom: '24px',
          }}>
            Insurance Agents &amp; Brokers
          </div>

          <h1 className="font-sora" style={{
            fontSize: 'clamp(2rem, 3.8vw, 3rem)', fontWeight: 900,
            lineHeight: 1.12, color: '#ffffff', marginBottom: '20px',
          }}>
            Your Clients Don't Leave Because They're Unhappy.<br/>They Leave Because <em style={{ color: '#f59e0b', fontStyle: 'normal' }}>You Went Silent.</em>
          </h1>

          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, marginBottom: '36px', maxWidth: '480px' }}>
            The average insurance agency loses 15% of its book every year — not to complaints or price, but to quiet drift. A client who never hears from you between sales is a client another agent can reach first. Handwritten cards fix the silence.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <InsuranceBtnOrange href="#get-sample">Get Your Free Sample Card</InsuranceBtnOrange>
            <InsuranceBtnOutline href="#calculator">Run the Retention Math</InsuranceBtnOutline>
          </div>
        </div>

        {/* Right column — stats */}
        <div className="insurance-hero-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {stats.map((s, i) => <InsuranceHeroStatCard key={i} value={s.value} label={s.label} />)}
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .insurance-hero-inner { grid-template-columns: 1fr !important; }
          .insurance-hero-stats { display: none !important; }
        }
        @media (max-width: 768px) {
          section { padding: 64px 24px !important; }
        }
      `}</style>
    </section>
  );
}

/* Shared button helpers */
function InsuranceBtnOrange({ href, children }) {
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

function InsuranceBtnOutline({ href, children }) {
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