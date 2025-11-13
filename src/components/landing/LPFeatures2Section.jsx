import React from "react";
import { Clock, DollarSign, Users, Zap } from "lucide-react";

export default function LPFeatures2Section() {
  const features = [
    {
      icon: Clock,
      title: "Save Hours Every Week",
      description: "No more writing cards by hand. We handle everything from printing to mailing."
    },
    {
      icon: DollarSign,
      title: "Less Than a Coffee",
      description: "Under $3 per card including postage, envelope, and handwritten personalization."
    },
    {
      icon: Users,
      title: "Perfect for Teams",
      description: "Allocate credits to sales reps. Track who sends what. Manage everything centrally."
    },
    {
      icon: Zap,
      title: "Send in Minutes",
      description: "Select clients, customize message, choose design. Done. We handle the rest."
    }
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Roofing Pros Love This
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to stay top-of-mind with prospects
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}