import React from 'react';

/**
 * RENav — sticky nav bar
 * Real Estate: navy bg, blue accent
 * Change 1: Added "Open House Calculator" link; renamed to "ROI Calculator"
 */
export default function RENav() {
  return (
    <nav
      style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: '#0f1623',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0 40px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <a href="#" className="font-sora" style={{ fontSize: '1.55rem', fontWeight: 900, textDecoration: 'none' }}>
        <span style={{ color: '#ffffff' }}>Nurtur</span>
        <span style={{ color: '#007bff' }}>Ink</span>
      </a>

      {/* Right side: links + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <RENavLink href="#why-nurturink">Why NurturInk</RENavLink>
        <RENavLink href="#calculator">ROI Calculator</RENavLink>
        <a
          href="#get-sample"
          className="font-inter"
          style={{
            background: '#007bff', color: '#ffffff', padding: '9px 20px',
            borderRadius: '4px', textDecoration: 'none', fontWeight: 700,
            fontSize: '15px', border: '2px solid #007bff',
            transition: 'background 0.18s, transform 0.18s, box-shadow 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#0056b3'; e.currentTarget.style.borderColor = '#0056b3'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,123,255,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#007bff'; e.currentTarget.style.borderColor = '#007bff'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
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

function RENavLink({ href, children }) {
  return (
    <a
      href={href}
      className="font-inter re-nav-link"
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
          .re-nav-link { display: none !important; }
        }
      `}</style>
    </a>
  );
}