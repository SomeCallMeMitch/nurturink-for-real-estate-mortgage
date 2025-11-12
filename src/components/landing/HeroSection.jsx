import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star } from "lucide-react";

const variations = {
  1: {
    headline: "Be the Roofer Homeowners Tell Their Neighbors About",
    subhead: "Personalized handwritten notes make customers feel special, turn one-time jobs into lifetime referrals, and build a reputation that brings work to your door.",
    cta: "Get Your Free Sample Note",
    tag: "Real Ink. Not a Font.",
    image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&q=80",
    imageAlt: "Handwritten thank you note"
  },
  2: {
    headline: "You Spent Hours On That Estimate. Don't Let a Generic Follow-Up Waste It.",
    subhead: "Handwritten notes show homeowners you're different—converting more leads into signed contracts and loyal customers who refer their friends.",
    cta: "Get My Free Sample",
    tag: "Used by 200+ Roofing Pros",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&q=80",
    imageAlt: "Roofing professional"
  },
  3: {
    headline: "Every Other Roofer Sends an Email. You're About to Send Something They'll Actually Keep.",
    subhead: "Handwritten thank-you notes get opened, read, and remembered—turning more estimates into contracts and customers into your best referral sources.",
    cta: "Send Me a Free Sample",
    tag: "Which would you remember?",
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80",
    imageAlt: "Handwritten note comparison"
  },
  4: {
    headline: "Real Ink. Real Stamps. Real Results.",
    subhead: "Our robots write personalized notes with actual pens — then mail them with your return address and a real stamp. Looks like you wrote it. Works like you wish you had time to.",
    cta: "Get Your First Card Free",
    tag: "Actual Pen Pressure. Real Ink Bleed.",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    imageAlt: "Pen writing"
  },
  5: {
    headline: 'What If Every Customer Remembered You as "The One Who Took The Time"?',
    subhead: "Stand out with authentic handwritten notes that build trust, close more deals, and create customers who can't stop talking about you.",
    cta: "Try It Free — We'll Write and Mail It For You",
    tag: "Thank-you cards get saved. Emails get archived.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80",
    imageAlt: "Happy homeowners"
  }
};

export default function HeroSection({ variation = 1 }) {
  const content = variations[variation];

  return (
    <section className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="text-4xl font-bold text-orange-500">RoofScribe</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                {content.headline}
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                {content.subhead}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 gap-2">
                {content.cta}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center gap-6 text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-sm">Trusted by roofing pros</span>
              </div>
            </div>
          </div>

          {/* Right Image - Consistent Layout */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={content.image}
                alt={content.imageAlt}
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-full shadow-lg">
                <span className="text-sm font-semibold text-orange-500">{content.tag}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}