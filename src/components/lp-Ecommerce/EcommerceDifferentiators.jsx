import React from 'react';

const cards = [
  { icon: '✏️', title: 'Real Ballpoint Pen, Every Card', body: 'Every note is written with a real pen on real cardstock. AI-controlled plotters calibrated for human-like variation. Your customers will feel the pen impression because it is there.' },
  { icon: '🎉', title: 'Pure Gratitude. No Sales Pitch.', body: 'We will never add a discount code, logo placement, or call to action. The research is clear: promotional content neutralizes the emotional effect. Every card is pure appreciation.' },
  { icon: '⚙️', title: 'Connects to Your Shopify Store', body: 'Post-purchase triggers, milestone recognition, win-back campaigns, designed around how Shopify stores operate. We walk through setup on your onboarding call.' },
  { icon: '💰', title: 'One Price. Everything Included.', body: '$2.49 per card. Real pen. Quality cardstock. Stamp. Mailed. No monthly minimums. No subscription. No postage line on your invoice.' },
  { icon: '🎁', title: 'High-Value Moments Only', body: 'First-time buyers. Loyalty milestones like order #10 or a one-year anniversary. Special occasions including birthdays. Win-back at 90-180 days.' },
  { icon: '📦', title: 'No Minimums. Scales With You.', body: '10 cards a month or 10,000, same quality, same turnaround. Volume pricing available at $2.00/card for 500+ monthly. No setup cost.' },
];

export default function EcommerceDifferentiators() {
  return (
    <section style={{ background: '#fff', padding: '64px 0 36px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <span style={{
          display: 'inline-block', fontSize: 14, fontWeight: 700,
          letterSpacing: '0.13em', textTransform: 'uppercase',
          marginBottom: 8, color: '#FF7A00'
        }}>Not All Handwritten Card Services Are Equal</span>
        <h2 style={{
          fontFamily: "'Sora', sans-serif", fontWeight: 800,
          fontSize: 'clamp(1.4rem, 4.8vw, 2.3rem)', lineHeight: 1.12,
          color: '#1a2d4a', marginBottom: 10
        }}>
          A Real Pen. Every Card. A Price That Includes Everything.
        </h2>
        <p style={{ fontSize: 19, lineHeight: 1.44, maxWidth: 700, marginBottom: 22, color: '#4a5568' }}>
          If your customer senses the card was printed, the effect disappears. And if your invoice includes a postage line you did not plan for, the ROI math falls apart. We solve both.
        </p>

        <div className="ec-diff-grid">
          {cards.map((card, i) => (
            <div key={i} className="ec-diff-card" style={{
              background: '#f2f1ee', border: '1px solid #dde1e7',
              borderRadius: 6, padding: 15,
              transition: 'border-color 0.2s, transform 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{card.icon}</span>
                <h3 style={{
                  fontFamily: "'Sora', sans-serif", fontSize: '0.93rem', fontWeight: 800,
                  color: '#1a2d4a', margin: 0
                }}>{card.title}</h3>
              </div>
              <p style={{ fontSize: 15, color: '#4a5568', lineHeight: 1.24 }}>{card.body}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .ec-diff-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 22px; }
        .ec-diff-card:hover { border-color: #FF7A00 !important; transform: translateY(-2px); }
        @media (min-width: 640px) { .ec-diff-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1024px) { .ec-diff-grid { grid-template-columns: repeat(3,1fr); } }
      `}</style>
    </section>
  );
}