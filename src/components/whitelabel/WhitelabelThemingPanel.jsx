import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function WhitelabelThemingPanel({ settings, updateSettings, fontOptions }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Colors & Fonts</CardTitle>
        <CardDescription>Customize the visual appearance of your application</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Color Settings */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-3 mt-1">
              <Input
                id="primaryColor"
                type="color"
                value={settings?.primaryColor ?? "#000000"}
                onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={settings?.primaryColor ?? ""}
                onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                placeholder="#4F46E5"
                className="font-mono"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Main buttons and primary elements</p>
          </div>

          <div>
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex items-center gap-3 mt-1">
              <Input
                id="accentColor"
                type="color"
                value={settings?.accentColor ?? "#000000"}
                onChange={(e) => updateSettings({ accentColor: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={settings?.accentColor ?? ""}
                onChange={(e) => updateSettings({ accentColor: e.target.value })}
                placeholder="#7C3AED"
                className="font-mono"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Secondary highlights and accents</p>
          </div>

          <div>
            <Label htmlFor="backgroundColor">Background Color</Label>
            <div className="flex items-center gap-3 mt-1">
              <Input
                id="backgroundColor"
                type="color"
                value={settings?.backgroundColor ?? "#ffffff"}
                onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={settings?.backgroundColor ?? ""}
                onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                placeholder="#F9FAFB"
                className="font-mono"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Default page background</p>
          </div>
        </div>

        {/* Font Settings */}
        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <Label htmlFor="fontHeadings">Headings Font</Label>
            <Select value={settings?.fontHeadings ?? "Inter"} onValueChange={(value) => updateSettings({ fontHeadings: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(fontOptions ?? []).map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">Font for headings and titles</p>
          </div>

          <div>
            <Label htmlFor="fontBody">Body Font</Label>
            <Select value={settings?.fontBody ?? "Inter"} onValueChange={(value) => updateSettings({ fontBody: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(fontOptions ?? []).map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">Font for body text and paragraphs</p>
          </div>
        </div>

        {/* Preview */}
        <div className="pt-4 border-t">
          <Label>Theme Preview</Label>
          <div
            className="mt-2 p-6 rounded-lg border-2"
            style={{ backgroundColor: settings?.backgroundColor ?? "#F9FAFB" }}
          >
            <h2
              className="text-2xl font-bold mb-2"
              style={{
                color: settings?.primaryColor ?? "#111827",
                fontFamily: settings?.fontHeadings ?? "Inter",
              }}
            >
              Heading Example
            </h2>
            <p className="mb-4" style={{ fontFamily: settings?.fontBody ?? "Inter" }}>
              This is how your body text will appear with the selected font.
            </p>
            <Button
              style={{
                backgroundColor: settings?.primaryColor ?? undefined,
                borderColor: settings?.primaryColor ?? undefined,
              }}
              className="hover:opacity-90"
              type="button"
            >
              Primary Button
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}