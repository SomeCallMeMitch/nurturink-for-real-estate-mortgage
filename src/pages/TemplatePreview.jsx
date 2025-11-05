
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, AlertTriangle, Star } from 'lucide-react';
import PlaceholderModal from '@/components/mailing/PlaceholderModal';
import CardPreview from '@/components/preview/CardPreview';

// Fallback settings if API fails
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

export default function TemplatePreview() {
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  
  // Get templateId from URL if editing existing template
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get('id');
  const isNew = templateId === 'new' || !templateId;
  
  // Core data
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [noteStyleProfiles, setNoteStyleProfiles] = useState([]);
  const [instanceSettings, setInstanceSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Template data state
  const [template, setTemplate] = useState({
    name: '',
    content: '',
    templateCategoryIds: [],
    type: 'organization',
    status: 'approved',
    isDefault: false
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Preview-specific state
  const [selectedNoteStyleProfileId, setSelectedNoteStyleProfileId] = useState(null);
  const [includeGreeting, setIncludeGreeting] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);

  useEffect(() => {
    loadData();
  }, [templateId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 TemplatePreview - Loading data...');
      
      // Load user
      const currentUser = await base44.auth.me();
      console.log('✅ User loaded:', currentUser.email);
      setUser(currentUser);
      
      // Load organization
      if (currentUser.orgId) {
        const orgList = await base44.entities.Organization.filter({ id: currentUser.orgId });
        if (orgList && orgList.length > 0) {
          console.log('✅ Organization loaded:', orgList[0].name);
          setOrganization(orgList[0]);
        }
      }
      
      // Load categories via backend function
      console.log('📡 Loading template categories...');
      const categoryResponse = await base44.functions.invoke('getTemplateCategories');
      const categoryList = categoryResponse.data;
      console.log('✅ Categories loaded:', categoryList.length);
      setCategories(categoryList);
      
      // Load note style profiles
      console.log('📡 Loading note style profiles...');
      const profileList = await base44.entities.NoteStyleProfile.filter({
        orgId: currentUser.orgId
      });
      console.log('✅ Note style profiles loaded:', profileList.length);
      setNoteStyleProfiles(profileList);
      
      // Auto-select default profile
      if (profileList.length > 0) {
        const defaultProfile = profileList.find(p => p.isDefault) || profileList[0];
        setSelectedNoteStyleProfileId(defaultProfile.id);
        console.log('✅ Auto-selected note style profile:', defaultProfile.name);
      }
      
      // Load instance settings with fallback
      console.log('📡 Loading instance settings...');
      try {
        const settingsResponse = await base44.functions.invoke('getInstanceSettings');
        console.log('✅ Instance settings loaded from API');
        setInstanceSettings(settingsResponse.data);
      } catch (settingsError) {
        console.warn('⚠️ Failed to load instance settings, using fallback:', settingsError);
        setInstanceSettings(FALLBACK_SETTINGS);
      }
      
      // Load template if editing existing
      if (!isNew) {
        console.log('📡 Loading template:', templateId);
        const templates = await base44.entities.Template.filter({ id: templateId });
        if (templates.length > 0) {
          const loadedTemplate = templates[0];
          console.log('✅ Template loaded:', loadedTemplate.name);
          setTemplate({
            name: loadedTemplate.name || '',
            content: loadedTemplate.content || '',
            templateCategoryIds: loadedTemplate.templateCategoryIds || [],
            type: loadedTemplate.type || 'organization',
            status: loadedTemplate.status || 'approved',
            isDefault: loadedTemplate.isDefault || false
          });
          
          // Check if template is favorited
          const favoriteIds = currentUser.favoriteTemplateIds || [];
          setIsFavorite(favoriteIds.includes(templateId));
        } else {
          throw new Error('Template not found');
        }
      } else {
        console.log('📝 Creating new template');
        setTemplate({
          name: '',
          content: '',
          templateCategoryIds: [],
          type: 'organization',
          status: 'approved',
          isDefault: false
        });
      }
      
      console.log('✅ All data loaded successfully');
      setLoading(false);
    } catch (err) {
      console.error('❌ Failed to load data:', err);
      setError(err.message || 'Failed to load data');
      setLoading(false);
    }
  };

  // Handle category toggle
  const handleCategoryToggle = (categoryId) => {
    setTemplate(prev => ({
      ...prev,
      templateCategoryIds: prev.templateCategoryIds.includes(categoryId)
        ? prev.templateCategoryIds.filter(id => id !== categoryId)
        : [...prev.templateCategoryIds, categoryId]
    }));
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!user || isNew) return;
    
    try {
      const currentFavorites = user.favoriteTemplateIds || [];
      const newFavorites = isFavorite
        ? currentFavorites.filter(id => id !== templateId)
        : [...currentFavorites, templateId];
      
      await base44.auth.updateMe({ favoriteTemplateIds: newFavorites });
      
      setIsFavorite(!isFavorite);
      setUser(prev => ({
        ...prev,
        favoriteTemplateIds: newFavorites
      }));
      
      console.log('✅ Favorite status updated:', !isFavorite);
    } catch (error) {
      console.error('❌ Failed to update favorite status:', error);
      alert('Failed to update favorite status. Please try again.');
    }
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
    
    setTemplate(prev => ({ ...prev, content: newContent }));
    
    // Set cursor position after placeholder
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
      textarea.focus();
    }, 0);
  };

  // Get selected note style profile
  const selectedNoteStyleProfile = useMemo(() => {
    if (!selectedNoteStyleProfileId) return null;
    return noteStyleProfiles.find(p => p.id === selectedNoteStyleProfileId);
  }, [selectedNoteStyleProfileId, noteStyleProfiles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading template preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Preview</h2>
              <p className="text-gray-600 mb-4">{error}</p>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate(createPageUrl('Templates'))}>
                Back to Templates
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Template Preview (Development)
              </h1>
              <p className="text-gray-600 mt-1">
                Testing the live preview feature for templates
              </p>
            </div>
            
            {/* Favorite Star - Only show if editing existing template */}
            {!isNew && (
              <button
                onClick={handleFavoriteToggle}
                className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  className={`w-8 h-8 ${
                    isFavorite 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-400 hover:text-yellow-400'
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Editor */}
          <div className="col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isNew ? 'New Template' : 'Edit Template'}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Template Name */}
                <div>
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={template.name}
                    onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
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

                {/* Message Editor */}
                <div>
                  <Label htmlFor="content">Message Content *</Label>
                  <Textarea
                    ref={textareaRef}
                    id="content"
                    value={template.content}
                    onChange={(e) => setTemplate(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Type your message here..."
                    className="min-h-[200px] text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Click the "Placeholders" button below to insert dynamic fields
                  </p>
                </div>

                {/* Placeholder Button */}
                <div>
                  <PlaceholderModal onPlaceholderSelect={handlePlaceholderSelect} />
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
                        onValueChange={(value) => setTemplate(prev => ({ ...prev, type: value }))}
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
                        onValueChange={(value) => setTemplate(prev => ({ ...prev, status: value }))}
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
                          onCheckedChange={(checked) => setTemplate(prev => ({ ...prev, isDefault: checked }))}
                        />
                        <label htmlFor="isDefault" className="text-sm font-medium cursor-pointer">
                          Mark as Platform Default Template
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Include Options for Preview */}
                <div className="pt-4 border-t">
                  <Label className="mb-3 block">Preview Options</Label>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeGreeting"
                        checked={includeGreeting}
                        onCheckedChange={setIncludeGreeting}
                      />
                      <label htmlFor="includeGreeting" className="text-sm font-medium cursor-pointer">
                        Include Greeting
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeSignature"
                        checked={includeSignature}
                        onCheckedChange={setIncludeSignature}
                      />
                      <label htmlFor="includeSignature" className="text-sm font-medium cursor-pointer">
                        Include Signature
                      </label>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Preview Notes:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Preview uses sample client data: {SAMPLE_CLIENT.fullName}</li>
                    <li>• Changes update live on the right side</li>
                    <li>• This is a development/testing page</li>
                    <li>• All template settings (categories, visibility, status) are editable here</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Preview */}
          <div className="col-span-5">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="flex justify-center">
                  {instanceSettings && (
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
                  )}
                  
                  {!instanceSettings && (
                    <div className="text-center py-12 text-gray-500">
                      Loading preview settings...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
