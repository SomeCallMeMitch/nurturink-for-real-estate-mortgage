import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PillPreview } from "./WhitelabelHelpers";

export default function WhitelabelPreviewPanel({ settings }) {
  return (
    <div className="sticky top-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mini App Preview */}
          <div
            className="rounded-lg overflow-hidden border-2 border-gray-200"
            style={{
              backgroundColor: settings.backgroundColor,
              fontFamily: settings.fontBody,
            }}
          >
            {/* Mini Sidebar */}
            <div className="flex">
              <div
                className="w-16 p-2 space-y-2"
                style={{
                  backgroundColor: settings.sidebarBackground,
                  borderRight: `1px solid ${settings.sidebarBorder}`,
                }}
              >
                {/* Logo placeholder */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold mx-auto"
                  style={{
                    backgroundColor: settings.brandAccent,
                    color: settings.brandAccentForeground,
                  }}
                >
                  {settings.brandName?.charAt(0) || "R"}
                </div>
                {/* Nav items */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-8 rounded mx-auto"
                    style={{
                      backgroundColor:
                        i === 1 ? settings.navItemActiveBg : "transparent",
                    }}
                  />
                ))}
              </div>

              {/* Main content area */}
              <div className="flex-1 p-3" style={{ minHeight: 200 }}>
                {/* Header */}
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{
                    color: settings.foregroundColor,
                    fontFamily: settings.fontHeadings,
                  }}
                >
                  Dashboard
                </h3>

                {/* Sample card */}
                <div
                  className="p-2 mb-2"
                  style={{
                    backgroundColor: settings.cardBackground,
                    borderRadius: settings.borderRadius,
                    border: `1px solid ${settings.inputBorder}`,
                  }}
                >
                  <p
                    className="text-xs"
                    style={{ color: settings.mutedForeground }}
                  >
                    Sample card content
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 mb-2">
                  <button
                    className="px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: settings.ctaPrimary,
                      color: settings.ctaPrimaryForeground,
                      borderRadius: settings.borderRadius,
                    }}
                  >
                    Primary
                  </button>
                  <button
                    className="px-2 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: settings.secondaryBackground,
                      color: settings.secondaryForeground,
                      borderRadius: settings.borderRadius,
                      border: `1px solid ${settings.inputBorder}`,
                    }}
                  >
                    Secondary
                  </button>
                </div>

                {/* Pills */}
                <div className="flex gap-1 flex-wrap">
                  <PillPreview
                    bg={settings.pillSuccessBg}
                    fg={settings.pillSuccessFg}
                    label="Active"
                  />
                  <PillPreview
                    bg={settings.pillWarningBg}
                    fg={settings.pillWarningFg}
                    label="Pending"
                  />
                  <PillPreview
                    bg={settings.pillColor1Bg}
                    fg={settings.pillColor1Fg}
                    label="Tag"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Brand Info */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: settings.brandAccent,
                    color: settings.brandAccentForeground,
                  }}
                >
                  {settings.brandName?.charAt(0) || "R"}
                </div>
              )}
              <span
                className="font-semibold"
                style={{
                  fontFamily: settings.fontHeadings,
                  color: settings.foregroundColor,
                }}
              >
                {settings.brandName || "Brand Name"}
              </span>
            </div>
            
            {/* Color Swatches */}
            <p className="text-xs text-muted-foreground mb-2">Color Palette</p>
            <div className="flex gap-2 flex-wrap">
              <div
                className="w-6 h-6 rounded border border-gray-200"
                style={{ backgroundColor: settings.primaryColor }}
                title="Primary"
              />
              <div
                className="w-6 h-6 rounded border border-gray-200"
                style={{ backgroundColor: settings.accentColor }}
                title="Accent"
              />
              <div
                className="w-6 h-6 rounded border border-gray-200"
                style={{ backgroundColor: settings.brandAccent }}
                title="Brand"
              />
              <div
                className="w-6 h-6 rounded border border-gray-200"
                style={{ backgroundColor: settings.successColor }}
                title="Success"
              />
              <div
                className="w-6 h-6 rounded border border-gray-200"
                style={{ backgroundColor: settings.warningColor }}
                title="Warning"
              />
              <div
                className="w-6 h-6 rounded border border-gray-200"
                style={{ backgroundColor: settings.dangerColor }}
                title="Danger"
              />
            </div>
          </div>

          {/* Typography Preview */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Typography</p>
            <p
              className="text-lg font-semibold"
              style={{ fontFamily: settings.fontHeadings }}
            >
              {settings.fontHeadings || "Headings Font"}
            </p>
            <p
              className="text-sm"
              style={{ fontFamily: settings.fontBody }}
            >
              {settings.fontBody || "Body Font"} - The quick brown fox jumps over the lazy dog.
            </p>
          </div>

          {/* Border Radius Preview */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Corner Style</p>
            <div className="flex gap-2">
              <div
                className="w-12 h-8 bg-gray-200 border border-gray-300"
                style={{ borderRadius: settings.borderRadius }}
              />
              <div
                className="w-16 h-8 bg-gray-200 border border-gray-300"
                style={{ borderRadius: settings.borderRadius }}
              />
              <div
                className="w-8 h-8 bg-gray-200 border border-gray-300"
                style={{ borderRadius: settings.borderRadius }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}