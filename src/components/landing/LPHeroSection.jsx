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

          {/* Right Column - Hero Image (2/5) */}
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
              {/* Hero image showing robot pen writing */}
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696020df49a02437cf7a3031/c314e0a0b_PenWriting.jpg"
                alt="Robot pen writing a handwritten note"
                className="w-full h-auto object-cover"
              />
              {/* Subtle overlay gradient for polish */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LPHeroSection;