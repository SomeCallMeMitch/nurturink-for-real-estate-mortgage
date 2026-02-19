import React from 'react';

/**
 * RoofingPreJobCard — SECTION 5 wide card below three-card grid
 * Cloned from SolarPreJobCard
 */
export default function RoofingPreJobCard() {
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
      <div className="roofing-prejob-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* Left */}
        <div className="roofing-prejob-left" style={{ padding: '36px 40px', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
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
            Nobody does this. The neighbor who gets that note does not just tolerate the noise. They remember that a company cared enough to reach out personally before the job started. When they need a roof, that is the company they call. When their friend asks for a recommendation, that is the name they give.
          </p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, marginTop: '12px' }}>
            50 to 60 cards covers a meaningful radius. At current card pricing, that is roughly $150 before the job starts. One call from that neighborhood pays for hundreds of jobs worth of cards.
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
            "Hi [Name], my name is [Owner], and my crew will be doing a roofing job at your neighbor's home on [day]. They are good people and they will keep everything clean, but you may hear some noise those mornings. I wanted to reach out personally before we started. If anything at all bothers you, please call my cell directly: [number]. I appreciate your patience and I am happy to talk anytime."
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {['50 cards ~ $125', 'One job = $25,000+', 'Nobody else does this'].map((t, i) => (
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
          .roofing-prejob-inner { grid-template-columns: 1fr !important; }
          .roofing-prejob-left { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; }
        }
      `}</style>
    </div>
  );
}