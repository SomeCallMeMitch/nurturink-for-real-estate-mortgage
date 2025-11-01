import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SuperAdminLayout from "@/components/sa/SuperAdminLayout";
import CardPreview from "@/components/preview/CardPreview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, RotateCcw } from "lucide-react";

// Sample data for preview
const sampleClient = {
  firstName: "John",
  lastName: "Smith",
  companyName: "ABC Roofing Co",
  address: "123 Main Street",
  address2: "Suite 100",
  city: "Denver",
  state: "CO",
  zipCode: "80202",
  phone: "(555) 123-4567",
  email: "john.smith@example.com"
};

const sampleUser = {
  firstName: "Sarah",
  lastName: "Johnson",
  companyName: "RoofPro Inc",
  phone: "(555) 987-6543",
  websiteUrl: "www.roofpro.com"
};

const sampleMessage = "Thank you for choosing us for your roofing project! We truly appreciate your business and look forward to exceeding your expectations.\n\nYour satisfaction is our top priority, and we're committed to delivering exceptional results.";

const sampleDesign = {
  id: "sample-design-1",
  name: "Classic Thank You Card",
  imageUrl: "https://via.placeholder.com/412x600/e8f4f8/4a5568?text=Thank+You+Card",
  category: "Thank You"
};

const sampleNoteStyleProfile = {
  id: "sample-profile-1",
  name: "Professional Style",
  defaultGreeting: "Dear {{firstName}},",
  signatureText: "Sincerely,\n{{rep_full_name}}\n{{rep_company_name}}\n{{rep_phone}}",
  handwritingFont: "Caveat",
  includeSignatureByDefault: true
};

