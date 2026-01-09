import React from 'react';
import { Clock, Shield, Zap, Repeat, Users, Settings } from 'lucide-react';

const LPFeaturesSection = () => {
  const features = [
    {
      icon: Clock,
      title: "Save Hours Every Week",
      description: "Automated personalization lets you focus on what you do best—building relationships and closing deals."
    },
    {
      icon: Shield,
      title: "Authentic Quality",
      description: "Real ink on quality cardstock. Our notes are indistinguishable from hand-written, building genuine rapport."
    },
    {
      icon: Zap,
      title: "Fast, Reliable Delivery",
      description: "Notes are written, stamped, and mailed within 24-48 hours, landing in mailboxes quickly."
    },
    {
      icon: Repeat,
      title: "Easy to Scale",
      description: "Send one note or thousands. Our system handles bulk campaigns just as easily as individual thank-yous."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Manage your whole team's outreach from one dashboard. Share templates, track usage, allocate credits."
    },
    {
      icon: Settings,
      title: "Fully Customizable",
      description: "Your message, your signature, your return address. Every note feels personally written by you."
    }
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-[36px] lg:text-[36px] font-bold text-[#1a2332] mb-4">
            Everything You Need to Stand Out
          </h2>
          <p className="text-[18px] text-[#4a5568] max-w-3xl mx-auto">
            Built for busy sales professionals who want maximum impact with minimum effort.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.title}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#fff7ed' }}
                >
                  <Icon className="w-6 h-6" style={{ color: '#FF7A00' }} />
                </div>
                <h3 className="text-lg font-semibold text-[#1a2332] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#4a5568] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LPFeaturesSection;