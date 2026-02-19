import React from 'react';

/**
 * InsurancePSL — SECTION 6: PSL FORMULA
 * Cloned from RoofingPSL
 */
const cards = [
  { letter: 'P', title: 'Proximity', body: 'You are not a roofing company sending mass mail. You are the crew that just finished a job on their street, or the inspector who just assessed storm damage nearby. Geographic context makes it feel like a neighbor reaching out, not a marketing campaign.' },
  { letter: 'S', title: 'Situation', body: 'Mention the job, the storm event, the age of roofs in the neighborhood, or whatever makes this outreach timely and specific. A reason that is true and relevant earns attention that a generic offer never will.' },
  { letter: 'L', title: 'Low-Barrier Ask', body: 'No pressure. No urgency. Just an offer for a free look while you are already nearby. An easy yes. No commitment required. One small, reasonable next step.' },
];

export default function InsurancePSL() {
  return (
    <section style={{ background: '#213659', padding: '80px 40px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '14px' }}>
          Neighborhood Prospecting Formula
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', marginBottom: '16px' }}>
          The PSL Method for Roofing
        </h2>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, maxWidth: '700px' }}>
          Whether following up after a job or reaching out after a storm, this three-part structure makes a cold note feel personal and specific. It works because it leads with real context instead of a sales pitch.
        </p>

        <div className="insurance-psl-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginTop: '40px' }}>
          {cards.map((c, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '5px', padding: '28px 24px', transition: 'background 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            >
              <span className="font-sora" style={{ fontSize: '3rem', fontWeight: 900, color: '#f59e0b', display: 'block', lineHeight: 1, marginBottom: '12px' }}>{c.letter}</span>
              <h3 className="font-sora" style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>{c.title}</h3>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.5 }}>{c.body}</p>
            </div>
          ))}
        </div>

        {/* Sample note */}
        <div style={{
          marginTop: '32px', background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)', borderRadius: '5px', padding: '26px 30px',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: '10px' }}>Sample Note — Neighborhood Radius</span>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.62, fontStyle: 'italic' }}>
            "Hi [Name], we just finished a roof replacement a few houses down on [street]. Since we're already set up in the neighborhood, I wanted to reach out personally. Roofs in this area are all about the same age, and I'd be glad to take a quick look at yours while we're close. Free, no pressure, just a few minutes. Give me a call at [number] and I'll stop by whenever works for you."
          </p>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .insurance-psl-grid { grid-template-columns: 1fr !important; }
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}