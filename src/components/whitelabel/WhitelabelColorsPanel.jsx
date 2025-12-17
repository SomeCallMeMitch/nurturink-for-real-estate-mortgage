import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Paintbrush,
  Layers,
  Type,
  Square,
  Circle,
  Palette,
} from "lucide-react";
import { ColorField, ColorSection } from "./WhitelabelHelpers";

export default function WhitelabelColorsPanel({ settings, updateSettings }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Color System</CardTitle>
        <CardDescription>
          Define your brand colors and theme palette
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Brand Colors */}
        <ColorSection
          title="Primary Brand Colors"
          icon={Paintbrush}
          defaultOpen={true}
        >
          <ColorField
            label="Primary Color"
            value={settings.primaryColor}
            onChange={(v) => updateSettings({ primaryColor: v })}
            description="Main brand color for buttons, links"
          />
          <ColorField
            label="Accent Color"
            value={settings.accentColor}
            onChange={(v) => updateSettings({ accentColor: v })}
            description="Secondary highlight color"
          />
          <ColorField
            label="Brand Accent"
            value={settings.brandAccent}
            onChange={(v) => updateSettings({ brandAccent: v })}
            description="CTA buttons, active states"
          />
          <ColorField
            label="Brand Accent Text"
            value={settings.brandAccentForeground}
            onChange={(v) => updateSettings({ brandAccentForeground: v })}
            description="Text on brand accent"
          />
        </ColorSection>

        {/* Background & Surface */}
        <ColorSection title="Backgrounds & Surfaces" icon={Layers}>
          <ColorField
            label="Page Background"
            value={settings.backgroundColor}
            onChange={(v) => updateSettings({ backgroundColor: v })}
            description="Main page background"
          />
          <ColorField
            label="Card Background"
            value={settings.cardBackground}
            onChange={(v) => updateSettings({ cardBackground: v })}
            description="Cards, panels, modals"
          />
          <ColorField
            label="Surface (Level 0)"
            value={settings.surface0}
            onChange={(v) => updateSettings({ surface0: v })}
            description="Primary surface"
          />
          <ColorField
            label="Surface (Level 1)"
            value={settings.surface1}
            onChange={(v) => updateSettings({ surface1: v })}
            description="Secondary surface"
          />
          <ColorField
            label="Muted Background"
            value={settings.mutedBackground}
            onChange={(v) => updateSettings({ mutedBackground: v })}
            description="Disabled, inactive areas"
          />
          <ColorField
            label="Surface Muted"
            value={settings.surfaceMuted}
            onChange={(v) => updateSettings({ surfaceMuted: v })}
            description="Subtle background areas"
          />
        </ColorSection>

        {/* Text Colors */}
        <ColorSection title="Text Colors" icon={Type}>
          <ColorField
            label="Primary Text"
            value={settings.foregroundColor}
            onChange={(v) => updateSettings({ foregroundColor: v })}
            description="Main body text"
          />
          <ColorField
            label="Card Text"
            value={settings.cardForeground}
            onChange={(v) => updateSettings({ cardForeground: v })}
            description="Text on cards"
          />
          <ColorField
            label="Muted Text"
            value={settings.mutedForeground}
            onChange={(v) => updateSettings({ mutedForeground: v })}
            description="Secondary, helper text"
          />
          <ColorField
            label="Text Level 0"
            value={settings.text0}
            onChange={(v) => updateSettings({ text0: v })}
            description="Headings"
          />
          <ColorField
            label="Text Level 1"
            value={settings.text1}
            onChange={(v) => updateSettings({ text1: v })}
            description="Body text"
          />
          <ColorField
            label="Text Level 2"
            value={settings.text2}
            onChange={(v) => updateSettings({ text2: v })}
            description="Captions, labels"
          />
        </ColorSection>

        {/* Borders & Inputs */}
        <ColorSection title="Borders & Inputs" icon={Square}>
          <ColorField
            label="Border Color"
            value={settings.inputBorder}
            onChange={(v) => updateSettings({ inputBorder: v })}
            description="Default border color"
          />
          <ColorField
            label="Border Subtle"
            value={settings.borderSubtle}
            onChange={(v) => updateSettings({ borderSubtle: v })}
            description="Subtle dividers"
          />
          <ColorField
            label="Input Background"
            value={settings.inputBackground}
            onChange={(v) => updateSettings({ inputBackground: v })}
            description="Form field background"
          />
          <ColorField
            label="Focus Ring"
            value={settings.focusRing}
            onChange={(v) => updateSettings({ focusRing: v })}
            description="Focus indicator color"
          />
          <ColorField
            label="Ring Color"
            value={settings.ringColor}
            onChange={(v) => updateSettings({ ringColor: v })}
            description="General ring/outline"
          />
        </ColorSection>

        {/* Semantic Status Colors */}
        <ColorSection title="Status Colors" icon={Circle}>
          <ColorField
            label="Success Color"
            value={settings.successColor}
            onChange={(v) => updateSettings({ successColor: v })}
            description="Success indicators"
          />
          <ColorField
            label="Warning Color"
            value={settings.warningColor}
            onChange={(v) => updateSettings({ warningColor: v })}
            description="Warning indicators"
          />
          <ColorField
            label="Danger Color"
            value={settings.dangerColor}
            onChange={(v) => updateSettings({ dangerColor: v })}
            description="Error, destructive"
          />
          <ColorField
            label="Destructive Background"
            value={settings.destructiveBackground}
            onChange={(v) => updateSettings({ destructiveBackground: v })}
            description="Delete buttons"
          />
          <ColorField
            label="Destructive Text"
            value={settings.destructiveForeground}
            onChange={(v) => updateSettings({ destructiveForeground: v })}
            description="Text on destructive"
          />
        </ColorSection>

        {/* Secondary & Accent */}
        <ColorSection title="Secondary & Accent" icon={Palette}>
          <ColorField
            label="Secondary Background"
            value={settings.secondaryBackground}
            onChange={(v) => updateSettings({ secondaryBackground: v })}
            description="Secondary buttons"
          />
          <ColorField
            label="Secondary Text"
            value={settings.secondaryForeground}
            onChange={(v) => updateSettings({ secondaryForeground: v })}
            description="Text on secondary"
          />
          <ColorField
            label="Accent Background"
            value={settings.accentBackground}
            onChange={(v) => updateSettings({ accentBackground: v })}
            description="Hover states"
          />
          <ColorField
            label="Accent Text"
            value={settings.accentForeground}
            onChange={(v) => updateSettings({ accentForeground: v })}
            description="Text on accent"
          />
          <ColorField
            label="CTA Primary"
            value={settings.ctaPrimary}
            onChange={(v) => updateSettings({ ctaPrimary: v })}
            description="Main CTA buttons"
          />
          <ColorField
            label="CTA Primary Text"
            value={settings.ctaPrimaryForeground}
            onChange={(v) => updateSettings({ ctaPrimaryForeground: v })}
            description="Text on CTA"
          />
        </ColorSection>
      </CardContent>
    </Card>
  );
}