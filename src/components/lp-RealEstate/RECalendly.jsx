import React, { useEffect } from 'react';

/**
 * RECalendly — Appointment booking section with Calendly embed
 * Real Estate: blue accent, navy bg
 */
export default function RECalendly() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      const existing = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existing) existing.remove();
    };
  }, []);

  return (
    <section style={{ background: '#1a2d4a', padding: '80px 40px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#007bff', marginBottom: '14px' }}>
          Book a Demo
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', marginBottom: '16px' }}>
          Demonstrations &amp; Free Samples
        </h2>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.55, maxWidth: '700px', margin: '0 auto 40px' }}>
          Schedule a personalized demo and receive free sample cards mailed directly to you.
        </p>
        <div
          className="calendly-inline-widget"
          data-url="https://calendly.com/nurturink/30min?hide_gdpr_banner=1&primary_color=007bff"
          style={{ minWidth: '320px', height: '700px', borderRadius: '8px', overflow: 'hidden' }}
        />
      </div>
      <style>{`
        @media (max-width: 768px) {
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}