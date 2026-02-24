import React from 'react';
import EcommerceFonts from '../components/lp-Ecommerce/EcommerceFonts';
import EcommerceNav from '../components/lp-Ecommerce/EcommerceNav';
import EcommerceHero from '../components/lp-Ecommerce/EcommerceHero';
import EcommerceAuthenticity from '../components/lp-Ecommerce/EcommerceAuthenticity';
import EcommerceEmailComplement from '../components/lp-Ecommerce/EcommerceEmailComplement';
import EcommerceStudy from '../components/lp-Ecommerce/EcommerceStudy';
import EcommerceRetention from '../components/lp-Ecommerce/EcommerceRetention';
import EcommerceDifferentiators from '../components/lp-Ecommerce/EcommerceDifferentiators';
import EcommercePricing from '../components/lp-Ecommerce/EcommercePricing';
import EcommerceCalculators from '../components/lp-Ecommerce/EcommerceCalculators';
import EcommerceQuotes from '../components/lp-Ecommerce/EcommerceQuotes';
import EcommerceBookCall from '../components/lp-Ecommerce/EcommerceBookCall';
import EcommerceSampleForm from '../components/lp-Ecommerce/EcommerceSampleForm';
import EcommerceCTA from '../components/lp-Ecommerce/EcommerceCTA';
import EcommerceFooter from '../components/lp-Ecommerce/EcommerceFooter';

/**
 * Ecommerce Landing Page — NurturInk Ecommerce v10
 * For Shopify brands selling handwritten cards as a retention tool.
 *
 * Section order:
 * 1. Nav (sticky)
 * 2. Hero + Video
 * 3. Authenticity
 * 4. Email Complement
 * 5. Study / Research
 * 6. Retention stats
 * 7. Differentiators
 * 8. Pricing
 * 9. ROI Calculators
 * 10. Quotes
 * 11. Book a Call (Calendly)
 * 12. Free Sample Form
 * 13. Final CTA
 * 14. Footer
 */
export default function Ecommerce() {
  return (
    <div className="ec-page" style={{ scrollBehavior: 'smooth' }}>
      <EcommerceFonts />
      <EcommerceNav />
      <EcommerceHero />
      <EcommerceAuthenticity />
      <EcommerceEmailComplement />
      <EcommerceStudy />
      <EcommerceRetention />
      <EcommerceDifferentiators />
      <EcommercePricing />
      <EcommerceCalculators />
      <EcommerceQuotes />
      <EcommerceBookCall />
      <EcommerceSampleForm />
      <EcommerceCTA />
      <EcommerceFooter />
    </div>
  );
}