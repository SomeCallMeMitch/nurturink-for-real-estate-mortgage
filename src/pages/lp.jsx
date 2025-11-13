import React from "react";
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
  console.log('🔍 LandingPage.jsx: Component is rendering');
  console.log('🔍 LandingPage.jsx: About to render LPNoLayoutWrapper');
  
  React.useEffect(() => {
    console.log('🔍 LandingPage.jsx: Component mounted in DOM');
    console.log('🔍 LandingPage.jsx: Checking for left nav elements...');
    
    // Check for common sidebar/nav elements
    const leftNavElements = document.querySelectorAll('nav, aside, [class*="sidebar"], [class*="LeftSidebar"]');
    console.log('🔍 LandingPage.jsx: Found left nav elements:', leftNavElements.length);
    
    if (leftNavElements.length > 0) {
      console.log('⚠️ LandingPage.jsx: LEFT NAV ELEMENTS DETECTED:');
      leftNavElements.forEach((el, idx) => {
        console.log(`  ${idx + 1}. Tag: ${el.tagName}, Classes: ${el.className}, ID: ${el.id}`);
      });
    } else {
      console.log('✅ LandingPage.jsx: No left nav elements found!');
    }
    
    // Check the body structure
    console.log('🔍 LandingPage.jsx: Body children count:', document.body.children.length);
    console.log('🔍 LandingPage.jsx: Root element structure:', document.getElementById('root')?.children.length || 'No #root found');
    
  }, []);
  
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