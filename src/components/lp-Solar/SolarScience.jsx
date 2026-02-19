import React from 'react';

/**
 * SolarScience — SECTION 7: SCIENCE / RESEARCH
 * bg #f2f1ee, 3-col grid of research cards
 */
const cards = [
  {
    institution: 'Canada Post / TrueImpact, 2015',
    finding: 'Physical mail requires 21% less cognitive effort to process than digital',
    body: "The brain doesn't have to work as hard. Physical mail just lands. The study also found a motivation-to-cognitive load ratio of 1.31 for physical mail versus 0.87 for digital. Scores above 1.0 are associated with behavior change. Digital typically doesn't cross that threshold.",
    source: 'fMRI and EEG study, 270 participants',
  },
  {
    institution: 'Temple University fMRI Study / USPS OIG, 2015',
    finding: 'Physical mail activates emotional and memory centers simultaneously',
    body: "Brain imaging showed physical mail creating cross-lobe integration — visual, emotional, and memory regions activating at the same time. The emotional processing regions triggered are directly wired to memory formation. That is why your client remembers the card two years later but not last week's email.",
    source: 'fMRI comparison: physical postcards vs. digital email',
  },
  {
    institution: 'Norwegian Univ. of Science & Technology, Frontiers in Psychology 2024',
    finding: 'Handwriting produces brain connectivity patterns linked to memory formation',
    body: 'A high-density EEG study found that handwriting produced significantly increased connectivity in theta and alpha frequency bands — the neural patterns associated with memory encoding. This connectivity appeared during handwriting and not during typing. When a client sees handwriting on an envelope, something registers before they even open it.',
    source: '256-channel EEG study on handwriting vs. typing',
  },
];

export default function SolarScience() {
  return (
    <section style={{ background: '#f2f1ee', padding: '80px 40px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FF7A00', marginBottom: '14px' }}>
          The Research Behind It
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#1a2d4a', marginBottom: '16px' }}>
          What Brain Scans Actually Show About Physical Mail
        </h2>
        <p style={{ fontSize: '17px', color: '#4a5568', lineHeight: 1.55, maxWidth: '700px' }}>
          Canada Post partnered with neuromarketing firm TrueImpact to put participants in fMRI machines and measure how the brain processes physical mail versus digital. The results weren't subtle. Here is what the science shows, across four independent studies.
        </p>

        <div className="solar-sci-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px', marginTop: '40px' }}>
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
        @media (max-width: 768px) {
          .solar-sci-grid { grid-template-columns: 1fr !important; }
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}