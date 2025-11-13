import React from "react";
import { Users, MessageSquare, Send } from "lucide-react";

export default function LPHowItWorksSection() {
  const steps = [
    {
      number: "1",
      icon: Users,
      title: "Choose Your Recipients",
      description: "Select clients from your CRM or upload a list. Tag and organize however you like."
    },
    {
      number: "2",
      icon: MessageSquare,
      title: "Personalize Your Message",
      description: "Use templates or write custom messages. Add merge fields for personal touches."
    },
    {
      number: "3",
      icon: Send,
      title: "We Handle the Rest",
      description: "Our robots write with real pens, address envelopes, add postage, and mail them out."
    }
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-xl text-gray-600">
            From upload to mailbox in minutes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {step.number}
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-0.5 bg-orange-300"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}