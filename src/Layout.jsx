
import React from "react";
import MainLayout from "./components/layout/MainLayout";
import { Toaster } from "@/components/ui/toaster";

export default function Layout({ children, currentPageName }) {
  // Pages that should use MainLayout
  const mainAppPages = [
    "Home",
    "FindClients", 
    "CreateContent",
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
    "SuperAdminCardManagement"
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
        <MainLayout>{children}</MainLayout>
      ) : (
        children
      )}
      
      {/* Global Toaster for all pages */}
      <Toaster />
    </>
  );
}
