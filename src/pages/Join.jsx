import React from 'react';
import JoinHeader from '../components/landing/JoinHeader';
import JoinHeroSection from '../components/landing/JoinHeroSection';
import LPSocialProofLogos from '../components/landing/LPSocialProofLogos';
import LPIndustriesSection from '../components/landing/LPIndustriesSection';
import LPStatsBanner from '../components/landing/LPStatsBanner';
import LPFeaturesSection from '../components/landing/LPFeaturesSection';
import LPHowItWorksSection from '../components/landing/LPHowItWorksSection';
import WelcomePricingBanner from '../components/landing/WelcomePricingBanner';
import LPFAQSection from '../components/landing/LPFAQSection';
import WelcomeCalendlySection from '../components/landing/WelcomeCalendlySection';
import WelcomeFooter from '../components/landing/WelcomeFooter';
import LPNoLayoutWrapper from '../components/landing/LPNoLayoutWrapper';

/**
 * Join Page (Duplicated from Welcome Page)
 * 
 * Based on the Welcome page with modifications:
 * - Added a "Join Today!" link.
 * 
 * Brand Identity:
 * - Primary Orange: #FF7A00
 * - Navy Blue: #1a2332
 */
export default function Join() {
  return (
    <LPNoLayoutWrapper>
      {/* Fixed Header Navigation - Modified with Join Today! button */}
      <JoinHeader />

      {/* Main Content - Add pt-20 to account for fixed header */}
      <main className="pt-20">
        {/* Hero Section */}
        <JoinHeroSection />

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

        {/* Pricing Banner - "Less than $2.49 per card" */}
        <WelcomePricingBanner />

        {/* FAQ Accordion */}
        <LPFAQSection />

        {/* Calendly Appointment Booking Section */}
        <WelcomeCalendlySection />
      </main>

      {/* Footer - Phone only (916.990.2020) */}
      <WelcomeFooter />
    </LPNoLayoutWrapper>
  );
}
