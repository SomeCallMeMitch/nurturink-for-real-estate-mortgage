import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Layout, Navigation } from "lucide-react";
import { ColorField, ColorSection } from "./WhitelabelHelpers";

export default function WhitelabelNavigationPanel({ settings, updateSettings }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Navigation & Sidebar</CardTitle>
        <CardDescription>
          Customize the sidebar and navigation appearance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sidebar Colors */}
        <ColorSection
          title="Sidebar Colors"
          icon={Layout}
          defaultOpen={true}
        >
          <ColorField
            label="Sidebar Background"
            value={settings.sidebarBackground}
            onChange={(v) => updateSettings({ sidebarBackground: v })}
            description="Main sidebar bg"
          />
          <ColorField
            label="Sidebar Text"
            value={settings.sidebarForeground}
            onChange={(v) => updateSettings({ sidebarForeground: v })}
            description="Sidebar text color"
          />
          <ColorField
            label="Sidebar Border"
            value={settings.sidebarBorder}
            onChange={(v) => updateSettings({ sidebarBorder: v })}
            description="Sidebar border/dividers"
          />
          <ColorField
            label="Sidebar Accent"
            value={settings.sidebarAccent}
            onChange={(v) => updateSettings({ sidebarAccent: v })}
            description="Hover background"
          />
          <ColorField
            label="Sidebar Accent Text"
            value={settings.sidebarAccentForeground}
            onChange={(v) => updateSettings({ sidebarAccentForeground: v })}
            description="Text on hover"
          />
        </ColorSection>

        {/* Navigation Items */}
        <ColorSection title="Navigation Items" icon={Navigation}>
          <ColorField
            label="Nav Background"
            value={settings.navBackground}
            onChange={(v) => updateSettings({ navBackground: v })}
            description="Navigation background"
          />
          <ColorField
            label="Nav Text"
            value={settings.navForeground}
            onChange={(v) => updateSettings({ navForeground: v })}
            description="Navigation text"
          />
          <ColorField
            label="Nav Muted"
            value={settings.navMuted}
            onChange={(v) => updateSettings({ navMuted: v })}
            description="Inactive nav items"
          />
          <ColorField
            label="Nav Border"
            value={settings.navBorder}
            onChange={(v) => updateSettings({ navBorder: v })}
            description="Nav dividers"
          />
          <ColorField
            label="Nav Hover Background"
            value={settings.navItemHoverBg}
            onChange={(v) => updateSettings({ navItemHoverBg: v })}
            description="Hover state bg"
          />
          <ColorField
            label="Nav Active Background"
            value={settings.navItemActiveBg}
            onChange={(v) => updateSettings({ navItemActiveBg: v })}
            description="Active item bg"
          />
          <ColorField
            label="Nav Active Text"
            value={settings.navItemActiveFg}
            onChange={(v) => updateSettings({ navItemActiveFg: v })}
            description="Active item text"
          />
          <ColorField
            label="Nav Accent"
            value={settings.navAccent}
            onChange={(v) => updateSettings({ navAccent: v })}
            description="Accent highlight"
          />
        </ColorSection>
      </CardContent>
    </Card>
  );
}