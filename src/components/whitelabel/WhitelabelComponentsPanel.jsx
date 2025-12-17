import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Circle, Layers } from "lucide-react";
import { ColorField, ColorSection, PillPreview } from "./WhitelabelHelpers";

export default function WhitelabelComponentsPanel({ settings, updateSettings }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pills & Badges</CardTitle>
        <CardDescription>
          Customize status indicators and category tags
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Semantic Pills */}
        <ColorSection
          title="Semantic Pills"
          icon={Circle}
          defaultOpen={true}
        >
          <div className="col-span-2 mb-2">
            <p className="text-sm text-muted-foreground mb-3">
              Used for status indicators throughout the app
            </p>
            <div className="flex gap-2 flex-wrap">
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
          </div>
          <ColorField
            label="Success Background"
            value={settings.pillSuccessBg}
            onChange={(v) => updateSettings({ pillSuccessBg: v })}
          />
          <ColorField
            label="Success Text"
            value={settings.pillSuccessFg}
            onChange={(v) => updateSettings({ pillSuccessFg: v })}
          />
          <ColorField
            label="Warning Background"
            value={settings.pillWarningBg}
            onChange={(v) => updateSettings({ pillWarningBg: v })}
          />
          <ColorField
            label="Warning Text"
            value={settings.pillWarningFg}
            onChange={(v) => updateSettings({ pillWarningFg: v })}
          />
          <ColorField
            label="Danger Background"
            value={settings.pillDangerBg}
            onChange={(v) => updateSettings({ pillDangerBg: v })}
          />
          <ColorField
            label="Danger Text"
            value={settings.pillDangerFg}
            onChange={(v) => updateSettings({ pillDangerFg: v })}
          />
          <ColorField
            label="Muted Background"
            value={settings.pillMutedBg}
            onChange={(v) => updateSettings({ pillMutedBg: v })}
          />
          <ColorField
            label="Muted Text"
            value={settings.pillMutedFg}
            onChange={(v) => updateSettings({ pillMutedFg: v })}
          />
        </ColorSection>

        {/* Utility Pills */}
        <ColorSection title="Utility Pills" icon={Layers}>
          <div className="col-span-2 mb-2">
            <p className="text-sm text-muted-foreground mb-3">
              Used for categories, tags, and labels
            </p>
            <div className="flex gap-2 flex-wrap">
              <PillPreview
                bg={settings.pillColor1Bg}
                fg={settings.pillColor1Fg}
                label="Category 1"
              />
              <PillPreview
                bg={settings.pillColor2Bg}
                fg={settings.pillColor2Fg}
                label="Category 2"
              />
              <PillPreview
                bg={settings.pillColor3Bg}
                fg={settings.pillColor3Fg}
                label="Category 3"
              />
            </div>
          </div>
          <ColorField
            label="Color 1 Background"
            value={settings.pillColor1Bg}
            onChange={(v) => updateSettings({ pillColor1Bg: v })}
            description="Blue variant"
          />
          <ColorField
            label="Color 1 Text"
            value={settings.pillColor1Fg}
            onChange={(v) => updateSettings({ pillColor1Fg: v })}
          />
          <ColorField
            label="Color 2 Background"
            value={settings.pillColor2Bg}
            onChange={(v) => updateSettings({ pillColor2Bg: v })}
            description="Purple variant"
          />
          <ColorField
            label="Color 2 Text"
            value={settings.pillColor2Fg}
            onChange={(v) => updateSettings({ pillColor2Fg: v })}
          />
          <ColorField
            label="Color 3 Background"
            value={settings.pillColor3Bg}
            onChange={(v) => updateSettings({ pillColor3Bg: v })}
            description="Teal variant"
          />
          <ColorField
            label="Color 3 Text"
            value={settings.pillColor3Fg}
            onChange={(v) => updateSettings({ pillColor3Fg: v })}
          />
        </ColorSection>
      </CardContent>
    </Card>
  );
}