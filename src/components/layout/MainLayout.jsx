import React, { useEffect, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import LeftSidebar from "./LeftSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

/**
 * Generates CSS variable declarations from whitelabel settings
 * This function maps all settings fields to their corresponding CSS variables
 */
function generateWhitelabelCSS(settings) {
  if (!settings) return "";

  // Helper to only include a CSS line if the value exists
  const cssVar = (varName, value) => {
    if (!value) return "";
    return `${varName}: ${value};`;
  };

  return `
    :root {
      /* ========================================
         WHITELABEL CSS VARIABLE OVERRIDES
         Generated from WhitelabelSettings
         ======================================== */

      /* Core Theme Colors */
      ${cssVar("--primary", settings.primaryColor)}
      ${cssVar("--background", settings.backgroundColor)}
      ${cssVar("--foreground", settings.foregroundColor)}
      
      /* Card & Surface */
      ${cssVar("--card", settings.cardBackground)}
      ${cssVar("--card-foreground", settings.cardForeground)}
      ${cssVar("--surface-0", settings.surface0)}
      ${cssVar("--surface-1", settings.surface1)}
      ${cssVar("--surface-muted", settings.surfaceMuted)}
      
      /* Input & Form */
      ${cssVar("--input", settings.inputBackground)}
      ${cssVar("--border", settings.inputBorder)}
      ${cssVar("--ring", settings.ringColor)}
      
      /* Muted */
      ${cssVar("--muted", settings.mutedBackground)}
      ${cssVar("--muted-foreground", settings.mutedForeground)}
      
      /* Secondary */
      ${cssVar("--secondary", settings.secondaryBackground)}
      ${cssVar("--secondary-foreground", settings.secondaryForeground)}
      
      /* Accent */
      ${cssVar("--accent", settings.accentBackground)}
      ${cssVar("--accent-foreground", settings.accentForeground)}
      
      /* Destructive */
      ${cssVar("--destructive", settings.destructiveBackground)}
      ${cssVar("--destructive-foreground", settings.destructiveForeground)}
      
      /* Semantic Status Colors */
      ${cssVar("--success", settings.successColor)}
      ${cssVar("--warning", settings.warningColor)}
      ${cssVar("--danger", settings.dangerColor)}
      
      /* Pills - Semantic */
      ${cssVar("--pill-success-bg", settings.pillSuccessBg)}
      ${cssVar("--pill-success-fg", settings.pillSuccessFg)}
      ${cssVar("--pill-warning-bg", settings.pillWarningBg)}
      ${cssVar("--pill-warning-fg", settings.pillWarningFg)}
      ${cssVar("--pill-danger-bg", settings.pillDangerBg)}
      ${cssVar("--pill-danger-fg", settings.pillDangerFg)}
      ${cssVar("--pill-muted-bg", settings.pillMutedBg)}
      ${cssVar("--pill-muted-fg", settings.pillMutedFg)}
      
      /* Pills - Utility */
      ${cssVar("--pill-color1-bg", settings.pillColor1Bg)}
      ${cssVar("--pill-color1-fg", settings.pillColor1Fg)}
      ${cssVar("--pill-color2-bg", settings.pillColor2Bg)}
      ${cssVar("--pill-color2-fg", settings.pillColor2Fg)}
      ${cssVar("--pill-color3-bg", settings.pillColor3Bg)}
      ${cssVar("--pill-color3-fg", settings.pillColor3Fg)}
      
      /* Navigation/Sidebar */
      ${cssVar("--sidebar-background", settings.sidebarBackground)}
      ${cssVar("--sidebar-foreground", settings.sidebarForeground)}
      ${cssVar("--sidebar-border", settings.sidebarBorder)}
      ${cssVar("--sidebar-accent", settings.sidebarAccent)}
      ${cssVar("--sidebar-accent-foreground", settings.sidebarAccentForeground)}
      ${cssVar("--sidebar-primary", settings.sidebarPrimary || settings.brandAccent)}
      ${cssVar("--sidebar-primary-foreground", settings.sidebarPrimaryForeground || settings.brandAccentForeground)}
      ${cssVar("--sidebar-ring", settings.ringColor)}
      
      ${cssVar("--nav-bg", settings.navBackground)}
      ${cssVar("--nav-fg", settings.navForeground)}
      ${cssVar("--nav-muted", settings.navMuted)}
      ${cssVar("--nav-border", settings.navBorder)}
      ${cssVar("--nav-item-hover-bg", settings.navItemHoverBg)}
      ${cssVar("--nav-item-active-bg", settings.navItemActiveBg)}
      ${cssVar("--nav-item-active-fg", settings.navItemActiveFg)}
      ${cssVar("--nav-accent", settings.navAccent)}
      
      /* Brand/CTA */
      ${cssVar("--brand-accent", settings.brandAccent)}
      ${cssVar("--brand-accent-foreground", settings.brandAccentForeground)}
      ${cssVar("--brand-primary", settings.brandAccent || settings.primaryColor)}
      ${cssVar("--cta-primary", settings.ctaPrimary)}
      ${cssVar("--cta-primary-foreground", settings.ctaPrimaryForeground)}
      ${cssVar("--focus-ring", settings.focusRing)}
      
      /* Text Hierarchy */
      ${cssVar("--text-0", settings.text0)}
      ${cssVar("--text-1", settings.text1)}
      ${cssVar("--text-2", settings.text2)}
      ${cssVar("--border-subtle", settings.borderSubtle)}
      
      /* Border Radius */
      ${cssVar("--radius", settings.borderRadius)}
    }

    /* Typography - Font Family Overrides */
    ${settings.fontHeadings ? `
    h1, h2, h3, h4, h5, h6 {
      font-family: '${settings.fontHeadings}', sans-serif;
    }
    ` : ""}
    
    ${settings.fontBody ? `
    body, p:not([class*="font-"]), span:not([class*="font-"]), div:not([class*="font-"]) {
      font-family: '${settings.fontBody}', sans-serif;
    }
    ` : ""}
    
    /* Preserve handwriting fonts for card preview */
    .font-caveat, .font-caveat * { font-family: 'Caveat', cursive !important; }
    .font-kalam, .font-kalam * { font-family: 'Kalam', cursive !important; }
    .font-patrick, .font-patrick * { font-family: 'Patrick Hand', cursive !important; }
  `;
}

export default function MainLayout({ children, whitelabelSettings }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const u = await base44.auth.me();
        console.log("MainLayout: Fetched user:", u);
        setUser(u);
      } catch (e) {
        console.error("MainLayout: Failed to fetch user:", e);
        // Set user to empty object to prevent white screen - layout will still render
        setUser({});
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  // Generate CSS from whitelabel settings
  const whitelabelStyles = whitelabelSettings && (
    <style>{generateWhitelabelCSS(whitelabelSettings)}</style>
  );

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--surface-1)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--nav-accent)]" />
      </div>
    );
  }

  const isSuperAdmin = user?.appRole === "super_admin";

  console.log(
    "MainLayout Render: user:",
    user,
    "isSuperAdmin:",
    isSuperAdmin,
    "role:",
    user?.appRole
  );

  if (isSuperAdmin) {
    console.log("MainLayout: Rendering AppSidebar (Super Admin)");
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
  console.log("MainLayout: Rendering LeftSidebar (Regular User/Not Loaded Yet)");
  return (
    <div className="flex h-screen bg-[var(--surface-1)]">
      <LeftSidebar whitelabelSettings={whitelabelSettings} user={user} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
      {whitelabelStyles}
    </div>
  );
}