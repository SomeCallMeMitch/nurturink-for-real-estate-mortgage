import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { FileText, Search } from 'lucide-react';
import { PURPOSE_OPTIONS } from '@/components/utils/quickSendConstants';

// Return address options
const RETURN_ADDRESS_OPTIONS = [
  { value: 'company', label: 'Company Address' },
  { value: 'rep', label: 'Rep Address' },
  { value: 'none', label: 'No Return Address' }
];

/**
 * QuickSendFormFields Component
 * Form fields for creating/editing a Quick Send Template
 * 
 * @param {Object} formData - Current form state
 * @param {Function} updateFormData - Callback to update form: (updates) => void
 * @param {Object} selectedTemplate - Currently selected Template object (for display)
 * @param {Object} selectedDesign - Currently selected CardDesign object (for display)
 * @param {Array} noteStyleProfiles - Available NoteStyleProfile options
 * @param {Function} onOpenTemplatePicker - Callback to open template picker modal
 * @param {Function} onOpenDesignPicker - Callback to open design picker modal
 */
export default function QuickSendFormFields({
  formData,
  updateFormData,
  selectedTemplate,
  selectedDesign,
  noteStyleProfiles = [],
  onOpenTemplatePicker,
  onOpenDesignPicker
}) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-5">
        {/* Name */}
        <div>
          <Label htmlFor="name">QuickSend Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="e.g., Thank You - Post Job"
            className="mt-1"
          />
        </div>

        {/* Purpose */}
        <div>
          <Label>Select Purpose *</Label>
          <Select 
            value={formData.purpose} 
            onValueChange={(value) => updateFormData({ purpose: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PURPOSE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Message Template Selector */}
        <div>
          <Label>Select Message Template *</Label>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between mt-1"
            onClick={onOpenTemplatePicker}
          >
            <span className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className={selectedTemplate ? 'text-gray-900' : 'text-gray-400'}>
                {selectedTemplate ? selectedTemplate.name : 'Select a message template...'}
              </span>
            </span>
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </Button>
          {selectedTemplate && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              {selectedTemplate.content?.substring(0, 150)}...
            </p>
          )}
        </div>

        {/* Writing Style */}
        <div>
          <Label>Select Writing Style *</Label>
          <Select 
            value={formData.noteStyleProfileId} 
            onValueChange={(value) => updateFormData({ noteStyleProfileId: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a writing style..." />
            </SelectTrigger>
            <SelectContent>
              {noteStyleProfiles.map(profile => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.name}
                  {profile.isDefault && ' (Default)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Include Greeting / Signature */}
        <div className="flex gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeGreeting"
              checked={formData.includeGreeting}
              onCheckedChange={(checked) => updateFormData({ includeGreeting: checked })}
            />
            <label htmlFor="includeGreeting" className="text-sm font-medium cursor-pointer">
              Include Greeting
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeSignature"
              checked={formData.includeSignature}
              onCheckedChange={(checked) => updateFormData({ includeSignature: checked })}
            />
            <label htmlFor="includeSignature" className="text-sm font-medium cursor-pointer">
              Include Signature
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}