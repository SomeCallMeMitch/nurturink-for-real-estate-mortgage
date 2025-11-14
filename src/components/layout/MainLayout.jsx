import React, { useEffect } from "react";
import LeftSidebar from "./LeftSidebar";
import { Docks } from "@/components/ui/docks";

export default function MainLayout({ children, whitelabelSettings }) {
  // Apply whitelabel colors dynamically
  useEffect(() => {
    if (whitelabelSettings) {
      const root = document.documentElement;
      
      // Apply primary color
      if (whitelabelSettings.primaryColor) {
        root.style.setProperty('--color-primary', whitelabelSettings.primaryColor);
      }
      
      // Apply accent color
      if (whitelabelSettings.accentColor) {
        root.style.setProperty('--color-accent', whitelabelSettings.accentColor);
      }
      
      // Apply background color
      if (whitelabelSettings.backgroundColor) {
        root.style.setProperty('--color-background', whitelabelSettings.backgroundColor);
      }
      
      // Apply fonts
      if (whitelabelSettings.fontHeadings) {
        root.style.setProperty('--font-headings', whitelabelSettings.fontHeadings);
      }
      
      if (whitelabelSettings.fontBody) {
        root.style.setProperty('--font-body', whitelabelSettings.fontBody);
      }
    }
  }, [whitelabelSettings]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <LeftSidebar whitelabelSettings={whitelabelSettings} />
      <main className="flex-1 overflow-y-auto relative">
        {/* Dark mode toggle - positioned top right with high z-index */}
        <div className="fixed top-4 right-6 z-[100]">
          <Docks />
        </div>
        <div className="pt-2">
          {children}
        </div>
      </main>
      
      {/* Global whitelabel styles */}
      {whitelabelSettings && (
        <style>{`
          :root {
            --primary-rgb: ${hexToRgb(whitelabelSettings.primaryColor || '#4F46E5')};
            --accent-rgb: ${hexToRgb(whitelabelSettings.accentColor || '#7C3AED')};
          }
          
          /* Apply primary color to buttons */
          .bg-indigo-600 {
            background-color: ${whitelabelSettings.primaryColor || '#4F46E5'} !important;
          }
          
          .hover\\:bg-indigo-700:hover {
            background-color: ${adjustBrightness(whitelabelSettings.primaryColor || '#4F46E5', -10)} !important;
          }
          
          .text-indigo-600 {
            color: ${whitelabelSettings.primaryColor || '#4F46E5'} !important;
          }
          
          .border-indigo-600 {
            border-color: ${whitelabelSettings.primaryColor || '#4F46E5'} !important;
          }
          
          .bg-indigo-50 {
            background-color: ${adjustBrightness(whitelabelSettings.primaryColor || '#4F46E5', 90)} !important;
          }
          
          /* Apply accent color */
          .bg-purple-600 {
            background-color: ${whitelabelSettings.accentColor || '#7C3AED'} !important;
          }
          
          .text-purple-600 {
            color: ${whitelabelSettings.accentColor || '#7C3AED'} !important;
          }
          
          /* Apply fonts - REMOVED !important to allow preview fonts to work */
          h1, h2, h3, h4, h5, h6 {
            font-family: '${whitelabelSettings.fontHeadings || 'Inter'}', sans-serif;
          }
          
          body, p:not([class*="font-"]), span:not([class*="font-"]), div:not([class*="font-"]) {
            font-family: '${whitelabelSettings.fontBody || 'Inter'}', sans-serif;
          }
          
          /* Ensure handwriting fonts always take precedence */
          .font-caveat, .font-caveat * {
            font-family: 'Caveat', cursive !important;
          }
          
          .font-kalam, .font-kalam * {
            font-family: 'Kalam', cursive !important;
          }
          
          .font-patrick, .font-patrick * {
            font-family: 'Patrick Hand', cursive !important;
          }
        `}</style>
      )}
    </div>
  );
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '79, 70, 229'; // fallback to indigo-600
}

// Helper function to adjust brightness
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}