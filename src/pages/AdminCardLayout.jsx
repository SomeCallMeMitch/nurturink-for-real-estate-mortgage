
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import SuperAdminLayout from '@/components/sa/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import CardPreview from '@/components/preview/CardPreview';

// Sample data for preview
const SAMPLE_CLIENT = {
  firstName: "John",
  lastName: "Smith",
  fullName: "John Smith",
  address1: "123 Main St",
  city: "Denver",
  state: "CO",
  zip: "80202",
  companyName: "ABC Roofing"
};

const SAMPLE_USER = {
  full_name: "Mitch Fields",
  firstName: "Mitch",
  lastName: "Fields",
  companyName: "ScribeHandwritten.com",
  phone: "916-555-1212"
};

const SAMPLE_NOTE_PROFILE = {
  name: "Professional",
  defaultGreeting: "Dear {{firstName}},",
  signatureText: "Sincerely,\n{{rep_full_name}}\n{{rep_company_name}}",
  handwritingFont: "Caveat"
};

// Multiple test messages
const TEST_MESSAGES = {
  short: "Thank you for your recent roofing project with us! We truly appreciate your business.",
  long: "Hello, my name's James,\n\nBelieve it or not, this letter is actually written with a real Bic pen, by our robots!\nAs you can see, the software will use a different letter format for each character, that way, none of the letters will look the same when you see them next to each other.\nKeep in mind, this is a general sample, and we can create any size mail piece, any cardstock, any envelopes, and craft your perfect custom mail piece!\n\nThank you,\n\nMitch Fields\nwww.ScribeHandwritten.com\n916-555-1212"
};

const GREETING_OPTIONS = [
  { label: "Dear {{firstName}},", value: "Dear {{firstName}}," },
  { label: "Hi {{firstName}}!", value: "Hi {{firstName}}!" },
  { label: "Hello {{firstName}},", value: "Hello {{firstName}}," }
];

const SIGNATURE_OPTIONS = [
  { label: "Sincerely, {{rep_full_name}}", value: "Sincerely,\n{{rep_full_name}}\n{{rep_company_name}}" },
  { label: "Best, {{rep_full_name}}", value: "Best,\n{{rep_full_name}}" },
  { label: "Thank you, {{rep_full_name}}", value: "Thank you,\n{{rep_full_name}}\n{{rep_company_name}}\n{{rep_phone}}" }
];

