import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, CheckCircle, Calendar, Briefcase, ClipboardCheck, Cake } from "lucide-react";

export default function HowItWorksSection({ variation = 'A' }) {
  // Variation A: Simple 3-Step Process
  if (variation === 'A') {
    return (
      <section className="bg-white border-t border-[#e5e7eb] py-25 lg:py-25 py-15 px-6">
        <div className="max-w-[1100px] mx-auto">
          {/* Section Headline */}
          <h2 className="text-[42px] lg:text-[42px] text-[30px] font-bold leading-[1.3] text-[#1a2332] text-center mb-4">
            Send Your First Handwritten Note in 60 Seconds
          </h2>

          {/* Subheadline */}
          <p className="text-[18px] text-[#6b7280] text-center mb-16">
            No special equipment. No handwriting practice. Just three clicks.
          </p>

          {/* 3-Column Layout - Desktop, Vertical Stack - Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 mb-12">
            {/* Step 1 */}
            <div className="text-center lg:text-left">
              {/* Step Number */}
              <div className="text-[64px] lg:text-[64px] text-[48px] font-bold text-[#d4915f] opacity-20 leading-none mb-4">
                1
              </div>

              {/* Step Headline */}
              <h3 className="text-[24px] lg:text-[24px] text-[20px] font-semibold text-[#1a2332] mb-3">
                Choose Your Client
              </h3>

              {/* Step Description */}
              <p className="text-[18px] lg:text-[18px] text-[16px] leading-[1.7] text-[#374151] mb-4">
                Pick from your contact list or add a new one.
              </p>

              {/* Time Indicator */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-[14px] font-semibold text-[#d4915f]">
                <Clock className="w-4 h-4" />
                <span>15 seconds</span>
              </div>

              {/* Arrow Indicator - Mobile Only */}
              <div className="lg:hidden flex justify-center mt-6 text-[#d1d5db] text-[24px]">
                ↓
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center lg:text-left">
              {/* Step Number */}
              <div className="text-[64px] lg:text-[64px] text-[48px] font-bold text-[#d4915f] opacity-20 leading-none mb-4">
                2
              </div>

              {/* Step Headline */}
              <h3 className="text-[24px] lg:text-[24px] text-[20px] font-semibold text-[#1a2332] mb-3">
                Write Your Message
              </h3>

              {/* Step Description */}
              <p className="text-[18px] lg:text-[18px] text-[16px] leading-[1.7] text-[#374151] mb-4">
                Use our templates or write your own. We personalize it automatically.
              </p>

              {/* Time Indicator */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-[14px] font-semibold text-[#d4915f]">
                <Clock className="w-4 h-4" />
                <span>30 seconds</span>
              </div>

              {/* Arrow Indicator - Mobile Only */}
              <div className="lg:hidden flex justify-center mt-6 text-[#d1d5db] text-[24px]">
                ↓
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center lg:text-left">
              {/* Step Number */}
              <div className="text-[64px] lg:text-[64px] text-[48px] font-bold text-[#d4915f] opacity-20 leading-none mb-4">
                3
              </div>

              {/* Step Headline */}
              <h3 className="text-[24px] lg:text-[24px] text-[20px] font-semibold text-[#1a2332] mb-3">
                Click Send
              </h3>

              {/* Step Description */}
              <p className="text-[18px] lg:text-[18px] text-[16px] leading-[1.7] text-[#374151] mb-4">
                Our robots write it with real pens, address it, stamp it, and mail it.
              </p>

              {/* Time Indicator */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-[14px] font-semibold text-[#d4915f]">
                <Clock className="w-4 h-4" />
                <span>15 seconds</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mb-6">
            <Button 
              size="lg" 
              className="bg-[#16a34a] hover:bg-[#15803d] text-white text-lg font-semibold px-9 py-7 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(22,163,74,0.3)]"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Bottom Caption */}
          <div className="text-center">
            <p className="text-[16px] italic text-[#6b7280]">
              No writer's cramp. No post office trips.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Variation B: Automated Workflow Focus
  if (variation === 'B') {
    return (
      <section className="bg-[#fefbf7] border-t border-[#e5e7eb] py-25 lg:py-25 py-15 px-6">
        <div className="max-w-[1100px] mx-auto">
          {/* Section Headline */}
          <h2 className="text-[42px] lg:text-[42px] text-[30px] font-bold leading-[1.3] text-[#1a2332] text-center mb-4">
            Set It Once. Works Forever.
          </h2>

          {/* Subheadline */}
          <p className="text-[18px] text-[#6b7280] text-center mb-16">
            Automate your follow-up so every customer gets a handwritten note without you lifting a finger.
          </p>

          {/* Automated Scenarios */}
          <div className="space-y-6 mb-12 max-w-[800px] mx-auto">
            {/* Scenario 1: Job Scheduled */}
            <div className="bg-white border-2 border-[#e5e7eb] rounded-lg p-6 hover:border-[#d4915f] transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[20px] font-semibold text-[#1a2332] mb-2">
                    📋 Job Scheduled?
                  </h3>
                  <p className="text-[16px] text-[#374151] leading-[1.7]">
                    → Auto-send: "Looking forward to working with you" note
                  </p>
                </div>
              </div>
            </div>

            {/* Scenario 2: Estimate Sent */}
            <div className="bg-white border-2 border-[#e5e7eb] rounded-lg p-6 hover:border-[#d4915f] transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[20px] font-semibold text-[#1a2332] mb-2">
                    💼 Estimate Sent?
                  </h3>
                  <p className="text-[16px] text-[#374151] leading-[1.7]">
                    → Auto-send: "Thank you for your time" follow-up
                  </p>
                </div>
              </div>
            </div>

            {/* Scenario 3: Job Completed */}
            <div className="bg-white border-2 border-[#e5e7eb] rounded-lg p-6 hover:border-[#d4915f] transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[20px] font-semibold text-[#1a2332] mb-2">
                    ✅ Job Completed?
                  </h3>
                  <p className="text-[16px] text-[#374151] leading-[1.7]">
                    → Auto-send: "How did we do?" with review request
                  </p>
                </div>
              </div>
            </div>

            {/* Scenario 4: Customer's Birthday */}
            <div className="bg-white border-2 border-[#e5e7eb] rounded-lg p-6 hover:border-[#d4915f] transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Cake className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[20px] font-semibold text-[#1a2332] mb-2">
                    🎂 Customer's Birthday?
                  </h3>
                  <p className="text-[16px] text-[#374151] leading-[1.7]">
                    → Auto-send: Personal birthday card
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ending Caption */}
          <div className="text-center mb-12">
            <p className="text-[22px] font-semibold text-[#1a2332] mb-2">
              You focus on roofing.
            </p>
            <p className="text-[22px] font-semibold text-[#d4915f]">
              We handle staying memorable.
            </p>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-[#16a34a] hover:bg-[#15803d] text-white text-lg font-semibold px-9 py-7 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(22,163,74,0.3)]"
            >
              Automate My Follow-Up
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return null;
}