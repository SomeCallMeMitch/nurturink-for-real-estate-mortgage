import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Code2, Info } from "lucide-react";
import PlaceholderSelector from "@/components/mailing/PlaceholderSelector";

export default function EditTemplate() {
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  // Get template ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get('id');
  const isNew = templateId === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    content: '',
    type: 'personal',
    templateCategoryIds: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
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

      // Load existing template if editing
      if (!isNew) {
        setLoading(true);
        const templates = await base44.entities.Template.filter({ id: templateId });

        if (templates.length === 0) {
          setError('Template not found');
          return;
        }

        const template = templates[0];
        setFormData({
          name: template.name,
          content: template.content,
          type: template.type || 'personal',
          templateCategoryIds: template.templateCategoryIds || []
        });
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load template data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceholderInsert = (placeholder) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = formData.content;

    const newContent =
      currentContent.slice(0, start) +
      placeholder +
      currentContent.slice(end);

    handleChange('content', newContent);

    // Set cursor position after placeholder
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
      textarea.focus();
    }, 0);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      alert('Template name is required');
      return;
    }

    if (!formData.content.trim()) {
      alert('Template content is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const templateData = {
        ...formData,
        orgId: user.orgId,
        createdByUserId: user.id,
        status: 'private'
      };

      if (isNew) {
        await base44.entities.Template.create(templateData);
      } else {
        await base44.entities.Template.update(templateId, templateData);
      }

      navigate(createPageUrl('Templates'));
    } catch (err) {
      console.error('Failed to save template:', err);
      setError('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const placeholders = [
    { label: 'Client First Name', value: '{{firstName}}' },
    { label: 'Client Last Name', value: '{{lastName}}' },
    { label: 'Client Full Name', value: '{{fullName}}' },
    { label: 'Client Company', value: '{{companyName}}' },
    { label: 'Your Name', value: '{{rep_full_name}}' },
    { label: 'Your Company', value: '{{rep_company_name}}' },
    { label: 'Your Phone', value: '{{rep_phone}}' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error && !isNew) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate(createPageUrl('Templates'))}>
              Back to Templates
            </Button>
          </CardContent>
        </Card>
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
            Back to Content Library
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Create Template' : 'Edit Template'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Name */}
              <div>
                <Label htmlFor="name">
                  Template Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Thank You After Storm, Follow-Up Check-In"
                  required
                />
              </div>

              {/* Template Type */}
              <div>
                <Label htmlFor="type">Sharing</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal (Only Me)</SelectItem>
                    <SelectItem value="organization">Shared with Organization</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Personal templates are only visible to you. Shared templates are visible to your entire team.
                </p>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Select
                    value={formData.templateCategoryIds[0] || ''}
                    onValueChange={(value) => handleChange('templateCategoryIds', value ? [value] : [])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>No Category</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Message Content */}
              <div>
                <Label htmlFor="content">
                  Message Content <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  ref={textareaRef}
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  placeholder="Write your template message here..."
                  className="min-h-[300px] text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use placeholders like {'{{firstName}}'} to personalize content for each recipient
                </p>
              </div>

              {/* Placeholder Selector */}
              <div>
                <Label className="mb-2 block">Insert Placeholders</Label>
                <PlaceholderSelector onPlaceholderSelect={handlePlaceholderInsert} />
              </div>

              {/* Placeholder Reference */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2 mb-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-blue-900 mb-2">
                        Available Placeholders
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {placeholders.map((placeholder) => (
                          <div key={placeholder.value} className="flex items-center gap-2">
                            <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200">
                              {placeholder.value}
                            </code>
                            <span className="text-xs text-blue-800">{placeholder.label}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-blue-700 mt-3">
                        These placeholders will be automatically replaced with real client and user data when you send a card.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl('Templates'))}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
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
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}