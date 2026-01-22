import React from 'react';
import { DollarSign, Mail, Stamp } from 'lucide-react';

/**
 * WelcomePricingBanner
 * Replaces the pricing section with a simple, attractive banner
 * showing the "Less than $2.49 per card including postage" message
 */
const WelcomePricingBanner = () => {
  return (
    <section id="pricing" className="py-16 md:py-24" style={{ backgroundColor: '#1a2332' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          {/* Icon cluster */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div className="text-5xl font-bold text-white">+</div>
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <Stamp className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Main pricing message */}
          <h2 className="text-[28px] md:text-5xl lg:text-6xl leading-[1.1] font-extrabold text-white mb-4">
            Less than{' '}
            <span style={{ color: '#FF7A00' }}>$2.49</span>
            {' '}per card
          </h2>
          
          <p className="text-[17px] md:text-2xl leading-[1.0] text-gray-300 mb-8">
            Including postage and handling
          </p>

          {/* Value props */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-gray-400">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" style={{ color: '#FF7A00' }} />
              <span>No monthly fees</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" style={{ color: '#FF7A00' }} />
              <span>No contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" style={{ color: '#FF7A00' }} />
              <span>Pay only for what you send</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomePricingBanner;