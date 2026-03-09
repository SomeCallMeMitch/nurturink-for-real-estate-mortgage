import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Loader2, 
  Upload,
  X,
  Copy,
  Check,
  Download,
  AlertTriangle,
  ChevronDown,
  Tag
} from 'lucide-react';
import { uploadImageVariants } from '@/components/utils/imageHelpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PrintReadyFileUploader from './PrintReadyFileUploader';
import { base44 } from '@/api/base44Client';

/**
 * ImageUploader Component
 * Reusable image upload with preview (for digital preview images)
 */
function ImageUploader({ 
  label, 
  sublabel,
  imageUrl, 
  onImageChange, 
  onUpload, 
  uploading,
  aspectRatio = '412/600'
}) {
  if (imageUrl) {
    return (
      <div>
        <p className="text-xs text-gray-600 mb-1 font-medium">{label}</p>
        {sublabel && <p className="text-[10px] text-gray-400 mb-1">{sublabel}</p>}
        <div 
          className="relative border-2 border-gray-300 rounded-lg overflow-hidden" 
          style={{ aspectRatio }}
        >
          <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
          <button
            onClick={() => onImageChange('')}
            className="absolute top-1.5 right-1.5 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
            {label}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-600 mb-1 font-medium">{label}</p>
      {sublabel && <p className="text-[10px] text-gray-400 mb-1">{sublabel}</p>}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors flex flex-col justify-center items-center py-6"
        style={{ aspectRatio }}
      >
        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
        <label className="cursor-pointer">
          <span className="px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 inline-block text-xs">
            {uploading ? (
              <><Loader2 className="w-3 h-3 animate-spin inline mr-1" />Uploading...</>
            ) : 'Upload'}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}

/**
 * CardDesignFormWithUpload Component
 * 
 * Enhanced version of CardDesignForm that uses file upload components
 * for print-ready files instead of URL text inputs.
 * 
 * Key differences from original CardDesignForm:
 * - Print-ready front/back use PrintReadyFileUploader (private storage)
 * - Digital preview images still use public storage (ImageUploader)
 * 
 * Layout:
 * - Header: Title + Cancel/Save buttons
 * - Row 1: Design Name + Default checkbox
 * - Row 2: Inside | Outside | [Front + Back stacked with Categories below]
 * - Row 3: Print-Ready file uploads side by side
 */
export default function CardDesignFormWithUpload({
  open,
  onOpenChange,
  editingDesign,
  categories = [],
  onSave,
  onUploadFile
}) {
  const [form, setForm] = useState({
    name: '',
    insideImageUrl: '',
    outsideImageUrl: '',
    outsideImageVariants: null,
    frontImageUrl: '',
    backImageUrl: '',
    cardDesignCategoryIds: [],
    type: 'platform',
    printReadyFrontUri: '',  // Changed from printReadyFrontUrl - now stores file_uri
    printReadyBackUri: '',   // Changed from printReadyBackUrl - now stores file_uri
    isDefault: false
  });
  
  const [uploading, setUploading] = useState({
    inside: false,
    outside: false,
    front: false,
    back: false
  });
  
  // Scribe ZIP display state
  const [copiedZipUri, setCopiedZipUri] = useState(false);
  const [signedZipUrl, setSignedZipUrl] = useState(null);
  const [isGeneratingSignedUrl, setIsGeneratingSignedUrl] = useState(false);

  // Reset form when modal opens/closes or editing design changes
  useEffect(() => {
    if (open) {
      if (editingDesign) {
        setForm({
          name: editingDesign.name || '',
          insideImageUrl: editingDesign.insideImageUrl || editingDesign.imageUrl || '',
          outsideImageUrl: editingDesign.outsideImageUrl || '',
          frontImageUrl: editingDesign.frontImageUrl || '',
          backImageUrl: editingDesign.backImageUrl || '',
          cardDesignCategoryIds: editingDesign.cardDesignCategoryIds || [],
          type: editingDesign.type || 'platform',
          // Support both old URL format and new URI format
          printReadyFrontUri: editingDesign.printReadyFrontUri || editingDesign.printReadyFrontUrl || '',
          printReadyBackUri: editingDesign.printReadyBackUri || editingDesign.printReadyBackUrl || '',
          isDefault: editingDesign.isDefault || false
        });
      } else {
        setForm({
          name: '',
          insideImageUrl: '',
          outsideImageUrl: '',
          outsideImageVariants: null,
          frontImageUrl: '',
          backImageUrl: '',
          cardDesignCategoryIds: [],
          type: 'platform',
          printReadyFrontUri: '',
          printReadyBackUri: '',
          isDefault: false
        });
      }
    }
  }, [open, editingDesign]);

  // Generate signed URL for ZIP download when editing a design with scribeZipUrl
  useEffect(() => {
    if (open && editingDesign?.scribeZipUrl) {
      const generateSignedUrl = async () => {
        setIsGeneratingSignedUrl(true);
        try {
          const response = await base44.integrations.Core.CreateFileSignedUrl({
            file_uri: editingDesign.scribeZipUrl,
            expires_in: 3600
          });
          setSignedZipUrl(response.signed_url);
        } catch (error) {
          console.error("Failed to generate signed URL for ZIP:", error);
          setSignedZipUrl(null);
        } finally {
          setIsGeneratingSignedUrl(false);
        }
      };
      generateSignedUrl();
    } else {
      setSignedZipUrl(null);
    }
  }, [open, editingDesign?.scribeZipUrl]);

  const handleCopyZipUri = async () => {
    if (editingDesign?.scribeZipUrl) {
      await navigator.clipboard.writeText(editingDesign.scribeZipUrl);
      setCopiedZipUri(true);
      setTimeout(() => setCopiedZipUri(false), 2000);
    }
  };

  const handleDownloadZip = () => {
    if (signedZipUrl) {
      window.open(signedZipUrl, '_blank');
    }
  };

  // Handle digital preview image uploads (public storage)
  const handleUpload = async (field, file) => {
    try {
      setUploading(prev => ({ ...prev, [field]: true }));
      
      if (field === 'outside') {
        // Use client-side generation for outside variants
        const variants = await uploadImageVariants(file);
        
        // Extract derived variants only (w600, w400, w200) for storage
        const derivedVariants = {
          w600: variants.w600,
          w400: variants.w400,
          w200: variants.w200
        };
        
        setForm(prev => ({ 
          ...prev, 
          outsideImageUrl: variants.full, // Canonical full
          outsideImageVariants: derivedVariants
        }));
      } else {
        // Standard upload for other images
        const url = await onUploadFile(file);
        setForm(prev => ({ ...prev, [`${field}ImageUrl`]: url }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
      // Fallback or error handling
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setForm(prev => ({
      ...prev,
      cardDesignCategoryIds: prev.cardDesignCategoryIds.includes(categoryId)
        ? prev.cardDesignCategoryIds.filter(id => id !== categoryId)
        : [...prev.cardDesignCategoryIds, categoryId]
    }));
  };

  const handleSave = () => {
    // Map new URI fields back to the expected schema field names
    const saveData = {
      ...form,
      // Store URIs in the existing schema fields (they can hold URIs or URLs)
      printReadyFrontUrl: form.printReadyFrontUri,
      printReadyBackUrl: form.printReadyBackUri
    };
    // Remove the temporary URI fields before saving
    delete saveData.printReadyFrontUri;
    delete saveData.printReadyBackUri;
    
    onSave(saveData, editingDesign);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1330px] p-0 gap-0">
        {/* Header with Actions */}
        <DialogHeader className="pl-6 pr-10 py-4 border-b flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle>{editingDesign ? 'Edit Card Design' : 'New Card Design'}</DialogTitle>
            <p className="text-sm text-gray-500 mt-0.5">
              {editingDesign ? 'Update card design details' : 'Create a new platform-wide card design'}
            </p>
          </div>
          <div className="flex gap-3 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-[#c87533] hover:bg-[#b5682e] text-white"
            >
              Save Design
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Row 1: Design Name + Categories Dropdown + Default Checkbox */}
          <div className="flex gap-4 items-end">
            {/* Design Name - reduced width */}
            <div className="flex-1 min-w-0">
              <Label htmlFor="design-name">Design Name *</Label>
              <Input
                id="design-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Thank You - White"
                className="mt-1"
              />
            </div>
            {/* Categories Multi-Select Dropdown */}
            <CategoryDropdown
              categories={categories}
              selectedIds={form.cardDesignCategoryIds}
              onToggle={handleCategoryToggle}
            />
            {/* Default Checkbox */}
            <div className="flex items-center space-x-2 pb-2 shrink-0">
              <Checkbox
                id="isDefault"
                checked={form.isDefault}
                onCheckedChange={(checked) => setForm({ ...form, isDefault: checked })}
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <label htmlFor="isDefault" className="text-sm font-medium cursor-pointer whitespace-nowrap">
                Set as default design
              </label>
            </div>
          </div>

          {/* Card Images — 4-column grid: Inside | Outside | Front+PrintFront | Back+PrintBack */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Card Images *</Label>
            <div className="grid grid-cols-4 gap-4">
              {/* Inside Image (tall) */}
              <ImageUploader
                label="Inside"
                sublabel="Digital preview"
                imageUrl={form.insideImageUrl}
                onImageChange={(url) => setForm({ ...form, insideImageUrl: url })}
                onUpload={(file) => handleUpload('inside', file)}
                uploading={uploading.inside}
                aspectRatio="412/600"
              />
              
              {/* Outside Image (tall) + variant indicator */}
              <div className="flex flex-col gap-1">
                <ImageUploader
                  label="Outside"
                  sublabel="Digital preview"
                  imageUrl={form.outsideImageUrl}
                  onImageChange={(url) => setForm({ ...form, outsideImageUrl: url, outsideImageVariants: null })}
                  onUpload={(file) => handleUpload('outside', file)}
                  uploading={uploading.outside}
                  aspectRatio="412/600"
                />
                {/* Variant Status Indicator */}
                {form.outsideImageUrl && (
                  <div className="flex items-center gap-1.5 px-1">
                    {uploading.outside ? (
                      <span className="text-[10px] text-blue-600 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Generating...
                      </span>
                    ) : form.outsideImageVariants?.w600 ? (
                      <span className="text-[10px] text-green-600 flex items-center gap-1" title="All sizes generated">
                        <Check className="w-3 h-3" /> Variants: Generated
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600 flex items-center gap-1" title="Missing resized variants">
                        <AlertTriangle className="w-3 h-3" /> Variants: Missing
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Right side: Front/Back + Print-Ready stacked below each */}
              <div className="col-span-2 flex flex-col gap-3">
                {/* Front and Back side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <ImageUploader
                    label="Front"
                    sublabel="Physical card"
                    imageUrl={form.frontImageUrl}
                    onImageChange={(url) => setForm({ ...form, frontImageUrl: url })}
                    onUpload={(file) => handleUpload('front', file)}
                    uploading={uploading.front}
                    aspectRatio="412/300"
                  />
                  
                  <ImageUploader
                    label="Back"
                    sublabel="Physical card"
                    imageUrl={form.backImageUrl}
                    onImageChange={(url) => setForm({ ...form, backImageUrl: url })}
                    onUpload={(file) => handleUpload('back', file)}
                    uploading={uploading.back}
                    aspectRatio="412/300"
                  />
                </div>
                
                {/* Print-Ready files directly below Front/Back — compact layout */}
                <div className="grid grid-cols-2 gap-3">
                  <PrintReadyFileUploader
                    label="Print-Ready Outside"
                    sublabel="Cover (1.png in ZIP)"
                    fileUri={form.printReadyFrontUri}
                    onFileUriChange={(uri) => setForm({ ...form, printReadyFrontUri: uri })}
                    accept=".pdf,.png,.jpg,.jpeg"
                    maxSizeMB={10}
                    compact
                  />
                  <PrintReadyFileUploader
                    label="Print-Ready Inside"
                    sublabel="Interior (2.png in ZIP)"
                    fileUri={form.printReadyBackUri}
                    onFileUriChange={(uri) => setForm({ ...form, printReadyBackUri: uri })}
                    accept=".pdf,.png,.jpg,.jpeg"
                    maxSizeMB={10}
                    compact
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Scribe ZIP URL Display - Only shown when editing a design with a generated ZIP */}
          {editingDesign?.scribeZipUrl && (
            <div className="pt-4 border-t">
              <Label className="text-sm font-semibold mb-2 block">Generated Scribe ZIP</Label>
              <p className="text-xs text-gray-500 mb-3">
                This ZIP contains outside (1.png) and inside (2.png) images for Scribe Nurture API.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={editingDesign.scribeZipUrl}
                  readOnly
                  className="flex-1 font-mono text-xs bg-gray-50"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleCopyZipUri}
                  title="Copy ZIP URI"
                >
                  {copiedZipUri ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={handleDownloadZip} 
                  disabled={isGeneratingSignedUrl || !signedZipUrl}
                  title="Download ZIP"
                >
                  {isGeneratingSignedUrl ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}