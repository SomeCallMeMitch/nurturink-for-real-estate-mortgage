import React, { useState } from 'react';

/**
 * RECalculator — Single-panel "What Is Your Database Worth?" calculator
 * Replaces the three-tabbed calculator per brief 2026-02-19 (conservative version).
 *
 * Layout: two-column grid (inputs left, results right)
 * Card cost fixed at $2.49. All results update live on slider change.
 * Column labels are ~30% larger than source spec, orange (#FF7A00), centered.
 */

const CARD_COST = 2.49;
const fmt$ = (n) => '$' + Math.round(n).toLocaleString();
const fmtN = (n) => (n % 1 === 0) ? n.toLocaleString() : parseFloat(n.toFixed(1)).toLocaleString();

// ── Slider row ──
function SliderGroup({ label, display, value, min, max, step, onChange }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px', gap: '12px' }}>
        <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: '18px', color: '#f59e0b', fontWeight: 700, whiteSpace: 'nowrap' }}>{display}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  );
}

// ── Result row ──
function ResultRow({ label, value, sub }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.09)',
    }}>
      <span style={{ fontSize: sub ? '15px' : '16px', color: sub ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.80)' }}>{label}</span>
      <strong style={{ fontSize: sub ? '15px' : '17px', color: sub ? 'rgba(255,255,255,0.65)' : '#ffffff', fontWeight: sub ? 600 : 700 }}>{value}</strong>
    </div>
  );
}

// ── Stream label ──
function StreamLabel({ children }) {
  return (
    <div style={{
      fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: '#f59e0b',
      display: 'block', marginTop: '10px', marginBottom: '6px',
    }}>{children}</div>
  );
}

// ── Divider ──
function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.12)', margin: '16px 0' }} />;
}

