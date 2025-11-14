import React from "react";
import LPNoLayoutWrapper from "@/components/landing/LPNoLayoutWrapper";
import LPHeader from "@/components/landing/LPHeader";
import LPStatsBanner from "@/components/landing/LPStatsBanner";
import LPPricingSection from "@/components/landing/LPPricingSection";
import LPContactFormSection from "@/components/landing/LPContactFormSection";
import LPFAQSection from "@/components/landing/LPFAQSection";
import LPFooter from "@/components/landing/LPFooter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, Users, TrendingUp, Target } from "lucide-react";

export default function LP1Page() {
  return (
    <LPNoLayoutWrapper>
      {/* CSS to hide left navigation and expand main content */}
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
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-orange-50 to-white py-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    Turn More Roofing Leads into Signed Contracts
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    The proven way to stay top of mind for up to a week
                  </p>
                  <div className="flex gap-4">
                    <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg">
                      Get Started Free
                    </Button>
                    <Button size="lg" variant="outline" className="border-gray-300 px-8 py-6 text-lg">
                      Watch Demo
                    </Button>
                  </div>
                  <div className="mt-8 flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span>No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span>Free sample included</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-gray-200 rounded-lg shadow-2xl aspect-video flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/80 flex items-center justify-center">
                        <div className="w-0 h-0 border-l-8 border-l-orange-600 border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1"></div>
                      </div>
                      <p className="text-sm">Video Player</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid 1 - Benefits/Value Props */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Why Roofing Pros Trust Us
                </h2>
                <p className="text-xl text-gray-600">
                  Everything you need to convert more leads into customers
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: <Target className="w-12 h-12 text-orange-600" />,
                    title: "Stand Out from Competition",
                    description: "Be the only roofer they remember with authentic handwritten cards"
                  },
                  {
                    icon: <TrendingUp className="w-12 h-12 text-orange-600" />,
                    title: "Increase Close Rates",
                    description: "Convert 2-3x more leads into signed contracts with personal touches"
                  },
                  {
                    icon: <Users className="w-12 h-12 text-orange-600" />,
                    title: "Build Trust Fast",
                    description: "Handwritten notes create instant credibility and trust"
                  },
                  {
                    icon: <Star className="w-12 h-12 text-orange-600" />,
                    title: "Get More Referrals",
                    description: "Customers remember you and recommend you to neighbors"
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  How It Works
                </h2>
                <p className="text-xl text-gray-600">
                  Send handwritten cards in 3 simple steps
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  {
                    number: "1",
                    title: "Upload Your Leads",
                    description: "Import contacts from your CRM or add them manually"
                  },
                  {
                    number: "2",
                    title: "Customize Your Message",
                    description: "Choose a template or write your own personal message"
                  },
                  {
                    number: "3",
                    title: "We Mail It For You",
                    description: "Cards are written, addressed, stamped and mailed automatically"
                  }
                ].map((step, idx) => (
                  <div key={idx} className="text-center relative">
                    <div className="bg-orange-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                      {step.number}
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                    {idx < 2 && (
                      <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-orange-200"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Grid 2 - Product Features */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Everything You Need to Succeed
                </h2>
                <p className="text-xl text-gray-600">
                  Powerful features built for busy roofing professionals
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <div key={idx} className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats Section from existing lp */}
          <LPStatsBanner />

          {/* Pricing Section from existing lp */}
          <LPPricingSection />

          {/* Video Section - Get Your Free Sample */}
          <section className="py-20 bg-orange-600">
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Get Your Free Sample
                </h2>
                <p className="text-xl text-orange-100">
                  See the quality for yourself - we'll send you a free handwritten card
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-2xl aspect-video max-w-3xl mx-auto flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <div className="w-0 h-0 border-l-10 border-l-orange-600 border-t-8 border-t-transparent border-b-8 border-b-transparent ml-1"></div>
                  </div>
                  <p className="text-lg font-medium">Video: See Our Process</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Form Section from existing lp - Updated title to match "Get Your Free Sample" */}
          <LPContactFormSection />

          {/* FAQ Section from existing lp */}
          <LPFAQSection />
        </div>

        <LPFooter />
      </div>
    </LPNoLayoutWrapper>
  );
}