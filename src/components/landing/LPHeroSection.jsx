import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LPHeroSection() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Finally, A Follow-Up Method That Roofing Prospects Actually Appreciate
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Stop losing contracts to competitors who send forgettable emails. Send handwritten notecards that get opened, read, and remembered—turning more estimates into signed deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 rounded-lg font-semibold gap-2"
                onClick={() => base44.auth.redirectToLogin('/Home')}
              >
                Get Your Free Sample Note
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-lg font-semibold gap-2 border-2 border-gray-300">
                <Play className="w-5 h-5" />
                See How It Works
              </Button>
            </div>
          </div>

          {/* Right Video/Image */}
          <div className="relative">
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl flex items-center justify-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-orange-500 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}