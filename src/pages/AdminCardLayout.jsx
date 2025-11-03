import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import SuperAdminLayout from '@/components/sa/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  full_name: "Mike Johnson",
  firstName: "Mike",
  lastName: "Johnson",
  companyName: "RoofScribe",
  phone: "(555) 123-4567"
};

const SAMPLE_NOTE_PROFILE = {
  name: "Professional",
  defaultGreeting: "Dear {{firstName}},",
  signatureText: "Sincerely,\n{{rep_full_name}}\n{{rep_company_name}}",
  handwritingFont: "Caveat"
};

const SAMPLE_MESSAGE = "Thank you for your recent roofing project with us! We truly appreciate your business and hope you're enjoying your new roof.\n\nIf you have any questions or need anything, please don't hesitate to reach out.";

export default function AdminCardLayout() {
  const [settings, setSettings] = useState(null);
  const [localSettings, setLocalSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null
  const [error, setError] = useState(null);
  
  // Preview controls
  const [includeGreeting, setIncludeGreeting] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await base44.functions.invoke('getInstanceSettings');
      setSettings(response.data);
      setLocalSettings(response.data);
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
        [key]: parseFloat(value) || 0
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
            <h1 className="text-3xl font-bold text-gray-900">Card Layout Settings</h1>
            <p className="text-gray-600 mt-1">
              Fine-tune the preview rendering for notecards
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
            {/* Typography */}
            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            {/* Sizing & Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Sizing & Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Base Text Width (px)</Label>
                  <Input
                    type="number"
                    value={s.baseTextWidth}
                    onChange={(e) => updateSetting('baseTextWidth', e.target.value)}
                  />
                </div>
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
              </CardContent>
            </Card>

            {/* Positioning */}
            <Card>
              <CardHeader>
                <CardTitle>Positioning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Base Margin Left (px)</Label>
                  <Input
                    type="number"
                    value={s.baseMarginLeft}
                    onChange={(e) => updateSetting('baseMarginLeft', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Top Half Padding Top (px)</Label>
                  <Input
                    type="number"
                    value={s.topHalfPaddingTop}
                    onChange={(e) => updateSetting('topHalfPaddingTop', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Gap Above Fold (px)</Label>
                  <Input
                    type="number"
                    value={s.gapAboveFold}
                    onChange={(e) => updateSetting('gapAboveFold', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Gap Below Fold (px)</Label>
                  <Input
                    type="number"
                    value={s.gapBelowFold}
                    onChange={(e) => updateSetting('gapBelowFold', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Short Below Fold (px)</Label>
                  <Input
                    type="number"
                    value={s.shortBelowFold}
                    onChange={(e) => updateSetting('shortBelowFold', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Shift Right (px)</Label>
                  <Input
                    type="number"
                    value={s.shiftRight}
                    onChange={(e) => updateSetting('shiftRight', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Right Padding (px)</Label>
                  <Input
                    type="number"
                    value={s.rightPadding}
                    onChange={(e) => updateSetting('rightPadding', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Indentation */}
            <Card>
              <CardHeader>
                <CardTitle>Indentation (Handwritten Effect)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Max Indent (px)</Label>
                  <Input
                    type="number"
                    value={s.maxIndent}
                    onChange={(e) => updateSetting('maxIndent', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Indent Amplitude</Label>
                  <Input
                    type="number"
                    value={s.indentAmplitude}
                    onChange={(e) => updateSetting('indentAmplitude', e.target.value)}
                    step={0.1}
                  />
                </div>
                <div>
                  <Label>Indent Noise</Label>
                  <Input
                    type="number"
                    value={s.indentNoise}
                    onChange={(e) => updateSetting('indentNoise', e.target.value)}
                    step={0.1}
                  />
                </div>
                <div>
                  <Label>Indent Frequency</Label>
                  <Input
                    type="number"
                    value={s.indentFrequency}
                    onChange={(e) => updateSetting('indentFrequency', e.target.value)}
                    step={0.05}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Live Preview */}
          <div className="col-span-7">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <div className="flex gap-4 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeGreeting}
                      onChange={(e) => setIncludeGreeting(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Include Greeting</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSignature}
                      onChange={(e) => setIncludeSignature(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Include Signature</span>
                  </label>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center">
                <CardPreview
                  message={SAMPLE_MESSAGE}
                  client={SAMPLE_CLIENT}
                  user={SAMPLE_USER}
                  noteStyleProfile={SAMPLE_NOTE_PROFILE}
                  selectedDesign={null}
                  previewSettings={localSettings.cardPreviewSettings}
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