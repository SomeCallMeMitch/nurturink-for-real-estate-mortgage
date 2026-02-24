import React from 'react';

export default function EcommerceCTA() {
  return (
    <section style={{ background: '#FF7A00', padding: '50px 0', textAlign: 'center' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <h2 style={{
          fontFamily: "'Sora', sans-serif", fontSize: 'clamp(1.45rem, 5vw, 2.2rem)',
          fontWeight: 900, lineHeight: 1.12, color: '#fff', marginBottom: 10
        }}>
          Ready to See If This Makes Sense for Your Store?
        </h2>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.88)', lineHeight: 1.44, maxWidth: 500, margin: '0 auto 24px' }}>
          Request a free sample card or book a 30-minute call and we will walk through exactly how it works for your business.
        </p>
        <a
          href="#book-call"
          style={{
            background: '#fff', color: '#FF7A00',
            fontSize: 17, fontWeight: 900, padding: '15px 36px',
            display: 'inline-block', textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: 4, transition: 'transform 0.18s'
          }}
        >
          Book a 30-Min Call
        </a>
        <p style={{ marginTop: 12, fontSize: 15, color: 'rgba(255,255,255,0.7)' }}>
          Real pen. Real cardstock. Postage included. No contracts. No credit card required.
        </p>
      </div>
    </section>
  );
}