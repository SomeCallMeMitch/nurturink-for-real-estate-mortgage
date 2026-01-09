/**
 * LandingPremium - Premium animated landing page
 * 
 * Implements advanced design principles:
 * - Micro-interactions everywhere
 * - Depth and layering
 * - Scroll storytelling
 * - Glassmorphism
 * - Cinematic timing
 * - Responsive motion
 * - Loading as experience
 */
import React from 'react';
import { motion } from 'framer-motion';
import LPNoLayoutWrapper from '../components/landing/LPNoLayoutWrapper';
import LPHeader from '../components/landing/LPHeader';
import LPFooter from '../components/landing/LPFooter';
import LPFAQSection from '../components/landing/LPFAQSection';
import LPContactFormSection from '../components/landing/LPContactFormSection';
import LPIndustriesSection from '../components/landing/LPIndustriesSection';

// Premium animated sections
import LPHeroSectionPremium from '../components/landing/LPHeroSectionPremium';
import LPSocialProofPremium from '../components/landing/LPSocialProofPremium';
import LPStatsBannerPremium from '../components/landing/LPStatsBannerPremium';
import LPFeaturesSectionPremium from '../components/landing/LPFeaturesSectionPremium';
import LPHowItWorksSectionPremium from '../components/landing/LPHowItWorksSectionPremium';
import LPPricingSectionPremium from '../components/landing/LPPricingSectionPremium';

// Premium components
import { 
  LoadingExperience, 
  CustomCursor,
  AnimationProvider,
} from '../components/premium';

export default function LandingPremium() {
  return (
    <AnimationProvider>
      {/* Premium loading experience */}
      <LoadingExperience minDuration={1800} brandName="NurturInk" brandColor="#FF7A00">
        <LPNoLayoutWrapper>
          {/* Custom cursor - desktop only */}
          <div className="hidden lg:block">
            <CustomCursor enabled={true} />
          </div>

          {/* Fixed Header Navigation */}
          <LPHeader />

          {/* Main Content */}
          <motion.main 
            className="pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Hero Section - Premium */}
            <LPHeroSectionPremium />

            {/* Social Proof - Premium */}
            <LPSocialProofPremium />

            {/* Stats Banner - Premium */}
            <LPStatsBannerPremium />

            {/* Industries Section (original) */}
            <LPIndustriesSection />

            {/* Features Section - Premium */}
            <LPFeaturesSectionPremium />

            {/* How It Works - Premium */}
            <LPHowItWorksSectionPremium />

            {/* Pricing Section - Premium */}
            <LPPricingSectionPremium />

            {/* FAQ Section (original) */}
            <LPFAQSection />

            {/* Contact Form (original) */}
            <LPContactFormSection />
          </motion.main>

          {/* Footer */}
          <LPFooter />
        </LPNoLayoutWrapper>
      </LoadingExperience>
    </AnimationProvider>
  );
}