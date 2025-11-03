import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, Save, Code2, X, Plus } from "lucide-react";

export default function EditTemplate() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get('id');
  const isNew = templateId === 'new';
  
  const [template, setTemplate] = useState({
    name: '',
    content: '',
    type: 'personal',
    templateCategoryIds: []
  });
  
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showPlaceholderHelp, setShowPlaceholderHelp] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

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
        const templateData = await base44.entities.Template.filter({ id: templateId });
        if (templateData.length > 0) {
          setTemplate(templateData[0]);
        }
      }
      
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!template.name.trim() || !template.content.trim()) {
        alert('Please fill in both template name and content');
        return;
      }
      
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
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = (categoryId) => {
    if (!template.templateCategoryIds.includes(categoryId)) {
      setTemplate(prev => ({
        ...prev,
        templateCategoryIds: [...prev.templateCategoryIds, categoryId]
      }));
    }
  };

  const handleRemoveCategory = (categoryId) => {
    setTemplate(prev => ({
      ...prev,
      templateCategoryIds: prev.templateCategoryIds.filter(id => id !== categoryId)
    }));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      setCreatingCategory(true);
      
      const newCategory = await base44.entities.TemplateCategory.create({
        name: newCategoryName.trim(),
        orgId: user.orgId
      });
      
      setCategories(prev => [...prev, newCategory]);
      handleAddCategory(newCategory.id);
      setNewCategoryName('');
      
    } catch (error) {
      console.error('Failed to create category:', error);
      alert('Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  const placeholderGroups = [
    {
      name: 'Client',
      placeholders: [
        { label: 'First Name', value: '{{firstName}}' },
        { label: 'Last Name', value: '{{lastName}}' },
        { label: 'Full Name', value: '{{fullName}}' },
        { label: 'Company Name', value: '{{companyName}}' },
        { label: 'Email', value: '{{client.email}}' },
        { label: 'Phone', value: '{{client.phone}}' },
        { label: 'City', value: '{{client.city}}' },
        { label: 'State', value: '{{client.state}}' }
      ]
    },
    {
      name: 'Me',
      placeholders: [
        { label: 'Your Name', value: '{{rep_full_name}}' },
        { label: 'Your Company', value: '{{rep_company_name}}' },
        { label: 'Your Phone', value: '{{rep_phone}}' }
      ]
    }
  ];

  const insertPlaceholder = (placeholder) => {
    setTemplate(prev => ({
      ...prev,
      content: prev.content + placeholder
    }));
    setShowPlaceholderHelp(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('Templates'))}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Create Template' : 'Edit Template'}
          </h1>
        </div>

        {/* Main Form */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Template Name */}
            <div>
              <Label htmlFor="name" className="text-base font-semibold">
                Template Name
              </Label>
              <Input
                id="name"
                value={template.name}
                onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Follow-up Thank You"
                className="mt-2"
              />
            </div>

            {/* Message Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="content" className="text-base font-semibold">
                  Message Content
                </Label>
                
                <Popover open={showPlaceholderHelp} onOpenChange={setShowPlaceholderHelp}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Code2 className="w-4 h-4" />
                      Placeholder Help
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm">Available Placeholders</h3>
                      {placeholderGroups.map((group, idx) => (
                        <div key={idx} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            {group.name}
                          </h4>
                          <div className="space-y-1">
                            {group.placeholders.map((ph, phIdx) => (
                              <button
                                key={phIdx}
                                onClick={() => insertPlaceholder(ph.value)}
                                className="w-full text-left px-2 py-1.5 text-sm hover:bg-indigo-50 rounded flex items-center justify-between group"
                              >
                                <span>{ph.label}</span>
                                <code className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded group-hover:bg-indigo-100 group-hover:text-indigo-700">
                                  {ph.value}
                                </code>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <Textarea
                id="content"
                value={template.content}
                onChange={(e) => setTemplate(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Type your message here..."
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            {/* Type Selector */}
            <div>
              <Label className="text-base font-semibold mb-2 block">
                Template Type
              </Label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTemplate(prev => ({ ...prev, type: 'personal' }))}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    template.type === 'personal'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Personal</div>
                  <div className="text-xs text-gray-500 mt-1">Only you can use this template</div>
                </button>
                
                <button
                  onClick={() => setTemplate(prev => ({ ...prev, type: 'organization' }))}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    template.type === 'organization'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Organization</div>
                  <div className="text-xs text-gray-500 mt-1">All team members can use this</div>
                </button>
              </div>
            </div>

            {/* Categories */}
            <div>
              <Label className="text-base font-semibold mb-2 block">
                Categories
              </Label>
              
              {/* Selected Categories */}
              {template.templateCategoryIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {template.templateCategoryIds.map(catId => {
                    const category = categories.find(c => c.id === catId);
                    return category ? (
                      <Badge key={catId} variant="secondary" className="gap-1">
                        {category.name}
                        <button
                          onClick={() => handleRemoveCategory(catId)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
              
              {/* Category Selector */}
              <Select onValueChange={handleAddCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Add a category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(cat => !template.templateCategoryIds.includes(cat.id))
                    .map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              
              {/* Create New Category */}
              <div className="flex gap-2 mt-3">
                <Input
                  placeholder="New category name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                />
                <Button
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim() || creatingCategory}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </Button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}