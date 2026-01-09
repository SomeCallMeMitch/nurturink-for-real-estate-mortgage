import React from 'react';
import { Mail, Star, Clock } from 'lucide-react';

const LPSocialProofLogos = () => {
  const stats = [
    { icon: Mail, value: "1,000,000+", label: "Notes Mailed" },
    { icon: Star, value: "5-Star", label: "Rated Service" },
    { icon: Clock, value: "24-48hr", label: "Turnaround" }
  ];

  return (
    <section style={{ backgroundColor: '#1a2332' }} className="py-6">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex justify-center items-center gap-8 lg:gap-16 flex-wrap">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <React.Fragment key={stat.label}>
                {index > 0 && (
                  <div className="hidden lg:block h-12 w-px bg-white/20" />
                )}
                <div className="text-center">
                  <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: '#d4915f' }} />
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LPSocialProofLogos;