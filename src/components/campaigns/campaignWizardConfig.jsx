// ─────────────────────────────────────────────────────────────────────────────
// campaignWizardConfig.js
// Shared constants and pure helpers for CampaignSetupWizard and its panels.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Cake, Gift, RefreshCw, Calendar, Home, Shield, Heart, Star,
  Clock, AlertCircle, Settings2, Mail, Users, Sparkles,
  PartyPopper, Award, Bell, Zap, Check, Key, TrendingUp,
  Handshake, HardHat, Building, HelpCircle,
} from 'lucide-react';

// ── Icon map ──────────────────────────────────────────────────────────────────
export const ICON_MAP = {
  Cake, Gift, RefreshCw, Calendar, Home, Shield, Heart, Star,
  Clock, AlertCircle, Settings2, Mail, Users, Sparkles,
  PartyPopper, Award, Bell, Zap, Check, Key, TrendingUp,
  Handshake, HardHat, Building, HelpCircle,
};

export const getIcon = (name) => ICON_MAP[name] || HelpCircle;

// ── Per-slug icon accent colors ───────────────────────────────────────────────
export const TYPE_COLORS = {
  birthday:         { hex: '#db2777', bg: '#fdf2f8' },
  welcome:          { hex: '#2563eb', bg: '#eff6ff' },
  renewal:          { hex: '#16a34a', bg: '#f0fdf4' },
  home_anniversary: { hex: '#16a34a', bg: '#f0fdf4' },
  post_close:       { hex: '#d97706', bg: '#fffbeb' },
  loan_anniversary: { hex: '#0d9488', bg: '#f0fdfa' },
  soi_quarterly:    { hex: '#7c3aed', bg: '#f5f3ff' },
};

export const getTypeColor = (slug) => TYPE_COLORS[slug] || { hex: '#6b7280', bg: '#f9fafb' };

// ── Campaign type → TemplateCategory slug mapping ─────────────────────────────
export const TYPE_TO_CATEGORY_SLUG = {
  birthday:         'birthday',
  welcome:          'new-client-welcome',
  renewal:          'just-because',
  home_anniversary: 're-home-anniversary',
  post_close:       'congratulations',
  loan_anniversary: 'mortgage-anniversary',
  soi_quarterly:    're-soi-touch',
};

// ── Sample client for live preview ────────────────────────────────────────────
export const SAMPLE_CLIENT = {
  firstName: 'Sarah', lastName: 'Johnson', fullName: 'Sarah Johnson',
  company: 'ABC Realty', email: 'sarah@abcrealty.com', phone: '(555) 123-4567',
  street: '123 Oak Street', city: 'Walnut Creek', state: 'CA', zipCode: '94596',
};

// ── Fallback preview settings ─────────────────────────────────────────────────
export const FALLBACK_PREVIEW = {
  fontSize: 22, lineHeight: 1, baseTextWidth: 360, baseMarginLeft: 40,
  shortCardMaxLines: 13, maxPreviewLines: 19, topHalfPaddingTop: 345,
  longCardTopPadding: 110, gapAboveFold: 14, gapBelowFold: 14,
  maxIndent: 16, indentAmplitude: 6, indentNoise: 2, indentFrequency: 0.35,
  frameWidth: 412, frameHeight: 600,
};

// ── Step factory ──────────────────────────────────────────────────────────────
export const makeDefaultStep = (timingDays = -10) => ({
  stepOrder: 1, cardDesignId: null, templateId: null,
  messageText: '', timingDays, timingReference: 'trigger_date', isEnabled: true,
});

// ── Strip characters the robot pen cannot write ───────────────────────────────
export const sanitizeMessage = (text) => {
  if (!text) return '';
  return Array.from(text).filter(char => {
    const cp = char.codePointAt(0);
    if (cp === 0x000A) return true;
    if (cp >= 0x0020 && cp <= 0x007E) return true;
    if (cp >= 0x00A0 && cp <= 0x024F) return true;
    if (cp === 0x2013 || cp === 0x2014) return true;
    if (cp >= 0x2018 && cp <= 0x201D) return true;
    if (cp === 0x2026) return true;
    return false;
  }).join('');
};