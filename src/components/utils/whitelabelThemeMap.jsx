// components/utils/whitelabelThemeMap.js

/**
 * Whitelabel Theme Mapping Configuration
 * 
 * Maps WhitelabelSettings entity fields to CSS variables.
 * 
 * mode:
 * - "hsl": hex input -> "H S% L%" (for hsl(var(--x)) usage in Tailwind/shadcn)
 * - "raw": string/number as-is (radius, shadows, toastPlacement, etc.)
 *
 * aliases:
 * - optional list of additional CSS vars to set to the same computed value
 *   (enables gradual migration without breaking existing styles)
 */
export const THEME_MAP = [
  // =====================
  // Core shadcn tokens
  // =====================
  { key: "primaryColor", var: "--primary", mode: "hsl" },
  { key: "accentColor", var: "--accent", mode: "hsl" },
  { key: "backgroundColor", var: "--background", mode: "hsl" },
  { key: "foregroundColor", var: "--foreground", mode: "hsl" },

  { key: "cardBackground", var: "--card", mode: "hsl" },
  { key: "cardForeground", var: "--card-foreground", mode: "hsl" },

  { key: "popoverBackground", var: "--popover", mode: "hsl" },
  { key: "popoverForeground", var: "--popover-foreground", mode: "hsl" },

  { key: "mutedBackground", var: "--muted", mode: "hsl" },
  { key: "mutedForeground", var: "--muted-foreground", mode: "hsl" },

  { key: "inputBackground", var: "--input", mode: "hsl" },
  { key: "inputBorder", var: "--input-border", mode: "hsl" },
  { key: "ringColor", var: "--ring", mode: "hsl" },

  { key: "accentBackground", var: "--accent-background", mode: "hsl" },
  { key: "accentForeground", var: "--accent-foreground", mode: "hsl" },

  { key: "secondaryBackground", var: "--secondary", mode: "hsl" },
  { key: "secondaryForeground", var: "--secondary-foreground", mode: "hsl" },

  { key: "destructiveBackground", var: "--destructive", mode: "hsl" },
  { key: "destructiveForeground", var: "--destructive-foreground", mode: "hsl" },

  // =====================
  // Semantic colors
  // =====================
  { key: "successColor", var: "--success", mode: "hsl" },
  { key: "warningColor", var: "--warning", mode: "hsl" },
  { key: "dangerColor", var: "--danger", mode: "hsl" },

  // Background semantic colors (standardized)
  { key: "successBgColor", var: "--success-bg", mode: "hsl" },
  { key: "warningBgColor", var: "--warning-bg", mode: "hsl" },
  { key: "dangerBgColor", var: "--danger-bg", mode: "hsl" },

  // =====================
  // Pills/tags (standardized names)
  // =====================
  { key: "pillSuccessBg", var: "--pill-success-bg", mode: "hsl" },
  { key: "pillSuccessFg", var: "--pill-success-fg", mode: "hsl" },
  { key: "pillWarningBg", var: "--pill-warning-bg", mode: "hsl" },
  { key: "pillWarningFg", var: "--pill-warning-fg", mode: "hsl" },
  { key: "pillDangerBg", var: "--pill-danger-bg", mode: "hsl" },
  { key: "pillDangerFg", var: "--pill-danger-fg", mode: "hsl" },
  { key: "pillMutedBg", var: "--pill-muted-bg", mode: "hsl" },
  { key: "pillMutedFg", var: "--pill-muted-fg", mode: "hsl" },

  // Color pills: standardized + legacy-friendly aliases
  { key: "pillColor1Bg", var: "--pill-1-bg", mode: "hsl", aliases: ["--pill-color1-bg"] },
  { key: "pillColor1Fg", var: "--pill-1-fg", mode: "hsl", aliases: ["--pill-color1-fg"] },
  { key: "pillColor2Bg", var: "--pill-2-bg", mode: "hsl", aliases: ["--pill-color2-bg"] },
  { key: "pillColor2Fg", var: "--pill-2-fg", mode: "hsl", aliases: ["--pill-color2-fg"] },
  { key: "pillColor3Bg", var: "--pill-3-bg", mode: "hsl", aliases: ["--pill-color3-bg"] },
  { key: "pillColor3Fg", var: "--pill-3-fg", mode: "hsl", aliases: ["--pill-color3-fg"] },

  // =====================
  // Selection tokens
  // =====================
  { key: "selectionBg", var: "--selection-bg", mode: "hsl" },
  { key: "selectionBorder", var: "--selection-border", mode: "hsl" },
  { key: "selectionText", var: "--selection-text", mode: "hsl" },

  // =====================
  // Sidebar tokens
  // =====================
  { key: "sidebarBackground", var: "--sidebar-bg", mode: "hsl", aliases: ["--sidebar-background"] },
  { key: "sidebarForeground", var: "--sidebar-fg", mode: "hsl", aliases: ["--sidebar-foreground"] },
  { key: "sidebarBorder", var: "--sidebar-border", mode: "hsl" },
  { key: "sidebarAccent", var: "--sidebar-accent", mode: "hsl" },
  { key: "sidebarAccentForeground", var: "--sidebar-accent-fg", mode: "hsl", aliases: ["--sidebar-accent-foreground"] },
  { key: "sidebarPrimary", var: "--sidebar-primary", mode: "hsl" },
  { key: "sidebarPrimaryForeground", var: "--sidebar-primary-fg", mode: "hsl", aliases: ["--sidebar-primary-foreground"] },

  // =====================
  // Nav tokens
  // =====================
  { key: "navBackground", var: "--nav-bg", mode: "hsl" },
  { key: "navForeground", var: "--nav-fg", mode: "hsl" },
  { key: "navMuted", var: "--nav-muted", mode: "hsl" },
  { key: "navBorder", var: "--nav-border", mode: "hsl" },
  { key: "navItemHoverBg", var: "--nav-item-hover-bg", mode: "hsl" },
  { key: "navItemActiveBg", var: "--nav-item-active-bg", mode: "hsl" },
  { key: "navItemActiveFg", var: "--nav-item-active-fg", mode: "hsl" },
  { key: "navAccent", var: "--nav-accent", mode: "hsl" },

  // =====================
  // Brand + CTA
  // =====================
  { key: "brandAccent", var: "--brand-accent", mode: "hsl" },
  { key: "brandAccentForeground", var: "--brand-accent-fg", mode: "hsl", aliases: ["--brand-accent-foreground"] },
  { key: "ctaPrimary", var: "--cta-primary", mode: "hsl" },
  { key: "ctaPrimaryForeground", var: "--cta-primary-fg", mode: "hsl", aliases: ["--cta-primary-foreground"] },

  // =====================
  // Focus / surfaces / borders / text
  // =====================
  { key: "focusRing", var: "--focus-ring", mode: "hsl" },
  { key: "surface0", var: "--surface-0", mode: "hsl" },
  { key: "surface1", var: "--surface-1", mode: "hsl" },
  { key: "surfaceMuted", var: "--surface-muted", mode: "hsl" },
  { key: "borderSubtle", var: "--border-subtle", mode: "hsl" },
  { key: "text0", var: "--text-0", mode: "hsl" },
  { key: "text1", var: "--text-1", mode: "hsl" },
  { key: "text2", var: "--text-2", mode: "hsl" },

  // =====================
  // Radius + shadows (raw strings)
  // =====================
  { key: "borderRadius", var: "--radius", mode: "raw" },
  { key: "shadowSm", var: "--shadow-sm", mode: "raw" },
  { key: "shadowMd", var: "--shadow-md", mode: "raw" },
  { key: "shadowLg", var: "--shadow-lg", mode: "raw" },

  // =====================
  // Toast config (raw values)
  // =====================
  { key: "toastDuration", var: "--toast-duration", mode: "raw" },
  { key: "toastPlacement", var: "--toast-placement", mode: "raw" },

  // =====================
  // Toast theming (HSL colors)
  // =====================
  { key: "toastSuccessBg", var: "--toast-success-bg", mode: "hsl" },
  { key: "toastSuccessText", var: "--toast-success-text", mode: "hsl" },
  { key: "toastSuccessBorder", var: "--toast-success-border", mode: "hsl" },

  { key: "toastErrorBg", var: "--toast-error-bg", mode: "hsl" },
  { key: "toastErrorText", var: "--toast-error-text", mode: "hsl" },
  { key: "toastErrorBorder", var: "--toast-error-border", mode: "hsl" },

  { key: "toastWarningBg", var: "--toast-warning-bg", mode: "hsl" },
  { key: "toastWarningText", var: "--toast-warning-text", mode: "hsl" },
  { key: "toastWarningBorder", var: "--toast-warning-border", mode: "hsl" },

  { key: "toastInfoBg", var: "--toast-info-bg", mode: "hsl" },
  { key: "toastInfoText", var: "--toast-info-text", mode: "hsl" },
  { key: "toastInfoBorder", var: "--toast-info-border", mode: "hsl" },
];