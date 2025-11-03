
import React from "react";
import MainLayout from "./components/layout/MainLayout";

export default function Layout({ children, currentPageName }) {
  // Pages that should use MainLayout
  const mainAppPages = [
    "Home",
    "FindClients", 
    "CreateContent",
    "CreateContent2",
    "Templates",
    "EditTemplate",
    "Analytics",
    "Clients",
    "Settings",
    "AdminClients",
    "AdminClientEdit",
    "SettingsProfile",
    "SettingsWritingStyle",
    "SettingsAddresses",
    "SettingsPhones",
    "SettingsUrls",
    "SettingsTeam"
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
      
      {useMainLayout ? (
        <MainLayout>{children}</MainLayout>
      ) : (
        children
      )}
    </>
  );
}
