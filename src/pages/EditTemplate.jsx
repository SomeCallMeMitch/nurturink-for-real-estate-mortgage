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
import { ArrowLeft, Save, Loader2, AlertTriangle, Star } from 'lucide-react';
import PlaceholderModal from '@/components/mailing/PlaceholderModal';
import CardPreview from '@/components/preview/CardPreviewNew';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const duplicateId = urlParams.get('duplicate');
  const isNew = templateId === 'new';
  const isDuplicate = isNew && duplicateId;

  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [categories, setCategories] = useState([]);
  const [noteStyleProfiles, setNoteStyleProfiles] = useState([]);
  const [instanceSettings, setInstanceSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  
  const [template, setTemplate] = useState({
    name: '',
    content: '',
    templateCategoryIds: [],
    status: 'approved',
    isDefault: false,
    type: 'organization'
  });

  const [initialTemplate, setInitialTemplate] = useState(null);

  const [selectedNoteStyleProfileId, setSelectedNoteStyleProfileId] = useState(null);
  const [includeGreeting, setIncludeGreeting] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);

  useEffect(() => {
    loadData();
  }, [templateId, duplicateId]);

  // Track unsaved changes - IMPROVED LOGIC
  useEffect(() => {
    if (!initialTemplate) return;
    
    // For duplicates, always mark as having changes (even if not modified yet)
    // This ensures warning shows when clicking Back before saving
    if (isDuplicate) {
      setHasUnsavedChanges(true);
      return;
    }
    
    // For new templates, check if user has entered any content
    if (isNew) {
      const hasContent = template.name.trim() !== '' || template.content.trim() !== '';
      setHasUnsavedChanges(hasContent);
      return;
    }
    
    // For existing templates, check if anything changed
    const hasChanges = 
      template.name !== initialTemplate.name ||
      template.content !== initialTemplate.content ||
      JSON.stringify(template.templateCategoryIds) !== JSON.stringify(initialTemplate.templateCategoryIds) ||
      template.status !== initialTemplate.status ||
      template.type !== initialTemplate.type ||
      template.isDefault !== initialTemplate.isDefault;
    
    setHasUnsavedChanges(hasChanges);
  }, [template, initialTemplate, isDuplicate, isNew]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      console.log('✅ EditTemplate - User loaded:', currentUser.email);
      setUser(currentUser);

      // Load organization data
      if (currentUser.orgId) {
        const orgList = await base44.entities.Organization.filter({ id: currentUser.orgId });
        if (orgList && orgList.length > 0) {
          console.log('✅ EditTemplate - Organization loaded:', orgList[0].name);
          setOrganization(orgList[0]);
        }
      }

      // Load categories via backend function
      const categoryResponse = await base44.functions.invoke('getTemplateCategories');
      const categoryList = categoryResponse.data;
      setCategories(categoryList);

      // Load note style profiles
      const profileList = await base44.entities.NoteStyleProfile.filter({
        orgId: currentUser.orgId
      });
      setNoteStyleProfiles(profileList);
      
      // Auto-select default profile
      if (profileList.length > 0) {
        const defaultProfile = profileList.find(p => p.isDefault) || profileList[0];
        setSelectedNoteStyleProfileId(defaultProfile.id);
      }

      // Load instance settings for preview
      try {
        const settingsResponse = await base44.functions.invoke('getInstanceSettings');
        setInstanceSettings(settingsResponse.data);
      } catch (settingsError) {
        console.error('⚠️ EditTemplate - Failed to load instance settings, using fallback:', settingsError);
        setInstanceSettings(FALLBACK_SETTINGS);
      }

      // Load template if editing or duplicating
      if (!isNew && templateId) {
        const templates = await base44.entities.Template.filter({ id: templateId });
        if (templates.length > 0) {
          setTemplate(templates[0]);
          setInitialTemplate(templates[0]);
        } else {
          alert('Template not found');
          navigate(createPageUrl('Templates'));
        }
      } else if (isDuplicate) {
        // Load template to duplicate
        const templates = await base44.entities.Template.filter({ id: duplicateId });
        if (templates.length > 0) {
          const originalTemplate = templates[0];
          const duplicatedTemplate = {
            name: `${originalTemplate.name} (Copy)`,
            content: originalTemplate.content,
            templateCategoryIds: originalTemplate.templateCategoryIds || [],
            status: 'draft',
            isDefault: false,
            type: 'personal'
          };
          setTemplate(duplicatedTemplate);
          setInitialTemplate(duplicatedTemplate);
          // setHasUnsavedChanges(true); // Mark as having changes since it's a new duplicate - now handled by useEffect
        } else {
          alert('Template to duplicate not found');
          navigate(createPageUrl('Templates'));
        }
      } else {
        // New template - determine default type based on user role
        const isSuperAdminOrWL = currentUser.appRole === 'super_admin' || currentUser.appRole === 'whitelabel_partner';
        
        const newTemplate = {
          name: '',
          content: '',
          templateCategoryIds: [],
          status: 'approved',
          isDefault: false,
          type: isSuperAdminOrWL ? 'platform' : 'organization'
        };
        setTemplate(newTemplate);
        setInitialTemplate(newTemplate);
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

      setHasUnsavedChanges(false);
      navigate(createPageUrl('Templates'));
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBackClick = () => {
    // Special handling for duplicates - always show warning
    if (isDuplicate) {
      setPendingNavigation(createPageUrl('Templates'));
      setShowUnsavedDialog(true);
      return;
    }
    
    // For new or edited templates, check if there are unsaved changes
    if (hasUnsavedChanges) {
      setPendingNavigation(createPageUrl('Templates'));
      setShowUnsavedDialog(true);
    } else {
      navigate(createPageUrl('Templates'));
    }
  };

  const handleCancelClick = () => {
    // Special handling for duplicates - always show warning
    if (isDuplicate) {
      setPendingNavigation(createPageUrl('Templates'));
      setShowUnsavedDialog(true);
      return;
    }
    
    // For new or edited templates, check if there are unsaved changes
    if (hasUnsavedChanges) {
      setPendingNavigation(createPageUrl('Templates'));
      setShowUnsavedDialog(true);
    } else {
      navigate(createPageUrl('Templates'));
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    setHasUnsavedChanges(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
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

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!user || isNew) return;

    try {
      const currentFavorites = user.favoriteTemplateIds || [];
      const isFavorited = currentFavorites.includes(templateId);
      
      const newFavoriteTemplateIds = isFavorited
        ? currentFavorites.filter(id => id !== templateId)
        : [...currentFavorites, templateId];

      await base44.auth.updateMe({ favoriteTemplateIds: newFavoriteTemplateIds });
      
      setUser(prev => ({
        ...prev,
        favoriteTemplateIds: newFavoriteTemplateIds
      }));
    } catch (error) {
      console.error("Failed to update favorite status:", error);
    }
  };

  // Check if current template is favorited
  const isFavorited = !isNew && user?.favoriteTemplateIds?.includes(templateId);

  // Get selected note style profile
  const selectedNoteStyleProfile = noteStyleProfiles.find(p => p.id === selectedNoteStyleProfileId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBackClick}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {isDuplicate ? 'Duplicate Template' : (isNew ? 'Create New Template' : 'Edit Template')}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {isDuplicate 
                    ? 'Save to create a copy of this template' 
                    : (isNew ? 'Create a reusable message template' : 'Update your template')
                  }
                </p>
              </div>
              
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm font-medium">Unsaved changes</span>
                </div>
              )}
            </div>
          </div>

          {/* Two-Column Layout: Form + Preview */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column: Form */}
            <div className="col-span-7">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  {/* Template Name with Favorite Star */}
                  <div>
                    <Label htmlFor="name">Template Name *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="name"
                        value={template.name}
                        onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                        placeholder="e.g., Thank You - Post Project"
                        className="flex-1"
                      />
                      {/* Show star for existing templates OR disabled star for new/duplicate */}
                      {!isNew ? (
                        <button
                          onClick={handleFavoriteToggle}
                          className="p-2 hover:bg-muted rounded transition-colors flex-shrink-0"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              isFavorited 
                                ? 'fill-warning text-warning' 
                                : 'text-warning'
                            }`}
                          />
                        </button>
                      ) : (
                        <div className="relative group">
                          <button
                            disabled
                            className="p-2 rounded transition-colors flex-shrink-0 cursor-not-allowed opacity-40"
                          >
                            <Star className="w-5 h-5 text-warning" />
                          </button>
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 pointer-events-none">
                            <div className="bg-foreground text-background text-xs rounded py-1 px-2 whitespace-nowrap">
                              Save template first to add to favorites
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Writing Style with Include Greeting and Signature on same row */}
                  <div>
                    <Label htmlFor="writing-style">Writing Style</Label>
                    <div className="flex items-center gap-4">
                      <Select
                        value={selectedNoteStyleProfileId || ''}
                        onValueChange={setSelectedNoteStyleProfileId}
                        className="flex-1"
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
                    <p className="text-sm text-muted-foreground mt-2">
                      Click the "Placeholders" button below to insert dynamic fields
                    </p>
                  </div>

                  {/* Placeholder Button */}
                  <PlaceholderModal onPlaceholderSelect={handlePlaceholderSelect} />

                  {/* Categories & Settings Grid - TWO COLUMNS */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column: Categories */}
                    <div>
                      <Label>Categories (Select Multiple)</Label>
                      {categories.length === 0 ? (
                        <div className="mt-2 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                          <p className="text-sm text-warning font-medium mb-2">
                            No categories available yet
                          </p>
                          <p className="text-sm text-warning/80">
                            Categories help organize your templates. To create categories:
                          </p>
                          <ul className="text-sm text-warning/80 mt-2 ml-4 list-disc">
                            <li>Go to <strong>Home</strong> page</li>
                            <li>Click <strong>"Seed Categories"</strong></li>
                          </ul>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground mb-2">
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
                            <p className="text-sm text-primary mt-2">
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
                            {(user?.appRole === 'super_admin' || user?.appRole === 'whitelabel_partner') && (
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
                      onClick={handleCancelClick}
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
                  <h3 className="font-semibold text-foreground mb-4">Live Preview</h3>
                  
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
                      <div className="text-center py-12 text-muted-foreground">
                        <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-spin" />
                        <p>Loading preview...</p>
                      </div>
                    )}
                  </div>

                  {/* Preview Info */}
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>Preview uses sample data:</strong>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Client: {SAMPLE_CLIENT.fullName} • {SAMPLE_CLIENT.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isDuplicate ? 'Discard Duplicate?' : 'Unsaved Changes'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isDuplicate 
                ? "The duplicate template has not been saved yet. If you leave now, no copy will be created. Are you sure you want to cancel this duplicate?"
                : isNew
                ? "You have unsaved changes to this new template. If you leave now, your work will be lost. Are you sure you want to leave without saving?"
                : "You have unsaved changes to this template. If you leave now, your changes will be lost. Are you sure you want to leave without saving?"
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardChanges}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDuplicate ? 'Discard Duplicate' : 'Discard Changes'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}