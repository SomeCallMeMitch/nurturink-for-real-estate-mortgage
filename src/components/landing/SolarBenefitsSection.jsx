import React from 'react';
import { Home, RefreshCw, TrendingUp, Users, Clock, Shield } from 'lucide-react';

/**
 * SolarBenefitsSection
 * Solar-industry–specific benefits of handwritten notes.
 */
const BENEFITS = [
  {
    icon: Home,
    title: 'Win More Proposals',
    description: 'A handwritten thank-you after a site visit makes your proposal memorable when homeowners compare bids from 3-5 installers.',
  },
  {
    icon: Users,
    title: 'Generate Referrals',
    description: 'Delighted customers who receive a personal note after install are far more likely to recommend you to neighbors and friends.',
  },
  {
    icon: RefreshCw,
    title: 'Re-engage Cold Leads',
    description: 'Revive stalled proposals with a thoughtful follow-up note. It cuts through email clutter and reminds homeowners why they were interested.',
  },
  {
    icon: TrendingUp,
    title: 'Boost Close Rates',
    description: 'Solar companies using handwritten notes report 15-30% higher close rates compared to email-only follow-up sequences.',
  },
  {
    icon: Clock,
    title: 'Automate the Personal Touch',
    description: 'Set up campaigns once and NurturInk sends real handwritten notes on autopilot — after site visits, installs, and anniversaries.',
  },
  {
    icon: Shield,
    title: 'Build Long-Term Trust',
    description: 'Solar is a big investment. A personal note signals you care about the relationship, not just the sale.',
  },
];

const SolarBenefitsSection = () => (
  <section id="solar-benefits" className="py-16 lg:py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-14">
        <h2 className="text-[28px] md:text-4xl font-extrabold text-[#1a2332] mb-4">
          Why Solar Pros Choose Handwritten Notes
        </h2>
        <p className="text-[17px] text-gray-500 max-w-2xl mx-auto">
          In a market where every installer sends the same email templates, a handwritten note is your unfair advantage.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {BENEFITS.map((b) => (
          <div key={b.title} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
              style={{ backgroundColor: '#fff7ed' }}
            >
              <b.icon className="w-6 h-6" style={{ color: '#FF7A00' }} />
            </div>
            <h3 className="text-lg font-bold text-[#1a2332] mb-2">{b.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{b.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SolarBenefitsSection;