import React from 'react';

export default function EcommerceNav() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#172840',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0 20px'
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52
      }}>
        <a href="#top" style={{
          fontFamily: "'Sora', sans-serif", fontSize: '1.2rem', fontWeight: 900,
          color: '#fff', textDecoration: 'none'
        }}>
          Nurtur<span style={{ color: '#FF7A00' }}>Ink</span>
        </a>

        {/* Desktop nav links */}
        <ul style={{
          display: 'flex', gap: 28, listStyle: 'none',
          margin: 0, padding: 0
        }} className="ec-nav-links">
          <li><a href="#auth-section" style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, textDecoration: 'none', fontWeight: 600 }}>How It Works</a></li>
          <li><a href="#the-math" style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, textDecoration: 'none', fontWeight: 600 }}>The Math</a></li>
          <li><a href="#pricing" style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, textDecoration: 'none', fontWeight: 600 }}>Pricing</a></li>
          <li><a href="#book-call" style={{ background: '#FF7A00', color: '#fff', padding: '8px 18px', borderRadius: 4, fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>Book a Call</a></li>
          <li><a href="#sample" style={{ background: '#FF7A00', color: '#fff', padding: '8px 18px', borderRadius: 4, fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>Free Sample</a></li>
        </ul>

        {/* Mobile CTA only */}
        <a href="#book-call" style={{
          background: '#FF7A00', color: '#fff',
          padding: '8px 16px', borderRadius: 4,
          fontWeight: 700, fontSize: 15, textDecoration: 'none'
        }} className="ec-nav-cta-mobile">
          Book a Call
        </a>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .ec-nav-links { display: flex !important; }
          .ec-nav-cta-mobile { display: none !important; }
        }
        @media (max-width: 1023px) {
          .ec-nav-links { display: none !important; }
          .ec-nav-cta-mobile { display: block !important; }
        }
      `}</style>
    </nav>
  );
}