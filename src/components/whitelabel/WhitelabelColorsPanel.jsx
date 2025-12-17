import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Palette,
  Square,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { ColorField, ColorSection } from "./WhitelabelHelpers";

export default function WhitelabelColorsPanel({ settings, updateSettings }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Core Colors</CardTitle>
        <CardDescription>
          Customize the fundamental color palette of your application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Colors */}
        <ColorSection title="Primary Colors" icon={Palette} defaultOpen={true}>
          <ColorField
            label="Primary Color"
            value={settings.primaryColor}
            onChange={(v) => updateSettings({ primaryColor: v })}
            description="Main brand color"
          />
          <ColorField
            label="Accent Color"
            value={settings.accentColor}
            onChange={(v) => updateSettings({ accentColor: v })}
            description="Secondary accent"
          />
          <ColorField
            label="Background"
            value={settings.backgroundColor}
            onChange={(v) => updateSettings({ backgroundColor: v })}
            description="Page background"
          />
          <ColorField
            label="Foreground"
            value={settings.foregroundColor}
            onChange={(v) => updateSettings({ foregroundColor: v })}
            description="Primary text color"
          />
        </ColorSection>

        {/* Card & Surface */}
        <ColorSection title="Card & Surface" icon={Square}>
          <ColorField
            label="Card Background"
            value={settings.cardBackground}
            onChange={(v) => updateSettings({ cardBackground: v })}
          />
          <ColorField
            label="Card Foreground"
            value={settings.cardForeground}
            onChange={(v) => updateSettings({ cardForeground: v })}
          />
          <ColorField
            label="Surface Level 0"
            value={settings.surface0}
            onChange={(v) => updateSettings({ surface0: v })}
          />
          <ColorField
            label="Surface Level 1"
            value={settings.surface1}
            onChange={(v) => updateSettings({ surface1: v })}
          />
          <ColorField
            label="Surface Muted"
            value={settings.surfaceMuted}
            onChange={(v) => updateSettings({ surfaceMuted: v })}
          />
        </ColorSection>

        {/* Input & Form */}
        <ColorSection title="Input & Form" icon={FileText}>
          <ColorField
            label="Input Background"
            value={settings.inputBackground}
            onChange={(v) => updateSettings({ inputBackground: v })}
          />
          <ColorField
            label="Input Border"
            value={settings.inputBorder}
            onChange={(v) => updateSettings({ inputBorder: v })}
          />
          <ColorField
            label="Ring/Focus Color"
            value={settings.ringColor}
            onChange={(v) => updateSettings({ ringColor: v })}
          />
          <ColorField
            label="Border Subtle"
            value={settings.borderSubtle}
            onChange={(v) => updateSettings({ borderSubtle: v })}
          />
        </ColorSection>

        {/* Muted Colors */}
        <ColorSection title="Muted Colors">
          <ColorField
            label="Muted Background"
            value={settings.mutedBackground}
            onChange={(v) => updateSettings({ mutedBackground: v })}
          />
          <ColorField
            label="Muted Foreground"
            value={settings.mutedForeground}
            onChange={(v) => updateSettings({ mutedForeground: v })}
          />
        </ColorSection>

        {/* Secondary Colors */}
        <ColorSection title="Secondary Colors">
          <ColorField
            label="Secondary Background"
            value={settings.secondaryBackground}
            onChange={(v) => updateSettings({ secondaryBackground: v })}
          />
          <ColorField
            label="Secondary Foreground"
            value={settings.secondaryForeground}
            onChange={(v) => updateSettings({ secondaryForeground: v })}
          />
        </ColorSection>

        {/* Accent Colors */}
        <ColorSection title="Accent Colors">
          <ColorField
            label="Accent Background"
            value={settings.accentBackground}
            onChange={(v) => updateSettings({ accentBackground: v })}
          />
          <ColorField
            label="Accent Foreground"
            value={settings.accentForeground}
            onChange={(v) => updateSettings({ accentForeground: v })}
          />
        </ColorSection>

        {/* Destructive Colors */}
        <ColorSection title="Destructive Colors" icon={AlertCircle}>
          <ColorField
            label="Destructive Background"
            value={settings.destructiveBackground}
            onChange={(v) => updateSettings({ destructiveBackground: v })}
          />
          <ColorField
            label="Destructive Foreground"
            value={settings.destructiveForeground}
            onChange={(v) => updateSettings({ destructiveForeground: v })}
          />
        </ColorSection>

        {/* Semantic Status */}
        <ColorSection title="Semantic Status" icon={CheckCircle}>
          <ColorField
            label="Success Color"
            value={settings.successColor}
            onChange={(v) => updateSettings({ successColor: v })}
          />
          <ColorField
            label="Warning Color"
            value={settings.warningColor}
            onChange={(v) => updateSettings({ warningColor: v })}
          />
          <ColorField
            label="Danger Color"
            value={settings.dangerColor}
            onChange={(v) => updateSettings({ dangerColor: v })}
          />
        </ColorSection>
      </CardContent>
    </Card>
  );
}