
import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import PlaceholderModal from '@/components/mailing/PlaceholderModal';

export default function EditTemplate() {
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get('id');
  const isNew = templateId === 'new';

  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [template, setTemplate] = useState({
    name: '',
    content: '',
    templateCategoryIds: [],
    status: 'approved',  // Changed from 'private' to 'approved'
    isDefault: false,
    type: 'organization'
  });

  useEffect(() => {
    loadData();
  }, [templateId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load categories
      const categoryList = await base44.entities.TemplateCategory.filter({
        $or: [
          { orgId: currentUser.orgId },
          { orgId: null }
        ]
      });
      setCategories(categoryList);

      // Load template if editing
      if (!isNew) {
        const templates = await base44.entities.Template.filter({ id: templateId });
        if (templates.length > 0) {
          setTemplate(templates[0]);
        } else {
          alert('Template not found');
          navigate(createPageUrl('Templates'));
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load template data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template.name.trim() || !template.content.trim()) {
      alert('Please fill in both name and content');
      return;
    }

    try {
      setSaving(true);

      if (isNew) {
        await base44.entities.Template.create({
          ...template,
          createdByUserId: user.id,
          orgId: user.orgId
        });
      } else {
        await base44.entities.Template.update(templateId, template);
      }

      navigate(createPageUrl('Templates'));
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setTemplate(prev => ({
      ...prev,
      templateCategoryIds: prev.templateCategoryIds.includes(categoryId)
        ? prev.templateCategoryIds.filter(id => id !== categoryId)
        : [...prev.templateCategoryIds, categoryId]
    }));
  };

  // Handle placeholder insertion
  const handlePlaceholderSelect = (placeholder) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = template.content;
    
    const newContent = 
      currentContent.slice(0, start) + 
      placeholder + 
      currentContent.slice(end);
    
    setTemplate({ ...template, content: newContent });
    
    // Set cursor position after placeholder
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
      textarea.focus();
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('Templates'))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Create New Template' : 'Edit Template'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isNew ? 'Create a reusable message template' : 'Update your template'}
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Template Name */}
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                placeholder="e.g., Thank You - Post Project"
              />
            </div>

            {/* Template Content */}
            <div>
              <Label htmlFor="content">Message Content *</Label>
              <Textarea
                ref={textareaRef}
                id="content"
                value={template.content}
                onChange={(e) => setTemplate({ ...template, content: e.target.value })}
                placeholder="Write your template message here..."
                className="min-h-[200px]"
              />
              <p className="text-sm text-gray-500 mt-2">
                Click the "Placeholders" button below to insert dynamic fields
              </p>
            </div>

            {/* Placeholder Button */}
            <div>
              <PlaceholderModal onPlaceholderSelect={handlePlaceholderSelect} />
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <Label>Categories (Select Multiple)</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Select all categories that apply to this template
                </p>
                <div className="mt-2 space-y-2">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={template.templateCategoryIds.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
                {template.templateCategoryIds.length > 0 && (
                  <p className="text-sm text-indigo-600 mt-2">
                    {template.templateCategoryIds.length} {template.templateCategoryIds.length === 1 ? 'category' : 'categories'} selected
                  </p>
                )}
              </div>
            )}

            {/* Template Type */}
            <div>
              <Label htmlFor="type">Template Visibility</Label>
              <Select
                value={template.type}
                onValueChange={(value) => setTemplate({ ...template, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal (Only You)</SelectItem>
                  <SelectItem value="organization">Organization (All Team Members)</SelectItem>
                  {user?.appRole === 'super_admin' && (
                    <SelectItem value="platform">Platform (All Users)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={template.status}
                onValueChange={(value) => setTemplate({ ...template, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Is Default (Super Admin Only) */}
            {user?.appRole === 'super_admin' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={template.isDefault}
                  onCheckedChange={(checked) => setTemplate({ ...template, isDefault: checked })}
                />
                <label htmlFor="isDefault" className="text-sm font-medium cursor-pointer">
                  Mark as Platform Default Template
                </label>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
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
                    Save Template
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl('Templates'))}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
