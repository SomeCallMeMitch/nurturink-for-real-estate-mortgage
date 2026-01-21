import React from 'react';
import { Home, Shield, Sun, Car, TrendingUp, Users } from 'lucide-react';

const LPIndustriesSection = () => {
  const industries = [
    { 
      name: "Real Estate", 
      icon: Home,
      description: "Agents & Brokers"
    },
    { 
      name: "Insurance", 
      icon: Shield,
      description: "Agents & Advisors"
    },
    { 
      name: "Solar & HVAC", 
      icon: Sun,
      description: "Home Services"
    },
    { 
      name: "Auto & Yacht", 
      icon: Car,
      description: "Luxury Sales"
    },
    { 
      name: "Financial Services", 
      icon: TrendingUp,
      description: "Advisors & Planners"
    },
    { 
      name: "Roofing", 
      icon: Users,
      description: "Contractors & Sales"
    }
  ];

  return (
    <section id="industries" className="bg-gray-50 py-16">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-[36px] lg:text-[36px] font-bold text-[#1a2332] mb-4">
            Built for Sales Professionals Across Every Industry
          </h2>
          <p className="text-[18px] text-[#4a5568] max-w-3xl mx-auto">
            Whether you're in real estate, insurance, or any high-touch sales role—handwritten notes help you stand out and close more deals.
          </p>
        </div>

        {/* Industry Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <div 
                key={industry.name}
                className="bg-white rounded-xl p-6 border border-gray-200 text-center hover:shadow-lg hover:border-[#FF7A00]/20 transition-all cursor-pointer"
              >
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#fff7ed' }}
                >
                  <Icon className="w-7 h-7" style={{ color: '#FF7A00' }} />
                </div>
                <h3 className="font-semibold text-[#1a2332] mb-1">
                  {industry.name}
                </h3>
                <p className="text-sm text-[#6b7280]">
                  {industry.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Text */}
        <p className="text-center text-gray-600 mt-8">
          Don't see your industry? Handwritten notes work for any relationship-based business.
        </p>
      </div>
    </section>
  );
};

export default LPIndustriesSection;