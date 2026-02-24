import React from 'react';

export default function EcommercePricing() {
  return (
    <section id="pricing" style={{ background: '#172840', borderTop: '3px solid #FF7A00', padding: '38px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div className="ec-pricing-inner">
          <div>
            <span style={{
              display: 'inline-block', fontSize: 14, fontWeight: 700,
              letterSpacing: '0.13em', textTransform: 'uppercase',
              marginBottom: 8, color: '#f59e0b'
            }}>Transparent, All-In Pricing</span>
            <h2 style={{
              fontFamily: "'Sora', sans-serif", fontWeight: 800,
              fontSize: 'clamp(1.4rem, 4.8vw, 2.3rem)', lineHeight: 1.12,
              color: '#fff', marginBottom: 11
            }}>
              What You See Is What You Pay.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 17, lineHeight: 1.44 }}>
              Most handwritten card services quote you a per-card price, then bill postage separately. Some require a monthly subscription before you access competitive rates. We price like an honest vendor. One number. Everything included. No surprises.
            </p>
            <div style={{
              background: 'rgba(255,122,0,0.1)', border: '1px solid rgba(255,122,0,0.3)',
              borderRadius: 6, padding: '13px 16px', marginTop: 14
            }}>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.82)', lineHeight: 1.44, fontStyle: 'italic', margin: 0 }}>
                "Quoting a card price without postage is like selling a car and billing the tires separately. The number sounds better until you see the invoice."
              </p>
              <cite style={{ display: 'block', marginTop: 6, fontSize: 15, color: '#f59e0b', fontStyle: 'normal', fontWeight: 700 }}>
                NurturInk pricing philosophy
              </cite>
            </div>
          </div>

          <div>
            <div className="ec-price-compare">
              {[
                { brand: 'Competitor A', amount: '$3.50+', detail: 'Per card at retail pricing', gotcha: '+ monthly subscription required for competitive rates', isOurs: false },
                { brand: 'Competitor B', amount: '$3.00+', detail: 'Per card quoted rate', gotcha: '+ postage billed separately', isOurs: false },
                { brand: 'NurturInk', amount: '$2.49', detail: 'Per card, completely all-in', extra: 'Real pen. Cardstock. Stamp. Mailed.', isOurs: true },
              ].map((card, i) => (
                <div key={i} style={{
                  background: card.isOurs ? 'rgba(255,122,0,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${card.isOurs ? 'rgba(255,122,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 6, padding: 16, textAlign: 'center'
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: card.isOurs ? '#f59e0b' : 'rgba(255,255,255,0.58)', display: 'block', marginBottom: 6 }}>{card.brand}</span>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: card.isOurs ? '2.1rem' : '1.7rem', fontWeight: 900, color: card.isOurs ? '#FF7A00' : '#fff', display: 'block', marginBottom: 5 }}>{card.amount}</span>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.58)', lineHeight: 1.24 }}>{card.detail}</span>
                  {card.extra && <span style={{ color: '#f59e0b', fontWeight: 700, marginTop: 5, display: 'block', fontSize: 15 }}>{card.extra}</span>}
                  {card.gotcha && <span style={{ display: 'block', marginTop: 8, fontSize: 13, fontWeight: 700, color: 'rgba(255,100,80,0.95)', lineHeight: 1.24, borderTop: '1px solid rgba(255,100,80,0.2)', paddingTop: 7 }}>{card.gotcha}</span>}
                </div>
              ))}
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, padding: '12px 14px'
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.58)', display: 'block', marginBottom: 4 }}>Volume Pricing</span>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.82)', lineHeight: 1.24, margin: 0 }}>
                Sending 500+ cards per month? Volume pricing starts at <strong>$2.00/card</strong>, still all-in, no subscription required.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ec-pricing-inner { display: block; }
        .ec-price-compare { display: grid; grid-template-columns: 1fr; gap: 10px; margin: 20px 0 12px; }
        @media (min-width: 640px) { .ec-price-compare { grid-template-columns: repeat(3,1fr); } }
        @media (min-width: 1024px) {
          .ec-pricing-inner { display: grid !important; grid-template-columns: 1fr 1fr; gap: 52px; align-items: start; }
          .ec-price-compare { margin-top: 0; }
        }
      `}</style>
    </section>
  );
}