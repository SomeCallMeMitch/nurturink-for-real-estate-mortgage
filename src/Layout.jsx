import React, { useEffect, useState } from "react";
import MainLayout from "./components/layout/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import { base44 } from "@/api/base44Client";
import { useDarkMode } from "@/components/hooks/useDarkMode";

export default function Layout({ children, currentPageName }) {
  const [whitelabelSettings, setWhitelabelSettings] = useState(null);
  
  // Initialize dark mode
  useDarkMode();

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

  // Pages that should use MainLayout
  const mainAppPages = [
    "Home",
    "FindClients", 
    "CreateContent",
    "SelectDesign",
    "ReviewAndSend",
    "MailingConfirmation",
    "Templates",
    "EditTemplate",
    "TemplatePreview",
    "Analytics",
    "Clients",
    "Settings",
    "AdminClients",
    "AdminClientEdit",
    "SettingsProfile",
    "SettingsOrganization",
    "SettingsWritingStyle",
    "SettingsAddresses",
    "SettingsPhones",
    "SettingsUrls",
    "SettingsTeam",
    "SuperAdminCardManagement",
    "AdminPricing",
    "AdminCoupons",
    "Credits",
    "Order",
    "PaymentSuccess",
    "PaymentCancel",
    "TeamManagement",
    "SuperAdminWhitelabel",
    "SuperAdminDashboard",
    "AdminCardLayout",
    "AdminEnvelopeLayout",
    "AdminCreateContentLayout"
  ];
  
  // Check if current page should use MainLayout
  const useMainLayout = mainAppPages.includes(currentPageName);
  
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
      
      {useMainLayout ? (
        <MainLayout whitelabelSettings={whitelabelSettings}>{children}</MainLayout>
      ) : (
        children
      )}
      
      {/* Global Toaster - will auto-dismiss after 3 seconds */}
      <Toaster />
    </>
  );
}