import React from 'react';
import { Phone } from 'lucide-react';

/**
 * WelcomeFooter
 * Simplified footer with only phone contact
 * Phone: 916.990.2020 (Cell Phone, text first)
 */
const WelcomeFooter = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer style={{ backgroundColor: '#1a2332' }} className="text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Brand Column */}
          <div>
            <div className="mb-4">
              <div className="text-2xl font-bold">
                <span className="text-white">Nurtur</span>
                <span style={{ color: '#FF7A00' }}>Ink</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Personalized follow-up</p>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Handwritten notes that help sales professionals stand out and close more deals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection('#how-it-works')}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#pricing')}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#industries')}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Industries
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#book-appointment')}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Book Appointment
                </button>
              </li>
            </ul>
          </div>

          {/* Contact - Phone Only */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FF7A00' }}
              >
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">916.990.2020</p>
                <p className="text-gray-400 text-sm mt-1">Cell Phone, text first</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} NurturInk. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
          {/* Login link - small and subtle at bottom */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                const { base44 } = require('@/api/base44Client');
                base44.auth.redirectToLogin('/Home');
              }}
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

export default WelcomeFooter;