import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, Eye } from "lucide-react";

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2 mt-1">
        <Input type="color" value={value ?? "#000000"} onChange={(e) => onChange(e.target.value)} className="w-12 h-8 cursor-pointer p-1" />
        <Input type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs flex-1" />
      </div>
    </div>
  );
}

function ToastColorCard({ title, icon, bg, text, border, onBg, onText, onBorder }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>

      <ColorField label="Background" value={bg} onChange={onBg} />
      <ColorField label="Text" value={text} onChange={onText} />
      <ColorField label="Border" value={border} onChange={onBorder} />

      <div
        className="p-3 rounded-lg border-2 mt-3"
        style={{
          backgroundColor: bg,
          color: text,
          borderColor: border,
        }}
      >
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs">Preview</p>
      </div>
    </div>
  );
}

export default function WhitelabelNotificationsPanel({ settings, updateSettings }) {
  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Behavior</CardTitle>
          <CardDescription>Configure how toast notifications appear and behave</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="toastDuration">Duration (milliseconds)</Label>
              <Input
                id="toastDuration"
                type="number"
                min="1000"
                max="30000"
                step="500"
                value={settings?.toastDuration ?? 3000}
                onChange={(e) => updateSettings({ toastDuration: parseInt(e.target.value || "0", 10) })}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">How long notifications stay visible (1000-30000ms)</p>
            </div>

            <div>
              <Label htmlFor="toastPlacement">Placement</Label>
              <Select
                value={settings?.toastPlacement ?? "top-right"}
                onValueChange={(value) => updateSettings({ toastPlacement: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-center">Top Center</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-center">Bottom Center</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Where notifications appear on screen</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Notification Colors in One Card */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Colors</CardTitle>
          <CardDescription>Customize the appearance of different notification types</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ToastColorCard
              title="Success"
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              bg={settings?.toastSuccessBg}
              text={settings?.toastSuccessText}
              border={settings?.toastSuccessBorder}
              onBg={(v) => updateSettings({ toastSuccessBg: v })}
              onText={(v) => updateSettings({ toastSuccessText: v })}
              onBorder={(v) => updateSettings({ toastSuccessBorder: v })}
            />

            <ToastColorCard
              title="Error"
              icon={<AlertCircle className="w-5 h-5 text-red-600" />}
              bg={settings?.toastErrorBg}
              text={settings?.toastErrorText}
              border={settings?.toastErrorBorder}
              onBg={(v) => updateSettings({ toastErrorBg: v })}
              onText={(v) => updateSettings({ toastErrorText: v })}
              onBorder={(v) => updateSettings({ toastErrorBorder: v })}
            />

            <ToastColorCard
              title="Warning"
              icon={<AlertCircle className="w-5 h-5 text-yellow-600" />}
              bg={settings?.toastWarningBg}
              text={settings?.toastWarningText}
              border={settings?.toastWarningBorder}
              onBg={(v) => updateSettings({ toastWarningBg: v })}
              onText={(v) => updateSettings({ toastWarningText: v })}
              onBorder={(v) => updateSettings({ toastWarningBorder: v })}
            />

            <ToastColorCard
              title="Info"
              icon={<Eye className="w-5 h-5 text-blue-600" />}
              bg={settings?.toastInfoBg}
              text={settings?.toastInfoText}
              border={settings?.toastInfoBorder}
              onBg={(v) => updateSettings({ toastInfoBg: v })}
              onText={(v) => updateSettings({ toastInfoText: v })}
              onBorder={(v) => updateSettings({ toastInfoBorder: v })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}