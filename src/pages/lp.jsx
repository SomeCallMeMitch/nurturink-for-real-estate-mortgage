import React from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import LPNoLayoutWrapper from "@/components/landing/LPNoLayoutWrapper";
import LPHeader from "@/components/landing/LPHeader";
import LPHeroSection from "@/components/landing/LPHeroSection";
import LPFeatures1Section from "@/components/landing/LPFeatures1Section";
import LPSocialProofLogos from "@/components/landing/LPSocialProofLogos";
import LPStatsBanner from "@/components/landing/LPStatsBanner";
import LPFeatures2Section from "@/components/landing/LPFeatures2Section";
import LPHowItWorksSection from "@/components/landing/LPHowItWorksSection";
import LPPricingSection from "@/components/landing/LPPricingSection";
import LPContactFormSection from "@/components/landing/LPContactFormSection";
import LPFAQSection from "@/components/landing/LPFAQSection";
import LPFooter from "@/components/landing/LPFooter";

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
    <LPNoLayoutWrapper>
      <div className="min-h-screen bg-white">
        <LPHeader />
        <div className="pt-20">
          <LPHeroSection />
          <LPFeatures1Section />
          <LPSocialProofLogos />
          <LPStatsBanner />
          <LPFeatures2Section />
          <LPHowItWorksSection />
          <LPPricingSection />
          <LPContactFormSection />
          <LPFAQSection />
        </div>
        <LPFooter />
      </div>
    </LPNoLayoutWrapper>
  );
}