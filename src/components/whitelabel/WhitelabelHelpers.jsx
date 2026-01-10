import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Color picker field with hex input
 */
export function ColorField({ label, value, onChange, description }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-9 p-1 cursor-pointer"
        />
        <Input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono text-sm flex-1"
        />
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

/**
 * Collapsible section for organizing color groups
 */
export function ColorSection({ title, icon: Icon, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
          <span className="font-medium">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 px-1">
        <div className="grid grid-cols-2 gap-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * Pill preview component for showing color combinations
 */
export function PillPreview({ bg, fg, label }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md"
      style={{ backgroundColor: bg, color: fg }}
    >
      {label}
    </span>
  );
}

/**
 * Default whitelabel settings - used for reset functionality
 */
export const DEFAULT_WHITELABEL_SETTINGS = {
  // Branding
  brandName: "NurturInk",
  logoUrl: null,
  faviconUrl: null,

  // Core Colors
  primaryColor: "#2563eb", // Blue-600
  accentColor: "#f97316", // Orange-500
  backgroundColor: "#ffffff",
  foregroundColor: "#222222",

  // Card & Surface
  cardBackground: "#ffffff",
  cardForeground: "#222222",
  surface0: "#ffffff",
  surface1: "#f9fafb",
  surfaceMuted: "#f3f4f6",

  // Input & Form
  inputBackground: "#e3e3e3",
  inputBorder: "#e3e3e3",
  ringColor: "#2563eb",

  // Muted
  mutedBackground: "#eeeeee",
  mutedForeground: "#787878",

  // Secondary
  secondaryBackground: "#edf6fc",
  secondaryForeground: "#575757",

  // Accent
  accentBackground: "#e3e3e3",
  accentForeground: "#035392",

  // Destructive
  destructiveBackground: "#d9363d",
  destructiveForeground: "#ffffff",

  // Semantic Status
  successColor: "#10b981",
  warningColor: "#f59e0b",
  dangerColor: "#ef4444",

  // Pills - Semantic
  pillSuccessBg: "#DCFCE7",
  pillSuccessFg: "#166534",
  pillWarningBg: "#FEF3C7",
  pillWarningFg: "#92400E",
  pillDangerBg: "#FEE2E2",
  pillDangerFg: "#991B1B",
  pillMutedBg: "#E5E7EB",
  pillMutedFg: "#374151",

  // Pills - Utility
  pillColor1Bg: "#DBEAFE",
  pillColor1Fg: "#1D4ED8",
  pillColor2Bg: "#EDE9FE",
  pillColor2Fg: "#6D28D9",
  pillColor3Bg: "#CCFBF1",
  pillColor3Fg: "#0F766E",

  // Navigation/Sidebar
  sidebarBackground: "#ffffff",
  sidebarForeground: "#374151",
  sidebarBorder: "#e5e7eb",
  sidebarAccent: "#f3f4f6",
  sidebarAccentForeground: "#111827",
  navBackground: "#ffffff",
  navForeground: "#374151",
  navMuted: "#9ca3af",
  navBorder: "#e5e7eb",
  navItemHoverBg: "#fef3e2",
  navItemActiveBg: "#ffedd5", // Orange-100
  navItemActiveFg: "#f97316", // Orange-500
  navAccent: "#f97316",

  // Brand/CTA
  brandAccent: "#f97316",
  brandAccentForeground: "#ffffff",
  ctaPrimary: "#f97316",
  ctaPrimaryForeground: "#ffffff",
  focusRing: "#3b82f6",

  // Text Hierarchy
  text0: "#111827",
  text1: "#4b5563",
  text2: "#9ca3af",
  borderSubtle: "#e5e7eb",

  // Selection/Active States
  selectionBg: "#EFF6FF",
  selectionBorder: "#2563eb",
  selectionText: "#222222",

  // Typography
  fontHeadings: "Inter",
  fontBody: "Inter",

  // Border Radius
  borderRadius: "0.5rem",

  // Toast
  toastDuration: 3000,
  toastPlacement: "top-right",
  toastSuccessBg: "#F0FDF4",
  toastSuccessText: "#166534",
  toastSuccessBorder: "#86EFAC",
  toastErrorBg: "#FEF2F2",
  toastErrorText: "#991B1B",
  toastErrorBorder: "#FCA5A5",
  toastWarningBg: "#FFFBEB",
  toastWarningText: "#92400E",
  toastWarningBorder: "#FDE68A",
  toastInfoBg: "#EFF6FF",
  toastInfoText: "#1E40AF",
  toastInfoBorder: "#93C5FD",
};

/**
 * Font options available for selection
 */
export const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Nunito",
  "Ubuntu",
  "Playfair Display",
  "Merriweather",
  "Helvetica Neue",
];