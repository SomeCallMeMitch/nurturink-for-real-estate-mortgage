import React, { useEffect, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import LeftSidebar from "./LeftSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { base44 } from "@/api/base44Client";

export default function MainLayout({ children, whitelabelSettings }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

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

  const isSuperAdmin = user?.appRole === 'super_admin';

  // Common style block
  const whitelabelStyles = whitelabelSettings && (
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
  );

  if (isSuperAdmin) {
    return (
      <SidebarProvider>
        <AppSidebar whitelabelSettings={whitelabelSettings} />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto pt-4">
            {children}
          </div>
        </SidebarInset>
        {whitelabelStyles}
      </SidebarProvider>
    );
  }

  // Regular User Layout - Simple Sidebar
  return (
    <div className="flex h-screen bg-gray-50">
      <LeftSidebar whitelabelSettings={whitelabelSettings} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
      {whitelabelStyles}
    </div>
  );
}