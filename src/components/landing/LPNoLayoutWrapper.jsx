import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Docks } from "@/components/ui/docks";
import { useDarkMode } from "../hooks/useDarkMode";

/**
 * Minimal layout wrapper for landing pages that bypasses MainLayout
 * This ensures no left navigation or app chrome appears on marketing pages
 */
export default function LPNoLayoutWrapper({ children }) {
  // Initialize dark mode for landing pages
  useDarkMode();
  
  return (
    <>
      {/* Dark mode toggle - positioned top right */}
      <div className="fixed top-4 right-6 z-[9999]">
        <Docks />
      </div>
      
      {/* Google Fonts for handwritten card preview (if needed) */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Kalam:wght@400;700&family=Patrick+Hand&display=swap" 
        rel="stylesheet" 
      />
      
      {/* Custom font classes mapped to Google Fonts */}
      <style>{`
        .font-caveat {
          font-family: 'Caveat', cursive;
        }
        .font-kalam {
          font-family: 'Kalam', cursive;
        }
        .font-patrick {
          font-family: 'Patrick Hand', cursive;
        }
      `}</style>
      
      {/* Render landing page content directly without MainLayout */}
      {children}
      
      {/* Global Toaster for notifications */}
      <Toaster />
    </>
  );
}