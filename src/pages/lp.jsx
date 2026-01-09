import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

// Layout components
import LPHeader from "@/components/landing/LPHeader";
import LPFooter from "@/components/landing/LPFooter";

// Premium animated sections
import LPHeroSectionPremium from "@/components/landing/LPHeroSectionPremium";
import LPSocialProofPremium from "@/components/landing/LPSocialProofPremium";
import LPStatsBannerPremium from "@/components/landing/LPStatsBannerPremium";
import LPFeaturesSectionPremium from "@/components/landing/LPFeaturesSectionPremium";
import LPHowItWorksSectionPremium from "@/components/landing/LPHowItWorksSectionPremium";
import LPPricingSectionPremium from "@/components/landing/LPPricingSectionPremium";

// Original sections (kept as-is)
import LPContactFormSection from "@/components/landing/LPContactFormSection";
import LPFAQSection from "@/components/landing/LPFAQSection";

// Premium animation system
import { 
  LoadingExperience, 
  CustomCursor,
  AnimationProvider,
} from "@/components/premium";

export default function LandingPage() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          navigate(createPageUrl('Home'));
        }
      } catch (error) {
        console.error("Auth check failed", error);
      }
    };
    checkAuth();
  }, [navigate]);
  
  return (
    <AnimationProvider>
      {/* Premium loading experience */}
      <LoadingExperience minDuration={1500} brandName="NurturInk" brandColor="#FF7A00">
        <div className="min-h-screen bg-white">
          {/* Custom cursor - desktop only */}
          <div className="hidden lg:block">
            <CustomCursor enabled={true} />
          </div>

          <LPHeader />
          
          <motion.div 
            className="pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Premium animated sections */}
            <LPHeroSectionPremium />
            <LPSocialProofPremium />
            <LPStatsBannerPremium />
            <LPFeaturesSectionPremium />
            <LPHowItWorksSectionPremium />
            <LPPricingSectionPremium />
            
            {/* Original sections */}
            <LPContactFormSection />
            <LPFAQSection />
          </motion.div>
          
          <LPFooter />
        </div>
      </LoadingExperience>
    </AnimationProvider>
  );
}