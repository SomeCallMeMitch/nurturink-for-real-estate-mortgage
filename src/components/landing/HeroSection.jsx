import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, CheckCircle, Star } from "lucide-react";

const variations = {
  1: {
    headline: "Be the Roofer Homeowners Tell Their Neighbors About",
    subhead: "Personalized handwritten notes make customers feel special, turn one-time jobs into lifetime referrals, and build a reputation that brings work to your door.",
    cta: "Get Your Free Sample Note",
    tag: "Real Ink. Not a Font.",
    layout: "split",
    bgColor: "bg-gradient-to-br from-slate-50 to-blue-50",
    image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&q=80",
    imageAlt: "Handwritten thank you note"
  },
  2: {
    headline: "You Spent Hours On That Estimate. Don't Let a Generic Follow-Up Waste It.",
    subhead: "Handwritten notes show homeowners you're different—converting more leads into signed contracts and loyal customers who refer their friends.",
    cta: "Get My Free Sample",
    tag: "Used by 200+ Roofing Pros",
    layout: "overlay",
    bgColor: "bg-gradient-to-r from-slate-900 to-slate-800",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&q=80",
    imageAlt: "Roofing professional"
  },
  3: {
    headline: "Every Other Roofer Sends an Email. You're About to Send Something They'll Actually Keep.",
    subhead: "Handwritten thank-you notes get opened, read, and remembered—turning more estimates into contracts and customers into your best referral sources.",
    cta: "Send Me a Free Sample",
    tag: "Which would you remember?",
    layout: "comparison",
    bgColor: "bg-white",
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80",
    imageAlt: "Handwritten note comparison"
  },
  4: {
    headline: "Real Ink. Real Stamps. Real Results.",
    subhead: "Our robots write personalized notes with actual pens — then mail them with your return address and a real stamp. Looks like you wrote it. Works like you wish you had time to.",
    cta: "Get Your First Card Free",
    tag: "Actual Pen Pressure. Real Ink Bleed.",
    tagSubtext: "US Only • Under $3 Each",
    layout: "centered",
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    imageAlt: "Pen writing"
  },
  5: {
    headline: 'What If Every Customer Remembered You as "The One Who Took The Time"?',
    subhead: "Stand out with authentic handwritten notes that build trust, close more deals, and create customers who can't stop talking about you.",
    cta: "Try It Free — We'll Write and Mail It For You",
    tag: "Thank-you cards get saved. Emails get archived.",
    layout: "hero",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80",
    imageAlt: "Happy homeowners"
  }
};

export default function HeroSection({ variation = 1 }) {
  const content = variations[variation];

  // Layout 1: Split (Left content, Right image)
  if (content.layout === "split") {
    return (
      <section className={`${content.bgColor} min-h-screen flex items-center`}>
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

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
            </div>

            {/* Right Image */}
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

  // Layout 2: Overlay (Background image with overlay content)
  if (content.layout === "overlay") {
    return (
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={content.image}
            alt={content.imageAlt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 to-slate-900/70"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl space-y-8">
            <div className="inline-block">
              <span className="text-4xl font-bold text-white">RoofScribe</span>
            </div>

            <div className="inline-block bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {content.tag}
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              {content.headline}
            </h1>
            
            <p className="text-xl text-slate-200 leading-relaxed">
              {content.subhead}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 gap-2">
                {content.cta}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center gap-6 text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span>Trusted by roofing pros</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Layout 3: Comparison (Side-by-side comparison)
  if (content.layout === "comparison") {
    return (
      <section className={`${content.bgColor} min-h-screen flex items-center`}>
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-8 mb-16">
            <div className="inline-block">
              <span className="text-4xl font-bold text-orange-500">RoofScribe</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight max-w-4xl mx-auto">
              {content.headline}
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              {content.subhead}
            </p>

            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 gap-2">
              {content.cta}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Comparison Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Email Card */}
            <div className="bg-slate-100 rounded-2xl p-8 space-y-4 border-2 border-slate-200">
              <div className="flex items-center gap-3">
                <Mail className="w-8 h-8 text-slate-400" />
                <h3 className="text-2xl font-bold text-slate-700">Generic Email</h3>
              </div>
              <div className="bg-white rounded-lg p-4 text-sm text-slate-500 space-y-2 font-mono">
                <p>Subject: Thank you for your business</p>
                <p className="border-t pt-2">Hi [NAME],</p>
                <p>Thank you for choosing us...</p>
                <p className="text-xs text-slate-400">📧 Buried in inbox</p>
              </div>
              <p className="text-slate-500 text-center text-sm">Deleted in 2 seconds</p>
            </div>

            {/* Handwritten Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 space-y-4 border-2 border-orange-300 shadow-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-orange-500" />
                <h3 className="text-2xl font-bold text-slate-900">Handwritten Note</h3>
              </div>
              <div className="bg-white rounded-lg p-4 text-sm space-y-2" style={{ fontFamily: 'Caveat, cursive' }}>
                <p className="text-2xl text-slate-700">Hi Sarah,</p>
                <p className="text-xl text-slate-600">Just wanted to thank you personally for trusting us with your roof...</p>
                <p className="text-xs text-orange-600 font-sans">✉️ Pinned on fridge</p>
              </div>
              <p className="text-orange-600 text-center font-semibold">{content.tag}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Layout 4: Centered (Centered content with image)
  if (content.layout === "centered") {
    return (
      <section className={`${content.bgColor} min-h-screen flex items-center`}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <span className="text-4xl font-bold text-orange-500">RoofScribe</span>
            </div>

            <div className="inline-block bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {content.tag}
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight">
              {content.headline}
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              {content.subhead}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 gap-2">
                {content.cta}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {content.tagSubtext && (
              <p className="text-slate-500 text-sm">{content.tagSubtext}</p>
            )}

            {/* Image */}
            <div className="max-w-4xl mx-auto mt-12">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={content.image}
                  alt={content.imageAlt}
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Layout 5: Hero (Full-width hero with content overlay)
  if (content.layout === "hero") {
    return (
      <section className={`${content.bgColor} min-h-screen flex items-center`}>
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
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

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-blue-900 font-medium">{content.tag}</p>
              </div>

              <div className="flex items-center gap-6 text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span>5-star rated</span>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={content.image}
                  alt={content.imageAlt}
                  className="w-full h-[600px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
}