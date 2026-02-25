import React from 'react';
import InsuranceFonts from '../components/lp-Insurance/InsuranceFonts';
import InsuranceNav from '../components/lp-Insurance/InsuranceNav';
import InsuranceHero from '../components/lp-Insurance/InsuranceHero';
import InsuranceVideoSection from '../components/lp-Insurance/InsuranceVideoSection';
import InsuranceDifferentiators from '../components/lp-Insurance/InsuranceDifferentiators';
import InsuranceThreeWays from '../components/lp-Insurance/InsuranceThreeWays';
import InsurancePSL from '../components/lp-Insurance/InsurancePSL';
import InsuranceScience from '../components/lp-Insurance/InsuranceScience';
import InsuranceCalculator from '../components/lp-Insurance/InsuranceCalculator';
import InsuranceCTA from '../components/lp-Insurance/InsuranceCTA';
import InsuranceSampleForm from '../components/lp-Insurance/InsuranceSampleForm';
import InsuranceCalendly from '../components/lp-Insurance/InsuranceCalendly';
import InsuranceFooter from '../components/lp-Insurance/InsuranceFooter';
import { Toaster } from '@/components/ui/toaster';

/**
 * Insurance Landing Page — NurturInk Insurance
 * Cloned from Roofing landing page, ready for insurance-specific copy edits.
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
export default function Insurance() {
  return (
    <div className="insurance-page" style={{ scrollBehavior: 'smooth' }}>
      <InsuranceFonts />
      <InsuranceNav />
      <InsuranceHero />
      <InsuranceVideoSection />
      <InsuranceDifferentiators />
      <InsuranceThreeWays />
      <InsurancePSL />
      <InsuranceScience />
      <InsuranceCalculator />
      <InsuranceCTA />
      <InsuranceCalendly />
      <InsuranceFooter />
      <Toaster />
    </div>
  );
}