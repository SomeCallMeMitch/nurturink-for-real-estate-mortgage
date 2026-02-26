import React from 'react';

const stats = [
  { val: '2x', label: 'future spending from customers who received a handwritten note', source: 'Univ. of Maryland / Yonsei, 2022' },
  { val: '5-25x', label: 'more expensive to acquire a new customer than keep one', source: 'Yotpo / Bain and Company' },
  { val: '65%', label: 'of total brand revenue comes from existing customers', source: 'BIA Advisory / Bluecore' },
  { val: '$2.50', label: 'per card, real pen, real cardstock, postage included', source: 'NurturInk flat rate' },
];

export default function EcommerceHero() {
  return (
    <section id="top" style={{ background: '#1a2d4a', padding: '22px 0 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div className="ec-hero-inner">
          {/* Left column */}
          <div>
            <div style={{
              display: 'inline-block',
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#f59e0b',
              fontSize: 14, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', padding: '5px 12px',
              borderRadius: 3, marginBottom: 11
            }}>
              For Ecommerce Brands on Shopify
            </div>

            <h1 className="ec-h1-mobile" style={{
              fontFamily: "'Sora', sans-serif", fontWeight: 900,
              fontSize: 'clamp(1.7rem, 6.5vw, 3rem)', lineHeight: 1.12,
              color: '#fff', marginBottom: 7
            }}>
              A $2.50 Card.<br />Customers Spend<br /><span style={{ color: '#FF7A00' }}>2x More.</span>
            </h1>
            <h1 className="ec-h1-desktop" style={{
              fontFamily: "'Sora', sans-serif", fontWeight: 900,
              fontSize: 'clamp(1.7rem, 6.5vw, 3rem)', lineHeight: 1.12,
              color: '#fff', marginBottom: 7
            }}>
              A $2.50 Handwritten Card.<br />Peer-Reviewed Research Shows<br />Customers Spend <span style={{ color: '#FF7A00' }}>2x More.</span>
            </h1>

            <p style={{
              fontSize: 17, color: 'rgba(255,255,255,0.82)',
              lineHeight: 1.44, marginBottom: 18, maxWidth: 560
            }}>
              Connects directly to your Shopify store. Real ballpoint pen. Postage included. Zero extra work on your end.
            </p>

            <div style={{ marginBottom: 10 }}>
              <span style={{
                fontFamily: "'Sora', sans-serif", fontSize: 19, fontWeight: 900,
                color: '#fff', display: 'block', lineHeight: 1.12
              }}>Real Pen. Real Card.</span>
              <span style={{
                fontFamily: "'Lato', sans-serif", fontSize: 14, fontWeight: 700,
                color: '#f59e0b', letterSpacing: '0.1em', textTransform: 'uppercase',
                display: 'block', marginTop: 3
              }}>Watch it being made</span>
            </div>
          </div>

          {/* Right column — desktop stat grid */}
          <div className="ec-hero-stats-col">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {stats.map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6, padding: '16px 14px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', textAlign: 'center'
                }}>
                  <span style={{
                    fontFamily: "'Sora', sans-serif", fontSize: '1.8rem',
                    fontWeight: 900, color: '#FF7A00', lineHeight: 1, marginBottom: 6
                  }}>{s.val}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', lineHeight: 1.36 }}>{s.label}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 5, display: 'block' }}>{s.source}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full-bleed video */}
      <div
        id="ec-video-wrap"
        style={{
          position: 'relative', width: '100%', aspectRatio: '16/9',
          background: '#000', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
        }}
      >
        <video
          id="ec-demo-video"
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        >
          <source src="https://res.cloudinary.com/dge8qy1ps/video/upload/Handwritten_Note_process_zuyc3z.mp4" type="video/mp4" />
        </video>
      </div>

      <p style={{
        fontSize: 19, fontWeight: 600, color: '#fff',
        padding: '10px 20px 0', lineHeight: 1.24
      }}>
        Not a font. Not an inkjet printer. A real ballpoint pen writing your message on real cardstock.
      </p>

      {/* Desktop stat strip */}
      <div className="ec-stat-strip">
        {stats.map((s, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, padding: '16px 14px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center'
          }}>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.8rem', fontWeight: 900, color: '#FF7A00', lineHeight: 1, marginBottom: 6 }}>{s.val}</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', lineHeight: 1.36 }}>{s.label}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 5, display: 'block' }}>{s.source}</span>
          </div>
        ))}
      </div>

      <style>{`
        .ec-h1-mobile { display: block; }
        .ec-h1-desktop { display: none; }
        .ec-hero-inner { display: block; }
        .ec-hero-stats-col { display: none; }
        .ec-stat-strip { display: none; }

        @media (min-width: 1024px) {
          .ec-h1-mobile { display: none !important; }
          .ec-h1-desktop { display: block !important; }
          .ec-hero-inner {
            display: grid !important;
            grid-template-columns: 1fr 420px;
            gap: 52px;
            align-items: start;
          }
          .ec-hero-stats-col { display: block !important; }
          .ec-stat-strip {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            padding: 28px 48px;
            background: #1a2d4a;
          }
        }
      `}</style>
    </section>
  );
}