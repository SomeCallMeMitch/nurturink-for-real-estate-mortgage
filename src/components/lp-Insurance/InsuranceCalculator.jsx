import React, { useState, useCallback } from 'react';

/**
 * InsuranceCalculator — SECTION 8: ROI CALCULATOR
 * Cloned from RoofingCalculator
 */
const fmt = (n) => '$' + Math.round(n).toLocaleString();

const sliderDefs = [
  { key: 'installs', label: 'Jobs Per Year', min: 10, max: 300, step: 5, def: 60, format: v => v },
  { key: 'saleval', label: 'Average Job Value', min: 5000, max: 50000, step: 500, def: 18000, format: v => fmt(v) },
  { key: 'margin', label: 'Your Margin / Commission', min: 5, max: 40, step: 1, def: 12, format: v => v + '%' },
  { key: 'ref', label: 'Current Referral Rate', min: 5, max: 50, step: 5, def: 15, format: v => v + '%' },
  { key: 'radius', label: 'Radius Cards Per Job', min: 0, max: 100, step: 5, def: 50, format: v => v },
  { key: 'card', label: 'Card Cost Per Card', min: 2, max: 4, step: 0.25, def: 2.5, format: v => '$' + Number(v).toFixed(2) },
];

export default function InsuranceCalculator() {
  const [vals, setVals] = useState({
    installs: 60, saleval: 18000, margin: 12, ref: 15, radius: 50, card: 2.5,
  });

  const update = useCallback((key, raw) => {
    setVals(prev => ({ ...prev, [key]: key === 'card' ? parseFloat(raw) : parseInt(raw) }));
  }, []);

  // --- Calculation logic ---
  const perSale = Math.round(vals.saleval * vals.margin / 100);
  const refNow = Math.round(vals.installs * vals.ref / 100);
  const refRevNow = refNow * perSale;
  const newRefRate = Math.min(vals.ref + 20, 80);
  const refNew = Math.round(vals.installs * newRefRate / 100);
  const extraFromRef = Math.max(0, refNew - refNow);
  const radiusJobsPerYear = vals.radius > 0 ? vals.installs : 0;
  const totalExtra = extraFromRef + radiusJobsPerYear;
  const cardsPerJob = 1 + vals.radius;
  const programCost = Math.round(vals.installs * cardsPerJob * vals.card);
  const extraRev = totalExtra * perSale;
  const year3 = (extraRev * 3) - (programCost * 3);

  const results = [
    { label: 'Your income per job', value: fmt(perSale) },
    { label: 'Referral jobs per year (current)', value: refNow },
    { label: 'Referral income per year (current)', value: fmt(refRevNow) },
    { label: 'Projected referral improvement', value: '+' + (newRefRate - vals.ref) + '%' },
    { label: 'Additional jobs per year', value: totalExtra },
    { label: 'Annual program cost (post-job + radius)', value: fmt(programCost) },
    { label: 'Additional annual income', value: fmt(extraRev) },
  ];

  return (
    <section id="calculator" style={{ background: '#1a2d4a', padding: '80px 40px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '14px' }}>
          ROI Calculator
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', marginBottom: '16px' }}>
          What Is One Referral Worth in Roofing?
        </h2>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, maxWidth: '700px' }}>
          Roofing is a high-ticket business with strong word-of-mouth potential. Adjust the sliders to match your situation. The program cost includes both the post-job card and the radius neighbor campaign.
        </p>

        <div className="insurance-calc-box" style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px', padding: '44px', marginTop: '40px',
        }}>
          <div className="insurance-calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px' }}>
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
                <strong className="font-sora" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
                  {(year3 >= 0 ? '' : '-') + fmt(Math.abs(year3))}
                </strong>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.32)', marginTop: '16px', lineHeight: 1.5 }}>
                Referral improvement assumes +20 percentage points from systematic follow-up and neighborhood outreach, capped at 80%. Program cost includes 1 post-job thank-you card plus the radius campaign per job. One radius job referral assumed per campaign. Individual results will vary.
              </p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .insurance-calc-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .insurance-calc-box { padding: 24px 18px !important; }
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}