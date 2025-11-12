import React from "react";
import { X, Check, Mail, Trash2, Eye, Ghost, MapPin, Package, Mailbox, Hand, Heart } from "lucide-react";

export default function ContrastSection({ variation = 'A' }) {
  // Variation A: Side-by-Side Visual Comparison
  if (variation === 'A') {
    return (
      <section className="bg-[#f9fafb] border-t border-[#e5e7eb] py-25 lg:py-25 py-15 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Section Headline */}
          <h2 className="text-[42px] lg:text-[42px] text-[30px] font-bold leading-[1.3] text-[#1a2332] text-center mb-16">
            One Gets Deleted. One Gets Displayed.
          </h2>

          {/* Two-Column Comparison - Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-0">
            {/* Email Side (Left) */}
            <div className="lg:pr-10 lg:border-r-2 border-[#e5e7eb]">
              <div className="bg-[#f3f4f6] border border-[#d1d5db] rounded-lg p-8 opacity-75">
                {/* Label */}
                <div className="mb-6">
                  <span className="text-[16px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">
                    Generic Email
                  </span>
                </div>

                {/* Email Mockup Preview */}
                <div className="bg-white border border-[#d1d5db] rounded p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#e5e7eb]">
                    <Mail className="w-4 h-4 text-[#9ca3af]" />
                    <span className="text-[12px] text-[#6b7280]">Inbox</span>
                  </div>
                  <div className="text-[11px] text-[#9ca3af] mb-1">From: noreply@company.com</div>
                  <div className="text-[13px] font-semibold text-[#6b7280] mb-2">Subject: Thank you for your business</div>
                  <div className="text-[11px] text-[#9ca3af] leading-relaxed">
                    Dear Customer, Thank you for choosing us...
                  </div>
                </div>

                {/* Feature List with X marks */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
                    <span className="text-[16px] lg:text-[16px] text-[15px] leading-[1.8] text-[#4b5563]">
                      Buried in inbox with 50 other emails
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
                    <span className="text-[16px] lg:text-[16px] text-[15px] leading-[1.8] text-[#4b5563]">
                      Deleted in 2 seconds
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
                    <span className="text-[16px] lg:text-[16px] text-[15px] leading-[1.8] text-[#4b5563]">
                      Feels like a template
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
                    <span className="text-[16px] lg:text-[16px] text-[15px] leading-[1.8] text-[#4b5563]">
                      Forgotten immediately
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Handwritten Side (Right) */}
            <div className="lg:pl-10">
              <div className="bg-[#fefbf7] border-2 border-[#d4915f] rounded-lg p-8">
                {/* Label */}
                <div className="mb-6">
                  <span className="text-[16px] font-semibold uppercase tracking-[0.1em] text-[#d4915f]">
                    Handwritten Note
                  </span>
                </div>

                {/* Card Mockup Preview */}
                <div className="bg-white border-2 border-[#d4915f] rounded-lg p-4 mb-6 shadow-md">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e5e7eb]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#d4915f] rounded-full flex items-center justify-center">
                        <Hand className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[12px] font-semibold text-[#1a2332]">Handwritten Card</span>
                    </div>
                    <div className="text-[10px] text-[#d4915f] font-semibold">REAL STAMP</div>
                  </div>
                  <div className="font-serif text-[14px] text-[#1a2332] leading-relaxed italic">
                    Dear John,<br />
                    Thank you for trusting us with your home. We truly appreciate your business...
                  </div>
                </div>

                {/* Feature List with Checkmarks */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#16a34a] flex-shrink-0 mt-0.5" />
                    <span className="text-[16px] lg:text-[16px] text-[15px] leading-[1.8] text-[#1a2332] font-medium">
                      Personal, hand-addressed envelope
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#16a34a] flex-shrink-0 mt-0.5" />
                    <span className="text-[16px] lg:text-[16px] text-[15px] leading-[1.8] text-[#1a2332] font-medium">
                      Opened with curiosity and read completely
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#16a34a] flex-shrink-0 mt-0.5" />
                    <span className="text-[16px] lg:text-[16px] text-[15px] leading-[1.8] text-[#1a2332] font-medium">
                      Pinned on fridge or desk
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#16a34a] flex-shrink-0 mt-0.5" />
                    <span className="text-[16px] lg:text-[16px] text-[15px] leading-[1.8] text-[#1a2332] font-medium">
                      Remembered for months
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Caption */}
          <div className="text-center mt-12">
            <p className="text-[20px] font-semibold text-[#d4915f]">
              Which one builds loyalty?
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Variation B: Timeline Comparison
  if (variation === 'B') {
    return (
      <section className="bg-white border-t border-[#e5e7eb] py-25 lg:py-25 py-15 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Section Headline */}
          <h2 className="text-[42px] lg:text-[42px] text-[30px] font-bold leading-[1.3] text-[#1a2332] text-center mb-4">
            What Happens After You Hit "Send"?
          </h2>

          {/* Subheadline */}
          <p className="text-[18px] text-[#6b7280] text-center mb-16">
            Let's follow two thank-you messages and see where they end up.
          </p>

          {/* EMAIL PATH - Top Timeline */}
          <div className="mb-16">
            <div className="mb-6">
              <span className="text-[16px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">
                Email Path →
              </span>
            </div>

            {/* Timeline Flow - Desktop Horizontal, Mobile Vertical */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-3">
              {/* Step 1: Sent */}
              <div className="flex items-center gap-3 lg:gap-2 w-full lg:w-auto">
                <div className="bg-[#f3f4f6] border border-[#d1d5db] rounded-lg px-4 py-3 flex-1 lg:flex-initial">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#9ca3af]" />
                    <div>
                      <div className="text-[11px] text-[#9ca3af] uppercase font-semibold mb-0.5">Day 1</div>
                      <div className="text-[14px] font-medium text-[#6b7280]">Sent</div>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block text-[#d1d5db] text-[20px]">→</div>
              </div>

              {/* Step 2: Inbox */}
              <div className="flex items-center gap-3 lg:gap-2 w-full lg:w-auto">
                <div className="bg-[#f3f4f6] border border-[#d1d5db] rounded-lg px-4 py-3 flex-1 lg:flex-initial">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-[#9ca3af]" />
                    <div>
                      <div className="text-[11px] text-[#9ca3af] uppercase font-semibold mb-0.5">Minutes</div>
                      <div className="text-[14px] font-medium text-[#6b7280]">Skimmed</div>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block text-[#d1d5db] text-[20px]">→</div>
              </div>

              {/* Step 3: Deleted */}
              <div className="flex items-center gap-3 lg:gap-2 w-full lg:w-auto">
                <div className="bg-[#f3f4f6] border border-[#d1d5db] rounded-lg px-4 py-3 flex-1 lg:flex-initial">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-[#ef4444]" />
                    <div>
                      <div className="text-[11px] text-[#9ca3af] uppercase font-semibold mb-0.5">Seconds</div>
                      <div className="text-[14px] font-medium text-[#6b7280]">Deleted</div>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block text-[#d1d5db] text-[20px]">→</div>
              </div>

              {/* Step 4: Forgotten */}
              <div className="flex items-center gap-3 lg:gap-2 w-full lg:w-auto">
                <div className="bg-[#f3f4f6] border border-[#d1d5db] rounded-lg px-4 py-3 flex-1 lg:flex-initial opacity-50">
                  <div className="flex items-center gap-2">
                    <Ghost className="w-5 h-5 text-[#9ca3af]" />
                    <div>
                      <div className="text-[11px] text-[#9ca3af] uppercase font-semibold mb-0.5">Instantly</div>
                      <div className="text-[14px] font-medium text-[#6b7280]">Forgotten</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="text-center mb-16">
            <span className="text-[14px] font-semibold uppercase tracking-[0.1em] text-[#1a2332]">vs.</span>
          </div>

          {/* HANDWRITTEN PATH - Bottom Timeline */}
          <div>
            <div className="mb-6">
              <span className="text-[16px] font-semibold uppercase tracking-[0.1em] text-[#d4915f]">
                Handwritten Path →
              </span>
            </div>

            {/* Timeline Flow - Desktop Horizontal, Mobile Vertical */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-3">
              {/* Step 1: Mailed */}
              <div className="flex items-center gap-3 lg:gap-2 w-full lg:w-auto">
                <div className="bg-white border-2 border-[#d4915f] rounded-lg px-4 py-3 flex-1 lg:flex-initial">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#d4915f]" />
                    <div>
                      <div className="text-[11px] text-[#d4915f] uppercase font-semibold mb-0.5">Day 1</div>
                      <div className="text-[14px] font-semibold text-[#1a2332]">Mailed</div>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block text-[#d4915f] text-[20px]">→</div>
              </div>

              {/* Step 2: Arrives */}
              <div className="flex items-center gap-3 lg:gap-2 w-full lg:w-auto">
                <div className="bg-white border-2 border-[#d4915f] rounded-lg px-4 py-3 flex-1 lg:flex-initial">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#d4915f]" />
                    <div>
                      <div className="text-[11px] text-[#d4915f] uppercase font-semibold mb-0.5">Day 4</div>
                      <div className="text-[14px] font-semibold text-[#1a2332]">Arrives</div>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block text-[#d4915f] text-[20px]">→</div>
              </div>

              {/* Step 3: Opened */}
              <div className="flex items-center gap-3 lg:gap-2 w-full lg:w-auto">
                <div className="bg-white border-2 border-[#d4915f] rounded-lg px-4 py-3 flex-1 lg:flex-initial">
                  <div className="flex items-center gap-2">
                    <Mailbox className="w-5 h-5 text-[#d4915f]" />
                    <div>
                      <div className="text-[11px] text-[#d4915f] uppercase font-semibold mb-0.5">Same Day</div>
                      <div className="text-[14px] font-semibold text-[#1a2332]">Read Fully</div>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block text-[#d4915f] text-[20px]">→</div>
              </div>

              {/* Step 4: Pinned */}
              <div className="flex items-center gap-3 lg:gap-2 w-full lg:w-auto">
                <div className="bg-white border-2 border-[#d4915f] rounded-lg px-4 py-3 flex-1 lg:flex-initial">
                  <div className="flex items-center gap-2">
                    <Hand className="w-5 h-5 text-[#d4915f]" />
                    <div>
                      <div className="text-[11px] text-[#d4915f] uppercase font-semibold mb-0.5">Week 2</div>
                      <div className="text-[14px] font-semibold text-[#1a2332]">Still Visible</div>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block text-[#d4915f] text-[20px]">→</div>
              </div>

              {/* Step 5: Remembered */}
              <div className="flex items-center gap-3 lg:gap-2 w-full lg:w-auto">
                <div className="bg-gradient-to-br from-[#d4915f] to-[#c07d4a] border-2 border-[#d4915f] rounded-lg px-4 py-3 flex-1 lg:flex-initial">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-white fill-white" />
                    <div>
                      <div className="text-[11px] text-white uppercase font-semibold mb-0.5">Month 3</div>
                      <div className="text-[14px] font-semibold text-white">Remembered</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Caption */}
          <div className="text-center mt-12">
            <p className="text-[20px] font-semibold text-[#d4915f]">
              One disappears in hours. One stays for months.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return null;
}