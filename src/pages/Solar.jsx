import React from 'react';
import LPNoLayoutWrapper from '../components/landing/LPNoLayoutWrapper';
import SolarHeader from '../components/landing/SolarHeader';
import SolarHeroSection from '../components/landing/SolarHeroSection';
import SolarBenefitsSection from '../components/landing/SolarBenefitsSection';
import SolarHowItWorksSection from '../components/landing/SolarHowItWorksSection';
import SolarResultsSection from '../components/landing/SolarResultsSection';
import SolarCalendlySection from '../components/landing/SolarCalendlySection';
import SolarFooter from '../components/landing/SolarFooter';

/**
 * Solar Landing Page
 *
 * Industry-specific landing page for solar sales professionals.
 * Designed to be shared as a standalone link on external sites and articles.
 *
 * Structure:
 *  - SolarHeader         — sticky nav with logo, section links, CTA
 *  - SolarHeroSection    — headline, video, CTAs
 *  - SolarBenefitsSection— 6 solar-specific benefit cards
 *  - SolarHowItWorksSection — 4-step process
 *  - SolarResultsSection — stats + testimonial quotes
 *  - SolarCalendlySection— Calendly appointment embed
 *  - SolarFooter         — contact, links, legal
 */
export default function Solar() {
  return (
    <LPNoLayoutWrapper>
      <SolarHeader />

      <main className="pt-[92px]">
        <SolarHeroSection />
        <SolarBenefitsSection />
        <SolarHowItWorksSection />
        <SolarResultsSection />
        <SolarCalendlySection />
      </main>

      <SolarFooter />
    </LPNoLayoutWrapper>
  );
}