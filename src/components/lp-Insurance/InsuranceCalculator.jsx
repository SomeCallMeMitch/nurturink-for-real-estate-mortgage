import React, { useState, useCallback } from 'react';

/**
 * InsuranceCalculator — SECTION 8: RETENTION CALCULATOR
 * Full multi-stream model: Retention + Referrals + Avoided Acquisition Cost → ROI
 * Matches the uploaded HTML spec exactly.
 */
const fmt = (n) => '$' + Math.round(n).toLocaleString();

const sliderDefs = [
  { key: 'clients',    label: 'Number of Clients',              min: 50,   max: 2000, step: 25,   def: 400,  format: v => v },
  { key: 'commission', label: 'Avg Annual Commission Per Client', min: 100, max: 1000, step: 25,  def: 200,  format: v => fmt(v) },
  { key: 'years',      label: 'Avg Years a Client Stays',       min: 2,    max: 10,   step: 1,    def: 5,    format: v => v },
  { key: 'churn',      label: 'Current Annual Churn Rate',      min: 5,    max: 30,   step: 1,    def: 15,   format: v => v + '%' },
  { key: 'improve',    label: 'Retention Improvement (points)',  min: 3,    max: 10,   step: 1,    def: 5,    format: v => v + ' pts' },
  { key: 'refPct',     label: '% of Saved Clients Who Refer',   min: 5,    max: 30,   step: 5,    def: 15,   format: v => v + '%' },
  { key: 'cards',      label: 'Cards Per Client Per Year',      min: 1,    max: 6,    step: 1,    def: 3,    format: v => v },
  { key: 'cardCost',   label: 'Card Cost Per Card',             min: 2.00, max: 4.00, step: 0.25, def: 2.50, format: v => '$' + Number(v).toFixed(2) },
];

export default function InsuranceCalculator() {
  const [vals, setVals] = useState(() => {
    const init = {};
    sliderDefs.forEach(s => { init[s.key] = s.def; });
    return init;
  });

  const update = useCallback((key, raw) => {
    setVals(prev => ({
      ...prev,
      [key]: (key === 'cardCost') ? parseFloat(raw) : parseInt(raw),
    }));
  }, []);

  // --- STREAM 1: RETENTION ---
  const lostNow  = Math.round(vals.clients * vals.churn / 100);
  const newChurn = Math.max(vals.churn - vals.improve, 1);
  const lostWith = Math.round(vals.clients * newChurn / 100);
  const saved    = Math.max(0, lostNow - lostWith);
  const ltv      = vals.commission * vals.years;
  const retentionVal = saved * ltv;

  // --- STREAM 2: REFERRALS ---
  const refCount = Math.round(saved * vals.refPct / 100);
  const refVal   = refCount * ltv;

  // --- STREAM 3: AVOIDED ACQUISITION COST (5× annual commission) ---
  const acqCost = saved * vals.commission * 5;

  // --- PROGRAM COST ---
  const programCost = Math.round(vals.clients * vals.cards * vals.cardCost);

  // --- TOTALS ---
  const totalVal = retentionVal + refVal + acqCost;
  const roi      = programCost > 0 ? (totalVal / programCost) : 0;

  return (
    <section id="calculator" style={{ background: '#0f1623', padding: '80px 40px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '12px' }}>
          Retention Calculator
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, lineHeight: 1.2, color: '#ffffff', marginBottom: '12px' }}>
          Run the Full Math on Your Book
        </h2>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: '640px', marginBottom: '36px' }}>
          Most agents only count the first year. This model shows what saved clients are actually worth over their lifetime — plus the referrals they generate and the acquisition cost you never have to spend.
        </p>

        {/* Calculator box */}
        <div className="ins-calc-box" style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '8px', padding: '36px 40px',
        }}>
          <div className="ins-calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px' }}>

            {/* LEFT — SLIDERS */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '28px' }}>
                Your Book
              </div>
              {sliderDefs.map(s => (
                <div key={s.key} style={{ marginBottom: '26px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                    <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{s.label}</span>
                    <strong style={{ fontSize: '16px', color: '#f59e0b', fontWeight: 700 }}>{s.format(vals[s.key])}</strong>
                  </div>
                  <input
                    type="range" min={s.min} max={s.max} step={s.step} value={vals[s.key]}
                    onChange={e => update(s.key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* RIGHT — RESULTS */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '28px' }}>
                Your Projected Value
              </div>

              {/* Stream 1: Retention */}
              <StreamLabel>Retention</StreamLabel>
              <ResultRow label="Clients saved per year" value={saved} />
              <ResultRow label="Lifetime value per saved client" value={fmt(ltv)} />
              <ResultRow label="Retained renewal value" value={fmt(retentionVal)} sub />

              {/* Stream 2: Referrals */}
              <StreamLabel style={{ marginTop: '14px' }}>Referrals</StreamLabel>
              <ResultRow label="New clients from referrals (yr 1)" value={refCount} />
              <ResultRow label="Referral new client value" value={fmt(refVal)} sub />

              {/* Stream 3: Avoided cost */}
              <StreamLabel style={{ marginTop: '14px' }}>Avoided Cost</StreamLabel>
              <ResultRow label="Acquisition cost not spent" value={fmt(acqCost)} sub />

              {/* Divider */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '16px 0 12px' }} />

              <ResultRow label="Annual program cost" value={fmt(programCost)} />
              <ResultRow label="Total value generated (yr 1)" value={fmt(totalVal)} noBorder />

              {/* ROI highlight */}
              <div style={{
                background: '#e85d04', borderRadius: '5px', padding: '18px 22px', marginTop: '16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Return on Investment</span>
                <strong className="font-sora" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
                  {roi.toFixed(1)}x return
                </strong>
              </div>

              {/* Footnote */}
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.32)', marginTop: '16px', lineHeight: 1.5 }}>
                Retention improvement: 5 points is conservative — a documented P&amp;C case study showed 8 points in year one. Referral % based on ClientCircle insurance agency data (vendor source, cited as directional). Acquisition cost uses 5× annual commission as the conservative floor from industry data. Lifetime value uses your commission × years a client stays.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive overrides */}
      <style>{`
        .ins-calc-grid input[type=range] {
          width: 100%; height: 4px;
          background: rgba(255,255,255,0.15); border-radius: 2px;
          outline: none; -webkit-appearance: none; cursor: pointer;
        }
        .ins-calc-grid input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px;
          border-radius: 50%; background: #f59e0b; cursor: pointer;
          box-shadow: 0 2px 8px rgba(245,158,11,0.45);
          transition: transform 0.15s;
        }
        .ins-calc-grid input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.15); }
        @media (max-width: 680px) {
          .ins-calc-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .ins-calc-box { padding: 24px 18px !important; }
        }
      `}</style>
    </section>
  );
}

/* ── Tiny helper sub-components ── */

function StreamLabel({ children, style }) {
  return (
    <div style={{
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
      color: '#f59e0b', marginBottom: '4px', marginTop: '4px', ...style,
    }}>
      {children}
    </div>
  );
}

function ResultRow({ label, value, sub = false, noBorder = false }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '11px 0',
      borderBottom: noBorder ? 'none' : '1px solid rgba(255,255,255,0.07)',
    }}>
      <span style={{ fontSize: sub ? '14px' : '15px', color: sub ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.6)' }}>{label}</span>
      <strong style={{ fontSize: '16px', color: sub ? 'rgba(255,255,255,0.65)' : '#ffffff', fontWeight: 700 }}>{value}</strong>
    </div>
  );
}