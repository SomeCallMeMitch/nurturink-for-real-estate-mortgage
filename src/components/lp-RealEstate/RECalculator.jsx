import React, { useState, useCallback } from 'react';

/**
 * RECalculator — SECTION 8: LEAD CONVERSION CALCULATOR
 * Completely rebuilt for Real Estate: 10 sliders, 3 value streams
 * Stream 1: New Lead Conversion | Stream 2: Past Client Retention | Stream 3: Referral Generation
 * Blue accent throughout
 */
const fmt = (n) => '$' + Math.round(n).toLocaleString();

const sliderDefs = [
  // Lead Conversion inputs
  { key: 'leadsPerMonth',    label: 'New Leads Per Month',            min: 5,    max: 100,  step: 5,    def: 30,    format: v => v },
  { key: 'currentConvRate',  label: 'Current Lead Conversion Rate',   min: 1,    max: 15,   step: 0.5,  def: 3,     format: v => v + '%' },
  { key: 'convBoost',        label: 'Conversion Boost (points)',      min: 1,    max: 10,   step: 0.5,  def: 2,     format: v => '+' + v + ' pts' },
  { key: 'avgCommission',    label: 'Avg Commission Per Transaction', min: 2000, max: 25000, step: 500, def: 8000,  format: v => fmt(v) },
  // Past Client Retention inputs
  { key: 'pastClients',      label: 'Past Clients in Sphere',         min: 25,   max: 1000, step: 25,   def: 200,   format: v => v },
  { key: 'repeatRate',       label: 'Current Repeat/Referral Rate',   min: 5,    max: 40,   step: 1,    def: 12,    format: v => v + '%' },
  { key: 'repeatBoost',      label: 'Repeat Rate Boost (points)',     min: 1,    max: 15,   step: 1,    def: 5,     format: v => '+' + v + ' pts' },
  // Program Cost inputs
  { key: 'cardsPerLead',     label: 'Cards Per New Lead',             min: 1,    max: 3,    step: 1,    def: 1,     format: v => v },
  { key: 'cardsPerClient',   label: 'Cards Per Past Client Per Year', min: 1,    max: 6,    step: 1,    def: 3,     format: v => v },
  { key: 'cardCost',         label: 'Cost Per Card',                  min: 2.00, max: 4.00, step: 0.25, def: 2.50,  format: v => '$' + Number(v).toFixed(2) },
];

