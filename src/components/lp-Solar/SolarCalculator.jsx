import React, { useState, useCallback } from 'react';

/**
 * SolarCalculator — SECTION 8: ROI CALCULATOR
 * id="calculator", bg #1a2d4a, interactive sliders + results
 * Calculator logic copied exactly from spec.
 */
const fmt = (n) => '$' + Math.round(n).toLocaleString();

const sliderDefs = [
  { key: 'installs', label: 'Installations Per Year', min: 10, max: 500, step: 5, def: 60, format: v => v },
  { key: 'saleval', label: 'Average Sale Value', min: 8000, max: 60000, step: 1000, def: 25000, format: v => fmt(v) },
  { key: 'margin', label: 'Your Commission / Margin', min: 3, max: 25, step: 1, def: 8, format: v => v + '%' },
  { key: 'ref', label: 'Current Referral Rate', min: 5, max: 50, step: 5, def: 15, format: v => v + '%' },
  { key: 'card', label: 'Card Cost Per Card', min: 2, max: 4, step: 0.25, def: 2.5, format: v => '$' + Number(v).toFixed(2) },
];

export default function SolarCalculator() {
  const [vals, setVals] = useState({
    installs: 60, saleval: 25000, margin: 8, ref: 15, card: 2.5,
  });

  const update = useCallback((key, raw) => {
    setVals(prev => ({ ...prev, [key]: key === 'card' ? parseFloat(raw) : parseInt(raw) }));
  }, []);

  const perSale = Math.round(vals.saleval * vals.margin / 100);
  const refNow = Math.round(vals.installs * vals.ref / 100);
  const refRevNow = refNow * perSale;
  const newRefRate = Math.min(vals.ref + 20, 80);
  const refNew = Math.round(vals.installs * newRefRate / 100);
  const extra = Math.max(0, refNew - refNow);
  const programCost = Math.round(vals.installs * vals.card);
  const extraRev = extra * perSale;
  const year3 = extraRev * 3;

  const results = [
    { label: 'Your income per sale', value: fmt(perSale) },
    { label: 'Referral sales per year (current)', value: refNow },
    { label: 'Referral income per year (current)', value: fmt(refRevNow) },
    { label: 'Projected referral improvement', value: '+20%' },
    { label: 'Additional sales per year', value: extra },
    { label: 'Annual program cost', value: fmt(programCost) },
    { label: 'Additional annual income', value: fmt(extraRev) },
  ];

  return (
    <section id="calculator" style={{ background: '#1a2d4a', padding: '80px 40px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '14px' }}>
          ROI Calculator
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', marginBottom: '16px' }}>
          What Is One Referral Worth in Solar?
        </h2>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, maxWidth: '700px' }}>
          Solar is a high-ticket, high-referral business. Adjust the sliders to reflect your situation and see what a consistent follow-up program means for your income over three years.
        </p>

        <div className="solar-calc-box" style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px', padding: '44px', marginTop: '40px',
        }}>
          <div className="solar-calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px' }}>
            {/* Left — sliders */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '28px' }}>
                Your Numbers
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
              {/* 3-year highlight */}
              <div style={{
                background: '#FF7A00', borderRadius: '5px', padding: '18px 22px', marginTop: '16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>3-Year Income Gain</span>
                <strong className="font-sora" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>{fmt(year3)}</strong>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.32)', marginTop: '16px', lineHeight: 1.5 }}>
                Referral improvement based on research on personal outreach and reciprocity in home services. Individual results will vary based on market, message quality, and follow-up consistency.
              </p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .solar-calc-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .solar-calc-box { padding: 24px 18px !important; }
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}