export default function RECalculator() {
  const [contacts,   setContacts]   = useState(150);
  const [cards,      setCards]      = useState(3);
  const [commission, setCommission] = useState(9000);
  const [refs,       setRefs]       = useState(3);

  // Calculations
  const totalCards  = contacts * cards;
  const cost        = totalCards * CARD_COST;
  const costPerRef  = refs > 0 ? cost / refs : 0;
  const refVal      = refs * commission;
  const yearsPaid   = cost > 0 ? (commission / cost).toFixed(1) : '0.0';

  return (
    <section id="calculator" style={{ padding: '80px 40px', background: '#1a2d4a' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Section header */}
        <span style={{
          display: 'inline-block', fontSize: '14px', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: '#f59e0b', marginBottom: '14px',
        }}>ROI Calculator</span>

        <h2 className="font-sora" style={{
          fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800,
          lineHeight: 1.15, color: '#ffffff', marginBottom: '10px',
        }}>
          What Is Your Database Worth?
        </h2>

        <p style={{
          fontSize: '18px', color: 'rgba(255,255,255,0.80)',
          lineHeight: 1.6, maxWidth: '680px', marginBottom: '40px',
        }}>
          Your past clients already know you and trust you. Run the numbers to see what staying in touch is actually worth — and what one referral costs you to generate.
        </p>

        {/* Calculator panel */}
        <div className="re-calc-box">

          {/* LEFT: INPUTS */}
          <div>
            {/* Column label — 30% larger than original 13px → ~17px, orange, centered */}
            <span style={{
              fontSize: '17px', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#FF7A00',
              marginBottom: '32px', display: 'block', textAlign: 'center',
            }}>Your Numbers</span>

            <SliderGroup
              label="Past Clients &amp; Prospects"
              display={contacts.toLocaleString()}
              value={contacts} min={25} max={600} step={25}
              onChange={setContacts}
            />
            <SliderGroup
              label="Cards Per Contact Per Year"
              display={cards}
              value={cards} min={1} max={6} step={1}
              onChange={setCards}
            />
            <SliderGroup
              label="Average Commission Per Transaction"
              display={fmt$(commission)}
              value={commission} min={3000} max={30000} step={500}
              onChange={setCommission}
            />
            <SliderGroup
              label="Referrals Expected Per Year from Sphere"
              display={refs}
              value={refs} min={1} max={20} step={1}
              onChange={setRefs}
            />

            {/* Cost vs Commission callout */}
            <div style={{
              marginTop: '32px', background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '6px', padding: '22px 24px',
            }}>
              <span style={{
                fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
                display: 'block', marginBottom: '16px',
              }}>Cost to Generate One Referral vs. What It Pays</span>

              <div className="re-cpr-boxes">
                {/* Amber box */}
                <div style={{
                  flex: 1, textAlign: 'center',
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.4)',
                  borderRadius: '5px', padding: '16px 12px',
                }}>
                  <span style={{
                    fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', display: 'block',
                    marginBottom: '8px', color: '#f59e0b',
                  }}>Your Cost Per Referral</span>
                  <span className="font-sora" style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b', display: 'block' }}>
                    {fmt$(costPerRef)}
                  </span>
                </div>

                <div style={{
                  fontFamily: 'Sora, sans-serif', fontSize: '1rem',
                  fontWeight: 900, color: 'rgba(255,255,255,0.55)', flexShrink: 0,
                }}>vs</div>

                {/* Neutral box */}
                <div style={{
                  flex: 1, textAlign: 'center',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '5px', padding: '16px 12px',
                }}>
                  <span style={{
                    fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', display: 'block',
                    marginBottom: '8px', color: 'rgba(255,255,255,0.55)',
                  }}>Commission on One Deal</span>
                  <span className="font-sora" style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', display: 'block' }}>
                    {fmt$(commission)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div>
            {/* Column label — 30% larger, orange, centered */}
            <span style={{
              fontSize: '17px', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#FF7A00',
              marginBottom: '32px', display: 'block', textAlign: 'center',
            }}>What the Program Produces</span>

            <StreamLabel>Program Cost</StreamLabel>
            <ResultRow label="Total cards per year"       value={fmtN(totalCards)} sub />
            <ResultRow label="Annual program cost"        value={fmt$(cost)}       sub />
            <ResultRow label="Cost per referral generated" value={fmt$(costPerRef)} sub />

            <Divider />
            <StreamLabel>Referral Pipeline</StreamLabel>
            <ResultRow label="Referrals generated per year"    value={fmtN(refs)} />
            <ResultRow label="Commission value from referrals" value={fmt$(refVal)} />

            <Divider />
            <ResultRow label="Annual program cost"   value={fmt$(cost)}   sub />
            <ResultRow label="Total referral revenue" value={fmt$(refVal)} sub />

            {/* ROI highlight */}
            <div style={{
              background: '#FF7A00', borderRadius: '6px',
              padding: '20px 24px', marginTop: '24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', lineHeight: 1.35 }}>
                One referral pays for<br />the program for
              </span>
              <strong className="font-sora" style={{
                fontSize: 'clamp(1.9rem, 3vw, 2.5rem)', fontWeight: 900,
                color: '#ffffff', whiteSpace: 'nowrap', marginLeft: '16px',
              }}>
                {yearsPaid} yrs
              </strong>
            </div>
          </div>

          {/* Full-width footnote */}
          <p style={{
            fontSize: '14px', color: 'rgba(255,255,255,0.55)',
            marginTop: '22px', lineHeight: 1.6, gridColumn: '1 / -1',
            borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px',
          }}>
            Cost per referral = annual card cost ÷ referrals expected from your sphere. Card cost is $2.49 per card, postage included. "One referral pays for the program for X years" = your average commission ÷ annual card cost. Individual results will vary.
          </p>
        </div>
      </div>

      {/* Scoped styles */}
      <style>{`
        .re-calc-box {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px; padding: 44px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
        }
        .re-cpr-boxes {
          display: flex; gap: 14px; align-items: center;
        }
        input[type=range] {
          width: 100%; height: 5px;
          background: rgba(255,255,255,0.2);
          border-radius: 3px; outline: none;
          -webkit-appearance: none; cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 24px; height: 24px;
          border-radius: 50%; background: #f59e0b;
          cursor: pointer; box-shadow: 0 2px 10px rgba(245,158,11,0.5);
          transition: transform 0.15s;
        }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.15); }
        input[type=range]::-moz-range-thumb {
          width: 24px; height: 24px; border-radius: 50%;
          background: #f59e0b; cursor: pointer; border: none;
        }
        @media (max-width: 860px) {
          .re-calc-box { grid-template-columns: 1fr !important; gap: 40px !important; }
          .re-cpr-boxes { flex-direction: column !important; }
        }
        @media (max-width: 768px) {
          #calculator { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}