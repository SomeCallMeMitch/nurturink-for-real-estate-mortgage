
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Loader2, 
  Save, 
  Palette, 
  Bell, 
  Image as ImageIcon,
  AlertCircle,
  Eye,
  CheckCircle,
  Upload
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function SuperAdminWhitelabel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('branding');
  
  // Form state
  const [settings, setSettings] = useState({
    brandName: 'RoofScribe',
    logoUrl: null,
    faviconUrl: null,
    primaryColor: '#4F46E5',
    accentColor: '#7C3AED',
    backgroundColor: '#F9FAFB',
    fontHeadings: 'Inter',
    fontBody: 'Inter',
    toastDuration: 3000,
    toastPlacement: 'top-right',
    toastSuccessBg: '#F0FDF4',
    toastSuccessText: '#166534',
    toastSuccessBorder: '#86EFAC',
    toastErrorBg: '#FEF2F2',
    toastErrorText: '#991B1B',
    toastErrorBorder: '#FCA5A5',
    toastWarningBg: '#FFFBEB',
    toastWarningText: '#92400E',
    toastWarningBorder: '#FDE68A',
    toastInfoBg: '#EFF6FF',
    toastInfoText: '#1E40AF',
    toastInfoBorder: '#93C5FD'
  });

  const [originalSettings, setOriginalSettings] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (originalSettings) {
      const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
      setHasChanges(changed);
    }
  }, [settings, originalSettings]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      if (currentUser.appRole !== 'super_admin') {
        setError('Access denied. Only super admins can access whitelabel settings.');
        setLoading(false);
        return;
      }
      
      const response = await base44.functions.invoke('getWhitelabelSettings');
      const loadedSettings = response.data.settings;
      
      console.log('📊 Loaded settings:', loadedSettings);
      
      setSettings(loadedSettings);
      setOriginalSettings(loadedSettings);
      
    } catch (err) {
      console.error('Failed to load whitelabel settings:', err);
      setError(err.response?.data?.error || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      await base44.functions.invoke('updateWhitelabelSettings', {
        settings: settings
      });
      
      setOriginalSettings(settings);
      setHasChanges(false);
      
      toast({
        title: 'Settings Saved! ✓',
        description: 'Whitelabel settings have been updated successfully',
        className: 'bg-green-50 border-green-200 text-green-900'
      });
      
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast({
        title: 'Save Failed',
        description: err.response?.data?.error || 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setHasChanges(false);
  };

  const handleImageUpload = async (field, file) => {
    if (!file) return;
    
    try {
      console.log(`📤 Uploading ${field}...`, file.name);
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      console.log(`✅ Upload successful! URL:`, file_url);
      
      setSettings(prev => {
        const updated = {
          ...prev,
          [field]: file_url
        };
        console.log(`📝 Updated settings state:`, updated);
        return updated;
      });
      
      toast({
        title: 'Image Uploaded',
        description: 'Image uploaded successfully'
      });
      
    } catch (err) {
      console.error('Failed to upload image:', err);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload image',
        variant: 'destructive'
      });
    }
  };

  const fontOptions = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Raleway',
    'Nunito',
    'Ubuntu',
    'Playfair Display',
    'Merriweather'
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
              <Button onClick={() => navigate(createPageUrl('Home'))}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('🎨 Current settings state:', settings);
  console.log('🖼️ Logo URL:', settings.logoUrl);
  console.log('🖼️ Favicon URL:', settings.faviconUrl);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Whitelabel Settings</h1>
            <p className="text-lg text-gray-600">Customize the branding and appearance of your application</p>
          </div>
          
          {/* Always Visible Save Button */}
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

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding Assets</CardTitle>
                <CardDescription>Upload logos and configure your brand name</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Brand Name */}
                <div>
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    value={settings.brandName}
                    onChange={(e) => setSettings(prev => ({ ...prev, brandName: e.target.value }))}
                    placeholder="Your Brand Name"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This name will appear in the sidebar and throughout the application
                  </p>
                </div>

                {/* Logo Upload */}
                <div>
                  <Label htmlFor="logo">Main Logo</Label>
                  <div className="mt-2 flex items-start gap-4">
                    {settings.logoUrl ? (
                      <div className="w-32 h-32 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-white p-2">
                        <img 
                          src={settings.logoUrl} 
                          alt="Logo preview" 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            console.error('❌ Logo failed to load:', settings.logoUrl);
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">No Image</text></svg>';
                          }}
                          onLoad={() => console.log('✅ Logo loaded successfully:', settings.logoUrl)}
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <p className="text-xs text-gray-400 text-center px-2">No logo uploaded</p>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('logoUrl', e.target.files[0])}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('logo').click()}
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Logo
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        Recommended: PNG or SVG, max 500KB
                      </p>
                      {settings.logoUrl && (
                        <p className="text-xs text-blue-600 mt-1 font-mono break-all">
                          Current: {settings.logoUrl.substring(0, 50)}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Favicon Upload */}
                <div>
                  <Label htmlFor="favicon">Favicon</Label>
                  <div className="mt-2 flex items-start gap-4">
                    {settings.faviconUrl ? (
                      <div className="w-16 h-16 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-white p-1">
                        <img 
                          src={settings.faviconUrl} 
                          alt="Favicon preview" 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            console.error('❌ Favicon failed to load:', settings.faviconUrl);
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">X</text></svg>';
                          }}
                          onLoad={() => console.log('✅ Favicon loaded successfully:', settings.faviconUrl)}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <p className="text-xs text-gray-400">No icon</p>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        id="favicon"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('faviconUrl', e.target.files[0])}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('favicon').click()}
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Favicon
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        Recommended: 32x32 or 64x64 pixels, ICO or PNG
                      </p>
                      {settings.faviconUrl && (
                        <p className="text-xs text-blue-600 mt-1 font-mono break-all">
                          Current: {settings.faviconUrl.substring(0, 50)}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theming Tab */}
          <TabsContent value="theming">
            <Card>
              <CardHeader>
                <CardTitle>Colors & Fonts</CardTitle>
                <CardDescription>Customize the visual appearance of your application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Color Settings */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        placeholder="#4F46E5"
                        className="font-mono"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Main buttons and primary elements</p>
                  </div>

                  <div>
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <Input
                        id="accentColor"
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={settings.accentColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                        placeholder="#7C3AED"
                        className="font-mono"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Secondary highlights and accents</p>
                  </div>

                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={settings.backgroundColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={settings.backgroundColor}
                        onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        placeholder="#F9FAFB"
                        className="font-mono"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Default page background</p>
                  </div>
                </div>

                {/* Font Settings */}
                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                  <div>
                    <Label htmlFor="fontHeadings">Headings Font</Label>
                    <Select
                      value={settings.fontHeadings}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, fontHeadings: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map(font => (
                          <SelectItem key={font} value={font}>
                            <span style={{ fontFamily: font }}>{font}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Font for headings and titles</p>
                  </div>

                  <div>
                    <Label htmlFor="fontBody">Body Font</Label>
                    <Select
                      value={settings.fontBody}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, fontBody: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map(font => (
                          <SelectItem key={font} value={font}>
                            <span style={{ fontFamily: font }}>{font}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Font for body text and paragraphs</p>
                  </div>
                </div>

                {/* Preview */}
                <div className="pt-4 border-t">
                  <Label>Theme Preview</Label>
                  <div 
                    className="mt-2 p-6 rounded-lg border-2"
                    style={{ backgroundColor: settings.backgroundColor }}
                  >
                    <h2 
                      className="text-2xl font-bold mb-2"
                      style={{ 
                        color: settings.primaryColor,
                        fontFamily: settings.fontHeadings 
                      }}
                    >
                      Heading Example
                    </h2>
                    <p 
                      className="mb-4"
                      style={{ fontFamily: settings.fontBody }}
                    >
                      This is how your body text will appear with the selected font.
                    </p>
                    <Button
                      style={{ 
                        backgroundColor: settings.primaryColor,
                        borderColor: settings.primaryColor
                      }}
                      className="hover:opacity-90"
                    >
                      Primary Button
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
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
                        value={settings.toastDuration}
                        onChange={(e) => setSettings(prev => ({ ...prev, toastDuration: parseInt(e.target.value) }))}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        How long notifications stay visible (1000-30000ms)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="toastPlacement">Placement</Label>
                      <Select
                        value={settings.toastPlacement}
                        onValueChange={(value) => setSettings(prev => ({ ...prev, toastPlacement: value }))}
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
                      <p className="text-xs text-gray-500 mt-1">
                        Where notifications appear on screen
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Success Toast Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Success Notification Colors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Background</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="color"
                          value={settings.toastSuccessBg}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastSuccessBg: e.target.value }))}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.toastSuccessBg}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastSuccessBg: e.target.value }))}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Text</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="color"
                          value={settings.toastSuccessText}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastSuccessText: e.target.value }))}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.toastSuccessText}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastSuccessText: e.target.value }))}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Border</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="color"
                          value={settings.toastSuccessBorder}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastSuccessBorder: e.target.value }))}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.toastSuccessBorder}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastSuccessBorder: e.target.value }))}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div 
                    className="p-4 rounded-lg border-2"
                    style={{
                      backgroundColor: settings.toastSuccessBg,
                      color: settings.toastSuccessText,
                      borderColor: settings.toastSuccessBorder
                    }}
                  >
                    <p className="font-semibold">Success! ✓</p>
                    <p className="text-sm">This is how a success notification will look</p>
                  </div>
                </CardContent>
              </Card>

              {/* Error Toast Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Error Notification Colors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Background</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="color"
                          value={settings.toastErrorBg}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastErrorBg: e.target.value }))}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.toastErrorBg}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastErrorBg: e.target.value }))}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Text</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="color"
                          value={settings.toastErrorText}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastErrorText: e.target.value }))}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.toastErrorText}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastErrorText: e.target.value }))}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Border</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="color"
                          value={settings.toastErrorBorder}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastErrorBorder: e.target.value }))}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.toastErrorBorder}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastErrorBorder: e.target.value }))}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div 
                    className="p-4 rounded-lg border-2"
                    style={{
                      backgroundColor: settings.toastErrorBg,
                      color: settings.toastErrorText,
                      borderColor: settings.toastErrorBorder
                    }}
                  >
                    <p className="font-semibold">Error!</p>
                    <p className="text-sm">This is how an error notification will look</p>
                  </div>
                </CardContent>
              </Card>

              {/* Warning Toast Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    Warning Notification Colors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Background</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="color"
                          value={settings.toastWarningBg}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastWarningBg: e.target.value }))}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.toastWarningBg}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastWarningBg: e.target.value }))}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Text</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="color"
                          value={settings.toastWarningText}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastWarningText: e.target.value }))}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.toastWarningText}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastWarningText: e.target.value }))}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Border</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="color"
                          value={settings.toastWarningBorder}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastWarningBorder: e.target.value }))}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.toastWarningBorder}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastWarningBorder: e.target.value }))}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div 
                    className="p-4 rounded-lg border-2"
                    style={{
                      backgroundColor: settings.toastWarningBg,
                      color: settings.toastWarningText,
                      borderColor: settings.toastWarningBorder
                    }}
                  >
                    <p className="font-semibold">Warning!</p>
                    <p className="text-sm">This is how a warning notification will look</p>
                  </div>
                </CardContent>
              </Card>

              {/* Info Toast Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    Info Notification Colors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Background</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="color"
                          value={settings.toastInfoBg}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastInfoBg: e.target.value }))}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.toastInfoBg}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastInfoBg: e.target.value }))}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Text</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="color"
                          value={settings.toastInfoText}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastInfoText: e.target.value }))}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.toastInfoText}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastInfoText: e.target.value }))}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Border</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="color"
                          value={settings.toastInfoBorder}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastInfoBorder: e.target.value }))}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.toastInfoBorder}
                          onChange={(e) => setSettings(prev => ({ ...prev, toastInfoBorder: e.target.value }))}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div 
                    className="p-4 rounded-lg border-2"
                    style={{
                      backgroundColor: settings.toastInfoBg,
                      color: settings.toastInfoText,
                      borderColor: settings.toastInfoBorder
                    }}
                  >
                    <p className="font-semibold">Info</p>
                    <p className="text-sm">This is how an info notification will look</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom Save Button - Always Visible */}
        <Card className={`mt-6 ${hasChanges ? 'border-2 border-indigo-300 bg-indigo-50' : 'border border-gray-200'}`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className={hasChanges ? 'text-indigo-900 font-semibold' : 'text-gray-600'}>
                {hasChanges ? 'Ready to apply your changes?' : 'No unsaved changes'}
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
