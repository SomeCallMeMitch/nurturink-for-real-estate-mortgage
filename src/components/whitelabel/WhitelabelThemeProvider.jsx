import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Default NurturInk colors - used if backend fails
const DEFAULT_COLORS = {
  primaryColor: '#2563eb',
  accentColor: '#f97316',
  backgroundColor: '#ffffff',
  foregroundColor: '#222222',
  cardBackground: '#ffffff',
  cardForeground: '#222222',
  secondaryBackground: '#f1f5f9',
  secondaryForeground: '#0f172a',
  mutedBackground: '#f1f5f9',
  mutedForeground: '#64748b',
  accentBackground: '#f1f5f9',
  accentForeground: '#0f172a',
  destructiveBackground: '#ef4444',
  destructiveForeground: '#ffffff',
  inputBorder: '#e5e7eb',
  ringColor: '#2563eb',
  borderRadius: '0.5rem',
  ctaPrimary: '#f97316',
  ctaPrimaryForeground: '#ffffff',
  navItemActiveBg: '#ffedd5',
  navItemActiveFg: '#f97316',
  successColor: '#10b981',
  brandAccent: '#f97316',
};

// Helper function to convert hex to HSL
const hexToHsl = (hex) => {
  if (!hex || typeof hex !== 'string') return '0 0% 0%';
  
  let r = 0, g = 0, b = 0;
  try {
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
      h = s = 0;
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
  } catch (error) {
    console.error('Error converting hex to HSL:', error);
    return '0 0% 0%';
  }
};

const generateCssVariables = (settings) => {
  const cssVars = {
    '--background': hexToHsl(settings.backgroundColor),
    '--foreground': hexToHsl(settings.foregroundColor),
    '--card': hexToHsl(settings.cardBackground),
    '--card-foreground': hexToHsl(settings.cardForeground),
    '--popover': hexToHsl(settings.cardBackground),
    '--popover-foreground': hexToHsl(settings.cardForeground),
    '--primary': hexToHsl(settings.primaryColor),
    '--primary-foreground': hexToHsl(settings.ctaPrimaryForeground || '#ffffff'),
    '--secondary': hexToHsl(settings.secondaryBackground),
    '--secondary-foreground': hexToHsl(settings.secondaryForeground),
    '--muted': hexToHsl(settings.mutedBackground),
    '--muted-foreground': hexToHsl(settings.mutedForeground),
    '--accent': hexToHsl(settings.accentBackground),
    '--accent-foreground': hexToHsl(settings.accentForeground),
    '--destructive': hexToHsl(settings.destructiveBackground),
    '--destructive-foreground': hexToHsl(settings.destructiveForeground),
    '--border': hexToHsl(settings.inputBorder),
    '--input': hexToHsl(settings.inputBorder),
    '--ring': hexToHsl(settings.ringColor),
    '--radius': settings.borderRadius || '0.5rem',

    // Direct color values for arbitrary Tailwind classes
    '--primaryColor': settings.primaryColor,
    '--accentColor': settings.accentColor,
    '--ctaPrimary': settings.ctaPrimary,
    '--ctaPrimaryForeground': settings.ctaPrimaryForeground,
    '--navItemActiveBg': settings.navItemActiveBg,
    '--navItemActiveFg': settings.navItemActiveFg,
    '--successColor': settings.successColor,
    '--brand-accent': settings.brandAccent || settings.accentColor,
  };

  return `:root {\n${Object.entries(cssVars).map(([key, value]) => `  ${key}: ${value};`).join('\n')}\n}`;
};

export default function WhitelabelThemeProvider({ children }) {
  const [css, setCss] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Check if the function exists before calling it
        const response = await base44.functions.invoke('getWhitelabelSettings');
        
        // Safely extract settings with fallback
        const loadedSettings = response?.data?.settings || {};
        const mergedSettings = { ...DEFAULT_COLORS, ...loadedSettings };
        
        setCss(generateCssVariables(mergedSettings));
        setIsLoading(false);
      } catch (error) {
        console.warn('White label settings not available, using defaults:', error.message);
        // Use defaults if backend fails
        setCss(generateCssVariables(DEFAULT_COLORS));
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Don't block rendering while loading
  return (
    <>
      {css && <style>{css}</style>}
      {children}
    </>
  );
}
