import React from 'react';
import REFonts from '../components/lp-RealEstate/REFonts';
import RENav from '../components/lp-RealEstate/RENav';
import REHero from '../components/lp-RealEstate/REHero';
import REVideoSection from '../components/lp-RealEstate/REVideoSection';
import REDifferentiators from '../components/lp-RealEstate/REDifferentiators';
import REThreeWays from '../components/lp-RealEstate/REThreeWays';
import REPSL from '../components/lp-RealEstate/REPSL';
import REFurmanSection from '../components/lp-RealEstate/REFurmanSection';
import REScience from '../components/lp-RealEstate/REScience';
import RECalculator from '../components/lp-RealEstate/RECalculator';
import RECTA from '../components/lp-RealEstate/RECTA';
import RECalendly from '../components/lp-RealEstate/RECalendly';
import REFooter from '../components/lp-RealEstate/REFooter';
import { Toaster } from '@/components/ui/toaster';

/**
 * Real Estate Landing Page — NurturInk Real Estate
 * Cloned from Insurance landing page, ready for real-estate-specific copy edits.
 *
 * Section order:
 * 1. Nav (sticky)
 * 2. Hero
 * 3. Video + Proof Bullets
 * 4. Why NurturInk (Differentiators)
 * 5. Three Ways + Wide Card
 * 6. Beyond the Core Three
 * 7. Science / Research
 * 8. Retention Calculator
 * 9. CTA
 * 10. Calendly (appointment booking)
 * 11. Footer
 */
export default function RealEstate() {
  return (
    <div className="real-estate-page" style={{ scrollBehavior: 'smooth' }}>
      <REFonts />
      <RENav />
      <REHero />
      <REVideoSection />
      <REDifferentiators />
      <REThreeWays />
      <REPSL />
      <REFurmanSection />
      <REScience />
      <RECalculator />
      <RECTA />
      <RECalendly />
      <REFooter />
      <Toaster />
    </div>
  );
}