export default function AdminCardLayout() {
  const [settings, setSettings] = useState(null);
  const [localSettings, setLocalSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [error, setError] = useState(null);
  
  // Preview controls
  const [testMessage, setTestMessage] = useState('long');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await base44.functions.invoke('getInstanceSettings');
      // Ensure cardPreviewSettings exists and has default boolean values for new controls
      const loadedSettings = {
        ...response.data,
        cardPreviewSettings: {
          ...response.data.cardPreviewSettings,
          includeGreeting: response.data.cardPreviewSettings?.includeGreeting ?? false,
          includeSignature: response.data.cardPreviewSettings?.includeSignature ?? false,
        }
      };
      setSettings(loadedSettings);
      setLocalSettings(loadedSettings);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError(err.response?.data?.error || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus(null);
      await base44.functions.invoke('updateInstanceSettings', localSettings);
      setSettings(localSettings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setSaveStatus(null);
  };

  const updateSetting = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      cardPreviewSettings: {
        ...prev.cardPreviewSettings,
        // Handle boolean values directly, otherwise parse as float or default to 0
        [key]: typeof value === 'boolean' ? value : parseFloat(value) || 0
      }
    }));
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(localSettings);

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </SuperAdminLayout>
    );
  }

  if (error) {
    return (
      <SuperAdminLayout>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-semibold">Failed to Load Settings</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <Button onClick={loadSettings} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </SuperAdminLayout>
    );
  }

  if (!localSettings) {
    return (
      <SuperAdminLayout>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">No settings found. Please contact support.</p>
          </CardContent>
        </Card>
      </SuperAdminLayout>
    );
  }

  const s = localSettings.cardPreviewSettings;

  return (
    <SuperAdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Preview Layout Settings</h1>
            <p className="text-gray-600 mt-1">
              Adjust positioning, sizing, and appearance of handwritten note previews
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={!hasChanges || saving}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
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
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Save Status */}
        {saveStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Settings saved successfully!</span>
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Failed to save settings. Please try again.</span>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Settings Controls */}
          <div className="col-span-5 space-y-6">
            {/* Preview Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Preview Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Test Message</Label>
                  <Select value={testMessage} onValueChange={setTestMessage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short Message</SelectItem>
                      <SelectItem value="long">Long Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeGreeting"
                    checked={s.includeGreeting}
                    onCheckedChange={(checked) => updateSetting('includeGreeting', checked)}
                  />
                  <Label htmlFor="includeGreeting">Include Greeting in Preview</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeSignature"
                    checked={s.includeSignature}
                    onCheckedChange={(checked) => updateSetting('includeSignature', checked)}
                  />
                  <Label htmlFor="includeSignature">Include Signature in Preview</Label>
                </div>
              </CardContent>
            </Card>

            {/* Typography & Sizing */}
            <Card>
              <CardHeader>
                <CardTitle>Typography & Sizing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Font Size (px)</Label>
                    <Input
                      type="number"
                      value={s.fontSize}
                      onChange={(e) => updateSetting('fontSize', e.target.value)}
                      min={10}
                      max={30}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label>Line Height</Label>
                    <Input
                      type="number"
                      value={s.lineHeight}
                      onChange={(e) => updateSetting('lineHeight', e.target.value)}
                      min={0.8}
                      max={2}
                      step={0.1}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Text Width (px)</Label>
                    <Input
                      type="number"
                      value={s.baseTextWidth}
                      onChange={(e) => updateSetting('baseTextWidth', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Left Margin (px)</Label>
                    <Input
                      type="number"
                      value={s.baseMarginLeft}
                      onChange={(e) => updateSetting('baseMarginLeft', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Limits & Flow */}
            <Card>
              <CardHeader>
                <CardTitle>Line Limits & Flow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Short Card Max Lines</Label>
                    <Input
                      type="number"
                      value={s.shortCardMaxLines}
                      onChange={(e) => updateSetting('shortCardMaxLines', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Max Preview Lines</Label>
                    <Input
                      type="number"
                      value={s.maxPreviewLines}
                      onChange={(e) => updateSetting('maxPreviewLines', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vertical Positioning */}
            <Card>
              <CardHeader>
                <CardTitle>Vertical Positioning (pixels)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Top Half Padding</Label>
                    <Input
                      type="number"
                      value={s.longCardTopPadding}
                      onChange={(e) => updateSetting('longCardTopPadding', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">For long cards (&gt;13 lines)</p>
                  </div>
                  <div>
                    <Label>Short Card Top Offset</Label>
                    <Input
                      type="number"
                      value={s.topHalfPaddingTop}
                      onChange={(e) => updateSetting('topHalfPaddingTop', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">For short cards (≤13 lines)</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Gap Above Fold</Label>
                    <Input
                      type="number"
                      value={s.gapAboveFold}
                      onChange={(e) => updateSetting('gapAboveFold', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Gap Below Fold</Label>
                    <Input
                      type="number"
                      value={s.gapBelowFold}
                      onChange={(e) => updateSetting('gapBelowFold', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Natural Handwriting Indents */}
            <Card>
              <CardHeader>
                <CardTitle>Natural Handwriting Indents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Max Indent (px)</Label>
                    <Input
                      type="number"
                      value={s.maxIndent}
                      onChange={(e) => updateSetting('maxIndent', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Drift Amplitude</Label>
                    <Input
                      type="number"
                      value={s.indentAmplitude}
                      onChange={(e) => updateSetting('indentAmplitude', e.target.value)}
                      step={0.1}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Random Noise (px)</Label>
                    <Input
                      type="number"
                      value={s.indentNoise}
                      onChange={(e) => updateSetting('indentNoise', e.target.value)}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <Label>Drift Frequency</Label>
                    <Input
                      type="number"
                      value={s.indentFrequency}
                      onChange={(e) => updateSetting('indentFrequency', e.target.value)}
                      step={0.05}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Frame Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle>Frame Dimensions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Frame Width (px)</Label>
                    <Input
                      type="number"
                      value={s.frameWidth}
                      onChange={(e) => updateSetting('frameWidth', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Frame Height (px)</Label>
                    <Input
                      type="number"
                      value={s.frameHeight}
                      onChange={(e) => updateSetting('frameHeight', e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  These control the exact size of the preview window across the app
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right: Live Preview */}
          <div className="col-span-7">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <CardPreview
                  message={TEST_MESSAGES[testMessage]}
                  client={SAMPLE_CLIENT}
                  user={SAMPLE_USER}
                  noteStyleProfile={SAMPLE_NOTE_PROFILE}
                  selectedDesign={null}
                  previewSettings={localSettings.cardPreviewSettings}
                  includeGreeting={s.includeGreeting}
                  includeSignature={s.includeSignature}
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
