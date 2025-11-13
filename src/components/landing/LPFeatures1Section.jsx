import React from "react";
import { Handshake, Lightbulb, MapPin } from "lucide-react";

export default function LPFeatures1Section() {
  const features = [
    {
      icon: Handshake,
      title: "Build Trust Instantly",
      description: "Handwritten notes create a personal connection that emails can't match"
    },
    {
      icon: Lightbulb,
      title: "Stand Out From Competition",
      description: "Be the roofer they remember when they're ready to decide"
    },
    {
      icon: MapPin,
      title: "Local & Personal Touch",
      description: "Show homeowners you care with a tangible, thoughtful gesture"
    }
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}