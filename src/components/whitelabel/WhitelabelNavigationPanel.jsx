import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Navigation, Menu } from "lucide-react";
import { ColorField, ColorSection } from "./WhitelabelHelpers";

export default function WhitelabelNavigationPanel({
  settings,
  updateSettings,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Navigation & Sidebar</CardTitle>
        <CardDescription>
          Customize sidebar and navigation appearance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sidebar Colors */}
        <ColorSection
          title="Sidebar Colors"
          icon={Navigation}
          defaultOpen={true}
        >
          <ColorField
            label="Background"
            value={settings.sidebarBackground}
            onChange={(v) => updateSettings({ sidebarBackground: v })}
          />
          <ColorField
            label="Foreground"
            value={settings.sidebarForeground}
            onChange={(v) => updateSettings({ sidebarForeground: v })}
          />
          <ColorField
            label="Border"
            value={settings.sidebarBorder}
            onChange={(v) => updateSettings({ sidebarBorder: v })}
          />
          <ColorField
            label="Accent"
            value={settings.sidebarAccent}
            onChange={(v) => updateSettings({ sidebarAccent: v })}
          />
          <ColorField
            label="Accent Foreground"
            value={settings.sidebarAccentForeground}
            onChange={(v) => updateSettings({ sidebarAccentForeground: v })}
          />
        </ColorSection>

        {/* Navigation Colors */}
        <ColorSection title="Navigation Colors" icon={Menu}>
          <ColorField
            label="Nav Background"
            value={settings.navBackground}
            onChange={(v) => updateSettings({ navBackground: v })}
          />
          <ColorField
            label="Nav Foreground"
            value={settings.navForeground}
            onChange={(v) => updateSettings({ navForeground: v })}
          />
          <ColorField
            label="Nav Muted"
            value={settings.navMuted}
            onChange={(v) => updateSettings({ navMuted: v })}
          />
          <ColorField
            label="Nav Border"
            value={settings.navBorder}
            onChange={(v) => updateSettings({ navBorder: v })}
          />
          <ColorField
            label="Nav Accent"
            value={settings.navAccent}
            onChange={(v) => updateSettings({ navAccent: v })}
          />
        </ColorSection>

        {/* Navigation States */}
        <ColorSection title="Navigation States">
          <ColorField
            label="Item Hover Background"
            value={settings.navItemHoverBg}
            onChange={(v) => updateSettings({ navItemHoverBg: v })}
          />
          <ColorField
            label="Item Active Background"
            value={settings.navItemActiveBg}
            onChange={(v) => updateSettings({ navItemActiveBg: v })}
          />
          <ColorField
            label="Item Active Foreground"
            value={settings.navItemActiveFg}
            onChange={(v) => updateSettings({ navItemActiveFg: v })}
          />
        </ColorSection>
      </CardContent>
    </Card>
  );
}