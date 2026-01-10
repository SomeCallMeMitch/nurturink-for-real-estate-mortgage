import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { DEFAULT_WHITELABEL_SETTINGS } from './WhitelabelHelpers';

// Helper function to convert hex to HSL, needed for some shadcn/ui components
const hexToHsl = (hex) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const generateCssVariables = (settings) => {
  const cssVars = {
    '--background': hexToHsl(settings.backgroundColor || '#ffffff'),
    '--foreground': hexToHsl(settings.foregroundColor || '#222222'),
    '--card': hexToHsl(settings.cardBackground || '#ffffff'),
    '--card-foreground': hexToHsl(settings.cardForeground || '#222222'),
    '--popover': hexToHsl(settings.cardBackground || '#ffffff'),
    '--popover-foreground': hexToHsl(settings.cardForeground || '#222222'),
    '--primary': hexToHsl(settings.primaryColor || '#2563eb'),
    '--primary-foreground': hexToHsl(settings.brandAccentForeground || '#ffffff'),
    '--secondary': hexToHsl(settings.secondaryBackground || '#f1f5f9'),
    '--secondary-foreground': hexToHsl(settings.secondaryForeground || '#0f172a'),
    '--muted': hexToHsl(settings.mutedBackground || '#f1f5f9'),
    '--muted-foreground': hexToHsl(settings.mutedForeground || '#64748b'),
    '--accent': hexToHsl(settings.accentBackground || '#f1f5f9'),
    '--accent-foreground': hexToHsl(settings.accentForeground || '#0f172a'),
    '--destructive': hexToHsl(settings.destructiveBackground || '#ef4444'),
    '--destructive-foreground': hexToHsl(settings.destructiveForeground || '#ffffff'),
    '--border': hexToHsl(settings.inputBorder || '#e5e7eb'),
    '--input': hexToHsl(settings.inputBorder || '#e5e7eb'),
    '--ring': hexToHsl(settings.ringColor || '#2563eb'),
    '--radius': settings.borderRadius || '0.5rem',

    // Direct color values for arbitrary Tailwind classes
    '--primaryColor': settings.primaryColor || '#2563eb',
    '--accentColor': settings.accentColor || '#f97316',
    '--successColor': settings.successColor || '#10b981',
    '--ctaPrimary': settings.ctaPrimary || '#f97316',
    '--ctaPrimaryForeground': settings.ctaPrimaryForeground || '#ffffff',
    '--navItemActiveBg': settings.navItemActiveBg || '#ffedd5',
    '--navItemActiveFg': settings.navItemActiveFg || '#f97316',
    '--brand-accent': settings.brandAccent || settings.accentColor || '#f97316',
  };

  return `:root {\n${Object.entries(cssVars).map(([key, value]) => `  ${key}: ${value};`).join('\n')}\n}`;
};

export default function WhitelabelThemeProvider({ children }) {
  const [css, setCss] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await base44.functions.invoke('getWhitelabelSettings');
        const loadedSettings = response?.data?.settings;
        const mergedSettings = { ...DEFAULT_WHITELABEL_SETTINGS, ...loadedSettings };
        setCss(generateCssVariables(mergedSettings));
      } catch (error) {
        console.error('Failed to load whitelabel settings, using defaults.', error);
        setCss(generateCssVariables(DEFAULT_WHITELABEL_SETTINGS));
      }
    };

    fetchSettings();
  }, []);

  return (
    <>
      {css && <style>{css}</style>}
      {children}
    </>
  );
}