import React from 'react';
import { Target, TrendingUp, DollarSign } from 'lucide-react';

const LPStatsBanner = () => {
  const benefits = [
    {
      icon: Target,
      stat: "99%",
      title: "Open Rate",
      description: "Physical mail gets opened. Your message gets seen, not buried in spam."
    },
    {
      icon: TrendingUp,
      stat: "20-35%",
      title: "More Appointments",
      description: "Our clients see dramatic increases in booked appointments after implementing handwritten follow-ups."
    },
    {
      icon: DollarSign,
      stat: "10-50x",
      title: "ROI",
      description: "One extra closed deal typically pays for a year's worth of notes. The math just works."
    }
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-[36px] lg:text-[36px] font-bold text-[#1a2332] mb-4">
            Why Handwritten Notes Outperform Digital
          </h2>
          <p className="text-[18px] text-[#4a5568] max-w-3xl mx-auto">
            In a world of digital noise, a personal touch makes all the difference.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={benefit.title}
                className="bg-white rounded-xl p-8 border border-gray-200 text-center hover:shadow-lg transition-all"
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#dcfce7' }}
                >
                  <Icon className="w-8 h-8" style={{ color: '#16a34a' }} />
                </div>
                <div className="text-4xl font-bold mb-2" style={{ color: '#16a34a' }}>
                  {benefit.stat}
                </div>
                <h3 className="text-xl font-semibold text-[#1a2332] mb-3">
                  {benefit.title}
                </h3>
                <p className="text-[#4a5568] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LPStatsBanner;