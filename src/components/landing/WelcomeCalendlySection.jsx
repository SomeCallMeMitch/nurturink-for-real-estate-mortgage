import React, { useEffect } from 'react';
import { Calendar, Gift, Presentation } from 'lucide-react';

/**
 * WelcomeCalendlySection
 * Calendly appointment booking section for demonstrations and free samples
 */
const WelcomeCalendlySection = () => {
  // Load Calendly widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <section id="book-appointment" className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF7A00' }}>
              <Presentation className="w-7 h-7 text-white" />
            </div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1a2332' }}>
              <Gift className="w-7 h-7 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4" style={{ color: '#1a2332' }}>
            Demonstrations & Free Samples
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
            by Appointment
          </p>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Schedule a personalized demo and receive free sample cards mailed directly to you
          </p>
        </div>

        {/* Calendly Embed */}
        <div className="max-w-4xl mx-auto">
          <div 
            className="calendly-inline-widget rounded-2xl overflow-hidden shadow-2xl border border-gray-200" 
            data-url="https://calendly.com/nurturink?hide_gdpr_banner=1&primary_color=FF7A00"
            style={{ 
              minWidth: '320px', 
              height: '700px',
              backgroundColor: 'white'
            }}
          />
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: '#FF7A00' }} />
              <span>15-minute demo</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5" style={{ color: '#FF7A00' }} />
              <span>Free sample cards included</span>
            </div>
            <div className="flex items-center gap-2">
              <Presentation className="w-5 h-5" style={{ color: '#FF7A00' }} />
              <span>No obligation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeCalendlySection;