import React from 'react';

export default function EcommerceEmailComplement() {
  return (
    <section id="email-complement" style={{ background: '#faf9f6', padding: '24px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <span style={{
          display: 'inline-block', fontSize: 14, fontWeight: 700,
          letterSpacing: '0.13em', textTransform: 'uppercase',
          marginBottom: 8, color: '#FF7A00'
        }}>This Is Not a Replacement for Email</span>

        <h2 style={{
          fontFamily: "'Sora', sans-serif", fontWeight: 800,
          fontSize: 'clamp(1.3rem, 4.5vw, 2.1rem)', lineHeight: 1.12,
          color: '#1a2d4a', marginBottom: 10
        }}>
          A Handwritten Card Makes Every Channel You Already Use More Effective.
        </h2>

        <p style={{ color: '#4a5568', fontSize: 17, lineHeight: 1.24, marginBottom: 14 }}>
          You already send post-purchase emails. You already ask for reviews. You already run re-engagement flows. These all work better when your customers feel a genuine connection to your brand. The physical card is what creates that connection at a level digital touchpoints rarely reach.
        </p>
        <p style={{ color: '#4a5568', fontSize: 17, lineHeight: 1.24, marginBottom: 14 }}>
          A handwritten card does something digital cannot: it creates <strong>reciprocity</strong>. When a customer holds something real from your brand, they feel a genuine connection to it. That feeling is still there the next time your email lands in their inbox.
        </p>

        <div className="ec-email-two-col" style={{ marginBottom: 16 }}>
          {/* Email column */}
          <div style={{ background: '#f2f1ee', border: '1px solid #dde1e7', borderRadius: 6, padding: 14 }}>
            <span style={{
              fontSize: 14, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', display: 'block', marginBottom: 8, color: '#4a5568'
            }}>What Email Does Well</span>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {['Scales to your entire list instantly', 'Cost-effective at any volume', 'Easy to automate and sequence', 'Trackable clicks and opens'].map((item, i, arr) => (
                <li key={i} style={{
                  fontSize: 17, lineHeight: 1.24, padding: '5px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  display: 'flex', gap: 8, alignItems: 'flex-start', color: '#2d3748'
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4a5568', flexShrink: 0, marginTop: 6, display: 'inline-block' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Card column */}
          <div style={{ background: '#1a2d4a', borderRadius: 6, padding: 14 }}>
            <span style={{
              fontSize: 14, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', display: 'block', marginBottom: 8, color: '#f59e0b'
            }}>What a Handwritten Card Adds</span>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {['Creates genuine emotional connection', 'Makes customers remember your brand name', 'Increases the chance they open your next email', 'Generates reviews and word-of-mouth organically'].map((item, i, arr) => (
                <li key={i} style={{
                  fontSize: 17, lineHeight: 1.24, padding: '5px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  display: 'flex', gap: 8, alignItems: 'flex-start', color: 'rgba(255,255,255,0.82)'
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF7A00', flexShrink: 0, marginTop: 6, display: 'inline-block' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{
          background: '#fff', border: '1px solid #dde1e7',
          borderLeft: '4px solid #FF7A00',
          borderRadius: '0 6px 6px 0', padding: '14px 16px'
        }}>
          <p style={{ fontSize: 17, color: '#2d3748', lineHeight: 1.44, margin: 0 }}>
            Think of it this way: your post-purchase email sequence is the system. The handwritten card is what gives customers a reason to care about the system. <strong style={{ color: '#1a2d4a' }}>They work together.</strong> The card makes the email more likely to get opened, and the email makes the relationship more likely to deepen.
          </p>
        </div>
      </div>

      <style>{`
        .ec-email-two-col {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin: 14px 0 16px;
        }
        @media (min-width: 900px) {
          .ec-email-two-col { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </section>
  );
}