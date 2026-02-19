import React from 'react';
import { Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

/**
 * SolarFooter
 * Matches WelcomeFooter style with solar-specific copy.
 */
const SolarFooter = () => {
  const year = new Date().getFullYear();
  const navigate = useNavigate();

  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer style={{ backgroundColor: '#1a2332' }} className="text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="text-2xl font-bold mb-1">
              <span className="text-white">Nurtur</span>
              <span style={{ color: '#FF7A00' }}>Ink</span>
            </div>
            <p className="text-sm text-gray-400 mt-1 mb-4">Handwritten notes for solar professionals</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Help your solar team stand out, close more deals, and generate referrals with authentic handwritten follow-up.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Why Notes', href: '#solar-benefits' },
                { label: 'How It Works', href: '#solar-how-it-works' },
                { label: 'Results', href: '#solar-results' },
                { label: 'Book Demo', href: '#solar-book-appointment' },
              ].map((l) => (
                <li key={l.href}>
                  <button onClick={() => scrollTo(l.href)} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FF7A00' }}>
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">916.990.2020</p>
                <p className="text-gray-400 text-sm mt-1">Cell Phone, text first</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">&copy; {year} NurturInk. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-400">
              <button onClick={() => navigate(createPageUrl('Legal'))} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => navigate(createPageUrl('Legal'))} className="hover:text-white transition-colors">Terms of Service</button>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={() => base44.auth.redirectToLogin('/Home')}
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              Team Member Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SolarFooter;