import React, { useState, useEffect, useCallback } from 'react';

const fmt$ = n => '$' + Math.round(n).toLocaleString();
const fmtN = n => n % 1 === 0 ? n.toLocaleString() : n.toFixed(1);

function SliderGroup({ label, value, display, min, max, step, onChange }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6, gap: 10 }}>
        <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 17, color: '#f59e0b', fontWeight: 700, whiteSpace: 'nowrap' }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)}
        style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 3, outline: 'none', WebkitAppearance: 'none', cursor: 'pointer', border: 'none', padding: 0 }} />
    </div>
  );
}

function ResultRow({ label, value, sub = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <span style={{ fontSize: sub ? 13 : 15, color: sub ? 'rgba(255,255,255,0.58)' : 'rgba(255,255,255,0.82)' }}>{label}</span>
      <strong style={{ fontSize: sub ? 13 : 17, color: sub ? 'rgba(255,255,255,0.5)' : '#fff', fontWeight: 700 }}>{value}</strong>
    </div>
  );
}

function StreamLabel({ children, first = false }) {
  return (
    <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginTop: first ? 0 : 12, marginBottom: 5 }}>{children}</span>
  );
}

export default function EcommerceCalculators() {
  // Calculator 1 state
  const [c1Orders, setC1Orders] = useState(500);
  const [c1New, setC1New] = useState(70);
  const [c1Aov, setC1Aov] = useState(115);
  const [c1Price, setC1Price] = useState(249);
  const [c1Ltv, setC1Ltv] = useState(0);

  // Calculator 2 state
  const [c2Lapsed, setC2Lapsed] = useState(1000);
  const [c2Aov, setC2Aov] = useState(115);
  const [c2Price, setC2Price] = useState(249);

  // Calc 1 results
  const price1 = c1Price / 100;
  const newPct = c1New / 100;
  const firstBuyers = Math.round(c1Orders * newPct);
  const monthlyCost = firstBuyers * price1;
  const annualCost = monthlyCost * 12;
  const newRepeats = Math.round(firstBuyers * 0.10);
  const addRevMonth = newRepeats * c1Aov;
  const addRevYear = addRevMonth * 12;
  const roi1 = annualCost > 0 ? addRevYear / annualCost : 0;
  const ltvTotal = c1Ltv > 0 ? newRepeats * 12 * c1Ltv : 0;

  // Calc 2 results
  const price2 = c2Price / 100;
  const emailRecovered = Math.round(c2Lapsed * 0.02);
  const cardRecovered = Math.round(c2Lapsed * 0.08);
  const emailRev = emailRecovered * c2Aov * 2.5;
  const cardRev = cardRecovered * c2Aov * 2.5;
  const cardCost = c2Lapsed * price2;
  const uplift = cardRev - emailRev;
  const roi2 = cardCost > 0 ? cardRev / cardCost : 0;

  const inputColStyle = { padding: 20 };
  const resultColStyle = { padding: 20 };

  return (
    <section id="the-math" style={{ background: '#1a2d4a', padding: '64px 0 36px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <span style={{ display: 'inline-block', fontSize: 14, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: 8, color: '#f59e0b' }}>ROI Calculators</span>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 'clamp(1.4rem, 4.8vw, 2.3rem)', lineHeight: 1.12, color: '#fff', marginBottom: 10 }}>Run Your Own Numbers</h2>
        <p style={{ fontSize: 19, lineHeight: 1.44, maxWidth: 700, marginBottom: 26, color: 'rgba(255,255,255,0.82)' }}>
          Adjust the sliders to match your store. We use a 10% repeat-purchase lift as our conservative floor. The peer-reviewed research showed significantly higher.
        </p>

        {/* CALCULATOR 1 */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, overflow: 'hidden', marginTop: 26 }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 900, color: '#f59e0b', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>Calculator 1</span>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>First-Time Buyer Program</span>
          </div>
          <div className="ec-calc-body-wrap">
            <div style={inputColStyle} className="ec-calc-inputs">
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: 13, paddingBottom: 7, borderBottom: '2px solid rgba(255,122,0,0.3)' }}>Your Store</span>
              <SliderGroup label="Monthly Orders" value={c1Orders} display={c1Orders.toLocaleString()} min={50} max={5000} step={50} onChange={setC1Orders} />
              <SliderGroup label="% First-Time Buyers" value={c1New} display={c1New + '%'} min={20} max={95} step={5} onChange={setC1New} />
              <SliderGroup label="Average Order Value" value={c1Aov} display={'$' + c1Aov} min={20} max={500} step={5} onChange={setC1Aov} />
              <SliderGroup label="Price Per Card (all-in)" value={c1Price} display={'$' + (c1Price / 100).toFixed(2)} min={200} max={400} step={1} onChange={setC1Price} />
              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, padding: '11px 13px', marginTop: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: 5 }}>Fixed Assumption</span>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.24, margin: 0 }}>
                  Repeat-purchase lift: <strong style={{ color: '#fff' }}>+10%</strong> conservative floor. The Maryland/Yonsei study showed approximately 2x future spending. DonorsChoose showed 38% repeat lift. We use 10% to understate the impact.
                </p>
              </div>
            </div>
            <div style={resultColStyle} className="ec-calc-results">
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: 13, paddingBottom: 7, borderBottom: '2px solid rgba(255,122,0,0.3)' }}>What It Produces</span>
              <StreamLabel first>Cards Sent</StreamLabel>
              <ResultRow label="First-time buyers / month" value={fmtN(firstBuyers)} sub />
              <ResultRow label="Cards sent / month" value={fmtN(firstBuyers)} sub />
              <StreamLabel>Program Cost</StreamLabel>
              <ResultRow label="Monthly cost" value={fmt$(monthlyCost)} sub />
              <ResultRow label="Annual cost" value={fmt$(annualCost)} sub />
              <StreamLabel>Revenue Impact</StreamLabel>
              <ResultRow label="Additional repeat purchases / month" value={fmtN(newRepeats)} />
              <ResultRow label="Additional revenue / month" value={fmt$(addRevMonth)} />
              <ResultRow label="Additional revenue / year" value={fmt$(addRevYear)} />
              <div style={{ background: '#FF7A00', borderRadius: 6, padding: '13px 16px', marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.24 }}>Annual ROI on program</span>
                <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', marginLeft: 12 }}>{roi1.toFixed(1)}x</strong>
              </div>
              {/* LTV slider */}
              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, padding: '12px 14px', marginTop: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: 6 }}>Factor In Customer Lifetime Value</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.82)' }}>Est. LTV beyond first repeat</span>
                  <span style={{ fontSize: 17, color: '#f59e0b', fontWeight: 700 }}>{fmt$(c1Ltv)}</span>
                </div>
                <input type="range" min={0} max={1000} step={10} value={c1Ltv} onChange={e => setC1Ltv(+e.target.value)}
                  style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 3, outline: 'none', WebkitAppearance: 'none', cursor: 'pointer', border: 'none', padding: 0 }} />
                <div style={{ marginTop: 9, paddingTop: 9, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.24 }}>
                  {c1Ltv > 0
                    ? <><strong style={{ color: '#fff', fontSize: 17 }}>{fmt$(ltvTotal)}</strong> estimated total lifetime value from recovered customers per year at your stated LTV of {fmt$(c1Ltv)} per customer.</>
                    : <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: 13, margin: 0 }}>Slide up to factor in the full lifetime value of each recovered customer.</p>
                  }
                </div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(220,220,220,0.55)', padding: '11px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', lineHeight: 1.24 }}>
            10% lift is conservative floor based on peer-reviewed research. Price slider reflects all-in cost including postage. Individual results vary by product category.
          </div>
        </div>

        {/* CALCULATOR 2 */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, overflow: 'hidden', marginTop: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 900, color: '#f59e0b', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>Calculator 2</span>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Win-Back Program</span>
          </div>
          <div className="ec-calc-body-wrap">
            <div style={inputColStyle} className="ec-calc-inputs">
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: 13, paddingBottom: 7, borderBottom: '2px solid rgba(255,122,0,0.3)' }}>Your Lapsed Customer List</span>
              <SliderGroup label="Lapsed Customers (90+ days)" value={c2Lapsed} display={c2Lapsed.toLocaleString()} min={100} max={20000} step={100} onChange={setC2Lapsed} />
              <SliderGroup label="Average Order Value" value={c2Aov} display={'$' + c2Aov} min={20} max={500} step={5} onChange={setC2Aov} />
              <SliderGroup label="Price Per Card (all-in)" value={c2Price} display={'$' + (c2Price / 100).toFixed(2)} min={200} max={400} step={1} onChange={setC2Price} />
              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, padding: '11px 13px', marginTop: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: 5 }}>Fixed Assumptions</span>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.24, margin: 0 }}>
                  Email win-back: <strong style={{ color: '#fff' }}>2%</strong> response (industry average)<br />
                  Card win-back: <strong style={{ color: '#fff' }}>8%</strong> response (physical mail averages 4x email)<br />
                  Future purchases per recovered customer: <strong style={{ color: '#fff' }}>2.5</strong>
                </p>
              </div>
            </div>
            <div style={resultColStyle} className="ec-calc-results">
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: 13, paddingBottom: 7, borderBottom: '2px solid rgba(255,122,0,0.3)' }}>Email vs. Card</span>
              <StreamLabel first>Email Win-Back</StreamLabel>
              <ResultRow label="Customers recovered" value={fmtN(emailRecovered)} sub />
              <ResultRow label="Revenue recovered" value={fmt$(emailRev)} sub />
              <StreamLabel>NurturInk Handwritten Card</StreamLabel>
              <ResultRow label="Customers recovered" value={fmtN(cardRecovered)} />
              <ResultRow label="Revenue recovered" value={fmt$(cardRev)} />
              <ResultRow label="Cost of card program" value={fmt$(cardCost)} sub />
              <ResultRow label="Additional revenue vs. email alone" value={fmt$(uplift)} />
              <div style={{ background: '#FF7A00', borderRadius: 6, padding: '13px 16px', marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.24 }}>ROI on card spend</span>
                <strong style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', marginLeft: 12 }}>{roi2.toFixed(1)}x</strong>
              </div>
              {c1Ltv > 0 && (
                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, padding: '12px 14px', marginTop: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: 6 }}>Lifetime Value Impact</span>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.24, margin: 0 }}>
                    At your stated LTV of <strong style={{ color: '#fff' }}>{fmt$(c1Ltv)}</strong>, recovered customers represent <strong style={{ color: '#fff' }}>{fmt$(cardRecovered * c1Ltv)}</strong> in total estimated lifetime value.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(220,220,220,0.55)', padding: '11px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', lineHeight: 1.24 }}>
            Email 2% win-back is industry benchmark. Card 8% is conservative, direct mail averages 4x email response. All-in price includes postage. Lifetime value pulls from Calculator 1 slider if set.
          </div>
        </div>
      </div>

      <style>{`
        .ec-calc-body-wrap { display: block; }
        .ec-calc-inputs { padding: 16px; }
        .ec-calc-results { padding: 16px; }
        @media (min-width: 1024px) {
          .ec-calc-body-wrap { display: grid !important; grid-template-columns: 1fr 1fr; }
          .ec-calc-inputs { padding: 20px 24px !important; border-right: 1px solid rgba(255,255,255,0.08); }
          .ec-calc-results { padding: 20px 24px !important; }
        }
      `}</style>
    </section>
  );
}