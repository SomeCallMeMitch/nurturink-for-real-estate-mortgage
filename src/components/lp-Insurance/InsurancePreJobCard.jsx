import React from 'react';

/**
 * InsurancePreJobCard — SECTION 5 wide card below three-card grid
 * Insurance-specific: retention math table instead of pre-job note
 */

const rows = [
  { left: 'Book size', right: '400 clients', highlight: false },
  { left: 'Avg annual commission', right: '$200/client', highlight: false },
  { left: 'Churn without program', right: '60 clients/yr', highlight: false },
  { left: 'Churn with program', right: '48 clients/yr', highlight: false },
  { left: 'Annual program cost', right: '$3,600', highlight: false },
  { left: 'Annual protected revenue', right: '$2,400', highlight: true },
  { left: '5-year net (retention only)', right: '+$8,400', highlight: true, last: true },
];

export default function InsurancePreJobCard() {
  return (
    <div
      style={{
        marginTop: '28px', background: '#172840', borderRadius: '5px',
        overflow: 'hidden', borderLeft: '6px solid #f59e0b',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.22)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div className="insurance-prejob-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* Left */}
        <div className="insurance-prejob-left" style={{ padding: '36px 40px', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: '10px' }}>
            The Math Every Agent Should Run
          </span>
          <h3 className="font-sora" style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.2, marginBottom: '14px' }}>
            What Does 15% Annual Churn Actually Cost Your Book?
          </h3>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55 }}>
            The average insurance agency runs about 85% retention — meaning 15 out of every 100 clients walk out the door each year. Not because they were unhappy. Because no one reached out. The research is consistent: clients fire agents for lack of proactive personal contact, not for pricing or claims disputes.
          </p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, marginTop: '12px' }}>
            On a 400-client book at $200 average annual commission, 15% churn is 60 clients and $12,000 in annual revenue walking out. Acquiring those clients back costs 5 to 9 times that in marketing and sales expense. Keeping them costs three cards a year at $2.50 each.
          </p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, marginTop: '12px' }}>
            A 3-point retention improvement — from 85% to 88% — saves 12 clients per year. Over five years, with referral compounding, that is $14,000 to $20,000 in protected and generated revenue from a program that costs under $4 per client per year.
          </p>
        </div>

        {/* Right */}
        <div style={{ padding: '36px 40px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '14px' }}>
            Conservative 5-Year Model — 400-Client Book
          </span>
          <div style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '4px', padding: '22px 24px',
            fontSize: '15px', fontStyle: 'normal', lineHeight: 1.7,
          }}>
            {rows.map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                borderBottom: row.last ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{row.left}</span>
                <span style={{ color: row.highlight ? '#f59e0b' : '#ffffff', fontWeight: row.highlight ? 700 : 400 }}>{row.right}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {['Does not include referral upside', '3 cards/yr per client'].map((t, i) => (
              <span key={i} style={{
                background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '3px', padding: '6px 14px',
                fontSize: '13px', fontWeight: 700, color: '#f59e0b',
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .insurance-prejob-inner { grid-template-columns: 1fr !important; }
          .insurance-prejob-left { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; }
        }
      `}</style>
    </div>
  );
}