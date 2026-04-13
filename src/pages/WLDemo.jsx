import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import WhitelabelBrandingPanel from "@/components/whitelabel/WhitelabelBrandingPanel";
import WhitelabelThemingPanel from "@/components/whitelabel/WhitelabelThemingPanel";
import WhitelabelNotificationsPanel from "@/components/whitelabel/WhitelabelNotificationsPanel";

export default function WLDemo() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("branding");

  // Form state
  const [settings, setSettings] = useState({
    brandName: "NurturInk",
    logoUrl: null,
    faviconUrl: null,
    primaryColor: "#4F46E5",
    accentColor: "#7C3AED",
    backgroundColor: "#F9FAFB",
    fontHeadings: "Inter",
    fontBody: "Inter",
    toastDuration: 3000,
    toastPlacement: "top-right",
    toastSuccessBg: "#F0FDF4",
    toastSuccessText: "#166534",
    toastSuccessBorder: "#86EFAC",
    toastErrorBg: "#FEF2F2",
    toastErrorText: "#991B1B",
    toastErrorBorder: "#FCA5A5",
    toastWarningBg: "#FFFBEB",
    toastWarningText: "#92400E",
    toastWarningBorder: "#FDE68A",
    toastInfoBg: "#EFF6FF",
    toastInfoText: "#1E40AF",
    toastInfoBorder: "#93C5FD",
  });

  const [originalSettings, setOriginalSettings] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSettings = (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!originalSettings) return;
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser?.appRole !== "super_admin") {
        setError("Access denied. Only super admins can access whitelabel settings.");
        setLoading(false);
        return;
      }

      const response = await base44.functions.invoke("getWhitelabelSettings");
      const loadedSettings = response?.data?.settings;

      if (!loadedSettings) {
        setError("Failed to load settings (missing response.data.settings).");
        return;
      }

      setSettings(loadedSettings);
      setOriginalSettings(loadedSettings);
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

  const fontOptions = [
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Raleway",
    "Nunito",
    "Ubuntu",
    "Playfair Display",
    "Merriweather",
  ];

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => navigate(createPageUrl("Home"))}>Go to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Whitelabel Demo Page</h1>
            <p className="text-lg text-gray-600">
              Testing the new tabbed interface for whitelabel settings
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="bg-indigo-600 hover:bg-indigo-700"
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Save Bar */}
        {hasChanges && (
          <Card className="mb-6 border-2 border-orange-300 bg-orange-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <p className="text-orange-900 font-semibold">You have unsaved changes</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleReset}>
                    Reset Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="branding" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="theming" className="gap-2">
              <Palette className="w-4 h-4" />
              Theming
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="branding">
            <WhitelabelBrandingPanel
              settings={settings}
              updateSettings={updateSettings}
              onUpload={handleImageUpload}
            />
          </TabsContent>

          <TabsContent value="theming">
            <WhitelabelThemingPanel
              settings={settings}
              updateSettings={updateSettings}
              fontOptions={fontOptions}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <WhitelabelNotificationsPanel settings={settings} updateSettings={updateSettings} />
          </TabsContent>
        </Tabs>

        {/* Bottom Save Button */}
        <Card className={`mt-6 ${hasChanges ? "border-2 border-indigo-300 bg-indigo-50" : "border border-gray-200"}`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className={hasChanges ? "text-indigo-900 font-semibold" : "text-gray-600"}>
                {hasChanges ? "Ready to apply your changes?" : "No unsaved changes"}
              </p>
              <div className="flex gap-3">
                {hasChanges && (
                  <Button variant="outline" onClick={handleReset}>
                    Reset Changes
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save All Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}