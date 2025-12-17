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
import { Eye } from "lucide-react";
import { PillPreview } from "./WhitelabelHelpers";

export default function WhitelabelPreviewPanel({ settings }) {
  // Generate inline styles for preview
  const previewStyles = {
    backgroundColor: settings.backgroundColor || "#ffffff",
    color: settings.foregroundColor || "#222222",
    fontFamily: settings.fontBody || "Inter",
  };

  const cardStyles = {
    backgroundColor: settings.cardBackground || "#ffffff",
    color: settings.cardForeground || "#222222",
    borderColor: settings.inputBorder || "#e3e3e3",
  };

  const buttonStyles = {
    backgroundColor: settings.ctaPrimary || "#c87533",
    color: settings.ctaPrimaryForeground || "#ffffff",
  };

  const inputStyles = {
    backgroundColor: settings.inputBackground || "#e3e3e3",
    borderColor: settings.inputBorder || "#e3e3e3",
  };

  const headingStyles = {
    fontFamily: settings.fontHeadings || "Inter",
    color: settings.text0 || "#111827",
  };

  return (
    <div className="sticky top-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <CardTitle className="text-lg">Live Preview</CardTitle>
          </div>
          <CardDescription>
            See how your theme looks in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="space-y-4 p-4 rounded-lg border"
            style={previewStyles}
          >
            {/* Heading */}
            <h2 className="text-xl font-bold mb-2" style={headingStyles}>
              {settings.brandName || "Brand Name"}
            </h2>

            {/* Card Preview */}
            <div
              className="p-4 rounded-lg border"
              style={cardStyles}
            >
              <h3 className="font-semibold mb-2" style={headingStyles}>
                Sample Card
              </h3>
              <p
                className="text-sm mb-3"
                style={{ color: settings.text1 || "#4b5563" }}
              >
                This is how your card content will appear with the selected
                colors and typography.
              </p>

              {/* Pills Preview */}
              <div className="flex flex-wrap gap-2 mb-3">
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
                  bg={settings.pillDangerBg}
                  fg={settings.pillDangerFg}
                  label="Failed"
                />
              </div>

              {/* Button Preview */}
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium w-full"
                style={{
                  ...buttonStyles,
                  borderRadius: settings.borderRadius || "0.5rem",
                }}
              >
                Primary Button
              </button>
            </div>

            {/* Input Preview */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: settings.text1 || "#4b5563" }}
              >
                Sample Input
              </label>
              <input
                type="text"
                placeholder="Enter text..."
                className="w-full px-3 py-2 border text-sm"
                style={{
                  ...inputStyles,
                  borderRadius: settings.borderRadius || "0.5rem",
                }}
              />
            </div>

            {/* Text Hierarchy */}
            <div className="pt-3 border-t" style={{ borderColor: settings.borderSubtle }}>
              <p className="text-xs mb-1" style={{ color: settings.text2 }}>
                Caption text (Level 2)
              </p>
              <p className="text-sm mb-1" style={{ color: settings.text1 }}>
                Body text (Level 1)
              </p>
              <p className="text-base font-medium" style={{ color: settings.text0 }}>
                Heading text (Level 0)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}