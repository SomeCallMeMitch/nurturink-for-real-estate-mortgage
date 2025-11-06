import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import SuperAdminLayout from '@/components/sa/SuperAdminLayout';
import EnvelopePreview from '@/components/preview/EnvelopePreview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, Save, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { debounce } from 'lodash';

// Sample data for preview
const SAMPLE_CLIENT = {
  firstName: 'John',
  lastName: 'Smith',
  fullName: 'John Smith',
  street: '123 Main Street',
  city: 'Denver',
  state: 'CO',
  zipCode: '80202'
};

const SAMPLE_USER = {
  full_name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '(555) 123-4567'
};

const SAMPLE_ORG = {
  name: 'RoofScribe Inc',
  companyReturnAddress: {
    street: '456 Business Ave',
    city: 'Boulder',
    state: 'CO',
    zip: '80301'
  }
};

export default function AdminEnvelopeLayout() {
  const { toast } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [localSettings, setLocalSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await base44.functions.invoke('getInstanceSettings');
      const data = response.data;
      
      setSettings(data);
      setLocalSettings(data.envelopeLayoutSettings || {});
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load envelope settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Debounced save function
  const debouncedSave = useMemo(
    () => debounce(async (envelopeSettings) => {
      try {
        setSaving(true);
        await base44.functions.invoke('updateInstanceSettings', {
          envelopeLayoutSettings: envelopeSettings
        });
        setSaving(false);
        
        toast({
          title: 'Settings saved',
          description: 'Envelope layout settings updated successfully',
          duration: 2000
        });
      } catch (error) {
        console.error('Failed to save settings:', error);
        setSaving(false);
        
        const errorMessage = error.response?.data?.details 
          ? error.response.data.details.join(', ')
          : 'Failed to save settings';
        
        toast({
          title: 'Save failed',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }, 1000),
    [toast]
  );
  
  // Update local setting and trigger save
  const updateSetting = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    debouncedSave(newSettings);
  };
  
  // Handle image upload
  const handleImageUpload = async (file) => {
    try {
      setUploadingImage(true);
      const response = await base44.integrations.Core.UploadFile({ file });
      updateSetting('envelopeImageUrl', response.file_url);
      
      toast({
        title: 'Image uploaded',
        description: 'Envelope template image uploaded successfully',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload envelope image',
        variant: 'destructive'
      });
    } finally {
      setUploadingImage(false);
    }
  };
  
  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </SuperAdminLayout>
    );
  }
  
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Envelope Layout Settings</h1>
            <p className="text-gray-600 mt-1">Configure envelope template, typography, and address positioning</p>
          </div>
          
          {/* Save Status */}
          <div className="flex items-center gap-2 text-sm">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-blue-600">Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Saved</span>
              </>
            )}
          </div>
        </div>
        
        {/* Two-Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column: Settings */}
          <div className="space-y-6">
            {/* Envelope Template Image */}
            <Card>
              <CardHeader>
                <CardTitle>Envelope Template Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {localSettings?.envelopeImageUrl ? (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden border border-gray-200" style={{ maxHeight: '200px' }}>
                      <img
                        src={localSettings.envelopeImageUrl}
                        alt="Envelope template"
                        className="w-full h-full object-contain"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                    <Button
                      onClick={() => updateSetting('envelopeImageUrl', '')}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-3">Upload an envelope template image</p>
                    <label className="cursor-pointer">
                      <span className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 inline-block">
                        {uploadingImage ? (
                          <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Uploading...</>
                        ) : (
                          'Choose File'
                        )}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Typography Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select
                    value={localSettings?.envelopeFontFamily || 'Caveat'}
                    onValueChange={(value) => updateSetting('envelopeFontFamily', value)}
                  >
                    <SelectTrigger id="font-family">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Caveat">Caveat</SelectItem>
                      <SelectItem value="Kalam">Kalam</SelectItem>
                      <SelectItem value="Patrick Hand">Patrick Hand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="font-size">Font Size (px)</Label>
                  <Input
                    id="font-size"
                    type="number"
                    min="8"
                    max="72"
                    value={localSettings?.envelopeFontSize || 18}
                    onChange={(e) => updateSetting('envelopeFontSize', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Valid range: 8-72 pixels</p>
                </div>
                
                <div>
                  <Label htmlFor="line-height">Line Height</Label>
                  <Input
                    id="line-height"
                    type="number"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={localSettings?.envelopeLineHeight || 1.2}
                    onChange={(e) => updateSetting('envelopeLineHeight', parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Valid range: 0.5-3.0</p>
                </div>
                
                <div>
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="text-color"
                      type="text"
                      placeholder="#000000"
                      value={localSettings?.envelopeTextColor || '#000000'}
                      onChange={(e) => updateSetting('envelopeTextColor', e.target.value)}
                      className="flex-1"
                    />
                    <input
                      type="color"
                      value={localSettings?.envelopeTextColor || '#000000'}
                      onChange={(e) => updateSetting('envelopeTextColor', e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Hex color code (e.g., #000000)</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Return Address */}
            <Card>
              <CardHeader>
                <CardTitle>Return Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="return-text">Return Address Text</Label>
                  <Textarea
                    id="return-text"
                    rows={4}
                    value={localSettings?.returnAddressText || ''}
                    onChange={(e) => updateSetting('returnAddressText', e.target.value)}
                    placeholder="{{org.name}}\n{{org.street}}\n{{org.city}}, {{org.state}} {{org.zipCode}}"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use placeholders: {'{{org.name}}'}, {'{{org.street}}'}, {'{{org.city}}'}, {'{{org.state}}'}, {'{{org.zipCode}}'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="return-left">Left Offset (px)</Label>
                    <Input
                      id="return-left"
                      type="number"
                      min="0"
                      value={localSettings?.returnAddressLeftOffset || 20}
                      onChange={(e) => updateSetting('returnAddressLeftOffset', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="return-top">Top Offset (px)</Label>
                    <Input
                      id="return-top"
                      type="number"
                      min="0"
                      value={localSettings?.returnAddressTopOffset || 20}
                      onChange={(e) => updateSetting('returnAddressTopOffset', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recipient Address */}
            <Card>
              <CardHeader>
                <CardTitle>Recipient Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="recipient-left">Left Offset (px)</Label>
                    <Input
                      id="recipient-left"
                      type="number"
                      min="0"
                      value={localSettings?.recipientAddressLeftOffset || 250}
                      onChange={(e) => updateSetting('recipientAddressLeftOffset', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipient-top">Top Offset (px)</Label>
                    <Input
                      id="recipient-top"
                      type="number"
                      min="0"
                      value={localSettings?.recipientAddressTopOffset || 150}
                      onChange={(e) => updateSetting('recipientAddressTopOffset', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Preview Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle>Preview Dimensions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="preview-width">Width (px)</Label>
                    <Input
                      id="preview-width"
                      type="number"
                      min="100"
                      max="2000"
                      value={localSettings?.envelopePreviewWidth || 500}
                      onChange={(e) => updateSetting('envelopePreviewWidth', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="preview-height">Height (px)</Label>
                    <Input
                      id="preview-height"
                      type="number"
                      min="100"
                      max="2000"
                      value={localSettings?.envelopePreviewHeight || 300}
                      onChange={(e) => updateSetting('envelopePreviewHeight', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Valid range: 100-2000 pixels</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column: Live Preview */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  {localSettings && (
                    <EnvelopePreview
                      envelopeSettings={localSettings}
                      client={SAMPLE_CLIENT}
                      user={SAMPLE_USER}
                      organization={SAMPLE_ORG}
                    />
                  )}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Preview Data
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Client:</strong> {SAMPLE_CLIENT.fullName}</p>
                    <p><strong>Address:</strong> {SAMPLE_CLIENT.street}, {SAMPLE_CLIENT.city}, {SAMPLE_CLIENT.state} {SAMPLE_CLIENT.zipCode}</p>
                    <p><strong>User:</strong> {SAMPLE_USER.full_name}</p>
                    <p><strong>Organization:</strong> {SAMPLE_ORG.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}