import React from 'react';

const stats = [
  {
    num: '65%',
    title: 'of total brand revenue comes from existing customers',
    sub: 'Not new ones. Retention math almost always beats acquisition math. BIA Advisory / Bluecore'
  },
  {
    num: '5%',
    title: 'retention increase can produce a 25-95% profit lift',
    sub: 'A small improvement in how many customers return has an outsized effect on profitability. Bain and Company / HBR'
  },
  {
    num: '46%',
    title: 'more is what emotionally loyal customers spend',
    sub: 'Customers with genuine emotional ties to your brand spend 46% more. A handwritten card is one of the few tools that creates that online. Gallup'
  },
];

export default function EcommerceRetention() {
  return (
    <section style={{ background: '#faf9f6', padding: '64px 0 36px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div className="ec-tension-inner">
          <div>
            <span style={{
              display: 'inline-block', fontSize: 14, fontWeight: 700,
              letterSpacing: '0.13em', textTransform: 'uppercase',
              marginBottom: 8, color: '#FF7A00'
            }}>Why Retention Matters More Than Ever</span>
            <h2 style={{
              fontFamily: "'Sora', sans-serif", fontWeight: 800,
              fontSize: 'clamp(1.4rem, 4.8vw, 2.3rem)', lineHeight: 1.12,
              color: '#1a2d4a', marginBottom: 10
            }}>
              Customer Acquisition Costs Have Risen 60-70% in Five Years. Your Best Growth Lever Is Already in Your Customer List.
            </h2>
            <p style={{ color: '#4a5568', fontSize: 17, lineHeight: 1.24 }}>
              The brands growing fastest right now are not the ones spending more on ads. They are the ones keeping more of the customers they already have. Retention is not a backup strategy. For most ecommerce stores, it is where the real margin lives.
            </p>
            <div style={{
              background: '#fff', border: '1px solid #dde1e7',
              borderLeft: '4px solid #FF7A00',
              borderRadius: '0 6px 6px 0', padding: '14px 16px', marginTop: 16
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FF7A00', display: 'block', marginBottom: 5 }}>Shopify1Percent, January 2026</span>
              <p style={{ fontSize: 17, color: '#2d3748', lineHeight: 1.44, margin: 0, fontStyle: 'italic' }}>
                "Nobody thanks people for shopping anymore. The bar is underground. Handwritten notes are a retention primitive. They create emotional residue."
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid #dde1e7',
                borderRadius: 6, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 14
              }}>
                <div style={{
                  fontFamily: "'Sora', sans-serif", fontSize: '1.8rem', fontWeight: 900,
                  color: '#FF7A00', flexShrink: 0, lineHeight: 1, minWidth: 56, textAlign: 'center'
                }}>{s.num}</div>
                <div>
                  <strong style={{ display: 'block', fontSize: 17, color: '#1a2d4a', marginBottom: 2, lineHeight: 1.24 }}>{s.title}</strong>
                  <span style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.24 }}>{s.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .ec-tension-inner { display: block; }
        @media (min-width: 1024px) {
          .ec-tension-inner { display: grid !important; grid-template-columns: 1fr 1fr; gap: 52px; align-items: start; }
        }
      `}</style>
    </section>
  );
}