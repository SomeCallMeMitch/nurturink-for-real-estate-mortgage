import React, { useState } from 'react';

/**
 * RECalculator — SECTION 8: THREE-PANEL TABBED ROI CALCULATORS
 * Replaces the previous single calculator per brief dated 2026-02-19.
 *
 * Panel 1: What Is My Database Worth?
 * Panel 2: The Furman System
 * Panel 3: What Does One Referral Cost Me?
 *
 * All calculations are live (no submit button).
 * Card cost fixed at $2.49 across all panels.
 * Design tokens match existing RE landing page exactly.
 */

const CARD_COST = 2.49;

// ── UTILITIES ──
const fmt$ = (n) => '$' + Math.round(n).toLocaleString();
const fmtN = (n) => Number.isInteger(n) ? n.toLocaleString() : parseFloat(n.toFixed(1)).toLocaleString();

// ── SUB-COMPONENTS ──
function SliderGroup({ label, value, display, min, max, step, onChange }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
        <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>{label}</span>
        <strong style={{ fontSize: '16px', color: '#f59e0b', fontWeight: 700, minWidth: '80px', textAlign: 'right' }}>{display}</strong>
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

function ResultRow({ label, value, sub }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      <span style={{ fontSize: sub ? '14px' : '15px', color: sub ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.65)' }}>{label}</span>
      <strong style={{ fontSize: sub ? '15px' : '16px', color: sub ? 'rgba(255,255,255,0.6)' : '#ffffff', fontWeight: 700 }}>{value}</strong>
    </div>
  );
}

function StreamLabel({ children }) {
  return (
    <div style={{
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: '#f59e0b',
      marginBottom: '4px', marginTop: '8px',
    }}>{children}</div>
  );
}

function ResultHighlight({ label, value }) {
  return (
    <div style={{
      background: '#FF7A00', borderRadius: '6px', padding: '18px 22px', marginTop: '20px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}
        dangerouslySetInnerHTML={{ __html: label }} />
      <strong className="font-sora" style={{
        fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 900,
        color: '#ffffff', whiteSpace: 'nowrap', marginLeft: '16px',
      }}>{value}</strong>
    </div>
  );
}

function CalcNote({ children }) {
  return (
    <p style={{
      fontSize: '12.5px', color: 'rgba(255,255,255,0.28)',
      marginTop: '18px', lineHeight: 1.55,
    }}>{children}</p>
  );
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '14px 0' }} />;
}

function PanelColLabel({ children }) {
  return (
    <span style={{
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
      marginBottom: '28px', display: 'block',
    }}>{children}</span>
  );
}

// ══════════════════════════════════════════════
// PANEL 1: DATABASE WORTH
// ══════════════════════════════════════════════
function Panel1() {
  const [contacts,   setContacts]   = useState(150);
  const [commission, setCommission] = useState(9000);
  const [cards,      setCards]      = useState(3);
  const [refrate,    setRefrate]    = useState(5);

  const totalCards = contacts * cards;
  const cost       = totalCards * CARD_COST;
  const refs       = contacts * (refrate / 100);
  const refVal     = refs * commission;
  const roi        = cost > 0 ? refVal / cost : 0;

  return (
    <div className="re-calc-panel-grid">
      {/* LEFT */}
      <div>
        <PanelColLabel>Your Database</PanelColLabel>
        <SliderGroup label="Past Clients &amp; Prospects"        value={contacts}   display={contacts.toLocaleString()} min={25}   max={600}   step={25}  onChange={setContacts} />
        <SliderGroup label="Average Commission Per Transaction"  value={commission} display={fmt$(commission)}           min={3000} max={30000} step={500} onChange={setCommission} />
        <SliderGroup label="Cards Per Contact Per Year"          value={cards}      display={cards}                      min={1}    max={6}     step={1}   onChange={setCards} />
        <SliderGroup label="Referral Rate With Consistent Follow-Up" value={refrate} display={refrate + '%'}             min={2}    max={15}    step={1}   onChange={setRefrate} />
      </div>

      {/* RIGHT */}
      <div>
        <PanelColLabel>What the Program Produces</PanelColLabel>
        <StreamLabel>Annual Program</StreamLabel>
        <ResultRow label="Total cards per year"       value={fmtN(totalCards)} sub />
        <ResultRow label="Annual program cost"        value={fmt$(cost)}       sub />
        <Divider />
        <StreamLabel>Referral Pipeline</StreamLabel>
        <ResultRow label="Referrals generated per year"   value={fmtN(refs)} />
        <ResultRow label="Commission value from referrals" value={fmt$(refVal)} />
        <Divider />
        <ResultRow label="Annual cost"     value={fmt$(cost)}   sub />
        <ResultRow label="Referral revenue" value={fmt$(refVal)} sub />
        <ResultHighlight label="Return on<br>Investment" value={fmtN(roi) + 'x'} />
        <CalcNote>Referral rate is incremental — the additional referrals generated by staying systematically in touch vs. going silent. NAR data: 66% of sellers and 61% of buyers chose their agent through referral or past relationship. Individual results will vary.</CalcNote>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// PANEL 2: THE FURMAN SYSTEM
// ══════════════════════════════════════════════
function Panel2() {
  const [cardsPerWeek,  setCardsPerWeek]  = useState(5);
  const [commission,    setCommission]    = useState(9000);
  const [convDivisor,   setConvDivisor]   = useState(20);

  const annualCards = cardsPerWeek * 52;
  const responses   = Math.round(annualCards * 0.99);
  const cost        = annualCards * CARD_COST;
  const refConvos   = annualCards / convDivisor;
  const closedTx    = refConvos * 0.50;
  const refVal      = closedTx * commission;

  return (
    <div className="re-calc-panel-grid">
      {/* LEFT */}
      <div>
        <PanelColLabel>Your Version of the Furman System</PanelColLabel>
        <SliderGroup label="Handwritten Cards Per Week"              value={cardsPerWeek} display={cardsPerWeek}            min={1}  max={20} step={1}  onChange={setCardsPerWeek} />
        <SliderGroup label="Average Commission Per Transaction"      value={commission}   display={fmt$(commission)}         min={3000} max={30000} step={500} onChange={setCommission} />
        <SliderGroup label="Cards That Become Referral Conversations" value={convDivisor} display={'1 in ' + convDivisor}   min={10} max={50} step={5}  onChange={setConvDivisor} />

        {/* Fixed stat — her actual documented quote, not adjustable */}
        <div style={{
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: '5px', padding: '14px 18px', marginBottom: '28px',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: '6px' }}>
            Amanda Furman's Documented Response Rate
          </span>
          <span className="font-sora" style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', display: 'block', marginBottom: '4px' }}>
            9.9 out of 10
          </span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', display: 'block', lineHeight: 1.4 }}>
            "Whoever I send a card to reaches back out to let me know how much it meant to them." — Amanda Furman, 98% referral-based business. Source: BizBox Outside the Box Podcast, June 2025
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div>
        <PanelColLabel>What the System Produces</PanelColLabel>
        <StreamLabel>Annual Activity</StreamLabel>
        <ResultRow label="Cards sent per year"           value={fmtN(annualCards)} sub />
        <ResultRow label="People who respond (9.9 in 10)" value={fmtN(responses)} sub />
        <ResultRow label="Annual program cost"           value={fmt$(cost)}        sub />
        <Divider />
        <StreamLabel>Referral Pipeline</StreamLabel>
        <ResultRow label="Referral conversations generated" value={fmtN(refConvos)} />
        <ResultRow label="Closed referral transactions"      value={fmtN(closedTx)} />
        <ResultRow label="Referral commission value"         value={fmt$(refVal)} />
        <ResultHighlight label="Annual value<br>of the system" value={fmt$(refVal)} />
        <CalcNote>Response rate (9.9/10) is Amanda Furman's own reported figure from the BizBox podcast, June 2025 — not a NurturInk claim. Referral conversation rate and close rate are conservative estimates. 50% of referral conversations assumed to close. Individual results will vary.</CalcNote>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// PANEL 3: COST PER REFERRAL
// ══════════════════════════════════════════════
function Panel3() {
  const [contacts,   setContacts]   = useState(150);
  const [cards,      setCards]      = useState(3);
  const [commission, setCommission] = useState(9000);
  const [refs,       setRefs]       = useState(3);

  const totalCards  = contacts * cards;
  const annualCost  = totalCards * CARD_COST;
  const costPerRef  = refs > 0 ? annualCost / refs : 0;
  const yearsPaid   = annualCost > 0 ? parseFloat((commission / annualCost).toFixed(1)) : 0;

  return (
    <div className="re-calc-panel-grid">
      {/* LEFT */}
      <div>
        <PanelColLabel>Your Numbers</PanelColLabel>
        <SliderGroup label="Past Clients &amp; Prospects in Your Sphere" value={contacts}   display={contacts.toLocaleString()} min={25}   max={600}   step={25}  onChange={setContacts} />
        <SliderGroup label="Cards Per Contact Per Year"                  value={cards}      display={cards}                      min={1}    max={6}     step={1}   onChange={setCards} />
        <SliderGroup label="Average Commission Per Transaction"          value={commission} display={fmt$(commission)}            min={3000} max={30000} step={500} onChange={setCommission} />
        <SliderGroup label="Expected Referrals Per Year from Sphere"     value={refs}       display={refs}                       min={1}    max={20}    step={1}   onChange={setRefs} />
      </div>

      {/* RIGHT */}
      <div>
        <PanelColLabel>The Real Math</PanelColLabel>
        <StreamLabel>Program Cost</StreamLabel>
        <ResultRow label="Total cards per year"      value={fmtN(totalCards)} sub />
        <ResultRow label="Annual program cost"       value={fmt$(annualCost)} sub />
        <ResultRow label="Cost per referral generated" value={fmt$(costPerRef)} />
        <Divider />

        {/* Side-by-side cost vs commission */}
        <div className="re-cost-vs" style={{ display: 'flex', gap: '20px', marginTop: '20px', marginBottom: '20px' }}>
          <div style={{
            flex: 1, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '6px', padding: '20px 22px', textAlign: 'center',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.35)' }}>
              Cost to Generate<br />One Referral
            </span>
            <span className="font-sora" style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', display: 'block' }}>
              {fmt$(costPerRef)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sora, sans-serif', fontSize: '1.2rem', fontWeight: 900, color: 'rgba(255,255,255,0.35)', padding: '0 4px' }}>
            vs
          </div>
          <div style={{
            flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px', padding: '20px 22px', textAlign: 'center',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.35)' }}>
              Commission on<br />One Transaction
            </span>
            <span className="font-sora" style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', display: 'block' }}>
              {fmt$(commission)}
            </span>
          </div>
        </div>

        <ResultHighlight label="One referral pays for<br>the program for" value={yearsPaid + ' yrs'} />
        <CalcNote>Cost per referral = total annual card cost divided by expected referrals from sphere. Commission is per transaction. This compares your cost to generate one referral against what that referral pays. Card cost assumed at $2.49 per card, postage included.</CalcNote>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════
export default function RECalculator() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { num: 'Calculator 01', label: 'What Is My Database Worth?' },
    { num: 'Calculator 02', label: 'The Furman System' },
    { num: 'Calculator 03', label: 'What Does One Referral Cost Me?' },
  ];

  return (
    <section id="calculator" style={{ background: '#1a2d4a', padding: '80px 40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '14px' }}>
          ROI Calculators
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', marginBottom: '10px' }}>
          What Is Staying in Touch Actually Worth?
        </h2>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.55, maxWidth: '680px', marginBottom: '48px' }}>
          Three questions. Three simple calculators. Pick the one that matches how you think about your business.
        </p>

        {/* Tab switcher */}
        <div className="re-calc-tabs" style={{ display: 'flex', gap: 0, marginBottom: '32px', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                padding: '12px 24px', fontFamily: 'Lato, sans-serif',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                color: activeTab === i ? '#f59e0b' : 'rgba(255,255,255,0.65)',
                background: 'transparent', border: 'none',
                borderBottom: activeTab === i ? '3px solid #f59e0b' : '3px solid transparent',
                marginBottom: '-2px', transition: 'color 0.18s, border-color 0.18s',
                textAlign: 'left', lineHeight: 1.3,
              }}
            >
              <span style={{
                display: 'block', fontSize: '10px', letterSpacing: '0.1em',
                textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px',
                color: activeTab === i ? 'rgba(245,158,11,0.7)' : 'rgba(255,255,255,0.35)',
              }}>{tab.num}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel container */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '40px',
        }}>
          {activeTab === 0 && <Panel1 />}
          {activeTab === 1 && <Panel2 />}
          {activeTab === 2 && <Panel3 />}
        </div>
      </div>

      {/* Scoped styles */}
      <style>{`
        .re-calc-panel-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
        }
        .re-calc-tabs button:hover {
          color: #ffffff !important;
        }
        input[type=range] {
          width: 100%; height: 4px;
          background: rgba(255,255,255,0.15);
          border-radius: 2px; outline: none;
          -webkit-appearance: none; cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px;
          border-radius: 50%; background: #f59e0b;
          cursor: pointer; box-shadow: 0 2px 8px rgba(245,158,11,0.45);
          transition: transform 0.15s;
        }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.15); }
        input[type=range]::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: #f59e0b; cursor: pointer; border: none;
        }
        @media (max-width: 860px) {
          .re-calc-panel-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .re-calc-tabs { flex-direction: column !important; border-bottom: none !important; gap: 4px !important; }
          .re-calc-tabs button { border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 4px !important; margin-bottom: 0 !important; }
          .re-cost-vs { flex-direction: column !important; }
        }
        @media (max-width: 768px) {
          #calculator { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}