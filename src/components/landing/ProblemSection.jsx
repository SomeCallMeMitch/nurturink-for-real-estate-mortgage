import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Mail, Quote } from "lucide-react";

const variations = {
  1: {
    type: "emotional",
    headline: "The Hardest Part Isn't Winning the Job — It's Being Remembered.",
    paragraphs: [
      "You spent hours on that inspection, gave a fair price, maybe even followed up.",
      "Then silence.",
      "Most homeowners forget 9 out of 10 roofers within a week.",
      "Not because you did anything wrong — you just blended into the inbox clutter.",
      "NurturInk helps you stand out with a real handwritten note that lands in their mailbox and sticks in their memory."
    ],
    cta: "See how easy it is to stay remembered",
    icon: Brain,
    bgGradient: "from-slate-50 to-slate-100",
    iconBg: "bg-red-100",
    iconColor: "text-red-600"
  },
  2: {
    type: "logic",
    headline: "Your Leads Don't Need Another Email — They Need Something Real.",
    paragraphs: [
      "Homeowners are drowning in digital noise: ads, texts, reminders.",
      "But handwritten envelopes get opened 99% of the time — and remembered for weeks.",
      "NurturInk turns your digital follow-ups into personal notes that get read, felt, and acted on."
    ],
    stat: {
      number: "99%",
      label: "Open Rate for Handwritten Mail",
      source: "Direct Marketing Association Study"
    },
    cta: "Discover how it works in under 60 seconds",
    icon: Mail,
    bgGradient: "from-blue-50 to-indigo-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  3: {
    type: "story",
    headline: '"We Lost a $14K Job Because They Forgot Us."',
    paragraphs: [
      "Mike, a roofing rep from Ohio, had a great estimate call. The homeowner loved the pitch… then hired someone else.",
      "The difference? That roofer sent a handwritten thank-you note the next day.",
      "NurturInk makes sure you're the one homeowners remember — with zero extra effort."
    ],
    quote: {
      text: "I thought our estimate was solid. Turns out, their thank-you card was better than our follow-up email.",
      author: "Mike T., Roofing Sales Rep, Ohio"
    },
    cta: "Let's make sure it's your name they remember",
    icon: Quote,
    bgGradient: "from-amber-50 to-orange-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600"
  }
};

export default function ProblemSection({ variation = 1 }) {
  const content = variations[variation];
  const IconComponent = content.icon;

  return (
    <section className={`bg-gradient-to-br ${content.bgGradient} py-20 lg:py-24`}>
      <div className="max-w-[1100px] mx-auto px-6">
        {/* Header with Icon */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${content.iconBg} mb-6`}>
            <IconComponent className={`w-10 h-10 ${content.iconColor}`} />
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1a2332] leading-tight max-w-4xl mx-auto">
            {content.headline}
          </h2>
        </div>

        {/* Body Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 mb-8">
          <div className="space-y-6">
            {content.paragraphs.map((paragraph, index) => (
              <p 
                key={index} 
                className={`text-lg lg:text-xl leading-relaxed ${
                  index === content.paragraphs.length - 1 
                    ? 'font-semibold text-[#1a2332]' 
                    : 'text-[#4a5568]'
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Stat Box (Variation 2) */}
          {content.stat && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white mt-8">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{content.stat.number}</div>
                <div className="text-xl font-semibold mb-1">{content.stat.label}</div>
                <div className="text-sm text-blue-100">{content.stat.source}</div>
              </div>
            </div>
          )}

          {/* Quote Box (Variation 3) */}
          {content.quote && (
            <div className="border-l-4 border-amber-500 bg-amber-50 rounded-r-xl p-6 mt-8">
              <p className="text-lg italic text-[#1a2332] mb-3">"{content.quote.text}"</p>
              <p className="text-sm font-semibold text-amber-700">— {content.quote.author}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-[#16a34a] hover:bg-[#15803d] text-white text-lg font-semibold px-9 py-7 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(22,163,74,0.3)]"
          >
            {content.cta}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}