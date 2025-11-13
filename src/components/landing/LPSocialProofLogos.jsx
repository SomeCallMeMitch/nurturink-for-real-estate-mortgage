import React from "react";

export default function LPSocialProofLogos() {
  return (
    <section className="bg-white py-12 border-t border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm text-gray-500 uppercase tracking-wide mb-8 font-semibold">
          Trusted by Leading Roofing Companies
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-center">
              <div className="w-32 h-16 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400 font-semibold">Logo {i}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}