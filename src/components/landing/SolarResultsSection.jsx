import React from 'react';
import { TrendingUp, Star, Users, DollarSign } from 'lucide-react';

/**
 * SolarResultsSection
 * Stats banner + mini testimonial-style proof points for solar.
 */
const STATS = [
  { icon: TrendingUp, value: '27%', label: 'Higher Close Rate' },
  { icon: Users, value: '3x', label: 'More Referrals' },
  { icon: DollarSign, value: '$2.49', label: 'Per Card Incl. Postage' },
  { icon: Star, value: '98%', label: 'Customer Satisfaction' },
];

const QUOTES = [
  {
    text: '"We started sending handwritten notes after every site visit. Our close rate jumped from 22% to 31% in 90 days."',
    author: 'Sales Manager — Regional Solar Installer',
  },
  {
    text: '"Homeowners actually call us back after getting the note. It\'s the best ROI marketing tool we\'ve ever used."',
    author: 'Owner — Residential Solar Company',
  },
];

const SolarResultsSection = () => (
  <section id="solar-results" className="py-16 lg:py-24" style={{ backgroundColor: '#1a2332' }}>
    <div className="max-w-7xl mx-auto px-6">

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-4">
              <s.icon className="w-7 h-7" style={{ color: '#FF7A00' }} />
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{s.value}</div>
            <div className="text-gray-400 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Testimonial Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        {QUOTES.map((q, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <p className="text-white text-lg leading-relaxed mb-4">{q.text}</p>
            <p className="text-gray-400 text-sm font-medium">— {q.author}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SolarResultsSection;