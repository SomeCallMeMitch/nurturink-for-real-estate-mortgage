import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Layers, Tag, Zap, Type } from "lucide-react";
import { ColorField, ColorSection, PillPreview } from "./WhitelabelHelpers";

export default function WhitelabelComponentsPanel({
  settings,
  updateSettings,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Component Colors</CardTitle>
        <CardDescription>
          Customize pills, badges, and UI components
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Semantic Pills */}
        <ColorSection
          title="Semantic Pills"
          icon={Tag}
          defaultOpen={true}
        >
          <ColorField
            label="Success Background"
            value={settings.pillSuccessBg}
            onChange={(v) => updateSettings({ pillSuccessBg: v })}
          />
          <ColorField
            label="Success Foreground"
            value={settings.pillSuccessFg}
            onChange={(v) => updateSettings({ pillSuccessFg: v })}
          />
          <ColorField
            label="Warning Background"
            value={settings.pillWarningBg}
            onChange={(v) => updateSettings({ pillWarningBg: v })}
          />
          <ColorField
            label="Warning Foreground"
            value={settings.pillWarningFg}
            onChange={(v) => updateSettings({ pillWarningFg: v })}
          />
          <ColorField
            label="Danger Background"
            value={settings.pillDangerBg}
            onChange={(v) => updateSettings({ pillDangerBg: v })}
          />
          <ColorField
            label="Danger Foreground"
            value={settings.pillDangerFg}
            onChange={(v) => updateSettings({ pillDangerFg: v })}
          />
          <ColorField
            label="Muted Background"
            value={settings.pillMutedBg}
            onChange={(v) => updateSettings({ pillMutedBg: v })}
          />
          <ColorField
            label="Muted Foreground"
            value={settings.pillMutedFg}
            onChange={(v) => updateSettings({ pillMutedFg: v })}
          />
          {/* Preview */}
          <div className="col-span-2 flex gap-2 mt-2 pt-2 border-t">
            <PillPreview
              bg={settings.pillSuccessBg}
              fg={settings.pillSuccessFg}
              label="Success"
            />
            <PillPreview
              bg={settings.pillWarningBg}
              fg={settings.pillWarningFg}
              label="Warning"
            />
            <PillPreview
              bg={settings.pillDangerBg}
              fg={settings.pillDangerFg}
              label="Danger"
            />
            <PillPreview
              bg={settings.pillMutedBg}
              fg={settings.pillMutedFg}
              label="Muted"
            />
          </div>
        </ColorSection>

        {/* Utility Pills */}
        <ColorSection title="Utility Pills" icon={Layers}>
          <ColorField
            label="Color 1 Background"
            value={settings.pillColor1Bg}
            onChange={(v) => updateSettings({ pillColor1Bg: v })}
          />
          <ColorField
            label="Color 1 Foreground"
            value={settings.pillColor1Fg}
            onChange={(v) => updateSettings({ pillColor1Fg: v })}
          />
          <ColorField
            label="Color 2 Background"
            value={settings.pillColor2Bg}
            onChange={(v) => updateSettings({ pillColor2Bg: v })}
          />
          <ColorField
            label="Color 2 Foreground"
            value={settings.pillColor2Fg}
            onChange={(v) => updateSettings({ pillColor2Fg: v })}
          />
          <ColorField
            label="Color 3 Background"
            value={settings.pillColor3Bg}
            onChange={(v) => updateSettings({ pillColor3Bg: v })}
          />
          <ColorField
            label="Color 3 Foreground"
            value={settings.pillColor3Fg}
            onChange={(v) => updateSettings({ pillColor3Fg: v })}
          />
          {/* Preview */}
          <div className="col-span-2 flex gap-2 mt-2 pt-2 border-t">
            <PillPreview
              bg={settings.pillColor1Bg}
              fg={settings.pillColor1Fg}
              label="Color 1"
            />
            <PillPreview
              bg={settings.pillColor2Bg}
              fg={settings.pillColor2Fg}
              label="Color 2"
            />
            <PillPreview
              bg={settings.pillColor3Bg}
              fg={settings.pillColor3Fg}
              label="Color 3"
            />
          </div>
        </ColorSection>

        {/* Brand & CTA */}
        <ColorSection title="Brand & CTA" icon={Zap}>
          <ColorField
            label="Brand Accent"
            value={settings.brandAccent}
            onChange={(v) => updateSettings({ brandAccent: v })}
          />
          <ColorField
            label="Brand Accent Foreground"
            value={settings.brandAccentForeground}
            onChange={(v) => updateSettings({ brandAccentForeground: v })}
          />
          <ColorField
            label="CTA Primary"
            value={settings.ctaPrimary}
            onChange={(v) => updateSettings({ ctaPrimary: v })}
          />
          <ColorField
            label="CTA Primary Foreground"
            value={settings.ctaPrimaryForeground}
            onChange={(v) => updateSettings({ ctaPrimaryForeground: v })}
          />
          <ColorField
            label="Focus Ring"
            value={settings.focusRing}
            onChange={(v) => updateSettings({ focusRing: v })}
          />
        </ColorSection>

        {/* Text Hierarchy */}
        <ColorSection title="Text Hierarchy" icon={Type}>
          <ColorField
            label="Text Level 0 (Headings)"
            value={settings.text0}
            onChange={(v) => updateSettings({ text0: v })}
          />
          <ColorField
            label="Text Level 1 (Body)"
            value={settings.text1}
            onChange={(v) => updateSettings({ text1: v })}
          />
          <ColorField
            label="Text Level 2 (Captions)"
            value={settings.text2}
            onChange={(v) => updateSettings({ text2: v })}
          />
        </ColorSection>
      </CardContent>
    </Card>
  );
}