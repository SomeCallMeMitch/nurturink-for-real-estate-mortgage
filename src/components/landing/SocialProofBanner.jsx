import React, { useState, useEffect } from "react";
import { Mail, Star, Lock, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

// 5 Real testimonials from the document
const testimonials = [
  {
    quote: "These are working out so well for our sales team, they are just hanging out in the area waiting for each new incoming! We are so excited for our next round of mailers to drop to keep our sales team busy.",
    author: "Fargo Roofing"
  },
  {
    quote: "We just hired 3 new receptionists to make sure the right people are answering all the calls! These are doing so well that we are so excited to see the results from our next bulk order!",
    author: "Lakes Country Roofing and Siding"
  },
  {
    quote: "I'm so excited to re-invest all the money I made from this campaign back into my next one. We now have a marketing budget for every roofing job to mail to the surrounding areas from that job site. It's rinse and repeat, especially since we booked jobs within the first day of calls hitting.",
    author: "Premier Roofing"
  },
  {
    quote: "Our clients have appreciated the personal outreach we have done with them which has increased our reviews.",
    author: "Jamestown Roofing"
  },
  {
    quote: "We're feeling really good about the process and these campaigns, that there are now additional cities we'd like to add! This has been a great way to add to our job sites weekly.",
    author: "Grand Forks Exterior"
  }
];

export default function SocialProofBanner({ variation = 'A' }) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-rotate testimonials every 6 seconds
  useEffect(() => {
    if (!isPaused && !isHovered) {
      const interval = setInterval(() => {
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isPaused, isHovered]);

  const goToPrevious = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const goToNext = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const goToTestimonial = (index) => {
    setActiveTestimonial(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  // Variation A: Stats Banner (Original)
  if (variation === 'A') {
    return (
      <section className="bg-[#f9fafb] border-t border-gray-200 py-10 lg:py-10 py-6 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 lg:divide-x divide-gray-200">
            <div className="text-center lg:px-8">
              <Mail className="w-12 h-12 text-[#d4915f] mx-auto mb-4" />
              <div className="text-[36px] lg:text-[36px] text-[28px] font-bold text-[#1a2332] mb-2">
                1,000,000+
              </div>
              <div className="text-[14px] lg:text-[14px] text-[13px] font-normal text-[#6b7280] uppercase tracking-wide">
                Notes Mailed
              </div>
            </div>
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

  // Variation B: Testimonial Carousel Only (Original)
  if (variation === 'B') {
    return (
      <section className="bg-[#f9fafb] border-t border-gray-200 py-10 lg:py-10 py-6 px-6">
        <div className="max-w-[800px] mx-auto">
          <div 
            className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-8 lg:p-10 p-6 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="max-w-[700px] mx-auto">
              <p className="text-[18px] lg:text-[18px] text-[16px] leading-[1.7] italic text-[#1a2332] mb-4">
                "{testimonials[activeTestimonial].quote}"
              </p>
              <p className="text-[14px] font-semibold text-[#4a5568]">
                — {testimonials[activeTestimonial].author}
              </p>
            </div>
            <div className="hidden lg:block">
              <button 
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <button 
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
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

  // Variation C: Combined Stats + Testimonial (Original)
  if (variation === 'C') {
    return (
      <section className="bg-[#f9fafb] border-t border-gray-200 py-10 lg:py-10 py-6 px-6">
        <div className="max-w-[1200px] mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 lg:divide-x divide-gray-200">
            <div className="text-center lg:px-8">
              <Mail className="w-12 h-12 text-[#d4915f] mx-auto mb-4" />
              <div className="text-[36px] lg:text-[36px] text-[28px] font-bold text-[#1a2332] mb-2">
                1,000,000+
              </div>
              <div className="text-[14px] lg:text-[14px] text-[13px] font-normal text-[#6b7280] uppercase tracking-wide">
                Notes Mailed
              </div>
            </div>
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
          <div className="border-t border-gray-200 pt-8">
            <div 
              className="max-w-[700px] mx-auto text-center"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <p className="text-[18px] lg:text-[18px] text-[16px] leading-[1.7] italic text-[#1a2332] mb-4">
                "{testimonials[activeTestimonial].quote}"
              </p>
              <p className="text-[14px] font-semibold text-[#4a5568] mb-4">
                — {testimonials[activeTestimonial].author}
              </p>
              <div className="flex justify-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
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

  // Variation D: NEW - Trust Badge Bar + Testimonial Carousel (Combined from document)
  if (variation === 'D') {
    return (
      <>
        {/* PART 1: Trust Badge Bar - Navy Background */}
        <section className="bg-[#1a2332] border-b border-white/10 py-5 lg:py-5 py-4 px-6">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between lg:justify-center gap-4 lg:gap-6">
              {/* Badge 1 */}
              <div className="flex items-center gap-2 text-white text-[14px] lg:text-[14px] text-[12px] font-medium tracking-[0.02em]">
                <CheckCircle className="w-5 h-5 text-[#d4915f]" />
                <span>1,000,000+ Notes Mailed</span>
              </div>

              {/* Divider (Desktop only) */}
              <div className="hidden lg:block text-white/30 px-6">|</div>

              {/* Badge 2 */}
              <div className="flex items-center gap-2 text-white text-[14px] lg:text-[14px] text-[12px] font-medium tracking-[0.02em]">
                <Star className="w-5 h-5 text-[#d4915f] fill-[#d4915f]" />
                <span>5-Star Rated</span>
              </div>

              {/* Divider (Desktop only) */}
              <div className="hidden lg:block text-white/30 px-6">|</div>

              {/* Badge 3 */}
              <div className="flex items-center gap-2 text-white text-[14px] lg:text-[14px] text-[12px] font-medium tracking-[0.02em]">
                <Lock className="w-5 h-5 text-[#d4915f]" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </section>

        {/* PART 2: Testimonial Carousel - White/Cream Background */}
        <section className="bg-white border-b border-gray-200 py-15 lg:py-15 py-10 px-6">
          <div className="max-w-[900px] mx-auto">
            <div 
              className="bg-[#fefbf7] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-10 lg:p-12 p-6 relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Optional Decorative Quote Mark */}
              <div className="absolute top-6 left-6 text-[64px] leading-none font-serif text-[#d4915f] opacity-20 select-none pointer-events-none">
                "
              </div>

              {/* Testimonial Content */}
              <div className="max-w-[800px] mx-auto relative z-10">
                <p className="text-[20px] lg:text-[20px] text-[18px] leading-[1.7] italic text-[#1a2332] mb-5 font-normal">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <p className="text-[15px] font-semibold text-[#4a5568] not-italic">
                  — {testimonials[activeTestimonial].author}
                </p>
              </div>

              {/* Navigation Arrows (Desktop - Show on Hover) */}
              <div className={`hidden lg:block transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <button 
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white hover:bg-gray-50 rounded-full shadow-md transition-all hover:shadow-lg"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-8 h-8 text-[#4a5568] hover:text-[#1a2332]" />
                </button>
                <button 
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white hover:bg-gray-50 rounded-full shadow-md transition-all hover:shadow-lg"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-8 h-8 text-[#4a5568] hover:text-[#1a2332]" />
                </button>
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === activeTestimonial 
                        ? 'bg-[#d4915f] w-8' 
                        : 'bg-[#d1d5db] w-2 hover:bg-[#9ca3af]'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return null;
}