import React from "react";

export default function Layout({ children, currentPageName }) {
  return (
    <>
      {/* Google Fonts for handwritten card preview */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Kalam:wght@400;700&family=Patrick+Hand&display=swap" 
        rel="stylesheet" 
      />
      
      {children}
    </>
  );
}