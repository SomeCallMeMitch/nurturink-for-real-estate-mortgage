import React, { useEffect, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import LeftSidebar from "./LeftSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

/**
 * Default values - ensures all CSS variables have values even if
 * WhitelabelSettings entity doesn't have all fields yet
 */
const DEFAULT_SETTINGS = {
  // Core Colors
  primaryColor: "#0477d1",
  accentColor: "#c87533",
  backgroundColor: "#f8fafc",  // Light gray background
  foregroundColor: "#222222",

  // Card & Surface - CRITICAL: card must be different from background
  cardBackground: "#ffffff",
  cardForeground: "#222222",
  surface0: "#ffffff",
  surface1: "#f9fafb",
  surfaceMuted: "#f3f4f6",

  // Input & Form
  inputBackground: "#ffffff",
  inputBorder: "#e5e7eb",
  ringColor: "#0477d1",

  // Muted
  mutedBackground: "#f3f4f6",
  mutedForeground: "#6b7280",

  // Secondary
  secondaryBackground: "#f1f5f9",
  secondaryForeground: "#475569",

  // Accent
  accentBackground: "#f1f5f9",
  accentForeground: "#0369a1",

  // Destructive
  destructiveBackground: "#dc2626",
  destructiveForeground: "#ffffff",

  // Semantic Status
  successColor: "#10b981",
  warningColor: "#f59e0b",
  dangerColor: "#ef4444",

  // Pills - Semantic
  pillSuccessBg: "#dcfce7",
  pillSuccessFg: "#166534",
  pillWarningBg: "#fef3c7",
  pillWarningFg: "#92400e",
  pillDangerBg: "#fee2e2",
  pillDangerFg: "#991b1b",
  pillMutedBg: "#f3f4f6",
  pillMutedFg: "#374151",

  // Pills - Utility
  pillColor1Bg: "#dbeafe",
  pillColor1Fg: "#1d4ed8",
  pillColor2Bg: "#ede9fe",
  pillColor2Fg: "#6d28d9",
  pillColor3Bg: "#ccfbf1",
  pillColor3Fg: "#0f766e",

  // Navigation/Sidebar
  sidebarBackground: "#ffffff",
  sidebarForeground: "#374151",
  sidebarBorder: "#e5e7eb",
  sidebarAccent: "#f3f4f6",
  sidebarAccentForeground: "#111827",
  sidebarPrimary: "#c87533",
  sidebarPrimaryForeground: "#ffffff",

  navBackground: "#ffffff",
  navForeground: "#374151",
  navMuted: "#9ca3af",
  navBorder: "#e5e7eb",
  navItemHoverBg: "#fef3e2",
  navItemActiveBg: "#fef3e2",
  navItemActiveFg: "#c87533",
  navAccent: "#c87533",

  // Brand/CTA
  brandAccent: "#c87533",
  brandAccentForeground: "#ffffff",
  ctaPrimary: "#c87533",
  ctaPrimaryForeground: "#ffffff",
  focusRing: "#3b82f6",

  // Text Hierarchy
  text0: "#111827",
  text1: "#4b5563",
  text2: "#9ca3af",
  borderSubtle: "#e5e7eb",

  // Typography
  fontHeadings: "Inter",
  fontBody: "Inter",

  // Border Radius
  borderRadius: "0.5rem",
};

/**
 * Generates CSS variable declarations from whitelabel settings
 * Merges with defaults to ensure all variables are defined
 */
function generateWhitelabelCSS(settings) {
  // Merge settings with defaults - settings values override defaults
  const merged = { ...DEFAULT_SETTINGS, ...settings };

  return `
    :root {
      /* ========================================
         WHITELABEL CSS VARIABLE OVERRIDES
         Generated from WhitelabelSettings
         ======================================== */

      /* Core Theme Colors */
      --primary: ${merged.primaryColor};
      --background: ${merged.backgroundColor};
      --foreground: ${merged.foregroundColor};
      
      /* Card & Surface */
      --card: ${merged.cardBackground};
      --card-foreground: ${merged.cardForeground};
      --surface-0: ${merged.surface0};
      --surface-1: ${merged.surface1};
      --surface-muted: ${merged.surfaceMuted};
      
      /* Input & Form */
      --input: ${merged.inputBackground};
      --border: ${merged.inputBorder};
      --ring: ${merged.ringColor};
      
      /* Muted */
      --muted: ${merged.mutedBackground};
      --muted-foreground: ${merged.mutedForeground};
      
      /* Secondary */
      --secondary: ${merged.secondaryBackground};
      --secondary-foreground: ${merged.secondaryForeground};
      
      /* Accent */
      --accent: ${merged.accentBackground};
      --accent-foreground: ${merged.accentForeground};
      
      /* Popover (same as card for consistency) */
      --popover: ${merged.cardBackground};
      --popover-foreground: ${merged.cardForeground};
      
      /* Destructive */
      --destructive: ${merged.destructiveBackground};
      --destructive-foreground: ${merged.destructiveForeground};
      
      /* Semantic Status Colors */
      --success: ${merged.successColor};
      --warning: ${merged.warningColor};
      --danger: ${merged.dangerColor};
      
      /* Pills - Semantic */
      --pill-success-bg: ${merged.pillSuccessBg};
      --pill-success-fg: ${merged.pillSuccessFg};
      --pill-warning-bg: ${merged.pillWarningBg};
      --pill-warning-fg: ${merged.pillWarningFg};
      --pill-danger-bg: ${merged.pillDangerBg};
      --pill-danger-fg: ${merged.pillDangerFg};
      --pill-muted-bg: ${merged.pillMutedBg};
      --pill-muted-fg: ${merged.pillMutedFg};
      
      /* Pills - Utility */
      --pill-color1-bg: ${merged.pillColor1Bg};
      --pill-color1-fg: ${merged.pillColor1Fg};
      --pill-color2-bg: ${merged.pillColor2Bg};
      --pill-color2-fg: ${merged.pillColor2Fg};
      --pill-color3-bg: ${merged.pillColor3Bg};
      --pill-color3-fg: ${merged.pillColor3Fg};
      
      /* Navigation/Sidebar */
      --sidebar-background: ${merged.sidebarBackground};
      --sidebar-foreground: ${merged.sidebarForeground};
      --sidebar-border: ${merged.sidebarBorder};
      --sidebar-accent: ${merged.sidebarAccent};
      --sidebar-accent-foreground: ${merged.sidebarAccentForeground};
      --sidebar-primary: ${merged.sidebarPrimary || merged.brandAccent};
      --sidebar-primary-foreground: ${merged.sidebarPrimaryForeground || merged.brandAccentForeground};
      --sidebar-ring: ${merged.ringColor};
      
      --nav-bg: ${merged.navBackground};
      --nav-fg: ${merged.navForeground};
      --nav-muted: ${merged.navMuted};
      --nav-border: ${merged.navBorder};
      --nav-item-hover-bg: ${merged.navItemHoverBg};
      --nav-item-active-bg: ${merged.navItemActiveBg};
      --nav-item-active-fg: ${merged.navItemActiveFg};
      --nav-accent: ${merged.navAccent};
      
      /* Brand/CTA */
      --brand-accent: ${merged.brandAccent};
      --brand-accent-foreground: ${merged.brandAccentForeground};
      --brand-primary: ${merged.brandAccent || merged.primaryColor};
      --cta-primary: ${merged.ctaPrimary};
      --cta-primary-foreground: ${merged.ctaPrimaryForeground};
      --focus-ring: ${merged.focusRing};
      
      /* Text Hierarchy */
      --text-0: ${merged.text0};
      --text-1: ${merged.text1};
      --text-2: ${merged.text2};
      --border-subtle: ${merged.borderSubtle};
      
      /* Border Radius */
      --radius: ${merged.borderRadius};
    }

    /* Typography - Font Family Overrides */
    h1, h2, h3, h4, h5, h6 {
      font-family: '${merged.fontHeadings}', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    body, p:not([class*="font-"]), span:not([class*="font-"]), div:not([class*="font-"]) {
      font-family: '${merged.fontBody}', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
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
        setUser({});
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  // ALWAYS generate CSS - use defaults if no settings provided
  const whitelabelStyles = (
    <style>{generateWhitelabelCSS(whitelabelSettings || {})}</style>
  );

  if (loading) {
    return (
      <>
        {whitelabelStyles}
        <div className="h-screen w-full flex items-center justify-center bg-[var(--background)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      </>
    );
  }

  const isSuperAdmin = user?.appRole === "super_admin";

  console.log(
    "MainLayout Render: user:",
    user,
    "isSuperAdmin:",
    isSuperAdmin,
    "role:",
    user?.appRole,
    "whitelabelSettings:",
    whitelabelSettings
  );

  if (isSuperAdmin) {
    console.log("MainLayout: Rendering AppSidebar (Super Admin)");
    return (
      <>
        {whitelabelStyles}
        <SidebarProvider>
          <AppSidebar whitelabelSettings={whitelabelSettings} user={user} />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto pt-4">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </>
    );
  }

  // Regular User Layout - Simple Sidebar
  console.log("MainLayout: Rendering LeftSidebar (Regular User)");
  return (
    <>
      {whitelabelStyles}
      <div className="flex h-screen bg-[var(--background)]">
        <LeftSidebar whitelabelSettings={whitelabelSettings} user={user} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </>
  );
}