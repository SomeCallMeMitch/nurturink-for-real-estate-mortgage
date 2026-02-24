import React from 'react';

const bullets = [
  'Real ballpoint pen on real cardstock, not inkjet, not a font',
  'Fully personalized, each card says exactly what you specify',
  'Processed within 24-48 hours, in recipients\' hands within 6-10 days',
  'Connects directly to Shopify, triggers based on customer actions you define',
];

export default function EcommerceAuthenticity() {
  return (
    <section id="auth-section" style={{ background: '#172840', padding: '32px 0 36px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div className="ec-auth-inner">
          <div>
            <span style={{
              display: 'inline-block', fontSize: 14, fontWeight: 700,
              letterSpacing: '0.13em', textTransform: 'uppercase',
              marginBottom: 8, color: '#f59e0b'
            }}>Why It Passes the Human Test</span>
            <h2 style={{
              fontFamily: "'Sora', sans-serif", fontWeight: 800,
              fontSize: 'clamp(1.4rem, 4.8vw, 2.3rem)', lineHeight: 1.12,
              color: '#fff', marginBottom: 10
            }}>
              This Is What Your Customers Will Hold in Their Hands.
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.82)', fontSize: 17,
              lineHeight: 1.24, marginBottom: 16
            }}>
              Most services print a cursive font with an inkjet. We use an actual ballpoint pen controlled by AI-precision plotters calibrated to write with the natural variation of a human hand.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              {[
                { title: 'Pen Impression', body: 'A real pen leaves a physical impression in the paper you can feel with your fingertip. This is what tells a customer\'s brain: a human did this.' },
                { title: 'AI-Controlled Variation', body: 'Our plotters are calibrated to introduce the natural variation in pressure and flow that real handwriting has. No two letters are perfectly identical, just like yours would not be.' }
              ].map((card, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderLeft: '3px solid #FF7A00',
                  borderRadius: '0 6px 6px 0',
                  padding: '12px 14px'
                }}>
                  <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 5 }}>{card.title}</h4>
                  <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.82)', lineHeight: 1.24, margin: 0 }}>{card.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {bullets.map((b, i) => (
                <li key={i} style={{
                  fontSize: 15, color: 'rgba(255,255,255,0.82)',
                  padding: '6px 0', display: 'flex', gap: 10,
                  alignItems: 'flex-start', lineHeight: 1.24,
                  borderBottom: i < bullets.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#FF7A00', flexShrink: 0, marginTop: 5, display: 'inline-block'
                  }} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .ec-auth-inner { display: block; }
        @media (min-width: 1024px) {
          .ec-auth-inner {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 52px;
            align-items: start;
          }
        }
      `}</style>
    </section>
  );
}