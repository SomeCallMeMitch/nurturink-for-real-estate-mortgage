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
  maxSizeMB = 10,
  compact = false
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
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <Label className={compact ? "text-xs font-medium" : "text-sm font-medium"}>{label}</Label>
      {sublabel && <p className="text-[10px] text-gray-500">{sublabel}</p>}

      {/* Upload state: No file uploaded yet */}
      {!fileUri && !uploading && (
        <div className={`border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors ${compact ? 'p-2' : 'p-4'}`}>
          <Upload className={`text-gray-400 mx-auto ${compact ? 'w-5 h-5 mb-1' : 'w-8 h-8 mb-2'}`} />
          <label className="cursor-pointer">
            <span className={`bg-gray-800 text-white rounded hover:bg-gray-700 inline-block ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}`}>
              Choose File
            </span>
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
          <p className={`text-gray-500 ${compact ? 'text-[10px] mt-1' : 'text-xs mt-2'}`}>
            PDF or image, max {maxSizeMB}MB
          </p>
        </div>
      )}

      {/* Uploading state */}
      {uploading && (
        <div className={`border-2 border-blue-200 bg-blue-50 rounded-lg text-center ${compact ? 'p-2' : 'p-4'}`}>
          <Loader2 className={`text-blue-500 mx-auto animate-spin ${compact ? 'w-5 h-5 mb-1' : 'w-8 h-8 mb-2'}`} />
          <p className={`text-blue-700 ${compact ? 'text-xs' : 'text-sm'}`}>Uploading...</p>
        </div>
      )}

      {/* File uploaded state */}
      {fileUri && !uploading && (
        <div className={`border-2 border-green-200 bg-green-50 rounded-lg flex items-center justify-between ${compact ? 'p-2' : 'p-3'}`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className={`bg-green-100 rounded-full flex items-center justify-center shrink-0 ${compact ? 'w-6 h-6' : 'w-8 h-8'}`}>
              <FileText className={`text-green-600 ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
            </div>
            <div className="min-w-0">
              <p className={`font-medium text-green-800 truncate ${compact ? 'text-xs max-w-[120px]' : 'text-sm max-w-[200px]'}`}>
                {displayName || 'File uploaded'}
              </p>
              <p className="text-[10px] text-green-600 flex items-center gap-1">
                <Check className="w-2.5 h-2.5" /> Stored
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className={`flex items-center gap-2 text-red-600 ${compact ? 'text-xs' : 'text-sm'}`}>
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
    </div>
  );
}