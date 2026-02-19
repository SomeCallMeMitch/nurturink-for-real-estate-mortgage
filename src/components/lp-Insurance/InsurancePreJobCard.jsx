import React from 'react';

/**
 * InsurancePreJobCard — SECTION 5 wide card below three-card grid
 * Cloned from RoofingPreJobCard
 */
export default function InsurancePreJobCard() {
  return (
    <div
      style={{
        marginTop: '28px', background: '#172840', borderRadius: '5px',
        overflow: 'hidden', borderLeft: '6px solid #f59e0b',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.22)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div className="insurance-prejob-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* Left */}
        <div className="insurance-prejob-left" style={{ padding: '36px 40px', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: '10px' }}>
            The Move Nobody Else Makes
          </span>
          <h3 className="font-sora" style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.2, marginBottom: '14px' }}>
            Send a Note to the Neighborhood Before the Job Even Starts
          </h3>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55 }}>
            Before your crew arrives, a handwritten note goes out to the homes within earshot. It comes from the owner. It says your crew is coming, they will be respectful and clean, and here is a direct cell number if there is any issue. No pitch. No offer. Just consideration for people who did not ask for the disruption.
          </p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, marginTop: '12px' }}>
            Nobody does this. The neighbor who gets that note does not just tolerate the noise. They remember that a company cared enough to reach out before starting. When their roof needs attention, that is the company they call. When a friend asks for a recommendation, that is the name they give.
          </p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, marginTop: '12px' }}>
            A roofing job can be heard from 50 to 60 homes in any direction. At current card pricing, covering that radius costs roughly $150. One job from one of those neighbors pays for that investment many times over.
          </p>
        </div>

        {/* Right */}
        <div style={{ padding: '36px 40px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '14px' }}>
            Sample Note — From the Owner
          </span>
          <div style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '4px', padding: '22px 24px',
            fontSize: '15px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.62, fontStyle: 'italic',
          }}>
            "Hi [Name], my name is [Owner], and my crew will be replacing a roof on your street on [day]. They are professionals and they will keep everything clean, but you may hear some noise those mornings. I wanted to reach out personally before we started. If anything at all bothers you, please call my cell directly: [number]. I appreciate your patience and I am happy to talk anytime."
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {['~60 cards per job', '~$150 total', 'Nobody else does this'].map((t, i) => (
              <span key={i} style={{
                background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '3px', padding: '6px 14px',
                fontSize: '13px', fontWeight: 700, color: '#f59e0b',
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .insurance-prejob-inner { grid-template-columns: 1fr !important; }
          .insurance-prejob-left { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; }
        }
      `}</style>
    </div>
  );
}