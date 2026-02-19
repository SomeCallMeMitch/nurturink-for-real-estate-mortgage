import React from 'react';

/**
 * REOpenHouseCard — Wide card below the 4-card ways grid
 * Real Estate specific: Open House Follow-Up
 * Added per delta change 2: sits OUTSIDE the ways-grid, not inside it
 */
export default function REOpenHouseCard() {
  return (
    <div
      style={{
        marginTop: '28px', background: '#1a2d4a', borderRadius: '5px',
        overflow: 'hidden', borderLeft: '6px solid #007bff',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 36px rgba(0,0,0,0.22)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div className="re-openhouse-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* Left */}
        <div className="re-openhouse-left" style={{ padding: '36px 40px', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#007bff', display: 'block', marginBottom: '10px' }}>
            05 — Open House Follow-Up
          </span>
          <h3 className="font-sora" style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.2, marginBottom: '14px' }}>
            Turn Every Open House Visitor Into a Warm Lead
          </h3>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55 }}>
            Every visitor at your open house gets the same generic follow-up email — if they get one at all. A handwritten card changes the dynamic completely. It says: "I remember you. You matter. I'm not just another agent." That distinction is the difference between a forgotten open house and a signed listing agreement.
          </p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, marginTop: '12px' }}>
            Open house visitors are warm leads who took the time to show up in person. They deserve more than a drip campaign. A handwritten note within 48 hours puts you in a category of one.
          </p>
        </div>

        {/* Right — sample note */}
        <div style={{ padding: '36px 40px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '14px' }}>
            Sample — Open House Follow-Up Card
          </span>
          <div style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '4px', padding: '22px 24px',
            fontSize: '16px', fontStyle: 'italic', lineHeight: 1.62,
            color: 'rgba(255,255,255,0.92)',
          }}>
            "Hi [Name], it was great meeting you at the open house on [Street] this weekend. I really enjoyed our conversation about [specific detail]. If you'd like to see any other properties in the area or have questions about the market, I'd love to help. — [Your Name]"
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {['Send within 48 hours', 'Reference something specific', 'No hard sell'].map((t, i) => (
              <span key={i} style={{
                background: 'rgba(0,123,255,0.15)', border: '1px solid rgba(0,123,255,0.3)',
                borderRadius: '3px', padding: '6px 14px',
                fontSize: '13px', fontWeight: 700, color: '#007bff',
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .re-openhouse-inner { grid-template-columns: 1fr !important; }
          .re-openhouse-left { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; }
        }
      `}</style>
    </div>
  );
}