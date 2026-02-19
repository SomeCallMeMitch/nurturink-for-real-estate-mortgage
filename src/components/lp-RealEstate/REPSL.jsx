import React from 'react';

/**
 * REPSL — SECTION 6: BEYOND THE CORE FOUR
 * Real Estate: 4 cards (Expired Listing, FSBO, Just Sold, Sphere Nurture)
 * Blue accent, RE-specific copy, sample card
 */
const cards = [
  { label: 'Expired Listing', title: 'After a Listing Expires', body: "An expired listing is a homeowner who wanted to sell and couldn't. They're frustrated, disappointed, and probably getting bombarded with calls from agents. A handwritten card cuts through all of that. It says: I see you as a person, not a lead. \"I know this isn't the outcome you were hoping for. If you'd like a fresh perspective on getting your home sold, I'd be happy to chat — no pressure.\"" },
  { label: 'FSBO', title: 'For Sale By Owner Outreach', body: "FSBO sellers are doing it themselves because they don't see the value an agent brings. Cold calls and door knocks feel aggressive. A handwritten card feels like a neighbor offering help. \"I noticed your home on [Street]. Beautiful property. If you ever want a second opinion on pricing or marketing strategy, I'm happy to help — no strings attached.\" That's how you earn a listing appointment." },
  { label: 'Just Sold', title: 'Neighborhood Farming After a Sale', body: "You just sold a home on the street. Every neighbor is curious about the price and what it means for their home value. A handwritten card to the 20 nearest homes is the highest-signal way to introduce yourself. \"I recently helped your neighbor at [Address] sell their home. If you're curious about what your home might be worth in today's market, I'd love to share some insights.\"" },
  { label: 'Sphere Nurture', title: 'Quarterly Past-Client Touch', body: "Your sphere of influence is your most valuable asset. A quarterly handwritten card to your top 100 past clients keeps you top of mind without feeling salesy. Rotate between seasonal greetings, market updates, and simple check-ins. The goal is simple: when anyone in their life mentions real estate, your name is the first one they think of." },
];

export default function REPSL() {
  return (
    <section style={{ background: '#1a2d4a', padding: '80px 40px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#007bff', marginBottom: '14px' }}>
          Beyond the Core Four
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', marginBottom: '16px' }}>
          More Moments That Build Your Business
        </h2>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, maxWidth: '700px' }}>
          Closing cards, anniversaries, market updates, and referral thank-you's are the foundation. Once those are running, these additional touchpoints compound the effect. Each one is a moment where most agents do nothing — and where a handwritten card stands completely alone.
        </p>

        <div className="re-psl-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', marginTop: '40px' }}>
          {cards.map((c, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '5px', padding: '28px 24px', transition: 'background 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            >
              <span className="font-sora" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#007bff', display: 'block', lineHeight: 1.1, marginBottom: '8px' }}>{c.label}</span>
              <h3 className="font-sora" style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>{c.title}</h3>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.5 }}>{c.body}</p>
            </div>
          ))}
        </div>

        {/* Sample note */}
        <div style={{
          marginTop: '32px', background: 'rgba(0,123,255,0.08)',
          border: '1px solid rgba(0,123,255,0.2)', borderRadius: '5px', padding: '26px 30px',
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#007bff', display: 'block', marginBottom: '10px' }}>Sample — Just Sold Neighborhood Card</span>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.62, fontStyle: 'italic' }}>
            "Hi [Name], I recently helped your neighbor at [Address] sell their home for [price/result]. The market in your area is [brief insight]. If you're ever curious about what your home might be worth, I'd love to share some insights — no obligation, just good information. — [Your Name]"
          </p>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .re-psl-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 768px) {
          .re-psl-grid { grid-template-columns: 1fr !important; }
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}