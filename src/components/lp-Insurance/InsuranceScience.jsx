import React from 'react';

/**
 * InsuranceScience — SECTION 7: SCIENCE / RESEARCH
 * Insurance-specific research cards per Step 10
 */
const cards = [
  {
    institution: 'Canada Post / TrueImpact Neuromarketing Study',
    finding: 'Physical mail requires 21% less cognitive effort — and produces 70% higher brand recall',
    body: "The brain treats something you can hold as more real and more trustworthy than something on a screen. The study's motivation-to-cognitive load ratio of 1.31 for physical mail (versus 0.87 for digital) puts it above the behavior-change threshold that digital consistently fails to reach.",
    source: 'fMRI and EEG study, 270 participants',
  },
  {
    institution: 'McKinsey & Company — Insurance Personalization Research',
    finding: 'Personalized trigger-based outreach delivers 20–40% lifts in key outcomes vs. generic campaigns',
    body: "McKinsey's research on insurance specifically found 10–15% revenue uplift and up to 20% better retention tied to personalization. Separately, 88% of insurance customers say they want more personalized contact from their agent. A handwritten card is the highest-signal form that desire can take.",
    source: 'McKinsey insurance personalization studies, 2018',
  },
  {
    institution: 'ClientCircle — Insurance Agency Data',
    finding: '2x more likely to refer. 7.5x more likely to leave a Google review.',
    body: "New clients who receive two handwritten cards in their first 60 days are twice as likely to refer friends and family. Birthday card recipients are 7.5x more likely to leave a Google review than clients who don't receive one. This is vendor data from their insurance agency client base — cited as directional, not an independent study.",
    source: 'ClientCircle insurance agency analytics',
  },
];

export default function InsuranceScience() {
  return (
    <section style={{ background: '#f2f1ee', padding: '80px 0' }}>
      {/* Widened inner container to 1200px */}
      <div className="insurance-sci-inner" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FF7A00', marginBottom: '14px' }}>
          The Research Behind It
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#1a2d4a', marginBottom: '16px' }}>
          Why Physical Mail Works Differently in the Brain
        </h2>
        <p style={{ fontSize: '17px', color: '#4a5568', lineHeight: 1.55, maxWidth: '700px' }}>
          The insurance industry already knows mail builds relationships — USPS data shows insurers are among the heaviest users of direct mail for loyalty, not acquisition. Handwritten notes are the premium tier of that established channel, backed by independent neuroscience on why physical outreach is processed and remembered differently than digital.
        </p>

        <div className="insurance-sci-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px', marginTop: '40px' }}>
          {cards.map((c, i) => (
            <div key={i} style={{
              background: '#ffffff', border: '1px solid #dde1e7', borderRadius: '5px',
              padding: '28px 24px', transition: 'box-shadow 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FF7A00', display: 'block', marginBottom: '10px' }}>{c.institution}</span>
              <div className="font-sora" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a2d4a', lineHeight: 1.25, marginBottom: '10px' }}>{c.finding}</div>
              <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.5 }}>{c.body}</p>
              <span style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginTop: '12px', fontStyle: 'italic' }}>{c.source}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .insurance-sci-inner { padding: 0 32px !important; }
        }
        @media (max-width: 768px) {
          .insurance-sci-inner { padding: 0 20px !important; }
          .insurance-sci-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}