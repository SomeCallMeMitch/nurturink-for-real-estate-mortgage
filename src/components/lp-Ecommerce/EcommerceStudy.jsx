import React from 'react';

const proofCards = [
  {
    num: '2x',
    title: 'Future Customer Spending',
    body: 'The only variable was the card. Customers who received a handwritten thank-you spent approximately twice as much going forward.',
    source: 'University of Maryland and Yonsei University, Journal of Interactive Marketing, 2022'
  },
  {
    num: '50%',
    title: 'Fewer Customers Left',
    body: 'Wufoo sent handwritten thank-you cards to approximately 800 customers. Result: 50% fewer churned compared to those who received no card.',
    source: 'Wufoo / Renee Morris, via Evelyn Starr, LinkedIn, April 2024'
  },
  {
    num: '38%',
    title: 'More Likely to Buy Again',
    body: 'DonorsChoose sent handwritten notes to half of first-time buyers. That group was 38% more likely to come back.',
    source: 'DonorsChoose / Charles Best, via Evelyn Starr, LinkedIn, April 2024'
  },
];

export default function EcommerceStudy() {
  return (
    <section style={{ background: '#1a2d4a', padding: '64px 0 36px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div className="ec-study-inner">
          <div>
            <span style={{
              display: 'inline-block', fontSize: 14, fontWeight: 700,
              letterSpacing: '0.13em', textTransform: 'uppercase',
              marginBottom: 8, color: '#f59e0b'
            }}>Peer-Reviewed Research</span>
            <h2 style={{
              fontFamily: "'Sora', sans-serif", fontWeight: 800,
              fontSize: 'clamp(1.4rem, 4.8vw, 2.3rem)', lineHeight: 1.12,
              color: '#fff', marginBottom: 10
            }}>
              There Is a Controlled Experiment on This, Done in Ecommerce.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 17, lineHeight: 1.44, marginBottom: 13 }}>
              In 2022, researchers from the University of Maryland and Yonsei University published a randomized field experiment in the Journal of Interactive Marketing: <em style={{ color: '#fff', fontStyle: 'normal', fontWeight: 700 }}>"Do Handwritten Notes Benefit Online Retailers?"</em>
            </p>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 17, lineHeight: 1.44, marginBottom: 13 }}>
              Real ecommerce customers. Real orders. Real follow-up purchase data. Not a survey. A <strong style={{ color: '#fff' }}>controlled experiment</strong> with a <strong style={{ color: '#fff' }}>treatment group</strong> and a <strong style={{ color: '#fff' }}>control group</strong>.
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, padding: '16px 18px', marginBottom: 14
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: 10 }}>What They Found</span>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[
                  <>Customers who received a handwritten note spent <strong style={{ color: '#FF7A00', fontSize: '1.05em' }}>approximately twice as much</strong> in subsequent purchases</>,
                  <>The effect was driven by warmth, perceived genuine gratitude, not novelty</>,
                  <>Adding a promotional discount alongside the note <strong>eliminated the effect entirely</strong></>,
                  <>The note works best alone, no pitch, no coupon, no upsell attached</>,
                ].map((item, i) => (
                  <li key={i} style={{ fontSize: 17, color: 'rgba(255,255,255,0.82)', display: 'flex', gap: 10, alignItems: 'flex-start', lineHeight: 1.24 }}>
                    <span style={{ color: '#f59e0b', flexShrink: 0, fontWeight: 900, fontSize: '1.2rem', lineHeight: 1.3, minWidth: 20, display: 'inline-block' }}>&#10148;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 6, padding: '14px 16px',
              display: 'flex', gap: 12, alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>&#9888;&#65039;</span>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.44, margin: 0 }}>
                <strong style={{ color: '#f59e0b' }}>Critical finding:</strong> Do not attach a coupon or promotional offer to the card. The research shows it kills the emotional effect completely. Every NurturInk card contains zero promotional content. This is by design, and it is why it works.
              </p>
            </div>
          </div>

          <div>
            <div className="ec-proof-cards">
              {proofCards.map((c, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6, padding: 18
                }}>
                  <span style={{
                    fontFamily: "'Sora', sans-serif", fontSize: '2.4rem', fontWeight: 900,
                    color: '#FF7A00', display: 'block', lineHeight: 1, marginBottom: 5
                  }}>{c.num}</span>
                  <h3 style={{ color: '#fff', fontSize: '1rem', fontFamily: "'Sora', sans-serif", fontWeight: 800, marginBottom: 5 }}>{c.title}</h3>
                  <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.82)', lineHeight: 1.24, marginTop: 5 }}>{c.body}</p>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.48)', marginTop: 7, display: 'block', fontStyle: 'italic', lineHeight: 1.24 }}>{c.source}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ec-study-inner { display: block; }
        .ec-proof-cards { display: flex; flex-direction: column; gap: 12px; }
        @media (min-width: 640px) {
          .ec-proof-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        }
        @media (min-width: 1024px) {
          .ec-study-inner { display: grid !important; grid-template-columns: 1fr 1fr; gap: 58px; align-items: start; }
          .ec-proof-cards { display: flex !important; flex-direction: column; gap: 12px; }
        }
      `}</style>
    </section>
  );
}