import React, { useState } from "react";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

export default function Landing() {
  const [heroVariation, setHeroVariation] = useState(1);
  const [problemVariation, setProblemVariation] = useState(1);

  const cycleHero = () => {
    setHeroVariation((prev) => (prev % 5) + 1);
  };

  const cycleProblem = () => {
    setProblemVariation((prev) => (prev % 3) + 1);
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
          onClick={cycleProblem}
          className="bg-purple-600 hover:bg-purple-700 shadow-lg gap-2"
          size="lg"
        >
          <RotateCw className="w-4 h-4" />
          Problem {problemVariation}/3
        </Button>
      </div>

      {/* Hero Section */}
      <HeroSection variation={heroVariation} />
      
      {/* Problem Section */}
      <ProblemSection variation={problemVariation} />
    </div>
  );
}