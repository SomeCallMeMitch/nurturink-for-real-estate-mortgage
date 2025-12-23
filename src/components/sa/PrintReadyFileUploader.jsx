import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { 
  Loader2, 
  Upload, 
  FileText,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

/**
 * PrintReadyFileUploader Component
 * 
 * Handles uploading print-ready files (PDFs, high-res images) to Base44 private storage.
 * Used in the Card Design management flow for uploading print-ready front/back files.
 * 
 * Files are stored privately and accessed via signed URLs when needed for print package generation.
 */
export default function PrintReadyFileUploader({
  label,
  sublabel,
  fileUri,
  onFileUriChange,
  accept = ".pdf,.png,.jpg,.jpeg",
  maxSizeMB = 10
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);

  // Handle file selection and upload
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setError(null);
    setUploading(true);
    setFileName(file.name);

    try {
      // Upload to Base44 private storage
      const response = await base44.integrations.Core.UploadPrivateFile({ file });
      
      if (response?.file_uri) {
        onFileUriChange(response.file_uri);
      } else {
        throw new Error('No file_uri returned from upload');
      }
    } catch (err) {
      console.error('Print-ready file upload failed:', err);
      setError('Upload failed. Please try again.');
      setFileName(null);
    } finally {
      setUploading(false);
    }
  };

  // Clear the uploaded file
  const handleClear = () => {
    onFileUriChange('');
    setFileName(null);
    setError(null);
  };

  // Extract filename from URI for display
  const displayName = fileName || (fileUri ? fileUri.split('/').pop() : null);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}

      {/* Upload state: No file uploaded yet */}
      {!fileUri && !uploading && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <label className="cursor-pointer">
            <span className="px-3 py-1.5 bg-gray-800 text-white rounded hover:bg-gray-700 inline-block text-sm">
              Choose File
            </span>
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">
            PDF or image, max {maxSizeMB}MB
          </p>
        </div>
      )}

      {/* Uploading state */}
      {uploading && (
        <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4 text-center">
          <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
          <p className="text-sm text-blue-700">Uploading {fileName}...</p>
        </div>
      )}

      {/* File uploaded state */}
      {fileUri && !uploading && (
        <div className="border-2 border-green-200 bg-green-50 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800 truncate max-w-[200px]">
                {displayName || 'File uploaded'}
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Stored securely
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}