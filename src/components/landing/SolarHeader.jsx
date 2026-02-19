import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

/**
 * SolarHeader
 * Sticky header for the Solar landing page.
 * Logo from NurturInk assets. CTA scrolls to Calendly section.
 */
const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696020df49a02437cf7a3031/d1689d419_NurturInklogoTiny.png';

const NAV_LINKS = [
  { label: 'Why Notes', href: '#solar-benefits' },
  { label: 'How It Works', href: '#solar-how-it-works' },
  { label: 'Results', href: '#solar-results' },
  { label: 'Book Demo', href: '#solar-book-appointment' },
];

const SolarHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-[92px]">
          {/* Logo */}
          <img src={LOGO_URL} alt="NurturInk Logo" className="h-16 w-auto" />

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="text-gray-700 hover:text-[#FF7A00] font-medium transition-colors"
              >
                {l.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center">
            <Button
              onClick={() => scrollTo('#solar-book-appointment')}
              style={{ backgroundColor: '#FF7A00' }}
              className="text-white font-semibold hover:opacity-90"
            >
              Get Free Sample
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-4">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="block w-full text-left text-gray-700 hover:text-[#FF7A00] font-medium py-2"
            >
              {l.label}
            </button>
          ))}
          <Button
            onClick={() => scrollTo('#solar-book-appointment')}
            style={{ backgroundColor: '#FF7A00' }}
            className="w-full text-white font-semibold"
          >
            Get Free Sample
          </Button>
        </div>
      )}
    </header>
  );
};

export default SolarHeader;