export default function AdminCardLayout() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Preview control states
  const [includeGreeting, setIncludeGreeting] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const result = await base44.functions.invoke('getInstanceSettings');
      setSettings(result.data.cardPreviewSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      await base44.functions.invoke('updateInstanceSettings', {
        cardPreviewSettings: settings
      });
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset to default values? This cannot be undone.')) {
      await loadSettings();
      setMessage({ type: 'success', text: 'Settings reset to defaults' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Card Layout Settings</h1>
          <p className="text-gray-600">
            Configure global settings for handwritten card preview rendering
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>

        {/* Two-Column Layout: Settings + Preview */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column: Settings Forms */}
          <div className="space-y-6">
            {/* Typography Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
                <CardDescription>Font size and line height settings</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fontSize">Font Size (px)</Label>
                  <Input
                    id="fontSize"
                    type="number"
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lineHeight">Line Height</Label>
                  <Input
                    id="lineHeight"
                    type="number"
                    step="0.1"
                    value={settings.lineHeight}
                    onChange={(e) => updateSetting('lineHeight', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sizing & Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Sizing & Limits</CardTitle>
                <CardDescription>Maximum widths and line limits</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseTextWidth">Base Text Width (px)</Label>
                  <Input
                    id="baseTextWidth"
                    type="number"
                    value={settings.baseTextWidth}
                    onChange={(e) => updateSetting('baseTextWidth', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="shortCardMaxLines">Short Card Max Lines</Label>
                  <Input
                    id="shortCardMaxLines"
                    type="number"
                    value={settings.shortCardMaxLines}
                    onChange={(e) => updateSetting('shortCardMaxLines', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="maxPreviewLines">Max Preview Lines</Label>
                  <Input
                    id="maxPreviewLines"
                    type="number"
                    value={settings.maxPreviewLines}
                    onChange={(e) => updateSetting('maxPreviewLines', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Positioning */}
            <Card>
              <CardHeader>
                <CardTitle>Positioning</CardTitle>
                <CardDescription>Margins, padding, and gaps</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseMarginLeft">Base Margin Left (px)</Label>
                  <Input
                    id="baseMarginLeft"
                    type="number"
                    value={settings.baseMarginLeft}
                    onChange={(e) => updateSetting('baseMarginLeft', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="topHalfPaddingTop">Top Half Padding (px)</Label>
                  <Input
                    id="topHalfPaddingTop"
                    type="number"
                    value={settings.topHalfPaddingTop}
                    onChange={(e) => updateSetting('topHalfPaddingTop', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gapAboveFold">Gap Above Fold (px)</Label>
                  <Input
                    id="gapAboveFold"
                    type="number"
                    value={settings.gapAboveFold}
                    onChange={(e) => updateSetting('gapAboveFold', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gapBelowFold">Gap Below Fold (px)</Label>
                  <Input
                    id="gapBelowFold"
                    type="number"
                    value={settings.gapBelowFold}
                    onChange={(e) => updateSetting('gapBelowFold', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="shortBelowFold">Short Below Fold (px)</Label>
                  <Input
                    id="shortBelowFold"
                    type="number"
                    value={settings.shortBelowFold}
                    onChange={(e) => updateSetting('shortBelowFold', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="shiftRight">Shift Right (px)</Label>
                  <Input
                    id="shiftRight"
                    type="number"
                    value={settings.shiftRight}
                    onChange={(e) => updateSetting('shiftRight', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="rightPadding">Right Padding (px)</Label>
                  <Input
                    id="rightPadding"
                    type="number"
                    value={settings.rightPadding}
                    onChange={(e) => updateSetting('rightPadding', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Indentation */}
            <Card>
              <CardHeader>
                <CardTitle>Indentation</CardTitle>
                <CardDescription>Handwritten effect parameters</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxIndent">Max Indent (px)</Label>
                  <Input
                    id="maxIndent"
                    type="number"
                    value={settings.maxIndent}
                    onChange={(e) => updateSetting('maxIndent', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="indentAmplitude">Indent Amplitude</Label>
                  <Input
                    id="indentAmplitude"
                    type="number"
                    value={settings.indentAmplitude}
                    onChange={(e) => updateSetting('indentAmplitude', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="indentNoise">Indent Noise</Label>
                  <Input
                    id="indentNoise"
                    type="number"
                    value={settings.indentNoise}
                    onChange={(e) => updateSetting('indentNoise', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="indentFrequency">Indent Frequency</Label>
                  <Input
                    id="indentFrequency"
                    type="number"
                    step="0.01"
                    value={settings.indentFrequency}
                    onChange={(e) => updateSetting('indentFrequency', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Frame */}
            <Card>
              <CardHeader>
                <CardTitle>Frame Dimensions</CardTitle>
                <CardDescription>Preview container size</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frameWidth">Frame Width (px)</Label>
                  <Input
                    id="frameWidth"
                    type="number"
                    value={settings.frameWidth}
                    onChange={(e) => updateSetting('frameWidth', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="frameHeight">Frame Height (px)</Label>
                  <Input
                    id="frameHeight"
                    type="number"
                    value={settings.frameHeight}
                    onChange={(e) => updateSetting('frameHeight', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Preview (Sticky) */}
          <div className="sticky top-8 h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>Real-time preview of your settings</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Preview Controls */}
                <div className="flex items-center gap-6 mb-4 pb-4 border-b">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeGreeting" 
                      checked={includeGreeting}
                      onCheckedChange={setIncludeGreeting}
                    />
                    <label
                      htmlFor="includeGreeting"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Include Greeting
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeSignature" 
                      checked={includeSignature}
                      onCheckedChange={setIncludeSignature}
                    />
                    <label
                      htmlFor="includeSignature"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Include Signature
                    </label>
                  </div>
                </div>

                {/* Card Preview Component */}
                <CardPreview
                  message={sampleMessage}
                  client={sampleClient}
                  user={sampleUser}
                  noteStyleProfile={sampleNoteStyleProfile}
                  selectedDesign={sampleDesign}
                  previewSettings={settings}
                  includeGreeting={includeGreeting}
                  includeSignature={includeSignature}
                  randomIndentEnabled={true}
                  showLineCounter={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}