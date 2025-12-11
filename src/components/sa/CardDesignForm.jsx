import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Loader2, 
  Upload,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * ImageUploader Component
 * Reusable image upload with preview
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
 * CardDesignForm Component
 * Modal form for creating/editing card designs
 * 
 * Layout:
 * - Header: Title + Cancel/Save buttons
 * - Row 1: Design Name + Default checkbox
 * - Row 2: Inside | Outside | [Front + Back stacked with Categories below]
 * - Row 3: Print-Ready URLs side by side
 */
export default function CardDesignForm({
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
    frontImageUrl: '',
    backImageUrl: '',
    cardDesignCategoryIds: [],
    type: 'platform',
    printReadyFrontUrl: '',
    printReadyBackUrl: '',
    isDefault: false
  });
  
  const [uploading, setUploading] = useState({
    inside: false,
    outside: false,
    front: false,
    back: false
  });

  // Reset form when modal opens/closes or editing design changes
  React.useEffect(() => {
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
          printReadyFrontUrl: editingDesign.printReadyFrontUrl || '',
          printReadyBackUrl: editingDesign.printReadyBackUrl || '',
          isDefault: editingDesign.isDefault || false
        });
      } else {
        setForm({
          name: '',
          insideImageUrl: '',
          outsideImageUrl: '',
          frontImageUrl: '',
          backImageUrl: '',
          cardDesignCategoryIds: [],
          type: 'platform',
          printReadyFrontUrl: '',
          printReadyBackUrl: '',
          isDefault: false
        });
      }
    }
  }, [open, editingDesign]);

  const handleUpload = async (field, file) => {
    try {
      setUploading(prev => ({ ...prev, [field]: true }));
      const url = await onUploadFile(file);
      setForm(prev => ({ ...prev, [`${field}ImageUrl`]: url }));
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
    onSave(form, editingDesign);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1210px] p-0 gap-0">
        {/* Header with Actions */}
        <DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between space-y-0">
          <div>
            <DialogTitle>{editingDesign ? 'Edit Card Design' : 'New Card Design'}</DialogTitle>
            <p className="text-sm text-gray-500 mt-0.5">
              {editingDesign ? 'Update card design details' : 'Create a new platform-wide card design'}
            </p>
          </div>
          <div className="flex gap-3">
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

        <div className="p-6 space-y-5">
          {/* Design Name + Default Checkbox */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="design-name">Design Name *</Label>
              <Input
                id="design-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Thank You - White"
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-2 pb-2">
              <Checkbox
                id="isDefault"
                checked={form.isDefault}
                onCheckedChange={(checked) => setForm({ ...form, isDefault: checked })}
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <label htmlFor="isDefault" className="text-sm font-medium cursor-pointer">
                Set as default design
              </label>
            </div>
          </div>

          {/* Card Images */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Card Images *</Label>
            <div className="grid grid-cols-4 gap-4">
              {/* Inside Image */}
              <ImageUploader
                label="Inside"
                sublabel="Digital preview"
                imageUrl={form.insideImageUrl}
                onImageChange={(url) => setForm({ ...form, insideImageUrl: url })}
                onUpload={(file) => handleUpload('inside', file)}
                uploading={uploading.inside}
                aspectRatio="412/600"
              />
              
              {/* Outside Image */}
              <ImageUploader
                label="Outside"
                sublabel="Digital preview"
                imageUrl={form.outsideImageUrl}
                onImageChange={(url) => setForm({ ...form, outsideImageUrl: url })}
                onUpload={(file) => handleUpload('outside', file)}
                uploading={uploading.outside}
                aspectRatio="412/600"
              />
              
              {/* Right side: Front, Back, Categories stacked */}
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
                
                {/* Categories below Front/Back */}
                <div className="flex-1">
                  <Label className="text-xs font-medium mb-1.5 block">Categories</Label>
                  <div className="border border-gray-200 rounded-lg p-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 max-h-[120px] overflow-y-auto">
                    {categories.length === 0 ? (
                      <p className="text-sm text-gray-500 col-span-2">No categories available.</p>
                    ) : (
                      categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cat-${category.id}`}
                            checked={form.cardDesignCategoryIds.includes(category.id)}
                            onCheckedChange={() => handleCategoryToggle(category.id)}
                            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                          />
                          <label htmlFor={`cat-${category.id}`} className="text-sm cursor-pointer">
                            {category.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Print URLs side by side */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label htmlFor="front-url">Print-Ready Front URL</Label>
              <Input
                id="front-url"
                value={form.printReadyFrontUrl}
                onChange={(e) => setForm({ ...form, printReadyFrontUrl: e.target.value })}
                placeholder="https://example.com/front.pdf"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="back-url">Print-Ready Back URL</Label>
              <Input
                id="back-url"
                value={form.printReadyBackUrl}
                onChange={(e) => setForm({ ...form, printReadyBackUrl: e.target.value })}
                placeholder="https://example.com/back.pdf"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}