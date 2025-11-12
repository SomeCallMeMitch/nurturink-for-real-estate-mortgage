import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star } from "lucide-react";

const variations = {
  1: {
    headline: "Be the Roofer Homeowners Tell Their Neighbors About",
    subhead: "Personalized handwritten notes make customers feel special, turn one-time jobs into lifetime referrals, and build a reputation that brings work to your door.",
    cta: "Get Your Free Sample Note",
    badge: "Real Ink. Not a Font.",
    badgePosition: "image",
    image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&q=80",
    imageAlt: "Handwritten notecard with pen"
  },
  2: {
    headline: "You Spent Hours On That Estimate. Don't Let a Generic Follow-Up Waste It.",
    subhead: "Handwritten notes show homeowners you're different—converting more leads into signed contracts and loyal customers who refer their friends.",
    cta: "Get My Free Sample",
    badge: "Used by 200+ Roofing Pros",
    badgePosition: "image",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
    imageAlt: "Robotic pen writing system"
  },
  3: {
    headline: "Every Other Roofer Sends an Email. You're About to Send Something They'll Actually Keep.",
    subhead: "Handwritten thank-you notes get opened, read, and remembered—turning more estimates into contracts and customers into your best referral sources.",
    cta: "Send Me a Free Sample",
    badge: "Which would you remember?",
    badgePosition: "bottom",
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&q=80",
    imageAlt: "Handwritten note vs email comparison"
  },
  4: {
    headline: "Real Ink. Real Stamps. Real Results.",
    subhead: "Our robots write personalized notes with actual pens — then mail them with your return address and a real stamp. Looks like you wrote it. Works like you wish you had time to.",
    cta: "Get Your First Card Free",
    badge: "Actual Pen Pressure. Real Ink Bleed.",
    badgePosition: "header",
    secondaryBadge: "US Only • Under $3 Each",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
    imageAlt: "Macro shot of pen writing on paper"
  },
  5: {
    headline: 'What If Every Customer Remembered You as "The One Who Took The Time"?',
    subhead: "Stand out with authentic handwritten notes that build trust, close more deals, and create customers who can't stop talking about you.",
    cta: "Try It Free — We'll Write and Mail It For You",
    badge: "Thank-you cards get saved. Emails get archived.",
    badgePosition: "callout",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80",
    imageAlt: "Happy homeowner reading handwritten note"
  }
};

export default function HeroSection({ variation = 1 }) {
  const content = variations[variation];

  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header Badge (Variation 4 only) */}
        {content.badgePosition === "header" && (
          <div className="mb-6">
            <span className="inline-block bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
              {content.badge}
            </span>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Left Content - 60% (3/5 columns) */}
          <div className="lg:col-span-3 space-y-8">
            {/* RoofScribe Logo */}
            <div>
              <span className="text-3xl font-bold text-orange-500">RoofScribe</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-[48px] leading-[1.2] lg:text-[48px] font-bold text-[#1a2332]">
              {content.headline}
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl lg:text-[20px] leading-[1.6] text-[#4a5568]">
              {content.subhead}
            </p>

            {/* Secondary Badge (Variation 4 only) */}
            {content.secondaryBadge && (
              <p className="text-sm text-[#6b7280]">{content.secondaryBadge}</p>
            )}

            {/* CTA Button */}
            <div>
              <Button 
                size="lg" 
                className="bg-[#16a34a] hover:bg-[#15803d] text-white text-lg font-semibold px-9 py-7 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(22,163,74,0.3)]"
              >
                {content.cta}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#6b7280]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#16a34a]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span>5-star rated</span>
              </div>
            </div>

            {/* Callout Badge (Variation 5 only) */}
            {content.badgePosition === "callout" && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-blue-900 font-medium">{content.badge}</p>
              </div>
            )}
          </div>

          {/* Right Image - 40% (2/5 columns) */}
          <div className="lg:col-span-2 relative">
            <div className="relative rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
              <img 
                src={content.image}
                alt={content.imageAlt}
                className="w-full h-[500px] lg:h-[600px] object-cover"
              />
              
              {/* Image Badge Overlay */}
              {content.badgePosition === "image" && (
                <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
                  <span className="text-sm font-semibold text-[#1a2332]">{content.badge}</span>
                </div>
              )}
              
              {/* Bottom Badge Overlay */}
              {content.badgePosition === "bottom" && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <p className="text-white font-bold text-center text-lg">{content.badge}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}