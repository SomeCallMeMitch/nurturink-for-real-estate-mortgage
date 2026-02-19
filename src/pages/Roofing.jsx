import React from 'react';
import RoofingFonts from '../components/lp-Roofing/RoofingFonts';
import RoofingNav from '../components/lp-Roofing/RoofingNav';
import RoofingHero from '../components/lp-Roofing/RoofingHero';
import RoofingVideoSection from '../components/lp-Roofing/RoofingVideoSection';
import RoofingDifferentiators from '../components/lp-Roofing/RoofingDifferentiators';
import RoofingThreeWays from '../components/lp-Roofing/RoofingThreeWays';
import RoofingPSL from '../components/lp-Roofing/RoofingPSL';
import RoofingScience from '../components/lp-Roofing/RoofingScience';
import RoofingCalculator from '../components/lp-Roofing/RoofingCalculator';
import RoofingCTA from '../components/lp-Roofing/RoofingCTA';
import RoofingCalendly from '../components/lp-Roofing/RoofingCalendly';
import RoofingFooter from '../components/lp-Roofing/RoofingFooter';
import { Toaster } from '@/components/ui/toaster';

/**
 * Roofing Landing Page — NurturInk Roofing
 * Cloned from Solar landing page, ready for roofing-specific edits.
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
export default function Roofing() {
  return (
    <div className="roofing-page" style={{ scrollBehavior: 'smooth' }}>
      <RoofingFonts />
      <RoofingNav />
      <RoofingHero />
      <RoofingVideoSection />
      <RoofingDifferentiators />
      <RoofingThreeWays />
      <RoofingPSL />
      <RoofingScience />
      <RoofingCalculator />
      <RoofingCTA />
      <RoofingCalendly />
      <RoofingFooter />
      <Toaster />
    </div>
  );
}