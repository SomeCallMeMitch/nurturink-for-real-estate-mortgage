import React from "react";

export default function LPStatsBanner() {
  const stats = [
    {
      value: "99%",
      label: "Open Rate for Handwritten Mail",
      sublabel: "vs 21% for email"
    },
    {
      value: "8-20%",
      label: "Average Response Rate",
      sublabel: "vs 0.6% for email"
    },
    {
      value: "500+",
      label: "Roofing Companies Using This",
      sublabel: "Growing daily"
    }
  ];

  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 text-center text-white">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-6xl font-bold mb-2">{stat.value}</div>
              <div className="text-xl font-semibold mb-1">{stat.label}</div>
              <div className="text-blue-200 text-sm">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}