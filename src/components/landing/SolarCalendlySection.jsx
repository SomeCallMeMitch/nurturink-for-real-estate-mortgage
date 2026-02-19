import React, { useEffect } from 'react';
import { Calendar, Gift, Presentation } from 'lucide-react';

/**
 * SolarCalendlySection
 * Calendly appointment booking for Solar landing page.
 * Mirrors WelcomeCalendlySection with solar-specific copy.
 */
const SolarCalendlySection = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const existing = document.querySelector(
        'script[src="https://assets.calendly.com/assets/external/widget.js"]'
      );
      if (existing) existing.remove();
    };
  }, []);

  return (
    <section id="solar-book-appointment" className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF7A00' }}>
              <Presentation className="w-7 h-7 text-white" />
            </div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1a2332' }}>
              <Gift className="w-7 h-7 text-white" />
            </div>
          </div>

          <h2 className="text-[28px] md:text-5xl lg:text-6xl leading-[1.1] font-extrabold mb-4" style={{ color: '#1a2332' }}>
            Demonstrations &amp; Free Samples
          </h2>
          <p className="text-[17px] leading-[1.1] text-gray-600 max-w-2xl mx-auto mb-2 font-semibold">
            by Appointment
          </p>
          <p className="text-[17px] leading-[1.1] text-gray-500 max-w-xl mx-auto">
            See how handwritten notes can transform your solar sales pipeline — and get free sample cards mailed to you
          </p>
        </div>

        {/* Calendly Embed */}
        <div className="max-w-4xl mx-auto">
          <div
            className="calendly-inline-widget rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
            data-url="https://calendly.com/nurturink/30min?hide_gdpr_banner=1&primary_color=FF7A00"
            style={{ minWidth: '320px', height: '700px', backgroundColor: 'white' }}
          />
        </div>

        {/* Info Pills */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6" style={{ color: '#FF7A00' }} />
              <span className="text-lg">15-minute demo</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6" style={{ color: '#FF7A00' }} />
              <span className="text-lg">Free sample cards included</span>
            </div>
            <div className="flex items-center gap-2">
              <Presentation className="w-6 h-6" style={{ color: '#FF7A00' }} />
              <span className="text-lg">No obligation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolarCalendlySection;