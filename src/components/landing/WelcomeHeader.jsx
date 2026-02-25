import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * WelcomeHeader
 * Modified header with buttons linking to the Calendly appointment section
 */
const WelcomeHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Logo URL
  const logoUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696020df49a02437cf7a3031/d1689d419_NurturInklogoTiny.png';

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Industries", href: "#industries" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
    { label: "Book Demo", href: "#book-appointment" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignIn = () => {
    base44.auth.redirectToLogin('/Home');
  };

  // Scroll to free sample form section
  const handleGetSample = () => {
    // Try #get-sample first (landing pages), fall back to #book-appointment (Welcome page)
    const element = document.querySelector('#get-sample') || document.querySelector('#book-appointment');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Height increased ~15% from h-20 (80px) to h-[92px] */}
        <div className="flex items-center justify-between h-[92px]">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src={logoUrl} 
              alt="NurturInk Logo" 
              className="h-16 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-gray-700 hover:text-[#FF7A00] font-medium transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Auth Buttons - Sign In moved to footer */}
          <div className="hidden lg:flex items-center gap-4">
            <Button
              onClick={handleGetSample}
              style={{ backgroundColor: '#FF7A00' }}
              className="text-white font-semibold hover:opacity-90"
            >
              Get Free Sample
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="block w-full text-left text-gray-700 hover:text-[#FF7A00] font-medium py-2"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 space-y-3">
              <Button
                onClick={handleGetSample}
                style={{ backgroundColor: '#FF7A00' }}
                className="w-full text-white font-semibold"
              >
                Get Free Sample
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default WelcomeHeader;