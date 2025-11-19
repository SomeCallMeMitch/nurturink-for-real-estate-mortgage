import React, { useEffect, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import LeftSidebar from "./LeftSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

export default function MainLayout({ children, whitelabelSettings }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const u = await base44.auth.me();
        console.log('MainLayout: Fetched user:', u);
        setUser(u);
      } catch (e) {
        console.error('MainLayout: Failed to fetch user:', e);
        // Don't set loading false here, let the page redirect if needed
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  // Common style block for whitelabel settings
  const whitelabelStyles = whitelabelSettings && (
    <style>{`
      h1, h2, h3, h4, h5, h6 {
        font-family: '${whitelabelSettings.fontHeadings || 'Helvetica Neue'}', sans-serif;
      }
      body, p:not([class*="font-"]), span:not([class*="font-"]), div:not([class*="font-"]) {
        font-family: '${whitelabelSettings.fontBody || 'Helvetica Neue'}', sans-serif;
      }
      .font-caveat, .font-caveat * { font-family: 'Caveat', cursive !important; }
      .font-kalam, .font-kalam * { font-family: 'Kalam', cursive !important; }
      .font-patrick, .font-patrick * { font-family: 'Patrick Hand', cursive !important; }
      
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
      
      /* Apply colors dynamically */
      :root {
        ${whitelabelSettings.primaryColor ? `--color-primary: ${whitelabelSettings.primaryColor};` : ''}
        ${whitelabelSettings.accentColor ? `--color-accent: ${whitelabelSettings.accentColor};` : ''}
        ${whitelabelSettings.backgroundColor ? `--color-background: ${whitelabelSettings.backgroundColor};` : ''}
      }
    `}</style>
  );

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isSuperAdmin = user?.appRole === 'super_admin';

  if (isSuperAdmin) {
    return (
      <SidebarProvider>
        <AppSidebar whitelabelSettings={whitelabelSettings} user={user} />
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
      <LeftSidebar whitelabelSettings={whitelabelSettings} user={user} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
      {whitelabelStyles}
    </div>
  );
}