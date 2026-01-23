import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LPPricingSection = () => {
  const tiers = [
    {
      name: "Starter",
      credits: 5,
      price: "$19.97",
      pricePerNote: "$3.99",
      popular: false,
      features: [
        "5 handwritten notes",
        "Real ink, real stamps",
        "Custom message & signature",
        "24-48 hour turnaround",
        "Quality cardstock"
      ]
    },
    {
      name: "Professional",
      credits: 20,
      price: "$69.97",
      pricePerNote: "$3.50",
      popular: true,
      features: [
        "20 handwritten notes",
        "All Starter features",
        "Priority processing",
        "Custom return address",
        "Template library access",
        "Team collaboration tools"
      ]
    },
    {
      name: "Growth",
      credits: 50,
      price: "$149.97",
      pricePerNote: "$3.00",
      popular: false,
      features: [
        "50 handwritten notes",
        "All Professional features",
        "Dedicated account support",
        "Bulk upload & send",
        "CRM integrations",
        "Advanced analytics"
      ]
    }
  ];

  const handleGetStarted = () => {
    base44.auth.redirectToLogin('/Home');
  };

  return (
    <section id="pricing" className="bg-gray-50 py-8 lg:py-12">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[36px] lg:text-[36px] font-bold text-[#1a2332] mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-[18px] text-[#4a5568] max-w-3xl mx-auto">
            No subscriptions. No hidden fees. Just credits that never expire.
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`bg-white rounded-2xl p-8 relative ${
                tier.popular 
                  ? 'border-2 shadow-xl scale-105' 
                  : 'border border-gray-200 shadow-sm'
              }`}
              style={tier.popular ? { borderColor: '#16a34a' } : {}}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div 
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-white text-sm font-semibold"
                  style={{ backgroundColor: '#16a34a' }}
                >
                  Most Popular
                </div>
              )}

              {/* Tier Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[#1a2332] mb-2">
                  {tier.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-[#1a2332]">
                    {tier.price}
                  </span>
                </div>
                <p className="text-sm text-[#6b7280]">
                  {tier.pricePerNote} per note
                </p>
                <p className="text-sm font-medium" style={{ color: '#16a34a' }}>
                  {tier.credits} credits
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
                    <span className="text-[#4a5568]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                onClick={handleGetStarted}
                className={`w-full font-semibold ${
                  tier.popular ? 'text-white' : ''
                }`}
                style={tier.popular ? { backgroundColor: '#16a34a' } : {}}
                variant={tier.popular ? 'default' : 'outline'}
                size="lg"
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-12">
          <p className="text-[#4a5568] mb-2">
            Need more? <span className="font-semibold" style={{ color: '#FF7A00' }}>Enterprise plans</span> available for teams sending 100+ notes/month.
          </p>
          <p className="text-sm text-[#6b7280]">
            Credits never expire. Use them whenever you need them.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LPPricingSection;