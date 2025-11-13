import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

export default function LPPricingSection() {
  const plans = [
    {
      name: "Rookie",
      credits: 5,
      price: 1997,
      pricePerCard: 399,
      features: [
        "5 handwritten notecards",
        "Envelope & postage included",
        "Choose from 20+ designs",
        "Basic templates library"
      ],
      highlighted: false
    },
    {
      name: "Starter",
      credits: 20,
      price: 5997,
      pricePerCard: 299,
      features: [
        "20 handwritten notecards",
        "Envelope & postage included",
        "All card designs",
        "Full template library",
        "Priority processing"
      ],
      highlighted: false
    },
    {
      name: "Growth Pack",
      credits: 50,
      price: 5997,
      originalPrice: 7497,
      pricePerCard: 119,
      features: [
        "50 handwritten notecards",
        "Envelope & postage included",
        "All card designs",
        "Full template library",
        "Priority processing",
        "Team collaboration tools",
        "Best value per card"
      ],
      highlighted: true,
      badge: "Most Popular"
    },
    {
      name: "Pro",
      credits: 100,
      price: 9997,
      pricePerCard: 99,
      features: [
        "100 handwritten notecards",
        "Everything in Growth Pack",
        "Dedicated account manager",
        "Custom templates",
        "Advanced analytics",
        "API access"
      ],
      highlighted: false
    }
  ];

  const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            No subscriptions. No hidden fees. Just pay for what you use.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-6 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-500 shadow-xl scale-105'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Star className="w-4 h-4 fill-white" />
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-1">
                  {plan.originalPrice && (
                    <span className="text-lg text-gray-400 line-through mr-2">
                      {formatPrice(plan.originalPrice)}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {formatPrice(plan.pricePerCard)} per card
                </p>
                <p className="text-sm font-semibold text-orange-600 mt-1">
                  {plan.credits} Credits
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.highlighted
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          All plans include envelope, postage, and mailing service
        </p>
      </div>
    </section>
  );
}