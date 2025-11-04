import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import SuperAdminLayout from '@/components/sa/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, RotateCcw, CheckCircle, AlertCircle, Layout } from 'lucide-react';

export default function AdminCreateContentLayout() {
  const [settings, setSettings] = useState(null);
  const [localSettings, setLocalSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await base44.functions.invoke('getCreateContentLayoutSettings');
      setSettings(response.data);
      setLocalSettings(response.data);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError(err.response?.data?.error || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const validateSettings = (settings) => {
    const total = settings.leftColumnSpan + settings.centerColumnSpan + settings.rightColumnSpan;
    if (total !== 12) {
      return `Column spans must add up to 12 (current total: ${total})`;
    }
    if (settings.leftColumnSpan < 1 || settings.leftColumnSpan > 12 ||
        settings.centerColumnSpan < 1 || settings.centerColumnSpan > 12 ||
        settings.rightColumnSpan < 1 || settings.rightColumnSpan > 12) {
      return 'Each column span must be between 1 and 12';
    }
    return null;
  };

  const handleSave = async () => {
    const validationErr = validateSettings(localSettings);
    if (validationErr) {
      setValidationError(validationErr);
      return;
    }

    try {
      setSaving(true);
      setSaveStatus(null);
      setValidationError(null);
      await base44.functions.invoke('updateCreateContentLayoutSettings', localSettings);
      setSettings(localSettings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSaveStatus('error');
      setValidationError(err.response?.data?.error || 'Failed to save settings');
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setSaveStatus(null);
    setValidationError(null);
  };

  const updateSetting = (key, value) => {
    const numValue = parseInt(value) || 0;
    setLocalSettings(prev => ({
      ...prev,
      [key]: numValue
    }));
    setValidationError(null);
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(localSettings);
  
  const total = localSettings ? 
    localSettings.leftColumnSpan + localSettings.centerColumnSpan + localSettings.rightColumnSpan : 0;

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

  return (
    <SuperAdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Content Layout</h1>
            <p className="text-gray-600 mt-1">
              Adjust column widths for the Create Content page
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
        
        {(saveStatus === 'error' || validationError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{validationError || 'Failed to save settings. Please try again.'}</span>
          </div>
        )}

        {/* Column Width Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Column Widths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Total Grid Columns:</strong> {total} / 12
              </p>
              <p className="text-xs text-gray-500">
                The three columns must add up to exactly 12 to use the full width.
              </p>
              {total !== 12 && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  ⚠️ Total must equal 12. Adjust the values below.
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Left Column
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={localSettings.leftColumnSpan}
                    onChange={(e) => updateSetting('leftColumnSpan', e.target.value)}
                    min={1}
                    max={12}
                    className="text-center text-lg font-semibold"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    /12
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Recipients + Template Library
                </p>
              </div>

              {/* Center Column */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Center Column
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={localSettings.centerColumnSpan}
                    onChange={(e) => updateSetting('centerColumnSpan', e.target.value)}
                    min={1}
                    max={12}
                    className="text-center text-lg font-semibold"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    /12
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Message Editor
                </p>
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Right Column
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={localSettings.rightColumnSpan}
                    onChange={(e) => updateSetting('rightColumnSpan', e.target.value)}
                    min={1}
                    max={12}
                    className="text-center text-lg font-semibold"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    /12
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Card Preview
                </p>
              </div>
            </div>

            {/* Visual Representation */}
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Visual Preview
              </Label>
              <div className="grid grid-cols-12 gap-2 h-24 border border-gray-300 rounded-lg overflow-hidden">
                <div 
                  className={`col-span-${localSettings.leftColumnSpan} bg-indigo-200 flex items-center justify-center text-indigo-900 font-semibold`}
                  style={{ gridColumn: `span ${localSettings.leftColumnSpan}` }}
                >
                  Left ({localSettings.leftColumnSpan})
                </div>
                <div 
                  className={`col-span-${localSettings.centerColumnSpan} bg-purple-200 flex items-center justify-center text-purple-900 font-semibold`}
                  style={{ gridColumn: `span ${localSettings.centerColumnSpan}` }}
                >
                  Center ({localSettings.centerColumnSpan})
                </div>
                <div 
                  className={`col-span-${localSettings.rightColumnSpan} bg-pink-200 flex items-center justify-center text-pink-900 font-semibold`}
                  style={{ gridColumn: `span ${localSettings.rightColumnSpan}` }}
                >
                  Right ({localSettings.rightColumnSpan})
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Quick Presets
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setLocalSettings({ leftColumnSpan: 4, centerColumnSpan: 4, rightColumnSpan: 4 })}
                  className="text-sm"
                >
                  Equal (4-4-4)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocalSettings({ leftColumnSpan: 5, centerColumnSpan: 3, rightColumnSpan: 4 })}
                  className="text-sm"
                >
                  Default (5-3-4)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocalSettings({ leftColumnSpan: 3, centerColumnSpan: 5, rightColumnSpan: 4 })}
                  className="text-sm"
                >
                  Wide Center (3-5-4)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Layout Tips:</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Left column contains Recipients list and Template Library</li>
            <li>• Center column contains Message Editor and controls</li>
            <li>• Right column contains Card Preview</li>
            <li>• Changes take effect immediately for all users</li>
            <li>• Recommended: Test on different screen sizes after changing</li>
          </ul>
        </div>
      </div>
    </SuperAdminLayout>
  );
}