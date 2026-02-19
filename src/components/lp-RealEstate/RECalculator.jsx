import React, { useState, useCallback } from 'react';

/**
 * RECalculator — SECTION 8: RETENTION CALCULATOR
 * Cloned from InsuranceCalculator for Real Estate LP
 */
const fmt = (n) => '$' + Math.round(n).toLocaleString();

const sliderDefs = [
  { key: 'clients', label: 'Number of Clients', min: 50, max: 2000, step: 25, def: 400, format: v => v },
  { key: 'commission', label: 'Avg Annual Commission Per Client', min: 100, max: 1000, step: 25, def: 200, format: v => fmt(v) },
  { key: 'churn', label: 'Current Annual Churn Rate', min: 5, max: 30, step: 1, def: 15, format: v => v + '%' },
  { key: 'cards', label: 'Cards Per Client Per Year', min: 1, max: 6, step: 1, def: 3, format: v => v },
  { key: 'cardCost', label: 'Card Cost Per Card', min: 2, max: 4, step: 0.25, def: 2.5, format: v => '$' + Number(v).toFixed(2) },
];

export default function RECalculator() {
  const [vals, setVals] = useState({
    clients: 400, commission: 200, churn: 15, cards: 3, cardCost: 2.5,
  });

  const update = useCallback((key, raw) => {
    setVals(prev => ({ ...prev, [key]: key === 'cardCost' ? parseFloat(raw) : parseInt(raw) }));
  }, []);

  // --- Retention calculation logic ---
  const lostNow = Math.round(vals.clients * vals.churn / 100);
  const revLost = lostNow * vals.commission;
  const newChurn = Math.max(vals.churn - 3, 1);
  const lostWithProg = Math.round(vals.clients * newChurn / 100);
  const saved = lostNow - lostWithProg;
  const programCost = Math.round(vals.clients * vals.cards * vals.cardCost);
  const protectedRev = saved * vals.commission;
  const net5Year = (protectedRev * 5) - (programCost * 5);

  const results = [
    { label: 'Clients lost per year (current)', value: lostNow },
    { label: 'Annual revenue lost to churn', value: fmt(revLost) },
    { label: 'Churn with program (3-pt improvement)', value: lostWithProg },
    { label: 'Clients saved per year', value: saved },
    { label: 'Annual program cost', value: fmt(programCost) },
    { label: 'Annual protected revenue', value: fmt(protectedRev) },
  ];

  return (
    <section id="calculator" style={{ background: '#1a2d4a', padding: '80px 40px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '14px' }}>
          Retention Calculator
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', marginBottom: '16px' }}>
          Run the Math on Your Own Book
        </h2>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, maxWidth: '700px' }}>
          Adjust the sliders to match your situation. The model shows what a 3-point improvement in retention means over five years — before accounting for the referral multiplier that comes from clients who feel genuinely valued.
        </p>

        <div className="re-calc-box" style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px', padding: '44px', marginTop: '40px',
        }}>
          <div className="re-calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px' }}>
            {/* Left — sliders */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '28px' }}>
                Your Book
              </div>
              {sliderDefs.map(s => (
                <div key={s.key} style={{ marginBottom: '26px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                    <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>{s.label}</span>
                    <strong style={{ fontSize: '16px', color: '#f59e0b', fontWeight: 700 }}>{s.format(vals[s.key])}</strong>
                  </div>
                  <input
                    type="range" min={s.min} max={s.max} step={s.step} value={vals[s.key]}
                    onChange={e => update(s.key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* Right — results */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '28px' }}>
                Your Projected Results
              </div>
              {results.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }}>
                  <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)' }}>{r.label}</span>
                  <strong style={{ fontSize: '16px', color: '#ffffff', fontWeight: 700 }}>{r.value}</strong>
                </div>
              ))}
              {/* 5-year highlight */}
              <div style={{
                background: '#FF7A00', borderRadius: '5px', padding: '18px 22px', marginTop: '16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>5-Year Net (retention only)</span>
                <strong className="font-sora" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
                  {(net5Year >= 0 ? '+' : '') + fmt(Math.abs(net5Year))}
                </strong>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.32)', marginTop: '16px', lineHeight: 1.5 }}>
                Based on a 3-point churn improvement. Does not include referral multiplier, cross-sell, or review generation upside. Independent research and vendor data both support 3-point or greater retention improvement with systematic personal outreach.
              </p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .re-calc-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .re-calc-box { padding: 24px 18px !important; }
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}