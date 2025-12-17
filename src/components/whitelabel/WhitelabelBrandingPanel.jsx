import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Type, Square } from "lucide-react";
import { FONT_OPTIONS } from "./WhitelabelHelpers";

export default function WhitelabelBrandingPanel({
  settings,
  updateSettings,
  onUpload,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding Assets</CardTitle>
        <CardDescription>
          Upload logos and configure your brand identity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Brand Name */}
        <div>
          <Label htmlFor="brandName">Brand Name</Label>
          <Input
            id="brandName"
            value={settings.brandName || ""}
            onChange={(e) => updateSettings({ brandName: e.target.value })}
            placeholder="Your Brand Name"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Appears in the browser tab and sidebar
          </p>
        </div>

        {/* Logo Upload */}
        <div>
          <Label>Main Logo</Label>
          <div className="mt-2 flex items-start gap-4">
            {settings.logoUrl ? (
              <div className="w-32 h-32 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-white p-2">
                <img
                  src={settings.logoUrl}
                  alt="Logo preview"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">No Image</text></svg>';
                  }}
                />
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <p className="text-xs text-gray-400 text-center px-2">
                  No logo
                </p>
              </div>
            )}
            <div className="flex-1">
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={(e) => onUpload?.("logoUrl", e.target.files?.[0])}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("logo-upload")?.click()}
                className="gap-2"
                type="button"
              >
                <Upload className="w-4 h-4" />
                Upload Logo
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                PNG or SVG, max 500KB
              </p>
              {settings.logoUrl && (
                <p className="text-xs text-blue-600 mt-1 font-mono break-all">
                  Current: {String(settings.logoUrl).substring(0, 50)}...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Favicon Upload */}
        <div>
          <Label>Favicon</Label>
          <div className="mt-2 flex items-start gap-4">
            {settings.faviconUrl ? (
              <div className="w-16 h-16 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-white p-1">
                <img
                  src={settings.faviconUrl}
                  alt="Favicon preview"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">X</text></svg>';
                  }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <p className="text-xs text-gray-400">No icon</p>
              </div>
            )}
            <div className="flex-1">
              <input
                id="favicon-upload"
                type="file"
                accept="image/*"
                onChange={(e) => onUpload?.("faviconUrl", e.target.files?.[0])}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() =>
                  document.getElementById("favicon-upload")?.click()
                }
                className="gap-2"
                type="button"
              >
                <Upload className="w-4 h-4" />
                Upload Favicon
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                32x32 or 64x64 pixels, ICO or PNG
              </p>
              {settings.faviconUrl && (
                <p className="text-xs text-blue-600 mt-1 font-mono break-all">
                  Current: {String(settings.faviconUrl).substring(0, 50)}...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="border-t pt-6">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Type className="w-4 h-4" />
            Typography
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Headings Font</Label>
              <Select
                value={settings.fontHeadings || "Inter"}
                onValueChange={(value) =>
                  updateSettings({ fontHeadings: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Font for headings and titles
              </p>
            </div>
            <div>
              <Label>Body Font</Label>
              <Select
                value={settings.fontBody || "Inter"}
                onValueChange={(value) => updateSettings({ fontBody: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Font for body text and paragraphs
              </p>
            </div>
          </div>
        </div>

        {/* Border Radius */}
        <div className="border-t pt-6">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Square className="w-4 h-4" />
            Corner Style
          </h3>
          <div>
            <Label>Border Radius</Label>
            <Select
              value={settings.borderRadius || "0.5rem"}
              onValueChange={(value) => updateSettings({ borderRadius: value })}
            >
              <SelectTrigger className="mt-1 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sharp (0px)</SelectItem>
                <SelectItem value="0.25rem">Subtle (4px)</SelectItem>
                <SelectItem value="0.5rem">Default (8px)</SelectItem>
                <SelectItem value="0.75rem">Rounded (12px)</SelectItem>
                <SelectItem value="1rem">Very Rounded (16px)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Controls the roundness of buttons, cards, and inputs
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}