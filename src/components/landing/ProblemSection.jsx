import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, TrendingDown, Mail, Brain } from "lucide-react";

const variations = {
  1: {
    type: "emotional",
    headline: "The Hardest Part Isn't Winning the Job — It's Being Remembered.",
    body: [
      "You spent hours on that inspection, gave a fair price, maybe even followed up.",
      "Then silence.",
      "Most homeowners forget 9 out of 10 roofers within a week.",
      "Not because you did anything wrong — you just blended into the inbox clutter.",
      "RoofScribe helps you stand out with a real handwritten note that lands in their mailbox and sticks in their memory."
    ],
    cta: "See how easy it is to stay remembered",
    icon: Brain,
    bgColor: "bg-slate-50",
    accentColor: "text-red-600"
  },
  2: {
    type: "logic",
    headline: "Your Leads Don't Need Another Email — They Need Something Real.",
    body: [
      "Homeowners are drowning in digital noise: ads, texts, reminders.",
      "But handwritten envelopes get opened 99% of the time — and remembered for weeks.",
      "RoofScribe turns your digital follow-ups into personal notes that get read, felt, and acted on."
    ],
    stat: {
      number: "99%",
      label: "Open Rate for Handwritten Mail",
      source: "Direct Marketing Association Study"
    },
    cta: "Discover how it works in under 60 seconds",
    icon: Mail,
    bgColor: "bg-blue-50",
    accentColor: "text-blue-600"
  },
  3: {
    type: "story",
    headline: '"We Lost a $14K Job Because They Forgot Us."',
    body: [
      "Mike, a roofing rep from Ohio, had a great estimate call. The homeowner loved the pitch… then hired someone else.",
      "The difference? That roofer sent a handwritten thank-you note the next day.",
      "RoofScribe makes sure you're the one homeowners remember — with zero extra effort."
    ],
    cta: "Let's make sure it's your name they remember",
    icon: AlertCircle,
    bgColor: "bg-amber-50",
    accentColor: "text-amber-600"
  }
};

export default function ProblemSection({ variation = 1 }) {
  const content = variations[variation];
  const IconComponent = content.icon;

  return (
    <section className={`${content.bgColor} py-24`}>
      <div className="max-w-5xl mx-auto px-6">
        {/* Header with Icon */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-6">
            <IconComponent className={`w-10 h-10 ${content.accentColor}`} />
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight max-w-4xl mx-auto">
            {content.headline}
          </h2>
        </div>

        {/* Body Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 space-y-6 mb-8">
          {content.body.map((paragraph, index) => (
            <p 
              key={index} 
              className={`text-lg lg:text-xl leading-relaxed ${
                index === content.body.length - 1 
                  ? 'font-semibold text-slate-900' 
                  : 'text-slate-700'
              }`}
            >
              {paragraph}
            </p>
          ))}

          {/* Stat Box (Variation 2 only) */}
          {content.stat && (
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white mt-8">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{content.stat.number}</div>
                <div className="text-xl font-semibold mb-1">{content.stat.label}</div>
                <div className="text-sm text-blue-100">{content.stat.source}</div>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 gap-2 shadow-lg"
          >
            {content.cta}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}