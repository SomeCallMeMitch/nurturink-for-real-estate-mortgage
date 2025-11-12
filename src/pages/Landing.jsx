import React, { useState } from "react";
import HeroSection from "@/components/landing/HeroSection";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

export default function Landing() {
  const [currentVariation, setCurrentVariation] = useState(1);

  const cycleVariation = () => {
    setCurrentVariation((prev) => (prev % 5) + 1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Test Controls - Hidden in production */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={cycleVariation}
          className="bg-indigo-600 hover:bg-indigo-700 shadow-lg gap-2"
          size="lg"
        >
          <RotateCw className="w-4 h-4" />
          Test Variation {currentVariation}/5
        </Button>
      </div>

      {/* Hero Section */}
      <HeroSection variation={currentVariation} />
    </div>
  );
}