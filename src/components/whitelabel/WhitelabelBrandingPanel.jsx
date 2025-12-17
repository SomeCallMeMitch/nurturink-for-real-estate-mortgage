import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

export default function WhitelabelBrandingPanel({ settings, updateSettings, onUpload }) {
  const logoInputId = "whitelabel-logo-input";
  const faviconInputId = "whitelabel-favicon-input";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding Assets</CardTitle>
        <CardDescription>Upload logos and configure your brand name</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Brand Name */}
        <div>
          <Label htmlFor="brandName">Brand Name</Label>
          <Input
            id="brandName"
            value={settings?.brandName ?? ""}
            onChange={(e) => updateSettings({ brandName: e.target.value })}
            placeholder="Your Brand Name"
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            This name will appear in the sidebar and throughout the application
          </p>
        </div>

        {/* Logo Upload */}
        <div>
          <Label htmlFor={logoInputId}>Main Logo</Label>
          <div className="mt-2 flex items-start gap-4">
            {settings?.logoUrl ? (
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
                <p className="text-xs text-gray-400 text-center px-2">No logo uploaded</p>
              </div>
            )}

            <div className="flex-1">
              <input
                id={logoInputId}
                type="file"
                accept="image/*"
                onChange={(e) => onUpload?.("logoUrl", e.target.files?.[0])}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById(logoInputId)?.click()}
                className="gap-2"
                type="button"
              >
                <Upload className="w-4 h-4" />
                Upload Logo
              </Button>

              <p className="text-xs text-gray-500 mt-2">Recommended: PNG or SVG, max 500KB</p>

              {settings?.logoUrl && (
                <p className="text-xs text-blue-600 mt-1 font-mono break-all">
                  Current: {String(settings.logoUrl).substring(0, 50)}...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Favicon Upload */}
        <div>
          <Label htmlFor={faviconInputId}>Favicon</Label>
          <div className="mt-2 flex items-start gap-4">
            {settings?.faviconUrl ? (
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
                id={faviconInputId}
                type="file"
                accept="image/*"
                onChange={(e) => onUpload?.("faviconUrl", e.target.files?.[0])}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById(faviconInputId)?.click()}
                className="gap-2"
                type="button"
              >
                <Upload className="w-4 h-4" />
                Upload Favicon
              </Button>

              <p className="text-xs text-gray-500 mt-2">
                Recommended: 32x32 or 64x64 pixels, ICO or PNG
              </p>

              {settings?.faviconUrl && (
                <p className="text-xs text-blue-600 mt-1 font-mono break-all">
                  Current: {String(settings.faviconUrl).substring(0, 50)}...
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}