export default function RECalculator() {
  const [vals, setVals] = useState(() => {
    const init = {};
    sliderDefs.forEach(s => { init[s.key] = s.def; });
    return init;
  });

  const update = useCallback((key, raw) => {
    const floatKeys = ['cardCost', 'currentConvRate', 'convBoost'];
    setVals(prev => ({
      ...prev,
      [key]: floatKeys.includes(key) ? parseFloat(raw) : parseInt(raw),
    }));
  }, []);

  // --- STREAM 1: NEW LEAD CONVERSION ---
  const annualLeads = vals.leadsPerMonth * 12;
  const currentDeals = annualLeads * (vals.currentConvRate / 100);
  const boostedRate = vals.currentConvRate + vals.convBoost;
  const boostedDeals = annualLeads * (boostedRate / 100);
  const additionalDeals = Math.max(0, boostedDeals - currentDeals);
  const leadConvValue = additionalDeals * vals.avgCommission;

  // --- STREAM 2: PAST CLIENT RETENTION ---
  const currentRepeatDeals = vals.pastClients * (vals.repeatRate / 100);
  const boostedRepeatRate = vals.repeatRate + vals.repeatBoost;
  const boostedRepeatDeals = vals.pastClients * (boostedRepeatRate / 100);
  const additionalRepeatDeals = Math.max(0, boostedRepeatDeals - currentRepeatDeals);
  const retentionValue = additionalRepeatDeals * vals.avgCommission;

  // --- STREAM 3: REFERRAL GENERATION ---
  // Referral multiplier: each additional repeat deal generates 0.5 referrals
  const referralDeals = additionalRepeatDeals * 0.5;
  const referralValue = referralDeals * vals.avgCommission;

  // --- PROGRAM COST ---
  const leadCardsCost = annualLeads * vals.cardsPerLead * vals.cardCost;
  const clientCardsCost = vals.pastClients * vals.cardsPerClient * vals.cardCost;
  const programCost = Math.round(leadCardsCost + clientCardsCost);

  // --- TOTALS ---
  const totalValue = leadConvValue + retentionValue + referralValue;
  const roi = programCost > 0 ? (totalValue / programCost) : 0;

  return (
    <section id="calculator" style={{ background: '#0f1623', padding: '80px 40px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#007bff', marginBottom: '12px' }}>
          Lead Conversion Calculator
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, lineHeight: 1.2, color: '#ffffff', marginBottom: '12px' }}>
          Run the Full Math on Your Business
        </h2>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: '640px', marginBottom: '36px' }}>
          Most agents only count the first transaction. This model shows the combined impact of converting more leads, retaining more past clients, and generating more referrals — all from a single card program.
        </p>

        {/* Calculator box */}
        <div className="re-calc-box" style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '8px', padding: '36px 40px',
        }}>
          <div className="re-calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px' }}>

            {/* LEFT — SLIDERS */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '28px' }}>
                Your Business
              </div>
              {sliderDefs.map(s => (
                <div key={s.key} style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{s.label}</span>
                    {/* Change 10: slider value display text → amber */}
                    <strong style={{ fontSize: '15px', color: '#f59e0b', fontWeight: 700 }}>{s.format(vals[s.key])}</strong>
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
                Your Projected Annual Value
              </div>

              {/* Stream 1: Lead Conversion */}
              <StreamLabel>New Lead Conversion</StreamLabel>
              <ResultRow label="Additional deals closed" value={additionalDeals.toFixed(1)} />
              <ResultRow label="Added commission income" value={fmt(leadConvValue)} accent />

              {/* Stream 2: Past Client Retention */}
              <StreamLabel style={{ marginTop: '14px' }}>Past Client Retention</StreamLabel>
              <ResultRow label="Additional repeat/referral deals" value={additionalRepeatDeals.toFixed(1)} />
              <ResultRow label="Retained commission value" value={fmt(retentionValue)} accent />

              {/* Stream 3: Referral Generation */}
              <StreamLabel style={{ marginTop: '14px' }}>Referral Generation</StreamLabel>
              <ResultRow label="Referral deals generated" value={referralDeals.toFixed(1)} />
              <ResultRow label="Referral commission value" value={fmt(referralValue)} accent />

              {/* Divider */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '16px 0 12px' }} />

              <ResultRow label="Annual program cost" value={fmt(programCost)} />
              <ResultRow label="Total annual value generated" value={fmt(totalValue)} noBorder />

              {/* ROI highlight — Change 10: keep amber/orange per brief */}
              <div style={{
                background: '#f59e0b', borderRadius: '5px', padding: '18px 22px', marginTop: '16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Return on Investment</span>
                <strong className="font-sora" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff' }}>
                  {roi.toFixed(1)}x return
                </strong>
              </div>

              {/* Footnote */}
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.32)', marginTop: '16px', lineHeight: 1.5 }}>
                Lead conversion boost is conservative — client data shows 2-5 point improvements. Past client repeat rate boost based on NAR data showing 89% satisfaction but only 27% repeat, with systematic follow-up closing the gap. Referral multiplier of 0.5x per additional repeat deal is conservative. Program cost includes cards to both new leads and past clients.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive overrides */}
      <style>{`
        .re-calc-grid input[type=range] {
          width: 100%; height: 4px;
          background: rgba(255,255,255,0.15); border-radius: 2px;
          outline: none; -webkit-appearance: none; cursor: pointer;
        }
        .re-calc-grid input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px;
          border-radius: 50%; background: #f59e0b; cursor: pointer;
          box-shadow: 0 2px 8px rgba(245,158,11,0.4);
          transition: transform 0.15s;
        }
        .re-calc-grid input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.15); }
        @media (max-width: 680px) {
          .re-calc-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .re-calc-box { padding: 24px 18px !important; }
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
      color: '#f59e0b', marginBottom: '4px', marginTop: '4px', ...style, // Change 10: stream labels → amber
    }}>
      {children}
    </div>
  );
}

function ResultRow({ label, value, accent = false, noBorder = false }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '11px 0',
      borderBottom: noBorder ? 'none' : '1px solid rgba(255,255,255,0.07)',
    }}>
      <span style={{ fontSize: accent ? '14px' : '15px', color: accent ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.6)' }}>{label}</span>
      <strong style={{ fontSize: '16px', color: accent ? 'rgba(255,255,255,0.65)' : '#ffffff', fontWeight: 700 }}>{value}</strong>
    </div>
  );
}