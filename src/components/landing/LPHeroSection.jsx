import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, CheckCircle, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LPHeroSection = () => {
  const handleGetSample = () => {
    base44.auth.redirectToLogin('/Home');
  };

  const scrollToHowItWorks = () => {
    const element = document.querySelector('#how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Left Column - Content (3/5) */}
          <div className="lg:col-span-3 space-y-8">
            <h1 className="text-[48px] lg:text-[48px] leading-[1.2] font-bold text-[#1a2332]">
              The Follow-Up System Your Prospects Will Actually Remember
            </h1>

            <p className="text-[20px] leading-[1.6] font-normal text-[#4a5568]">
              Stop losing deals to forgettable emails. Send authentic handwritten notes that get opened, read, and remembered—turning more leads into loyal customers who refer their friends.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleGetSample}
                style={{ backgroundColor: '#16a34a' }}
                className="text-white text-[18px] font-semibold px-9 py-[18px] rounded-lg hover:opacity-90 transition-all hover:-translate-y-0.5"
                size="lg"
              >
                Get Your Free Sample Note
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <Button
                variant="outline"
                onClick={scrollToHowItWorks}
                className="text-lg px-8 py-6 rounded-lg font-semibold gap-2 border-2 border-gray-300"
                size="lg"
              >
                <Play className="w-5 h-5" />
                See How It Works
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-[14px] text-[#6b7280]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#16a34a]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span>5-star rated</span>
              </div>
            </div>
          </div>

          {/* Right Column - Video/Image Placeholder (2/5) */}
          <div className="lg:col-span-2">
            <div className="relative rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.1)] bg-gray-100">
              {/* Placeholder for video or hero image */}
              <div className="aspect-[4/3] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-4 cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 text-[#FF7A00] ml-1" />
                  </div>
                  <p className="text-gray-500">Video Placeholder</p>
                  <p className="text-sm text-gray-400 mt-2">Replace with demo video or hero image</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LPHeroSection;