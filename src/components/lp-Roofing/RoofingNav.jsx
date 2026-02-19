import React from 'react';

/**
 * RoofingNav — sticky nav bar
 * Cloned from SolarNav
 */
export default function RoofingNav() {
  return (
    <nav
      style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: '#2a4a7a',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0 40px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <a href="#" className="font-sora" style={{ fontSize: '1.55rem', fontWeight: 900, textDecoration: 'none' }}>
        <span style={{ color: '#ffffff' }}>Nurtur</span>
        <span style={{ color: '#FF7A00' }}>Ink</span>
      </a>

      {/* Right side: links + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <RoofingNavLink href="#why-nurturink">Why NurturInk</RoofingNavLink>
        <RoofingNavLink href="#calculator">ROI Calculator</RoofingNavLink>
        <a
          href="#get-sample"
          className="font-lato"
          style={{
            background: '#FF7A00', color: '#ffffff', padding: '9px 20px',
            borderRadius: '4px', textDecoration: 'none', fontWeight: 700,
            fontSize: '15px', border: '2px solid #FF7A00',
            transition: 'background 0.18s, transform 0.18s, box-shadow 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e86e00'; e.currentTarget.style.borderColor = '#e86e00'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,122,0,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#FF7A00'; e.currentTarget.style.borderColor = '#FF7A00'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          Get Free Sample
        </a>
      </div>

      {/* Mobile override */}
      <style>{`
        @media (max-width: 768px) {
          nav { padding: 0 20px !important; }
        }
      `}</style>
    </nav>
  );
}

function RoofingNavLink({ href, children }) {
  return (
    <a
      href={href}
      className="font-lato roofing-nav-link"
      style={{
        color: 'rgba(255,255,255,0.8)', textDecoration: 'none',
        fontSize: '15px', fontWeight: 700, transition: 'color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
    >
      {children}
      <style>{`
        @media (max-width: 768px) {
          .roofing-nav-link { display: none !important; }
        }
      `}</style>
    </a>
  );
}