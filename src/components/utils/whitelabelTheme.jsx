// components/utils/whitelabelTheme.js

import { THEME_MAP } from "@/components/utils/whitelabelThemeMap";

/**
 * Whitelabel Theme Application Utility
 * 
 * Converts WhitelabelSettings hex colors to HSL CSS variables
 * and applies them to document.documentElement for global theming.
 */

// =====================
// Helper Functions
// =====================

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

/**
 * Convert hex color string to RGB object
 * @param {string} hex - Hex color (e.g., "#4F46E5" or "4F46E5")
 * @returns {{ r: number, g: number, b: number } | null}
 */
function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") return null;
  const cleaned = hex.replace("#", "").trim();
  if (![3, 6].includes(cleaned.length)) return null;

  const full =
    cleaned.length === 3
      ? cleaned.split("").map((c) => c + c).join("")
      : cleaned;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  if ([r, g, b].some((v) => Number.isNaN(v))) return null;
  return { r, g, b };
}

/**
 * Convert RGB object to HSL object
 * @param {{ r: number, g: number, b: number }} rgb
 * @returns {{ h: number, s: number, l: number }}
 */
function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = ((gn - bn) / delta) % 6;
        break;
      case gn:
        h = (bn - rn) / delta + 2;
        break;
      default:
        h = (rn - gn) / delta + 4;
        break;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return {
    h: clamp(Math.round(h), 0, 360),
    s: clamp(Math.round(s * 100), 0, 100),
    l: clamp(Math.round(l * 100), 0, 100),
  };
}

/**
 * Convert hex color to HSL triple string for CSS variables
 * @param {string} hex - Hex color string
 * @returns {string | null} - HSL triple (e.g., "240 100% 50%")
 */
function hexToHslTriple(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const { h, s, l } = rgbToHsl(rgb);
  return `${h} ${s}% ${l}%`;
}

/**
 * Set a single CSS variable on document root
 * @param {string} name - CSS variable name (e.g., "--primary")
 * @param {string} value - CSS variable value
 */
function setCssVar(name, value) {
  if (!name) return;
  if (value == null || value === "") return;
  document.documentElement.style.setProperty(name, value);
}

/**
 * Set a CSS variable and any aliases to the same value
 * @param {string} primaryVar - Main CSS variable name
 * @param {string} value - CSS variable value
 * @param {string[]} [aliases] - Optional array of alias variable names
 */
function setCssVarWithAliases(primaryVar, value, aliases) {
  setCssVar(primaryVar, value);
  if (Array.isArray(aliases)) {
    for (const alias of aliases) {
      setCssVar(alias, value);
    }
  }
}

// =====================
// Main Export
// =====================

/**
 * Apply whitelabel settings to the app theme via CSS variables
 * 
 * This function reads WhitelabelSettings and sets corresponding CSS variables
 * on document.documentElement. Colors are converted from hex to HSL format
 * for compatibility with Tailwind/shadcn's hsl(var(--x)) pattern.
 * 
 * @param {object} settings - WhitelabelSettings object from the entity
 */
export function applyWhitelabelTheme(settings) {
  if (!settings) return;

  // =====================
  // Font configuration
  // =====================
  if (settings.fontHeadings) {
    setCssVar("--font-headings", `'${settings.fontHeadings}', sans-serif`);
  }
  if (settings.fontBody) {
    setCssVar("--font-body", `'${settings.fontBody}', sans-serif`);
  }

  // =====================
  // Process theme map
  // =====================
  for (const item of THEME_MAP) {
    const raw = settings?.[item.key];
    if (raw == null || raw === "") continue;

    if (item.mode === "raw") {
      // Raw mode: pass value as-is (strings, numbers)
      setCssVarWithAliases(item.var, String(raw), item.aliases);
      continue;
    }

    if (item.mode === "hsl") {
      // HSL mode: convert hex to HSL triple
      const hsl = hexToHslTriple(raw);
      if (hsl) {
        setCssVarWithAliases(item.var, hsl, item.aliases);
      }
    }
  }
}