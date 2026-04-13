import React from 'react';
import LPHeader from '../components/landing/LPHeader';
import LPHeroSection from '../components/landing/LPHeroSection';
import LPSocialProofLogos from '../components/landing/LPSocialProofLogos';
import LPIndustriesSection from '../components/landing/LPIndustriesSection';
import LPStatsBanner from '../components/landing/LPStatsBanner';
import LPFeaturesSection from '../components/landing/LPFeaturesSection';
import LPHowItWorksSection from '../components/landing/LPHowItWorksSection';
import LPPricingSection from '../components/landing/LPPricingSection';
import LPFAQSection from '../components/landing/LPFAQSection';
import LPContactFormSection from '../components/landing/LPContactFormSection';
import LPFooter from '../components/landing/LPFooter';
import LPNoLayoutWrapper from '../components/landing/LPNoLayoutWrapper';

/**
 * NurturInk Landing Page
 * Multi-industry handwritten notecard service for sales professionals.
 * 
 * Brand Identity:
 * - Primary Orange: #FF7A00
 * - Navy Blue: #1a2332
 * - Success Green: #16a34a
 * - Tagline: "Personalized follow-up"
 */
export default function Landing() {
  return (
    <LPNoLayoutWrapper>
      {/* Fixed Header Navigation */}
      <LPHeader />

      {/* Main Content - Add pt-20 to account for fixed header */}
      <main className="pt-20">
        {/* Hero Section */}
        <LPHeroSection />

        {/* Trust Indicators Banner */}
        <LPSocialProofLogos />

        {/* Industries We Serve */}
        <LPIndustriesSection />

        {/* Why Handwritten Notes Work */}
        <LPStatsBanner />

        {/* Additional Benefits */}
        <LPFeaturesSection />

        {/* How It Works (4 Steps) */}
        <LPHowItWorksSection />

        {/* Pricing Tiers */}
        <LPPricingSection />

        {/* FAQ Accordion */}
        <LPFAQSection />

        {/* Contact Form */}
        <LPContactFormSection />
      </main>

      {/* Footer */}
      <LPFooter />
    </LPNoLayoutWrapper>
  );
}