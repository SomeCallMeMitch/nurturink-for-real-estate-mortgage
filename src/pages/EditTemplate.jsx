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
import CardPreview from '@/components/preview/CardPreview';

// Sample client for preview
const SAMPLE_CLIENT = {
  firstName: "John",
  lastName: "Smith",
  fullName: "John Smith",
  company: "ABC Roofing",
  email: "john@abcroofing.com",
  phone: "(555) 123-4567",
  street: "123 Main Street",
  city: "Denver",
  state: "CO",
  zipCode: "80202"
};

// Default fallback settings
const FALLBACK_SETTINGS = {
  cardPreviewSettings: {
    fontSize: 22,
    lineHeight: 1,
    baseTextWidth: 360,
    baseMarginLeft: 40,
    shortCardMaxLines: 13,
    maxPreviewLines: 19,
    topHalfPaddingTop: 345,
    longCardTopPadding: 110,
    gapAboveFold: 14,
    gapBelowFold: 14,
    maxIndent: 16,
    indentAmplitude: 6,
    indentNoise: 2,
    indentFrequency: 0.35,
    frameWidth: 412,
    frameHeight: 600
  }
};

export default function EditTemplate() {
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get('id');
  const isNew = templateId === 'new';

  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [categories, setCategories] = useState([]);
  const [noteStyleProfiles, setNoteStyleProfiles] = useState([]);
  const [instanceSettings, setInstanceSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [template, setTemplate] = useState({
    name: '',
    content: '',
    templateCategoryIds: [],
    status: 'approved',
    isDefault: false,
    type: 'organization'
  });

  const [selectedNoteStyleProfileId, setSelectedNoteStyleProfileId] = useState(null);
  const [includeGreeting, setIncludeGreeting] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);

  useEffect(() => {
    loadData();
  }, [templateId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      console.log('✅ EditTemplate - User loaded:', currentUser.email);
      console.log('👤 EditTemplate - User orgId:', currentUser.orgId);
      setUser(currentUser);

      // Load organization data
      console.log('📡 EditTemplate - Loading organization...');
      if (currentUser.orgId) {
        const orgList = await base44.entities.Organization.filter({ id: currentUser.orgId });
        if (orgList && orgList.length > 0) {
          console.log('✅ EditTemplate - Organization loaded:', orgList[0].name);
          setOrganization(orgList[0]);
        }
      }

      // Load categories via backend function
      console.log('📡 EditTemplate - Calling getTemplateCategories backend function...');
      
      const categoryResponse = await base44.functions.invoke('getTemplateCategories');
      const categoryList = categoryResponse.data;
      
      console.log('✅ EditTemplate - Categories loaded from backend:', categoryList);
      console.log('📊 EditTemplate - Category count:', categoryList.length);
      
      setCategories(categoryList);

      // Load note style profiles
      console.log('📡 EditTemplate - Loading note style profiles...');
      const profileList = await base44.entities.NoteStyleProfile.filter({
        orgId: currentUser.orgId
      });
      console.log('✅ EditTemplate - Note style profiles loaded:', profileList.length);
      setNoteStyleProfiles(profileList);
      
      // Auto-select default profile
      if (profileList.length > 0) {
        const defaultProfile = profileList.find(p => p.isDefault) || profileList[0];
        setSelectedNoteStyleProfileId(defaultProfile.id);
        console.log('✅ EditTemplate - Auto-selected note style profile:', defaultProfile.name);
      }

      // Load instance settings for preview
      console.log('📡 EditTemplate - Loading instance settings...');
      try {
        const settingsResponse = await base44.functions.invoke('getInstanceSettings');
        console.log('✅ EditTemplate - Instance settings loaded');
        setInstanceSettings(settingsResponse.data);
      } catch (settingsError) {
        console.error('⚠️ EditTemplate - Failed to load instance settings, using fallback:', settingsError);
        setInstanceSettings(FALLBACK_SETTINGS);
      }

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
      console.error('❌ EditTemplate - Failed to load data:', error);
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
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
      textarea.focus();
    }, 0);
  };

  // Get selected note style profile
  const selectedNoteStyleProfile = noteStyleProfiles.find(p => p.id === selectedNoteStyleProfileId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
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

        {/* Two-Column Layout: Form + Preview */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Form */}
          <div className="col-span-7">
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

                {/* Writing Style Selector */}
                <div>
                  <Label htmlFor="writing-style">Writing Style</Label>
                  <Select
                    value={selectedNoteStyleProfileId || ''}
                    onValueChange={setSelectedNoteStyleProfileId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style..." />
                    </SelectTrigger>
                    <SelectContent>
                      {noteStyleProfiles.map(profile => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

                {/* Placeholder Button & Preview Options - INLINE */}
                <div className="flex items-center gap-6">
                  <PlaceholderModal onPlaceholderSelect={handlePlaceholderSelect} />
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeGreeting"
                        checked={includeGreeting}
                        onCheckedChange={setIncludeGreeting}
                      />
                      <label htmlFor="includeGreeting" className="text-sm font-medium cursor-pointer whitespace-nowrap">
                        Include Greeting
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeSignature"
                        checked={includeSignature}
                        onCheckedChange={setIncludeSignature}
                      />
                      <label htmlFor="includeSignature" className="text-sm font-medium cursor-pointer whitespace-nowrap">
                        Include Signature
                      </label>
                    </div>
                  </div>
                </div>

                {/* Categories & Settings Grid - TWO COLUMNS */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column: Categories */}
                  <div>
                    <Label>Categories (Select Multiple)</Label>
                    {categories.length === 0 ? (
                      <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 font-medium mb-2">
                          ⚠️ No categories available yet
                        </p>
                        <p className="text-sm text-yellow-700">
                          Categories help organize your templates. To create categories:
                        </p>
                        <ul className="text-sm text-yellow-700 mt-2 ml-4 list-disc">
                          <li>Go to <strong>Home</strong> page</li>
                          <li>Click <strong>"Seed Categories"</strong></li>
                        </ul>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>

                  {/* Right Column: Visibility, Status, Default */}
                  <div className="space-y-4">
                    {/* Template Visibility (Type) */}
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

                    {/* Mark as Platform Default (Super Admin Only) */}
                    {user?.appRole === 'super_admin' && (
                      <div className="flex items-center space-x-2 pt-2">
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
                  </div>
                </div>

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

          {/* Right Column: Live Preview */}
          <div className="col-span-5">
            <Card className="sticky top-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Live Preview</h3>
                
                {/* Preview container */}
                <div className="flex justify-center px-4">
                  {instanceSettings && selectedNoteStyleProfile ? (
                    <div className="w-full max-w-[440px]">
                      <CardPreview
                        message={template.content}
                        client={SAMPLE_CLIENT}
                        user={user}
                        organization={organization}
                        noteStyleProfile={selectedNoteStyleProfile}
                        selectedDesign={null}
                        previewSettings={instanceSettings.cardPreviewSettings}
                        includeGreeting={includeGreeting}
                        includeSignature={includeSignature}
                        randomIndentEnabled={true}
                        showLineCounter={true}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                      <p>Loading preview...</p>
                    </div>
                  )}
                </div>

                {/* Preview Info */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <strong>Preview uses sample data:</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Client: {SAMPLE_CLIENT.fullName} • {SAMPLE_CLIENT.company}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}