import React from 'react';
import { Upload, Edit3, Send, CheckCircle } from 'lucide-react';

const LPHowItWorksSection = () => {
  const steps = [
    {
      icon: Upload,
      number: "1",
      title: "Upload Your Contacts",
      description: "Import your list or add clients one at a time or in bulk whatever works for your workflow."
    },
    {
      icon: Edit3,
      number: "2",
      title: "Personalize Your Message",
      description: "Choose from proven templates or write your own. Add merge fields like {First Name} and {Company} to make each note feel personal."
    },
    {
      icon: Send,
      number: "3",
      title: "We Write & Mail It",
      description: "Our AI will automatically vary each letter just like a human would. We stuff, stamp, and mail each note within 24-48 hours."
    },
    {
      icon: CheckCircle,
      number: "4",
      title: "Watch the Responses Roll In",
      description: "Your prospects receive real, physical mail that stands out. They're more likely to answer your call, refer friends and leave a great review."
    }
  ];

  return (
    <section id="how-it-works" className="bg-white py-8 lg:py-12">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[28px] lg:text-[36px] leading-[1.1] font-bold text-[#1a2332] mb-4">
            How It Works
          </h2>
          <p className="text-[17px] leading-[1.1] text-[#4a5568] max-w-3xl mx-auto">
            Send authentic handwritten notes in four simple steps—no handwriting required.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="text-center">
                {/* Icon Circle */}
                <div className="relative inline-block mb-6">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#fff7ed' }}
                  >
                    <Icon className="w-10 h-10" style={{ color: '#FF7A00' }} />
                  </div>
                  {/* Step Number Badge */}
                  <div 
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-[22px] font-semibold text-[#1a2332] mb-3">
                  {step.title}
                </h3>
                <p className="text-[#4a5568] leading-[1.1] text-base">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LPHowItWorksSection;