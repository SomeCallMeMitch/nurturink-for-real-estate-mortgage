import React, { useEffect, useState } from "react";
import MainLayout from "./components/layout/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import { base44 } from "@/api/base44Client";
import { useLocation } from "react-router-dom";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  // DEBUG: See what page we're actually on
  console.log('🔍 Layout.js - currentPageName prop:', currentPageName);
  console.log('🔍 Layout.js - actual pathname:', location.pathname);
  
  const [whitelabelSettings, setWhitelabelSettings] = useState(null);

  useEffect(() => {
    // Load whitelabel settings for favicon
    const loadWhitelabelSettings = async () => {
      try {
        const response = await base44.functions.invoke('getWhitelabelSettings');
        setWhitelabelSettings(response.data.settings);
        
        // Update favicon if it exists
        if (response.data.settings.faviconUrl) {
          const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
          link.type = 'image/x-icon';
          link.rel = 'shortcut icon';
          link.href = response.data.settings.faviconUrl;
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        
        // Update page title if brand name exists
        if (response.data.settings.brandName) {
          document.title = response.data.settings.brandName;
        }
      } catch (error) {
        console.error('Failed to load whitelabel settings:', error);
      }
    };
    
    loadWhitelabelSettings();
  }, []);

  // Check actual path instead of unreliable currentPageName prop
  // Landing pages bypass MainLayout (no sidebar)
  const isLandingPage = location.pathname === '/' || 
                        location.pathname === '/Welcome' ||
                        location.pathname === '/lp' || 
                        location.pathname.toLowerCase().includes('landing');

  console.log('🔍 Layout.js - isLandingPage:', isLandingPage);
  console.log('🔍 Layout.js - will use MainLayout:', !isLandingPage);
  
  return (
    <>
      {/* Google Fonts for handwritten card preview */}
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
      
      {isLandingPage ? (
        // Landing page renders directly without sidebar
        children
      ) : (
        // All other pages get MainLayout with sidebar
        <MainLayout whitelabelSettings={whitelabelSettings}>{children}</MainLayout>
      )}
      
      {/* Global Toaster - will auto-dismiss after 3 seconds */}
      <Toaster />
    </>
  );
}