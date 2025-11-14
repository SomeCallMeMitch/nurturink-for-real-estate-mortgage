import React from "react";
import LPNoLayoutWrapper from "@/components/landing/LPNoLayoutWrapper";
import LPHeader from "@/components/landing/LPHeader";
import LPStatsBanner from "@/components/landing/LPStatsBanner";
import LPPricingSection from "@/components/landing/LPPricingSection";
import LPContactFormSection from "@/components/landing/LPContactFormSection";
import LPFAQSection from "@/components/landing/LPFAQSection";
import LPFooter from "@/components/landing/LPFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Clock, DollarSign, Users, Zap, CheckCircle2, MessageSquare, Send } from "lucide-react";

export default function LP1Page() {
  return (
    <LPNoLayoutWrapper>
      <style>{`
        aside.w-64.bg-white.border-r.border-gray-200.flex.flex-col {
          display: none !important;
        }
        nav.flex-1.p-4.space-y-2 {
          display: none !important;
        }
        main {
          margin-left: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        body > div,
        #root > div {
          grid-template-columns: 1fr !important;
        }
        [class*="main-content"],
        [class*="content-wrapper"] {
          margin-left: 0 !important;
          width: 100% !important;
        }
      `}</style>
      
      <div className="min-h-screen bg-white">
        <LPHeader />
        
        <div className="pt-20">
          {/* Hero Section - Matching LPHeroSection style */}
          <section className="bg-white py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                    Turn More Roofing Leads into Signed Contracts
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    The proven way to stay top of mind for up to a week
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 rounded-lg font-semibold gap-2">
                      Get Your Free Sample Note
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-lg font-semibold gap-2 border-2 border-gray-300">
                      <Play className="w-5 h-5" />
                      See How It Works
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl flex items-center justify-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-orange-500 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid 1 - Matching LPFeatures2Section style */}
          <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Why Roofing Pros Trust Us
                </h2>
                <p className="text-xl text-gray-600">
                  Everything you need to convert more leads into customers
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: Clock,
                    title: "Save Hours Every Week",
                    description: "No more writing cards by hand. We handle everything from printing to mailing."
                  },
                  {
                    icon: DollarSign,
                    title: "Less Than a Coffee",
                    description: "Under $3 per card including postage, envelope, and handwritten personalization."
                  },
                  {
                    icon: Users,
                    title: "Perfect for Teams",
                    description: "Allocate credits to sales reps. Track who sends what. Manage everything centrally."
                  },
                  {
                    icon: Zap,
                    title: "Send in Minutes",
                    description: "Select clients, customize message, choose design. Done. We handle the rest."
                  }
                ].map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div key={idx} className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* How It Works Section - Matching LPHowItWorksSection style */}
          <section className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  How It Works in 3 Simple Steps
                </h2>
                <p className="text-xl text-gray-600">
                  From upload to mailbox in minutes
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    number: "1",
                    icon: Users,
                    title: "Choose Your Recipients",
                    description: "Select clients from your CRM or upload a list. Tag and organize however you like."
                  },
                  {
                    number: "2",
                    icon: MessageSquare,
                    title: "Personalize Your Message",
                    description: "Use templates or write custom messages. Add merge fields for personal touches."
                  },
                  {
                    number: "3",
                    icon: Send,
                    title: "We Handle the Rest",
                    description: "Our robots write with real pens, address envelopes, add postage, and mail them out."
                  }
                ].map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={idx} className="relative">
                      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 h-full">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                            {step.number}
                          </div>
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-orange-600" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{step.description}</p>
                      </div>
                      
                      {idx < 2 && (
                        <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                          <div className="w-8 h-0.5 bg-orange-300"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Features Grid 2 - Product Features */}
          <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Everything You Need to Succeed
                </h2>
                <p className="text-xl text-gray-600">
                  Powerful features built for busy roofing professionals
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Real Handwritten Cards",
                    description: "Authentic ballpoint pen writing - not printed or robotic"
                  },
                  {
                    title: "Custom Card Designs",
                    description: "Choose from professional templates or upload your own"
                  },
                  {
                    title: "Automated Campaigns",
                    description: "Set up follow-up sequences to nurture leads automatically"
                  },
                  {
                    title: "CRM Integration",
                    description: "Sync with your existing tools and workflows seamlessly"
                  },
                  {
                    title: "Team Collaboration",
                    description: "Manage your sales team with shared templates and tracking"
                  },
                  {
                    title: "Delivery Tracking",
                    description: "Know exactly when your cards arrive at prospects' homes"
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <LPStatsBanner />

          {/* Pricing Section */}
          <LPPricingSection />

          {/* Video Section - Get Your Free Sample */}
          <section className="bg-gradient-to-br from-orange-500 to-orange-600 py-16">
            <div className="max-w-5xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Get Your Free Sample
                </h2>
                <p className="text-xl text-orange-100 leading-relaxed">
                  See the quality for yourself - we'll send you a free handwritten card
                </p>
              </div>
              
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl max-w-3xl mx-auto flex items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <Play className="w-10 h-10 text-orange-500 ml-1" />
                </div>
              </div>
            </div>
          </section>

          {/* Contact Form Section */}
          <LPContactFormSection />

          {/* FAQ Section */}
          <LPFAQSection />
        </div>

        <LPFooter />
      </div>
    </LPNoLayoutWrapper>
  );
}