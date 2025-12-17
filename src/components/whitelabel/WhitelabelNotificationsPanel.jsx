import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorField, ColorSection } from "./WhitelabelHelpers";

export default function WhitelabelNotificationsPanel({ settings, updateSettings }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Toast Notifications</CardTitle>
        <CardDescription>
          Customize notification appearance and behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toast Behavior */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Duration (ms)</Label>
            <Input
              type="number"
              value={settings.toastDuration || 3000}
              onChange={(e) =>
                updateSettings({
                  toastDuration: parseInt(e.target.value) || 3000,
                })
              }
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              How long toasts stay visible
            </p>
          </div>
          <div>
            <Label>Placement</Label>
            <Select
              value={settings.toastPlacement || "top-right"}
              onValueChange={(v) => updateSettings({ toastPlacement: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Where toasts appear on screen
            </p>
          </div>
        </div>

        {/* Toast Colors */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-sm text-muted-foreground">
            Toast Color Schemes
          </h3>

          {/* Success Toast */}
          <ColorSection title="Success Toast" defaultOpen={true}>
            <ColorField
              label="Background"
              value={settings.toastSuccessBg}
              onChange={(v) => updateSettings({ toastSuccessBg: v })}
            />
            <ColorField
              label="Text"
              value={settings.toastSuccessText}
              onChange={(v) => updateSettings({ toastSuccessText: v })}
            />
            <ColorField
              label="Border"
              value={settings.toastSuccessBorder}
              onChange={(v) => updateSettings({ toastSuccessBorder: v })}
            />
            {/* Preview */}
            <div className="col-span-2 mt-2">
              <div
                className="p-3 rounded-lg border text-sm"
                style={{
                  backgroundColor: settings.toastSuccessBg,
                  color: settings.toastSuccessText,
                  borderColor: settings.toastSuccessBorder,
                }}
              >
                ✓ Success message preview
              </div>
            </div>
          </ColorSection>

          {/* Error Toast */}
          <ColorSection title="Error Toast">
            <ColorField
              label="Background"
              value={settings.toastErrorBg}
              onChange={(v) => updateSettings({ toastErrorBg: v })}
            />
            <ColorField
              label="Text"
              value={settings.toastErrorText}
              onChange={(v) => updateSettings({ toastErrorText: v })}
            />
            <ColorField
              label="Border"
              value={settings.toastErrorBorder}
              onChange={(v) => updateSettings({ toastErrorBorder: v })}
            />
            {/* Preview */}
            <div className="col-span-2 mt-2">
              <div
                className="p-3 rounded-lg border text-sm"
                style={{
                  backgroundColor: settings.toastErrorBg,
                  color: settings.toastErrorText,
                  borderColor: settings.toastErrorBorder,
                }}
              >
                ✕ Error message preview
              </div>
            </div>
          </ColorSection>

          {/* Warning Toast */}
          <ColorSection title="Warning Toast">
            <ColorField
              label="Background"
              value={settings.toastWarningBg}
              onChange={(v) => updateSettings({ toastWarningBg: v })}
            />
            <ColorField
              label="Text"
              value={settings.toastWarningText}
              onChange={(v) => updateSettings({ toastWarningText: v })}
            />
            <ColorField
              label="Border"
              value={settings.toastWarningBorder}
              onChange={(v) => updateSettings({ toastWarningBorder: v })}
            />
            {/* Preview */}
            <div className="col-span-2 mt-2">
              <div
                className="p-3 rounded-lg border text-sm"
                style={{
                  backgroundColor: settings.toastWarningBg,
                  color: settings.toastWarningText,
                  borderColor: settings.toastWarningBorder,
                }}
              >
                ⚠ Warning message preview
              </div>
            </div>
          </ColorSection>

          {/* Info Toast */}
          <ColorSection title="Info Toast">
            <ColorField
              label="Background"
              value={settings.toastInfoBg}
              onChange={(v) => updateSettings({ toastInfoBg: v })}
            />
            <ColorField
              label="Text"
              value={settings.toastInfoText}
              onChange={(v) => updateSettings({ toastInfoText: v })}
            />
            <ColorField
              label="Border"
              value={settings.toastInfoBorder}
              onChange={(v) => updateSettings({ toastInfoBorder: v })}
            />
            {/* Preview */}
            <div className="col-span-2 mt-2">
              <div
                className="p-3 rounded-lg border text-sm"
                style={{
                  backgroundColor: settings.toastInfoBg,
                  color: settings.toastInfoText,
                  borderColor: settings.toastInfoBorder,
                }}
              >
                ℹ Info message preview
              </div>
            </div>
          </ColorSection>
        </div>
      </CardContent>
    </Card>
  );
}