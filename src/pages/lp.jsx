import React from "react";
import LPHeroSection from "@/components/landing/LPHeroSection";
import LPFeatures1Section from "@/components/landing/LPFeatures1Section";
import LPSocialProofLogos from "@/components/landing/LPSocialProofLogos";
import LPStatsBanner from "@/components/landing/LPStatsBanner";
import LPFeatures2Section from "@/components/landing/LPFeatures2Section";
import LPHowItWorksSection from "@/components/landing/LPHowItWorksSection";
import LPPricingSection from "@/components/landing/LPPricingSection";
import LPContactFormSection from "@/components/landing/LPContactFormSection";
import LPFAQSection from "@/components/landing/LPFAQSection";
import LPFooter from "@/components/landing/LPFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LPHeroSection />
      <LPFeatures1Section />
      <LPSocialProofLogos />
      <LPStatsBanner />
      <LPFeatures2Section />
      <LPHowItWorksSection />
      <LPPricingSection />
      <LPContactFormSection />
      <LPFAQSection />
      <LPFooter />
    </div>
  );
}