import React from "react";
import { Lightbulb, TrendingDown, DollarSign, MessageSquareOff } from "lucide-react";

export default function ProblemAgitationSection({ variation = 'A' }) {
  // Variation A: "The Follow-Up Gap"
  if (variation === 'A') {
    return (
      <section className="bg-white border-t border-b border-[#e5e7eb] py-20 lg:py-20 py-12 px-6">
        <div className="max-w-[900px] mx-auto">
          {/* Optional Icon */}
          <div className="mb-8">
            <MessageSquareOff className="w-12 h-12 text-[#d4915f] mx-auto lg:mx-0" />
          </div>

          {/* Headline */}
          <h2 className="text-[36px] lg:text-[36px] text-[28px] font-bold leading-[1.3] text-[#1a2332] mb-8">
            Here's What Happens After You Send That Estimate
          </h2>

          {/* Body Copy */}
          <div className="space-y-6 text-[18px] lg:text-[18px] text-[16px] leading-[1.8] text-[#374151]">
            <p>
              You spend 2-3 hours measuring, calculating, and creating the perfect proposal. You present it professionally. The homeowner smiles and says, "We'll think about it."
            </p>

            {/* Dramatic spacing for "Then... silence." */}
            <p className="text-[#1a2332] font-semibold text-[20px] my-8">
              Then... silence.
            </p>

            <p>
              Or maybe you send a quick text. A generic email. Maybe you call and leave a voicemail.
            </p>

            <p>
              Meanwhile, your competitor—who might have a higher bid—sends a handwritten thank-you note. It arrives in their mailbox with a real stamp. The homeowner puts it on their fridge.
            </p>

            <p className="italic text-[#1a2332] font-semibold">
              Guess who they remember when it's time to decide?
            </p>

            <p className="font-semibold text-[#1a2332]">
              Not the roofer with the lowest bid. The one who made them feel valued.
            </p>
          </div>

          {/* Callout Box */}
          <div className="mt-10 bg-[#fef3e7] border-l-4 border-[#d4915f] rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-[#d4915f] flex-shrink-0 mt-1" />
              <p className="text-[17px] font-semibold text-[#1a2332] leading-[1.6]">
                The difference between winning and losing a $15,000 job often comes down to a $2.49 notecard.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variation B: "The Referral Problem"
  if (variation === 'B') {
    return (
      <section className="bg-[#fafbfc] border-t border-b border-[#e5e7eb] py-20 lg:py-20 py-12 px-6">
        <div className="max-w-[900px] mx-auto">
          {/* Optional Icon */}
          <div className="mb-8">
            <TrendingDown className="w-12 h-12 text-[#d4915f] mx-auto lg:mx-0" />
          </div>

          {/* Headline */}
          <h2 className="text-[36px] lg:text-[36px] text-[28px] font-bold leading-[1.3] text-[#1a2332] mb-8">
            You Do Great Work. So Why Don't You Get More Referrals?
          </h2>

          {/* Body Copy */}
          <div className="space-y-6 text-[18px] lg:text-[18px] text-[16px] leading-[1.8] text-[#374151]">
            <p className="font-semibold text-[#1a2332]">
              The job's done. The roof looks amazing. The customer is happy.
            </p>

            <p>
              But three months later when their neighbor needs a roofer? They can't quite remember your company name.
            </p>

            <p>
              They scroll through their phone trying to find your contact. Was it <span className="italic">[Your Company]</span>? <span className="italic">[Similar Name]</span>? They give up and Google "roofers near me" instead.
            </p>

            <p>
              You did perfect work and they <span className="font-bold text-[#1a2332]">STILL</span> forgot about you.
            </p>

            <p className="text-[20px] font-semibold text-[#d4915f]">
              The difference between a one-time customer and someone who refers you 5 times over 10 years? Staying memorably present.
            </p>
          </div>

          {/* Stat Callout Box */}
          <div className="mt-10 bg-[#1a2332] rounded-lg p-6 lg:p-8">
            <div className="flex items-start gap-4">
              <span className="text-[32px] flex-shrink-0">📊</span>
              <div className="text-white">
                <p className="text-[17px] lg:text-[18px] leading-[1.7] mb-2">
                  <span className="font-bold text-[22px] text-[#d4915f]">82%</span> of satisfied customers say they'd refer a contractor... but only <span className="font-bold text-[22px] text-[#d4915f]">11%</span> actually do.
                </p>
                <p className="text-[16px] font-semibold">
                  The problem isn't your work. It's staying memorable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variation C: "The Math of Being Forgettable"
  if (variation === 'C') {
    return (
      <section className="bg-white border-t border-b border-[#e5e7eb] py-20 lg:py-20 py-12 px-6">
        <div className="max-w-[900px] mx-auto">
          {/* Optional Icon */}
          <div className="mb-8">
            <DollarSign className="w-12 h-12 text-[#d4915f] mx-auto lg:mx-0" />
          </div>

          {/* Headline */}
          <h2 className="text-[36px] lg:text-[36px] text-[28px] font-bold leading-[1.3] text-[#1a2332] mb-8">
            Calculate What Being "Just Another Roofer" Is Costing You
          </h2>

          {/* Body Copy with Calculations */}
          <div className="space-y-6 text-[18px] lg:text-[18px] text-[16px] leading-[1.8] text-[#374151]">
            <p>
              Let's say you send <span className="font-bold text-[#1a2332]">20 estimates per month</span>.
            </p>

            <div className="pl-6 border-l-4 border-[#d4915f] space-y-4">
              <p>
                Industry average: <span className="font-bold text-[#1a2332]">40% close rate</span> = <span className="font-bold text-[#d4915f]">8 jobs</span>
              </p>
              <p>
                With memorable follow-up: <span className="font-bold text-[#1a2332]">55% close rate</span> = <span className="font-bold text-[#d4915f]">11 jobs</span>
              </p>
            </div>

            <p className="text-[22px] font-bold text-[#1a2332] py-2">
              That's 3 extra jobs per month.
            </p>

            <p className="text-[20px] font-semibold text-[#1a2332]">
              At $8,000 average profit per job, that's <span className="text-[24px] text-[#d4915f]">$24,000</span> more per month.
            </p>

            <p className="text-[24px] font-bold text-[#d4915f]">
              $288,000 more per year.
            </p>

            <p className="italic text-[#374151] font-medium pt-4">
              From the same 20 estimates you're already sending.
            </p>

            <p className="text-[19px] font-semibold text-[#1a2332]">
              The only difference? A handwritten note that costs $2.49.
            </p>
          </div>

          {/* ROI Highlight Box */}
          <div className="mt-10 bg-gradient-to-br from-[#d4915f] to-[#c07d4a] rounded-xl p-8 text-center">
            <div className="mb-3">
              <span className="text-[48px]">💰</span>
            </div>
            <p className="text-white text-[28px] lg:text-[32px] font-bold mb-2">
              $2.49 investment → $8,000 return
            </p>
            <p className="text-white text-[36px] lg:text-[42px] font-bold mb-3">
              = 321,285% ROI
            </p>
            <p className="text-white text-[16px] font-semibold tracking-wide">
              That's not a typo.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Variation D: "The Ghost Zone"
  if (variation === 'D') {
    return (
      <section className="bg-[#fafbfc] border-t border-b border-[#e5e7eb] py-20 lg:py-20 py-12 px-6">
        <div className="max-w-[900px] mx-auto">
          {/* Optional Icon */}
          <div className="mb-8">
            <MessageSquareOff className="w-12 h-12 text-[#d4915f] mx-auto lg:mx-0" />
          </div>

          {/* Headline */}
          <h2 className="text-[36px] lg:text-[36px] text-[28px] font-bold leading-[1.3] text-[#1a2332] mb-8">
            Why Do Homeowners Ghost You After Saying "Yes"?
          </h2>

          {/* Body Copy */}
          <div className="space-y-6 text-[18px] lg:text-[18px] text-[16px] leading-[1.8] text-[#374151]">
            <p>
              You nailed the pitch. They were nodding along. They said, "This looks great, we'll let you know soon."
            </p>

            <p className="text-[#1a2332] font-semibold text-[20px] my-8">
              Two weeks later... nothing.
            </p>

            <p>
              Your text goes unanswered. Your call goes to voicemail. Your email sits unopened.
            </p>

            <p className="font-semibold text-[#1a2332]">
              They didn't choose your competitor. They didn't choose anyone. They just... forgot.
            </p>

            <p className="text-[20px] font-bold text-[#d4915f] border-l-4 border-[#d4915f] pl-6 py-3">
              Here's the painful truth: They don't remember your name. They don't remember your face. They barely remember the conversation.
            </p>

            <p>
              But if you'd sent them a handwritten note two days after your meeting? They'd have a physical reminder sitting on their kitchen counter. Your name. Your number. A personal message.
            </p>

            <p className="font-semibold text-[#1a2332] text-[19px]">
              You'd be the roofer they can't forget—even if they wanted to.
            </p>
          </div>

          {/* Optional Callout */}
          <div className="mt-10 bg-white border-2 border-[#d4915f] rounded-lg p-6">
            <p className="text-[17px] font-semibold text-[#1a2332] leading-[1.6] text-center">
              The difference between "I'll think about it" and a signed contract? A $2.49 note that keeps you top-of-mind.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return null;
}