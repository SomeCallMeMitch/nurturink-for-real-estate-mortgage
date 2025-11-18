import React, { useEffect, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function MainLayout({ children, whitelabelSettings }) {
  // Apply whitelabel colors dynamically
  useEffect(() => {
    if (whitelabelSettings) {
      const root = document.documentElement;
      
      // Apply primary color
      if (whitelabelSettings.primaryColor) {
        root.style.setProperty('--color-primary', whitelabelSettings.primaryColor);
        // Also set sidebar primary variables if needed
        root.style.setProperty('--sidebar-primary', whitelabelSettings.primaryColor);
      }
      
      // Apply accent color
      if (whitelabelSettings.accentColor) {
        root.style.setProperty('--color-accent', whitelabelSettings.accentColor);
        root.style.setProperty('--sidebar-accent', whitelabelSettings.accentColor);
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
    <SidebarProvider>
      <AppSidebar whitelabelSettings={whitelabelSettings} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
      
      {/* Global whitelabel styles - Font overrides only */}
      {whitelabelSettings && (
        <style>{`
          /* Apply fonts from WL settings if available, otherwise use theme defaults */
          h1, h2, h3, h4, h5, h6 {
            font-family: '${whitelabelSettings.fontHeadings || 'Helvetica Neue'}', sans-serif;
          }
          
          body, p:not([class*="font-"]), span:not([class*="font-"]), div:not([class*="font-"]) {
            font-family: '${whitelabelSettings.fontBody || 'Helvetica Neue'}', sans-serif;
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
          
          /* Sidebar variable overrides for customization */
          :root {
             --sidebar-background: #ffffff;
             --sidebar-foreground: #374151;
             --sidebar-primary: var(--primary);
             --sidebar-primary-foreground: #ffffff;
             --sidebar-accent: #f3f4f6;
             --sidebar-accent-foreground: #111827;
             --sidebar-border: #e5e7eb;
             --sidebar-ring: var(--ring);
          }
          .dark {
             --sidebar-background: #111827;
             --sidebar-foreground: #f3f4f6;
             --sidebar-primary: var(--primary);
             --sidebar-primary-foreground: #ffffff;
             --sidebar-accent: #1f2937;
             --sidebar-accent-foreground: #f3f4f6;
             --sidebar-border: #374151;
             --sidebar-ring: var(--ring);
          }
        `}</style>
      )}
    </SidebarProvider>
  );
}