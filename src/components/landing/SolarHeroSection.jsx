import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sun, CheckCircle } from 'lucide-react';

/**
 * SolarHeroSection
 * Industry-specific hero for the Solar landing page.
 * Includes the Cloudinary video and solar-focused messaging.
 */
const VIDEO_URL = 'https://res.cloudinary.com/dge8qy1ps/video/upload/Handwritten_Note_process_zuyc3z.mp4';

const SolarHeroSection = () => {
  const scrollToBooking = () => {
    const el = document.querySelector('#solar-book-appointment');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHowItWorks = () => {
    const el = document.querySelector('#solar-how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-gradient-to-br from-amber-50 via-white to-orange-50 py-4 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-12 items-center">

          {/* Mobile: Video First */}
          <div className="lg:hidden">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
              <video autoPlay loop muted playsInline className="w-full h-auto object-cover">
                <source src={VIDEO_URL} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Left Column — Content (3/5) */}
          <div className="lg:col-span-3 space-y-6 lg:space-y-8">
            {/* Industry badge */}
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 rounded-full px-4 py-1.5 text-sm font-semibold">
              <Sun className="w-4 h-4" />
              Built for Solar Sales Professionals
            </div>

            <h1 className="text-[28px] lg:text-[48px] leading-[1.1] font-bold text-[#1a2332]">
              Close More Solar Deals with Handwritten Follow-Up Notes
            </h1>

            <p className="text-[17px] leading-relaxed text-[#4a5568]">
              Homeowners are bombarded with solar pitches. Stand out from every other installer with authentic, handwritten notes that build trust, earn referrals, and turn proposals into signed contracts.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={scrollToBooking}
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
                See How It Works
              </Button>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap items-center gap-6 text-[14px] text-[#6b7280]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#16a34a]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#16a34a]" />
                <span>Cards start under $2.49</span>
              </div>
            </div>
          </div>

          {/* Right Column — Video (2/5) — Desktop */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
              <video autoPlay loop muted playsInline className="w-full h-auto object-cover">
                <source src={VIDEO_URL} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolarHeroSection;