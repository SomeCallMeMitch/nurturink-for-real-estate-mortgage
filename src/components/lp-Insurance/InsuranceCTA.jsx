import React from 'react';

/**
 * InsuranceCTA — SECTION 9: CTA
 * Insurance-specific copy per Step 12
 */
export default function InsuranceCTA() {
  return (
    <section id="get-sample" style={{ background: '#FF7A00', padding: '88px 0', textAlign: 'center' }}>
      {/* Widened inner container to 1200px */}
      <div className="insurance-cta-inner" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>
        <h2 className="font-sora" style={{ color: '#ffffff', fontSize: 'clamp(1.8rem, 3vw, 2.7rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '14px' }}>
          Your Clients Don't Need Another Email.<br />
          They Need to Know You Still Remember Them.
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', maxWidth: '500px', margin: '0 auto 36px', lineHeight: 1.55 }}>
          Get a free sample card mailed directly to you. Hold it. Read it. Then decide if this is the retention system your book has been missing.
        </p>
        <a
          href="https://nurturink.com"
          className="font-lato"
          style={{
            display: 'inline-block', padding: '13px 28px', borderRadius: '4px',
            fontSize: '15px', fontWeight: 700, letterSpacing: '0.02em',
            textDecoration: 'none', border: '2px solid transparent',
            background: '#ffffff', color: '#FF7A00',
            boxShadow: '0 3px 12px rgba(0,0,0,0.15)',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 7px 24px rgba(0,0,0,0.22)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.15)'; e.currentTarget.style.transform = 'none'; }}
        >
          Get Your Free Sample Card
        </a>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .insurance-cta-inner { padding: 0 32px !important; }
        }
        @media (max-width: 768px) {
          .insurance-cta-inner { padding: 0 20px !important; }
        }
      `}</style>
    </section>
  );
}