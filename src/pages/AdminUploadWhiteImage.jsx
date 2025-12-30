import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Copy, Check, Image as ImageIcon } from 'lucide-react';
import SuperAdminLayout from '@/components/sa/SuperAdminLayout';

/**
 * AdminUploadWhiteImage
 * Simple utility page for uploading the default white inside image
 * and retrieving its URL for the DEFAULT_WHITE_INSIDE_URL secret.
 */
export default function AdminUploadWhiteImage() {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      setUploading(true);
      const response = await base44.integrations.Core.UploadFile({ file });
      setUploadedUrl(response.file_url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(uploadedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SuperAdminLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Upload Default White Image
            </CardTitle>
            <CardDescription>
              Upload a plain white 1375x2000 PNG image to use as the default inside image for card designs.
              After uploading, copy the URL and set it as the DEFAULT_WHITE_INSIDE_URL secret.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileChange}
                className="hidden"
                id="white-image-upload"
                disabled={uploading}
              />
              <label
                htmlFor="white-image-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload className="w-10 h-10 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to select white image (PNG recommended)'}
                </span>
                <span className="text-xs text-gray-400">
                  Recommended size: 1375 x 2000 pixels
                </span>
              </label>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Preview:</p>
                <div className="border rounded-lg p-2 bg-gray-50">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 mx-auto border"
                  />
                </div>
              </div>
            )}

            {/* URL Output */}
            {uploadedUrl && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Uploaded URL:</p>
                <div className="flex gap-2">
                  <Input
                    value={uploadedUrl}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button onClick={handleCopy} variant="outline" size="icon">
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Copy this URL and paste it into Dashboard → Secrets → DEFAULT_WHITE_INSIDE_URL
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}