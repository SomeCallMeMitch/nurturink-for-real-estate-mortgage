import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star } from "lucide-react";

const variations = {
  1: {
    headline: "Be the Roofer Homeowners Tell Their Neighbors About",
    subheadline: "Personalized handwritten notes make customers feel special, turn one-time jobs into lifetime referrals, and build a reputation that brings work to your door.",
    cta: "Get Your Free Sample Note",
    image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&q=80",
    imageAlt: "Handwritten notecard on clipboard",
    badge: "Real Ink. Not a Font.",
    badgePosition: "image-top-right"
  },
  2: {
    headline: "You Spent Hours On That Estimate. Don't Let a Generic Follow-Up Waste It.",
    subheadline: "Handwritten notes show homeowners you're different—converting more leads into signed contracts and loyal customers who refer their friends.",
    cta: "Get My Free Sample",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
    imageAlt: "Robotic pen writing system in action",
    badge: "Used by 200+ Roofing Pros",
    badgePosition: "image-top-right",
    copyWidth: "lg:col-span-3",
    imageWidth: "lg:col-span-2"
  },
  3: {
    headline: "Every Other Roofer Sends an Email. You're About to Send Something They'll Actually Keep.",
    subheadline: "Handwritten thank-you notes get opened, read, and remembered—turning more estimates into contracts and customers into your best referral sources.",
    cta: "Send Me a Free Sample",
    image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1200&q=80",
    imageAlt: "Handwritten note on refrigerator",
    caption: "Which would you remember?",
    captionPosition: "bottom-center"
  },
  4: {
    headline: "Real Ink. Real Stamps. Real Results.",
    subheadline: "Our robots write personalized notes with actual pens — then mail them with your return address and a real stamp. Looks like you wrote it. Works like you wish you had time to.",
    cta: "Get Your First Card Free",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
    imageAlt: "Macro shot of pen writing on paper",
    topBadge: "Actual Pen Pressure. Real Ink Bleed.",
    topBadgeStyle: "bg-orange-500 text-white",
    copyWidth: "lg:col-span-3",
    imageWidth: "lg:col-span-2"
  },
  5: {
    headline: 'What If Every Customer Remembered You as "The One Who Took The Time"?',
    subheadline: "Stand out with authentic handwritten notes that build trust, close more deals, and create customers who can't stop talking about you.",
    cta: "Try It Free — We'll Write and Mail It For You",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80",
    imageAlt: "Happy homeowner reading handwritten note"
  }
};

export default function HeroSection1({ variation = 1 }) {
  const content = variations[variation];
  const copyWidth = content.copyWidth || "lg:col-span-3";
  const imageWidth = content.imageWidth || "lg:col-span-2";

  return (
    <section className="bg-white py-20 lg:py-20 px-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Top Badge (Variation 4 only) */}
        {content.topBadge && (
          <div className="mb-6">
            <span className={`inline-block ${content.topBadgeStyle} px-3 py-1.5 rounded-2xl text-sm font-semibold`}>
              {content.topBadge}
            </span>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Left Content - 60% */}
          <div className={`${copyWidth} space-y-8`}>
            {/* Headline */}
            <h1 className="text-[48px] lg:text-[48px] text-[32px] leading-[1.2] font-bold text-[#1a2332]">
              {content.headline}
            </h1>
            
            {/* Subheadline */}
            <p className="text-[20px] lg:text-[20px] text-[18px] leading-[1.6] font-normal text-[#4a5568]">
              {content.subheadline}
            </p>

            {/* CTA Button */}
            <div>
              <Button 
                size="lg" 
                className="bg-[#16a34a] hover:bg-[#15803d] text-white text-[18px] lg:text-[18px] text-[16px] font-semibold px-9 py-[18px] rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(22,163,74,0.3)] w-full sm:w-auto h-14 sm:h-auto"
              >
                {content.cta}
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

          {/* Right Image - 40% */}
          <div className={`${imageWidth} relative`}>
            <div className="relative rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
              <img 
                src={content.image}
                alt={content.imageAlt}
                className="w-full h-[500px] lg:h-[600px] object-cover"
              />
              
              {/* Badge Overlay - Top Right */}
              {content.badgePosition === "image-top-right" && (
                <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                  <span className="text-sm font-semibold text-[#1a2332]">{content.badge}</span>
                </div>
              )}
              
              {/* Caption Overlay - Bottom Center */}
              {content.captionPosition === "bottom-center" && (
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm py-4">
                  <p className="text-center font-bold text-[#1a2332] text-lg">{content.caption}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}