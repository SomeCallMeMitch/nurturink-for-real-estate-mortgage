import React from 'react';
import { Upload, Pen, Send, BarChart3 } from 'lucide-react';

/**
 * SolarHowItWorksSection
 * 4-step process tailored to solar sales workflows.
 */
const STEPS = [
  {
    icon: Upload,
    num: '1',
    title: 'Upload Your Prospects',
    description: 'Import your homeowner leads from your CRM or a spreadsheet. Tag them by stage: site-visit, proposal sent, installed.',
  },
  {
    icon: Pen,
    num: '2',
    title: 'Choose or Customize a Message',
    description: 'Pick from solar-specific templates or write your own. Include personal details like the homeowner\'s name and neighborhood.',
  },
  {
    icon: Send,
    num: '3',
    title: 'We Write & Mail It',
    description: 'NurturInk creates authentic handwritten notes on premium card stock and mails them via USPS — typically arriving in 3-5 days.',
  },
  {
    icon: BarChart3,
    num: '4',
    title: 'Track Your Results',
    description: 'See which notes have been sent, monitor your pipeline, and measure the ROI on every note through your dashboard.',
  },
];

const SolarHowItWorksSection = () => (
  <section id="solar-how-it-works" className="py-16 lg:py-24 bg-gradient-to-br from-amber-50 to-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-14">
        <h2 className="text-[28px] md:text-4xl font-extrabold text-[#1a2332] mb-4">
          How It Works for Solar Teams
        </h2>
        <p className="text-[17px] text-gray-500 max-w-2xl mx-auto">
          From lead import to mailbox — in four simple steps.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {STEPS.map((s) => (
          <div key={s.num} className="text-center">
            <div className="relative mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF7A00' }}>
              <s.icon className="w-9 h-9 text-white" />
              <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#1a2332] text-white text-sm font-bold flex items-center justify-center">
                {s.num}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#1a2332] mb-2">{s.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SolarHowItWorksSection;