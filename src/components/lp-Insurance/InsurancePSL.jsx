import React from 'react';

/**
 * InsurancePSL — SECTION 6: BEYOND THE CORE THREE
 * Insurance-specific: Post-Claim, Anniversary, Referral (replaces PSL formula)
 */
const cards = [
  { label: 'Post-Claim', title: 'After a Claim Is Resolved', body: "A claim is stressful. Most agents process it and move on. A handwritten note saying \"I'm glad we could help get that resolved\" arrives during an emotional moment and does something no email can. It makes the client feel that their agent actually cared about them, not just the paperwork." },
  { label: 'Anniversary', title: 'Policy Anniversary', body: '"Thanks for being a client for three years." That is the whole note. Acknowledging loyalty does two things: it reminds the client there is a relationship worth keeping, and it makes them think twice before calling around for a better rate. Most agents never send this. The ones who do stand out immediately.' },
  { label: 'Referral', title: 'After Someone Refers a Friend', body: 'When a client sends you a referral, a handwritten thank-you does two things. It expresses genuine appreciation for something genuinely valuable. And it makes them want to do it again. According to Deloitte research, retained clients who feel a personal connection are 5x more likely to refer. Thanking them in writing reinforces exactly that connection.' },
];

export default function InsurancePSL() {
  return (
    <section style={{ background: '#213659', padding: '80px 0' }}>
      {/* Widened inner container to 1200px */}
      <div className="insurance-psl-inner" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: '14px' }}>
          Beyond the Core Three
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', marginBottom: '16px' }}>
          More Moments That Deepen the Relationship
        </h2>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, maxWidth: '700px' }}>
          Welcome, birthday, and pre-renewal are the foundation. Once those are running, these additional touchpoints compound the effect. Each one is a moment where most agents do nothing — and where a handwritten card stands completely alone.
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
              <span className="font-sora" style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', display: 'block', lineHeight: 1, marginBottom: '8px' }}>{c.label}</span>
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
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: '10px' }}>Sample — Pre-Renewal Card</span>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.62, fontStyle: 'italic' }}>
            "Hi [Name], can you believe it's been [X] years already? Thank you for being a client. Your renewal is coming up in [timeframe] — if you'd like to review your coverage or have any questions, just call or text me. Either way, I've got you covered. — [Your Name]"
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