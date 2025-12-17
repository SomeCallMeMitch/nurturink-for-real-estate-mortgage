import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Save,
  Palette,
  Bell,
  Image as ImageIcon,
  AlertCircle,
  RotateCcw,
  Layers,
  Navigation,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Import panel components
import WhitelabelBrandingPanel from "@/components/whitelabel/WhitelabelBrandingPanel";
import WhitelabelColorsPanel from "@/components/whitelabel/WhitelabelColorsPanel";
import WhitelabelNavigationPanel from "@/components/whitelabel/WhitelabelNavigationPanel";
import WhitelabelComponentsPanel from "@/components/whitelabel/WhitelabelComponentsPanel";
import WhitelabelNotificationsPanel from "@/components/whitelabel/WhitelabelNotificationsPanel";
import WhitelabelPreviewPanel from "@/components/whitelabel/WhitelabelPreviewPanel";
import { DEFAULT_WHITELABEL_SETTINGS } from "@/components/whitelabel/WhitelabelHelpers";

export default function SuperAdminWhitelabel() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("branding");

  const [settings, setSettings] = useState(DEFAULT_WHITELABEL_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSettings = (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!originalSettings) return;
    const changed =
      JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser?.appRole !== "super_admin") {
        setError(
          "Access denied. Only super admins can access whitelabel settings."
        );
        setLoading(false);
        return;
      }

      const response = await base44.functions.invoke("getWhitelabelSettings");
      const loadedSettings = response?.data?.settings;

      if (!loadedSettings) {
        setError("Failed to load settings (missing response.data.settings).");
        return;
      }

      // Merge loaded settings with defaults (for any missing fields)
      const mergedSettings = { ...DEFAULT_WHITELABEL_SETTINGS, ...loadedSettings };
      setSettings(mergedSettings);
      setOriginalSettings(mergedSettings);
    } catch (err) {
      console.error("Failed to load whitelabel settings:", err);
      setError(err?.response?.data?.error || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await base44.functions.invoke("updateWhitelabelSettings", {
        settings,
      });

      setOriginalSettings(settings);
      setHasChanges(false);

      toast({
        title: "Settings Saved! ✓",
        description: "Whitelabel settings have been updated successfully",
        className: "bg-green-50 border-green-200 text-green-900",
      });
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast({
        title: "Save Failed",
        description: err?.response?.data?.error || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!originalSettings) return;
    setSettings(originalSettings);
    setHasChanges(false);
  };

  const handleResetToDefaults = () => {
    setSettings(DEFAULT_WHITELABEL_SETTINGS);
  };

  const handleImageUpload = async (field, file) => {
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateSettings({ [field]: file_url });

      toast({
        title: "Image Uploaded",
        description: "Image uploaded successfully",
      });
    } catch (err) {
      console.error("Failed to upload image:", err);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading whitelabel settings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-600 mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => navigate(createPageUrl("Home"))}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Whitelabel Settings
            </h1>
            <p className="text-gray-600">
              Customize the branding and appearance of your application
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleResetToDefaults}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Unsaved Changes Banner */}
        {hasChanges && (
          <Card className="mb-6 border-2 border-amber-300 bg-amber-50">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <p className="text-amber-900 font-medium">
                    You have unsaved changes
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Discard Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Settings Panels */}
          <div className="col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="branding" className="gap-1.5 text-xs">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="colors" className="gap-1.5 text-xs">
                  <Palette className="w-3.5 h-3.5" />
                  Colors
                </TabsTrigger>
                <TabsTrigger value="navigation" className="gap-1.5 text-xs">
                  <Navigation className="w-3.5 h-3.5" />
                  Navigation
                </TabsTrigger>
                <TabsTrigger value="components" className="gap-1.5 text-xs">
                  <Layers className="w-3.5 h-3.5" />
                  Components
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-1.5 text-xs">
                  <Bell className="w-3.5 h-3.5" />
                  Toasts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="branding">
                <WhitelabelBrandingPanel
                  settings={settings}
                  updateSettings={updateSettings}
                  onUpload={handleImageUpload}
                />
              </TabsContent>

              <TabsContent value="colors">
                <WhitelabelColorsPanel
                  settings={settings}
                  updateSettings={updateSettings}
                />
              </TabsContent>

              <TabsContent value="navigation">
                <WhitelabelNavigationPanel
                  settings={settings}
                  updateSettings={updateSettings}
                />
              </TabsContent>

              <TabsContent value="components">
                <WhitelabelComponentsPanel
                  settings={settings}
                  updateSettings={updateSettings}
                />
              </TabsContent>

              <TabsContent value="notifications">
                <WhitelabelNotificationsPanel
                  settings={settings}
                  updateSettings={updateSettings}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Live Preview */}
          <div className="col-span-1">
            <WhitelabelPreviewPanel settings={settings} />
          </div>
        </div>
      </div>
    </div>
  );
}