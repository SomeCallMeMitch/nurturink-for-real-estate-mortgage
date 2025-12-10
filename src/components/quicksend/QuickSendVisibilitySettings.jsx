import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { PURPOSE_OPTIONS } from './QuickSendFormFields';

/**
 * QuickSendVisibilitySettings Component
 * Visibility and status settings for Quick Send Templates
 * 
 * @param {Object} formData - Current form state
 * @param {Function} updateFormData - Callback to update form: (updates) => void
 * @param {Object} user - Current user (for permission checks)
 */
export default function QuickSendVisibilitySettings({
  formData,
  updateFormData,
  user
}) {
  // Permission checks
  const canSetOrgVisibility = user?.appRole === 'organization_owner' || user?.appRole === 'super_admin';
  const canSetPlatformVisibility = user?.appRole === 'super_admin';
  
  // Get purpose label for default checkbox
  const purposeLabel = PURPOSE_OPTIONS.find(p => p.value === formData.purpose)?.label || formData.purpose;

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Visibility & Status</h3>
        
        {/* Template Visibility (Type) */}
        <div>
          <Label>Template Visibility</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => updateFormData({ type: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal (Only You)</SelectItem>
              {canSetOrgVisibility && (
                <SelectItem value="organization">Organization (All Team Members)</SelectItem>
              )}
              {canSetPlatformVisibility && (
                <SelectItem value="platform">Platform (All Users)</SelectItem>
              )}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-gray-500">
            {formData.type === 'personal' && 'Only you can see and use this template'}
            {formData.type === 'organization' && 'All members of your organization can use this template'}
            {formData.type === 'platform' && 'All users across the platform can use this template'}
          </p>
        </div>

        {/* Set as Default checkbox - only for org/platform templates */}
        {(formData.type === 'organization' || formData.type === 'platform') && (
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) => updateFormData({ isDefault: checked })}
            />
            <label htmlFor="isDefault" className="text-sm font-medium cursor-pointer">
              Set as default for "{purposeLabel}" purpose
            </label>
          </div>
        )}
        
        {/* Active Status - for existing templates */}
        {formData.id && (
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => updateFormData({ isActive: checked })}
            />
            <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
              Template is active
            </label>
            <span className="text-xs text-gray-500 ml-2">
              (Inactive templates are hidden from selection)
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}