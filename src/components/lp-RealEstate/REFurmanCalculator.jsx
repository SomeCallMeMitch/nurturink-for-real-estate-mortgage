import React, { useState } from 'react';

/**
 * REFurmanCalculator — "What Would the Furman Card System Produce for Your Business?"
 * Placed directly below REFurmanSection, sharing the same navy-mid (#213659) background.
 * Amber top border visually connects it to the Furman content above.
 *
 * Column labels: 17px, orange (#FF7A00), centered — matching RECalculator convention.
 */

const CARD_COST = 2.49;
const fmt$ = (n) => '$' + Math.round(n).toLocaleString();
const fmtN = (n) => (n % 1 === 0) ? n.toLocaleString() : parseFloat(n.toFixed(1)).toLocaleString();

function SliderGroup({ label, display, value, min, max, step, onChange, hints }) {
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
      {hints && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>{hints[0]}</span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>{hints[1]}</span>
        </div>
      )}
    </div>
  );
}

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

function StreamLabel({ children }) {
  return (
    <div style={{
      fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: '#f59e0b',
      display: 'block', marginTop: '10px', marginBottom: '6px',
    }}>{children}</div>
  );
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.12)', margin: '16px 0' }} />;
}

export default function REFurmanCalculator() {
  const [contacts,    setContacts]    = useState(200);
  const [cardsPerWk,  setCardsPerWk]  = useState(5);
  const [commission,  setCommission]  = useState(9000);
  const [convDivisor, setConvDivisor] = useState(75);

  // Calculations
  const annualCards = cardsPerWk * 52;
  const coverage    = Math.min(contacts, annualCards);
  const cost        = annualCards * CARD_COST;
  const refConvos   = annualCards / convDivisor;
  const closedTx    = refConvos * 0.50;
  const refVal      = closedTx * commission;

  return (
    <section style={{ padding: '0 40px 80px', background: '#213659' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Calc box — amber top border connects to Furman section above */}
        <div className="re-furman-calc-box">

          {/* Header — full width, inside the box */}
          <div style={{
            gridColumn: '1 / -1',
            paddingBottom: '32px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '8px',
          }}>
            <span style={{
              display: 'inline-block', fontSize: '14px', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#f59e0b', marginBottom: '12px',
            }}>Run Your Own Numbers</span>
            <h3 className="font-sora" style={{
              fontSize: '1.5rem', fontWeight: 900,
              color: '#ffffff', marginBottom: '8px', lineHeight: 1.2,
            }}>
              What Would the Furman Card System Produce for Your Business?
            </h3>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.80)', lineHeight: 1.6, maxWidth: '700px' }}>
              Five cards a week built Amanda Furman a 98% referral business. Use the sliders below to see what a consistent card habit could produce for yours — even the most conservative scenario shows strong ROI at $2.49 per card.
            </p>
          </div>

          {/* LEFT: INPUTS */}
          <div>
            {/* Column label — 17px, orange, centered */}
            <span style={{
              fontSize: '17px', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#FF7A00',
              marginBottom: '32px', display: 'block', textAlign: 'center',
            }}>Your Inputs</span>

            <SliderGroup
              label="Past Clients &amp; Prospects in Your Sphere"
              display={contacts.toLocaleString()}
              value={contacts} min={25} max={600} step={25}
              onChange={setContacts}
            />
            <SliderGroup
              label="Cards Per Week"
              display={cardsPerWk}
              value={cardsPerWk} min={1} max={20} step={1}
              onChange={setCardsPerWk}
            />
            <SliderGroup
              label="Average Commission Per Transaction"
              display={fmt$(commission)}
              value={commission} min={3000} max={30000} step={500}
              onChange={setCommission}
            />
            <SliderGroup
              label="Cards That Generate a Referral Conversation"
              display={'1 in ' + convDivisor}
              value={convDivisor} min={50} max={100} step={5}
              onChange={setConvDivisor}
              hints={['1 in 50 — optimistic', '1 in 100 — conservative']}
            />

            {/* Info box */}
            <div style={{
              marginTop: '8px',
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: '6px', padding: '18px 20px',
            }}>
              <span style={{
                fontSize: '13px', fontWeight: 700, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: '#f59e0b',
                display: 'block', marginBottom: '8px',
              }}>Why This Range?</span>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.80)', lineHeight: 1.6 }}>
                Even at 1 in 100 — one referral conversation for every 100 cards sent — the math still produces a meaningful pipeline at just $2.49 per card. Slide left for the optimistic view. The point: almost any reasonable assumption shows strong ROI.
              </p>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div>
            {/* Column label — 17px, orange, centered */}
            <span style={{
              fontSize: '17px', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#FF7A00',
              marginBottom: '32px', display: 'block', textAlign: 'center',
            }}>What the System Produces</span>

            <StreamLabel>Annual Activity</StreamLabel>
            <ResultRow label="Cards sent per year"                    value={fmtN(annualCards)} sub />
            <ResultRow label="Sphere contacts touched per year"       value={fmtN(coverage) + ' of ' + contacts.toLocaleString()} sub />
            <ResultRow label="Annual program cost"                    value={fmt$(cost)} sub />

            <Divider />
            <StreamLabel>Referral Pipeline</StreamLabel>
            <ResultRow label="Referral conversations generated"       value={fmtN(refConvos)} />
            <ResultRow label="Closed transactions (50% of conversations)" value={fmtN(closedTx)} />
            <ResultRow label="Referral commission value"              value={fmt$(refVal)} />

            <Divider />
            <ResultRow label="Annual program cost"  value={fmt$(cost)}   sub />
            <ResultRow label="Total referral revenue" value={fmt$(refVal)} sub />

            {/* ROI highlight box */}
            <div style={{
              background: '#FF7A00', borderRadius: '6px',
              padding: '20px 24px', marginTop: '24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', lineHeight: 1.35 }}>
                Annual value<br />of the system
              </span>
              <strong className="font-sora" style={{
                fontSize: 'clamp(1.9rem, 3vw, 2.5rem)', fontWeight: 900,
                color: '#ffffff', whiteSpace: 'nowrap', marginLeft: '16px',
              }}>
                {fmt$(refVal)}
              </strong>
            </div>
          </div>

          {/* Full-width footnote */}
          <p style={{
            fontSize: '14px', color: 'rgba(255,255,255,0.55)',
            marginTop: '22px', lineHeight: 1.6, gridColumn: '1 / -1',
            borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px',
          }}>
            The referral conversation rate (1 in 50 to 1 in 100) is a conservative estimate — separate from Amanda Furman's documented personal response rate of 9.9 in 10. Her figure measures how many people reach out to thank her; this calculator measures how many of those contacts eventually generate a referral conversation, which is a much lower and more conservative number. 50% of referral conversations assumed to close. Card cost is $2.49 per card, postage included. Individual results will vary.
          </p>

        </div>
      </div>

      <style>{`
        .re-furman-calc-box {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          border-top: 4px solid #f59e0b;
          border-radius: 0 0 8px 8px;
          padding: 44px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
        }
        @media (max-width: 860px) {
          .re-furman-calc-box { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 768px) {
          section { padding: 0 24px 60px !important; }
        }
      `}</style>
    </section>
  );
}