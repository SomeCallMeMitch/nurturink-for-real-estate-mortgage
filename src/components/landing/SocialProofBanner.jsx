import React, { useState, useEffect } from "react";
import { Mail, Star, Lock, ChevronLeft, ChevronRight } from "lucide-react";

// Placeholder testimonials - User will replace with real ones
const testimonials = [
  {
    quote: "[Your first real testimonial quote will go here]",
    author: "Customer Name",
    company: "Company Name"
  },
  {
    quote: "[Your second real testimonial quote will go here]",
    author: "Customer Name",
    company: "Company Name"
  },
  {
    quote: "[Your third real testimonial quote will go here]",
    author: "Customer Name",
    company: "Company Name"
  },
  {
    quote: "[Your fourth real testimonial quote will go here]",
    author: "Customer Name",
    company: "Company Name"
  }
];

export default function SocialProofBanner({ variation = 'A' }) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    if ((variation === 'B' || variation === 'C') && !isPaused) {
      const interval = setInterval(() => {
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [variation, isPaused]);

  // Variation A: Stats Banner
  if (variation === 'A') {
    return (
      <section className="bg-[#f9fafb] border-t border-gray-200 py-10 lg:py-10 py-6 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 lg:divide-x divide-gray-200">
            {/* Stat 1 */}
            <div className="text-center lg:px-8">
              <Mail className="w-12 h-12 text-[#d4915f] mx-auto mb-4" />
              <div className="text-[36px] lg:text-[36px] text-[28px] font-bold text-[#1a2332] mb-2">
                1,000,000+
              </div>
              <div className="text-[14px] lg:text-[14px] text-[13px] font-normal text-[#6b7280] uppercase tracking-wide">
                Notes Mailed
              </div>
            </div>

            {/* Stat 2 */}
            <div className="text-center lg:px-8">
              <Star className="w-12 h-12 text-[#d4915f] mx-auto mb-4 fill-[#d4915f]" />
              <div className="text-[36px] lg:text-[36px] text-[28px] font-bold text-[#1a2332] mb-2">
                5-Star
              </div>
              <div className="text-[14px] lg:text-[14px] text-[13px] font-normal text-[#6b7280] uppercase tracking-wide">
                Rated Service
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variation B: Testimonial Carousel Only
  if (variation === 'B') {
    return (
      <section className="bg-[#f9fafb] border-t border-gray-200 py-10 lg:py-10 py-6 px-6">
        <div className="max-w-[800px] mx-auto">
          <div 
            className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-8 lg:p-10 p-6 relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Testimonial Content */}
            <div className="max-w-[700px] mx-auto">
              <p className="text-[18px] lg:text-[18px] text-[16px] leading-[1.7] italic text-[#1a2332] mb-4">
                "{testimonials[activeTestimonial].quote}"
              </p>
              <p className="text-[14px] font-semibold text-[#4a5568]">
                — {testimonials[activeTestimonial].author}, {testimonials[activeTestimonial].company}
              </p>
            </div>

            {/* Navigation Arrows (Desktop) */}
            <div className="hidden lg:block">
              <button 
                onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <button 
                onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeTestimonial 
                      ? 'bg-[#1a2332] w-6' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variation C: Combined Stats + Testimonial
  if (variation === 'C') {
    return (
      <section className="bg-[#f9fafb] border-t border-gray-200 py-10 lg:py-10 py-6 px-6">
        <div className="max-w-[1200px] mx-auto space-y-8">
          {/* Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 lg:divide-x divide-gray-200">
            {/* Stat 1 */}
            <div className="text-center lg:px-8">
              <Mail className="w-12 h-12 text-[#d4915f] mx-auto mb-4" />
              <div className="text-[36px] lg:text-[36px] text-[28px] font-bold text-[#1a2332] mb-2">
                1,000,000+
              </div>
              <div className="text-[14px] lg:text-[14px] text-[13px] font-normal text-[#6b7280] uppercase tracking-wide">
                Notes Mailed
              </div>
            </div>

            {/* Stat 2 */}
            <div className="text-center lg:px-8">
              <Star className="w-12 h-12 text-[#d4915f] mx-auto mb-4 fill-[#d4915f]" />
              <div className="text-[36px] lg:text-[36px] text-[28px] font-bold text-[#1a2332] mb-2">
                5-Star
              </div>
              <div className="text-[14px] lg:text-[14px] text-[13px] font-normal text-[#6b7280] uppercase tracking-wide">
                Rated Service
              </div>
            </div>
          </div>

          {/* Testimonial Section */}
          <div className="border-t border-gray-200 pt-8">
            <div 
              className="max-w-[700px] mx-auto text-center"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <p className="text-[18px] lg:text-[18px] text-[16px] leading-[1.7] italic text-[#1a2332] mb-4">
                "{testimonials[activeTestimonial].quote}"
              </p>
              <p className="text-[14px] font-semibold text-[#4a5568] mb-4">
                — {testimonials[activeTestimonial].author}, {testimonials[activeTestimonial].company}
              </p>

              {/* Dots Navigation */}
              <div className="flex justify-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === activeTestimonial 
                        ? 'bg-[#1a2332] w-6' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variation D: Trust Badge Bar
  if (variation === 'D') {
    return (
      <section className="bg-[#1a2332] border-t border-gray-700 py-5 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 text-white">
            {/* Badge 1 */}
            <div className="flex items-center gap-2 text-[14px] lg:text-[14px] text-[12px]">
              <Mail className="w-5 h-5" />
              <span>✓ 1M+ Notes Mailed</span>
            </div>

            {/* Divider (Desktop only) */}
            <div className="hidden lg:block w-px h-6 bg-white/20" />

            {/* Badge 2 */}
            <div className="flex items-center gap-2 text-[14px] lg:text-[14px] text-[12px]">
              <Star className="w-5 h-5 fill-white" />
              <span>⭐ 5-Star Rated</span>
            </div>

            {/* Divider (Desktop only) */}
            <div className="hidden lg:block w-px h-6 bg-white/20" />

            {/* Badge 3 */}
            <div className="flex items-center gap-2 text-[14px] lg:text-[14px] text-[12px]">
              <Lock className="w-5 h-5" />
              <span>🔒 Secure</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
}