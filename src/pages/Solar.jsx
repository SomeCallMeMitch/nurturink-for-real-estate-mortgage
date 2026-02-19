import React from 'react';
import SolarFonts from '../components/lp-Solar/SolarFonts';
import SolarNav from '../components/lp-Solar/SolarNav';
import SolarHero from '../components/lp-Solar/SolarHero';
import SolarVideoSection from '../components/lp-Solar/SolarVideoSection';
import SolarDifferentiators from '../components/lp-Solar/SolarDifferentiators';
import SolarThreeWays from '../components/lp-Solar/SolarThreeWays';
import SolarPSL from '../components/lp-Solar/SolarPSL';
import SolarScience from '../components/lp-Solar/SolarScience';
import SolarCalculator from '../components/lp-Solar/SolarCalculator';
import SolarCTA from '../components/lp-Solar/SolarCTA';
import SolarCalendly from '../components/lp-Solar/SolarCalendly';
import SolarFooter from '../components/lp-Solar/SolarFooter';
import { Toaster } from '@/components/ui/toaster';

/**
 * Solar Landing Page — NurturInk Solar v5
 * Built strictly from nurturink-solar-b44-spec.txt and nurturink-solar-v5.txt
 *
 * Section order:
 * 1. Nav (sticky)
 * 2. Hero
 * 3. Video + Proof Bullets
 * 4. Why NurturInk (Differentiators)
 * 5. Three Ways + Pre-Job Card
 * 6. PSL Formula
 * 7. Science / Research
 * 8. ROI Calculator
 * 9. CTA
 * 10. Calendly (appointment booking)
 * 11. Footer
 */
export default function Solar() {
  return (
    <div className="solar-page" style={{ scrollBehavior: 'smooth' }}>
      <SolarFonts />
      <SolarNav />
      <SolarHero />
      <SolarVideoSection />
      <SolarDifferentiators />
      <SolarThreeWays />
      <SolarPSL />
      <SolarScience />
      <SolarCalculator />
      <SolarCTA />
      <SolarCalendly />
      <SolarFooter />
      <Toaster />
    </div>
  );
}