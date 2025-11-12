import React, { useState } from "react";
import HeroSection1 from "@/components/landing/HeroSection1";
import SocialProofBanner from "@/components/landing/SocialProofBanner";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

export default function Landing1() {
  const [heroVariation, setHeroVariation] = useState(1);
  const [socialProofVariation, setSocialProofVariation] = useState('A');

  const cycleHero = () => {
    setHeroVariation((prev) => (prev % 5) + 1);
  };

  const cycleSocialProof = () => {
    const variations = ['A', 'B', 'C', 'D'];
    setSocialProofVariation((prev) => {
      const currentIndex = variations.indexOf(prev);
      return variations[(currentIndex + 1) % 4];
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Test Controls - Sticky Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <Button
          onClick={cycleHero}
          className="bg-indigo-600 hover:bg-indigo-700 shadow-lg gap-2"
          size="lg"
        >
          <RotateCw className="w-4 h-4" />
          Hero {heroVariation}/5
        </Button>
        
        <Button
          onClick={cycleSocialProof}
          className="bg-purple-600 hover:bg-purple-700 shadow-lg gap-2"
          size="lg"
        >
          <RotateCw className="w-4 h-4" />
          Social Proof {socialProofVariation}
        </Button>
      </div>

      {/* Hero Section */}
      <HeroSection1 variation={heroVariation} />
      
      {/* Social Proof Banner */}
      <SocialProofBanner variation={socialProofVariation} />
    </div>
  );
}