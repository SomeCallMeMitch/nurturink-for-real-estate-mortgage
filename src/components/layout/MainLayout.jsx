import React from "react";
import { AppSidebar } from "./AppSidebar";
import LeftSidebar from "./LeftSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";
// BATCH4-B1: user now comes from AuthContext — no direct auth.me() call needed here
import { useAuth } from "@/lib/AuthContext";

/**
 * Converts a hex color to HSL values string for Tailwind
 * Input: "#ffffff" or "ffffff"
 * Output: "0 0% 100%" (format Tailwind expects)
 */
function hexToHSL(hex) {
  if (!hex) return "0 0% 0%";
  
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Handle shorthand hex (e.g., "fff")
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: h = 0;
    }
  }

  // Convert to degrees and percentages
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

/**
 * Default values - ensures all CSS variables have values even if
 * WhitelabelSettings entity doesn't have all fields yet
 */
const DEFAULT_SETTINGS = {
  // Core Colors
  primaryColor: "#0477d1",
  accentColor: "#c87533",
  backgroundColor: "#f8fafc",
  foregroundColor: "#222222",

  // Card & Surface
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

  // ===========================
  // PILLS - SEMANTIC
  // ===========================
  pillSuccessBg: "#dcfce7",
  pillSuccessFg: "#166534",
  pillWarningBg: "#fef3c7",
  pillWarningFg: "#92400e",
  pillDangerBg: "#fee2e2",
  pillDangerFg: "#991b1b",
  pillMutedBg: "#f3f4f6",
  pillMutedFg: "#374151",

  // ===========================
  // PILLS - UTILITY COLORS
  // ===========================
  pillColor1Bg: "#dbeafe",
  pillColor1Fg: "#1d4ed8",
  pillColor2Bg: "#ede9fe",
  pillColor2Fg: "#6d28d9",
  pillColor3Bg: "#ccfbf1",
  pillColor3Fg: "#0f766e",

  // ===========================
  // PILLS - TAG/CATEGORY
  // ===========================
  pillTagBg: "#fef3e2",
  pillTagFg: "#c87533",

  // ===========================
  // PILLS - CUSTOM INDICATOR
  // ===========================
  pillCustomBg: "#fff7ed",
  pillCustomFg: "#c2410c",

  // ===========================
  // PILLS - TYPES (Template/QuickSend)
  // ===========================
  pillPersonalBg: "#f3e8ff",
  pillPersonalFg: "#7c3aed",
  pillOrganizationBg: "#dbeafe",
  pillOrganizationFg: "#1d4ed8",
  pillPlatformBg: "#dcfce7",
  pillPlatformFg: "#166534",

  // ===========================
  // PILLS - PURPOSES (QuickSend)
  // ===========================
  pillPurposeThankYouBg: "#dcfce7",
  pillPurposeThankYouFg: "#166534",
  pillPurposeReferralBg: "#dbeafe",
  pillPurposeReferralFg: "#1d4ed8",
  pillPurposeReviewBg: "#fef9c3",
  pillPurposeReviewFg: "#a16207",
  pillPurposeReviewReferralBg: "#f3e8ff",
  pillPurposeReviewReferralFg: "#7c3aed",
  pillPurposeBirthdayBg: "#fce7f3",
  pillPurposeBirthdayFg: "#be185d",
  pillPurposeAnniversaryBg: "#fee2e2",
  pillPurposeAnniversaryFg: "#b91c1c",
  pillPurposeHolidayBg: "#e0e7ff",
  pillPurposeHolidayFg: "#4338ca",
  pillPurposeJustBecauseBg: "#ccfbf1",
  pillPurposeJustBecauseFg: "#0f766e",
  pillPurposeCustomBg: "#f3f4f6",
  pillPurposeCustomFg: "#374151",

  // ===========================
  // SELECTION STATES
  // ===========================
  selectionBg: "#EFF6FF",
  selectionBorder: "#0477d1",
  selectionText: "#222222",

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
 * Converts hex colors to HSL format for Tailwind compatibility
 */
function generateWhitelabelCSS(settings) {
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  
  // Helper to convert hex to HSL
  const hsl = (hex) => hexToHSL(hex);

  return `
    :root {
      /* ========================================
         WHITELABEL CSS VARIABLE OVERRIDES
         Generated from WhitelabelSettings
         
         Values are in HSL format for Tailwind:
         "hue saturation% lightness%"
         ======================================== */

      /* Core Theme Colors (HSL for Tailwind) */
      --primary: ${hsl(merged.primaryColor)};
      --primary-foreground: ${hsl("#ffffff")};
      --background: ${hsl(merged.backgroundColor)};
      --foreground: ${hsl(merged.foregroundColor)};
      
      /* Card & Surface */
      --card: ${hsl(merged.cardBackground)};
      --card-foreground: ${hsl(merged.cardForeground)};
      
      /* Input & Form */
      --input: ${hsl(merged.inputBackground)};
      --border: ${hsl(merged.inputBorder)};
      --ring: ${hsl(merged.ringColor)};
      
      /* Muted */
      --muted: ${hsl(merged.mutedBackground)};
      --muted-foreground: ${hsl(merged.mutedForeground)};
      
      /* Secondary */
      --secondary: ${hsl(merged.secondaryBackground)};
      --secondary-foreground: ${hsl(merged.secondaryForeground)};
      
      /* Accent */
      --accent: ${hsl(merged.accentBackground)};
      --accent-foreground: ${hsl(merged.accentForeground)};
      
      /* Popover */
      --popover: ${hsl(merged.cardBackground)};
      --popover-foreground: ${hsl(merged.cardForeground)};
      
      /* Destructive */
      --destructive: ${hsl(merged.destructiveBackground)};
      --destructive-foreground: ${hsl(merged.destructiveForeground)};

      /* Border Radius */
      --radius: ${merged.borderRadius};

      /* ========================================
         EXTENDED THEME VARIABLES (HEX)
         Used by custom utility classes
         ======================================== */
      
      /* Surface levels */
      --surface-0: ${merged.surface0};
      --surface-1: ${merged.surface1};
      --surface-muted: ${merged.surfaceMuted};
      
      /* Semantic Status Colors */
      --success: ${merged.successColor};
      --warning: ${merged.warningColor};
      --danger: ${merged.dangerColor};
      
      /* ========================================
         PILLS - SEMANTIC
         ======================================== */
      --pill-success-bg: ${merged.pillSuccessBg};
      --pill-success-fg: ${merged.pillSuccessFg};
      --pill-warning-bg: ${merged.pillWarningBg};
      --pill-warning-fg: ${merged.pillWarningFg};
      --pill-danger-bg: ${merged.pillDangerBg};
      --pill-danger-fg: ${merged.pillDangerFg};
      --pill-muted-bg: ${merged.pillMutedBg};
      --pill-muted-fg: ${merged.pillMutedFg};
      
      /* ========================================
         PILLS - UTILITY COLORS
         ======================================== */
      --pill-color1-bg: ${merged.pillColor1Bg};
      --pill-color1-fg: ${merged.pillColor1Fg};
      --pill-color2-bg: ${merged.pillColor2Bg};
      --pill-color2-fg: ${merged.pillColor2Fg};
      --pill-color3-bg: ${merged.pillColor3Bg};
      --pill-color3-fg: ${merged.pillColor3Fg};
      
      /* ========================================
         PILLS - TAG/CATEGORY
         ======================================== */
      --pill-tag-bg: ${merged.pillTagBg};
      --pill-tag-fg: ${merged.pillTagFg};
      
      /* ========================================
         PILLS - CUSTOM INDICATOR
         ======================================== */
      --pill-custom-bg: ${merged.pillCustomBg};
      --pill-custom-fg: ${merged.pillCustomFg};
      
      /* ========================================
         PILLS - TYPES
         ======================================== */
      --pill-personal-bg: ${merged.pillPersonalBg};
      --pill-personal-fg: ${merged.pillPersonalFg};
      --pill-organization-bg: ${merged.pillOrganizationBg};
      --pill-organization-fg: ${merged.pillOrganizationFg};
      --pill-platform-bg: ${merged.pillPlatformBg};
      --pill-platform-fg: ${merged.pillPlatformFg};
      
      /* ========================================
         PILLS - PURPOSES (QuickSend)
         ======================================== */
      --pill-purpose-thank-you-bg: ${merged.pillPurposeThankYouBg};
      --pill-purpose-thank-you-fg: ${merged.pillPurposeThankYouFg};
      --pill-purpose-referral-bg: ${merged.pillPurposeReferralBg};
      --pill-purpose-referral-fg: ${merged.pillPurposeReferralFg};
      --pill-purpose-review-bg: ${merged.pillPurposeReviewBg};
      --pill-purpose-review-fg: ${merged.pillPurposeReviewFg};
      --pill-purpose-review-referral-bg: ${merged.pillPurposeReviewReferralBg};
      --pill-purpose-review-referral-fg: ${merged.pillPurposeReviewReferralFg};
      --pill-purpose-birthday-bg: ${merged.pillPurposeBirthdayBg};
      --pill-purpose-birthday-fg: ${merged.pillPurposeBirthdayFg};
      --pill-purpose-anniversary-bg: ${merged.pillPurposeAnniversaryBg};
      --pill-purpose-anniversary-fg: ${merged.pillPurposeAnniversaryFg};
      --pill-purpose-holiday-bg: ${merged.pillPurposeHolidayBg};
      --pill-purpose-holiday-fg: ${merged.pillPurposeHolidayFg};
      --pill-purpose-just-because-bg: ${merged.pillPurposeJustBecauseBg};
      --pill-purpose-just-because-fg: ${merged.pillPurposeJustBecauseFg};
      --pill-purpose-custom-bg: ${merged.pillPurposeCustomBg};
      --pill-purpose-custom-fg: ${merged.pillPurposeCustomFg};
      
      /* ========================================
         SELECTION STATES
         ======================================== */
      --selection-bg: ${merged.selectionBg};
      --selection-border: ${merged.selectionBorder};
      --selection-text: ${merged.selectionText};
      
      /* ========================================
         NAVIGATION / SIDEBAR
         ======================================== */
      --sidebar-background: ${hsl(merged.sidebarBackground)};
      --sidebar-foreground: ${hsl(merged.sidebarForeground)};
      --sidebar-border: ${hsl(merged.sidebarBorder)};
      --sidebar-accent: ${hsl(merged.sidebarAccent)};
      --sidebar-accent-foreground: ${hsl(merged.sidebarAccentForeground)};
      --sidebar-primary: ${hsl(merged.sidebarPrimary || merged.brandAccent)};
      --sidebar-primary-foreground: ${hsl(merged.sidebarPrimaryForeground || "#ffffff")};
      --sidebar-ring: ${hsl(merged.ringColor)};
      
      --nav-bg: ${merged.navBackground};
      --nav-fg: ${merged.navForeground};
      --nav-muted: ${merged.navMuted};
      --nav-border: ${merged.navBorder};
      --nav-item-hover-bg: ${merged.navItemHoverBg};
      --nav-item-active-bg: ${merged.navItemActiveBg};
      --nav-item-active-fg: ${merged.navItemActiveFg};
      --nav-accent: ${merged.navAccent};
      
      /* ========================================
         BRAND / CTA
         ======================================== */
      --brand-accent: ${merged.brandAccent};
      --brand-accent-foreground: ${merged.brandAccentForeground};
      --brand-primary: ${merged.brandAccent || merged.primaryColor};
      --cta-primary: ${merged.ctaPrimary};
      --cta-primary-foreground: ${merged.ctaPrimaryForeground};
      --focus-ring: ${merged.focusRing};
      
      /* ========================================
         TEXT HIERARCHY
         ======================================== */
      --text-0: ${merged.text0};
      --text-1: ${merged.text1};
      --text-2: ${merged.text2};
      --border-subtle: ${merged.borderSubtle};
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
  // BATCH4-B1: user and auth loading state now sourced from AuthContext.
  // whitelabelSettings prop is still received from Layout.jsx and passed down unchanged.
  const { user, isLoadingAuth } = useAuth();

  // ALWAYS generate CSS - use defaults if no settings provided
  const whitelabelStyles = (
    <style>{generateWhitelabelCSS(whitelabelSettings || {})}</style>
  );

  // Guard while AuthContext is still resolving the initial auth check
  if (isLoadingAuth) {
    return (
      <>
        {whitelabelStyles}
        <div className="h-screen w-full flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  const isSuperAdmin = user?.appRole === "super_admin";

  if (isSuperAdmin) {
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
  return (
    <>
      {whitelabelStyles}
      <div className="flex h-screen bg-background">
        <LeftSidebar whitelabelSettings={whitelabelSettings} user={user} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </>
  );
}