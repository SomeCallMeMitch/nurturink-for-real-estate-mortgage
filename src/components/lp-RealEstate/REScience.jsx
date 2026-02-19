import React from 'react';

/**
 * REScience — SECTION 7: SCIENCE / RESEARCH
 * Real Estate: blue accent, RE-specific research cards
 */
const cards = [
  {
    institution: 'Canada Post / TrueImpact Neuromarketing Study',
    finding: 'Physical mail requires 21% less cognitive effort — and produces 70% higher brand recall',
    body: "The brain treats something you can hold as more real and more trustworthy than something on a screen. The study's motivation-to-cognitive load ratio of 1.31 for physical mail (versus 0.87 for digital) puts it above the behavior-change threshold that digital consistently fails to reach.",
    source: 'fMRI and EEG study, 270 participants',
  },
  {
    institution: 'National Association of REALTORS® (NAR)',
    finding: '89% of sellers would use their agent again — but only 27% actually do',
    body: "The gap between satisfaction and repeat business is entirely a follow-up problem. NAR data consistently shows that agents who maintain personalized post-transaction contact capture repeat and referral business at rates 3-5x higher than those who rely on email drip campaigns alone. A handwritten card is the highest-signal form of that follow-up.",
    source: 'NAR Profile of Home Buyers and Sellers, 2023',
  },
  {
    institution: 'DMA / Direct Marketing Association',
    finding: '3-9x higher response rate on handwritten direct mail vs. digital outreach',
    body: "The DMA's response rate data shows that physical mail consistently outperforms digital channels for response rates. Handwritten mail — which signals personal investment and authentic communication — sits at the top of that hierarchy. In real estate, where trust and personal relationships drive transactions, this difference translates directly to listings and referrals.",
    source: 'DMA Response Rate Report',
  },
];

export default function REScience() {
  return (
    <section style={{ background: '#f2f1ee', padding: '80px 40px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#007bff', marginBottom: '14px' }}>
          The Research Behind It
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#1a2d4a', marginBottom: '16px' }}>
          Why Physical Mail Converts Better Than Digital in Real Estate
        </h2>
        <p style={{ fontSize: '17px', color: '#4a5568', lineHeight: 1.55, maxWidth: '700px' }}>
          Real estate is a relationship business — and relationships are built on trust, not technology. The science is clear: physical mail is processed differently by the brain, producing higher recall, stronger emotional engagement, and more action than any digital channel.
        </p>

        <div className="re-sci-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px', marginTop: '40px' }}>
          {cards.map((c, i) => (
            <div key={i} style={{
              background: '#ffffff', border: '1px solid #dde1e7', borderRadius: '5px',
              padding: '28px 24px', transition: 'box-shadow 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#007bff', display: 'block', marginBottom: '10px' }}>{c.institution}</span>
              <div className="font-sora" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a2d4a', lineHeight: 1.25, marginBottom: '10px' }}>{c.finding}</div>
              <p style={{ fontSize: '15px', color: '#4a5568', lineHeight: 1.5 }}>{c.body}</p>
              <span style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginTop: '12px', fontStyle: 'italic' }}>{c.source}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .re-sci-grid { grid-template-columns: 1fr !important; }
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}