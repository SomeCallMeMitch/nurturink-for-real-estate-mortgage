import React from 'react';
import WelcomeHeader from '../components/landing/WelcomeHeader';
import LPHeroSection from '../components/landing/LPHeroSection';
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
 * Welcome Page (Default Landing Page)
 * 
 * Based on the Landing page with modifications:
 * - Removed pricing section, replaced with "$2.49 per card" banner
 * - Added Calendly appointment booking section
 * - Footer shows only phone contact (916.990.2020 - Cell Phone, text first)
 * - Header buttons link to Calendly section
 * 
 * Brand Identity:
 * - Primary Orange: #FF7A00
 * - Navy Blue: #1a2332
 */
export default function Welcome() {
  return (
    <LPNoLayoutWrapper>
      {/* Fixed Header Navigation - Modified to link to Calendly */}
      <WelcomeHeader />

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