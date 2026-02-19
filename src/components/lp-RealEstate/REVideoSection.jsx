import React from 'react';

/**
 * REVideoSection — SECTION 3: VIDEO + PROOF BULLETS
 * Real Estate: blue accent, RE-specific subtitle
 */
const bullets = [
  'Real ballpoint pen on real cardstock',
  'No commercial postmark — looks locally mailed',
  'Real stamp, postage included',
  'No minimums — send one card or one thousand',
  'Passes the Grandma Test',
];

export default function REVideoSection() {
  return (
    <section style={{ background: '#1a2d4a', padding: '72px 40px' }}>
      <div className="re-video-inner" style={{ maxWidth: '1060px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 528px', gap: '56px', alignItems: 'center' }}>

        {/* Left — bullets */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#007bff', marginBottom: '14px' }}>
            See It for Yourself
          </div>
          <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', marginBottom: '12px' }}>
            Watch a Card Being Made
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, marginBottom: '32px' }}>
            From the robotic arm writing your message to the addressed envelope, stuffed, sealed, stamped, and mailed. This is exactly what arrives in your client's mailbox.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, margin: 0 }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>
                <CheckCircleIcon />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — video */}
        <div className="re-video-right">
          <div style={{
            position: 'relative', borderRadius: '8px', overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.55)', background: '#0d1a28',
          }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', height: 'auto', display: 'block' }}
            >
              <source
                src="https://res.cloudinary.com/dge8qy1ps/video/upload/Handwritten_Note_process_zuyc3z.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
          <p style={{ marginTop: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.65)', fontStyle: 'italic' }}>
            A real robotic arm. A real ballpoint pen. Real ink on real cardstock.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .re-video-inner { grid-template-columns: 1fr !important; }
          .re-video-right { order: -1; }
        }
        @media (max-width: 768px) {
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}

function CheckCircleIcon() {
  return (
    <div style={{
      width: '22px', height: '22px', borderRadius: '50%', background: '#007bff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, fontSize: '11px', fontWeight: 900, color: 'white',
    }}>
      ✓
    </div>
  );
}