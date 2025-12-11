import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
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

// Import modular components
import QuickSendFormFields from '@/components/quicksend/QuickSendFormFields';
import QuickSendVisibilitySettings from '@/components/quicksend/QuickSendVisibilitySettings';
import QuickSendPreviewPanel from '@/components/quicksend/QuickSendPreviewPanel';
import TemplatePickerModal from '@/components/quicksend/TemplatePickerModal';
import CardDesignPickerModal from '@/components/quicksend/CardDesignPickerModal';
import PhysicalCardDisplay from '@/components/quicksend/PhysicalCardDisplay.jsx';
import CardDesignSelector from '@/components/quicksend/CardDesignSelector.jsx';
import ReturnAddressSelector from '@/components/quicksend/ReturnAddressSelector.jsx';

// Default form state
const DEFAULT_FORM_DATA = {
  name: '',
  purpose: 'thank_you',
  templateId: '',
  noteStyleProfileId: '',
  cardDesignId: '',
  returnAddressMode: 'company',
  includeGreeting: true,
  includeSignature: true,
  type: 'personal',
  isDefault: false,
  isActive: true,
  sortOrder: 0
};

// Fallback settings if instance settings fail to load
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

export default function EditQuickSendTemplate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // URL params
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get('id');
  const duplicateId = urlParams.get('duplicate');
  const isNew = templateId === 'new';
  const isDuplicate = isNew && duplicateId;

  // Core data
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [instanceSettings, setInstanceSettings] = useState(null);
  
  // Related entities for selection
  const [templates, setTemplates] = useState([]);
  const [noteStyleProfiles, setNoteStyleProfiles] = useState([]);
  const [cardDesigns, setCardDesigns] = useState([]);
  const [cardDesignCategories, setCardDesignCategories] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [initialFormData, setInitialFormData] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  
  // Modal state
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showDesignPicker, setShowDesignPicker] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [templateId, duplicateId]);

  // Track unsaved changes
  useEffect(() => {
    if (!initialFormData) return;
    
    if (isDuplicate) {
      setHasUnsavedChanges(true);
      return;
    }
    
    if (isNew) {
      setHasUnsavedChanges(formData.name.trim() !== '');
      return;
    }
    
    setHasUnsavedChanges(JSON.stringify(formData) !== JSON.stringify(initialFormData));
  }, [formData, initialFormData, isDuplicate, isNew]);

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
      setUser(currentUser);
      
      // Load organization
      if (currentUser.orgId) {
        const orgList = await base44.entities.Organization.filter({ id: currentUser.orgId });
        if (orgList?.length > 0) setOrganization(orgList[0]);
      }
      
      // Load instance settings with robust fallback
      try {
        const settingsResponse = await base44.functions.invoke('getInstanceSettings');
        // Ensure cardPreviewSettings always has all required properties
        setInstanceSettings({
          cardPreviewSettings: {
            ...FALLBACK_SETTINGS.cardPreviewSettings,
            ...(settingsResponse.data?.cardPreviewSettings || {})
          }
        });
      } catch {
        setInstanceSettings(FALLBACK_SETTINGS);
      }
      
      // Load message templates (all accessible)
      const [personalTemplates, orgTemplates, platformTemplates] = await Promise.all([
        base44.entities.Template.filter({ createdByUserId: currentUser.id, type: 'personal' }),
        base44.entities.Template.filter({ orgId: currentUser.orgId, type: 'organization', status: 'approved' }),
        base44.entities.Template.filter({ type: 'platform', status: 'approved' })
      ]);
      setTemplates([...personalTemplates, ...orgTemplates, ...platformTemplates]);
      
      // Load note style profiles
      const profileList = await base44.entities.NoteStyleProfile.filter({ orgId: currentUser.orgId });
      setNoteStyleProfiles(profileList);
      
      // Load card designs
      const designList = await base44.entities.CardDesign.filter({ type: 'platform' });
      setCardDesigns(designList);
      
      // Load card design categories
      const categoryList = await base44.entities.CardDesignCategory.filter({ orgId: null });
      setCardDesignCategories(categoryList.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
      
      // Initialize form based on mode (new, edit, or duplicate)
      await initializeForm(currentUser, profileList, designList);
      
    } catch (err) {
      console.error('Failed to load data:', err);
      toast({ title: 'Error loading data', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const initializeForm = async (currentUser, profileList, designList) => {
    if (isNew && !isDuplicate) {
      // New template - set defaults
      const defaultProfile = profileList.find(p => p.isDefault) || profileList[0];
      const defaultDesign = designList.find(d => d.isDefault) || designList[0];
      
      const newFormData = {
        ...DEFAULT_FORM_DATA,
        noteStyleProfileId: defaultProfile?.id || '',
        cardDesignId: defaultDesign?.id || ''
      };
      setFormData(newFormData);
      setInitialFormData(newFormData);
      
    } else if (isDuplicate) {
      // Duplicate - load source and modify
      const existing = await base44.entities.QuickSendTemplate.filter({ id: duplicateId });
      if (existing?.length > 0) {
        const source = existing[0];
        const duplicatedData = {
          ...DEFAULT_FORM_DATA,
          name: `${source.name} (Copy)`,
          purpose: source.purpose || 'thank_you',
          templateId: source.templateId || '',
          noteStyleProfileId: source.noteStyleProfileId || '',
          cardDesignId: source.cardDesignId || '',
          returnAddressMode: source.returnAddressMode || 'company',
          includeGreeting: source.includeGreeting ?? true,
          includeSignature: source.includeSignature ?? true,
          type: 'personal', // Duplicates start as personal
          isDefault: false
        };
        setFormData(duplicatedData);
        setInitialFormData(duplicatedData);
      }
      
    } else {
      // Edit existing
      const existing = await base44.entities.QuickSendTemplate.filter({ id: templateId });
      if (existing?.length > 0) {
        const data = existing[0];
        const loadedData = {
          name: data.name || '',
          purpose: data.purpose || 'thank_you',
          templateId: data.templateId || '',
          noteStyleProfileId: data.noteStyleProfileId || '',
          cardDesignId: data.cardDesignId || '',
          returnAddressMode: data.returnAddressMode || 'company',
          includeGreeting: data.includeGreeting ?? true,
          includeSignature: data.includeSignature ?? true,
          type: data.type || 'personal',
          isDefault: data.isDefault || false,
          isActive: data.isActive ?? true,
          sortOrder: data.sortOrder || 0,
          id: data.id // Include ID for edit mode
        };
        setFormData(loadedData);
        setInitialFormData(loadedData);
      } else {
        toast({ title: 'Template not found', variant: 'destructive' });
        navigate(createPageUrl('QuickSendTemplates'));
      }
    }
  };

  // Get selected entities for display/preview
  const selectedTemplate = useMemo(() => 
    templates.find(t => t.id === formData.templateId),
    [templates, formData.templateId]
  );

  const selectedNoteStyleProfile = useMemo(() => 
    noteStyleProfiles.find(p => p.id === formData.noteStyleProfileId),
    [noteStyleProfiles, formData.noteStyleProfileId]
  );

  const selectedCardDesign = useMemo(() => 
    cardDesigns.find(d => d.id === formData.cardDesignId),
    [cardDesigns, formData.cardDesignId]
  );

  // Form update handler
  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Save handler
  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast({ title: 'Name required', description: 'Please enter a template name.', variant: 'destructive' });
      return;
    }
    if (!formData.templateId) {
      toast({ title: 'Message template required', variant: 'destructive' });
      return;
    }
    if (!formData.noteStyleProfileId) {
      toast({ title: 'Writing style required', variant: 'destructive' });
      return;
    }
    if (!formData.cardDesignId) {
      toast({ title: 'Card design required', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);
      
      const saveData = {
        name: formData.name.trim(),
        purpose: formData.purpose,
        templateId: formData.templateId,
        noteStyleProfileId: formData.noteStyleProfileId,
        cardDesignId: formData.cardDesignId,
        returnAddressMode: formData.returnAddressMode,
        includeGreeting: formData.includeGreeting,
        includeSignature: formData.includeSignature,
        type: formData.type,
        isDefault: formData.isDefault,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
        previewSnippet: selectedTemplate?.content?.substring(0, 100) || '',
        createdByUserId: user.id,
        orgId: formData.type === 'organization' ? user.orgId : null
      };

      if (isNew || isDuplicate) {
        await base44.entities.QuickSendTemplate.create(saveData);
        toast({ title: 'Template created', className: 'bg-green-50 border-green-200 text-green-900' });
      } else {
        await base44.entities.QuickSendTemplate.update(templateId, saveData);
        toast({ title: 'Template updated', className: 'bg-green-50 border-green-200 text-green-900' });
      }

      navigate(createPageUrl('QuickSendTemplates'));

    } catch (err) {
      console.error('Failed to save template:', err);
      toast({ title: 'Error', description: 'Failed to save template.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Cancel with unsaved changes check
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      navigate(createPageUrl('QuickSendTemplates'));
    }
  };

  const confirmCancel = () => {
    setShowUnsavedDialog(false);
    navigate(createPageUrl('QuickSendTemplates'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-6 max-w-[1600px]">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isNew ? (isDuplicate ? 'Duplicate' : 'Create') : 'Edit'} Quick Send Template
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Bundle message, style, and design into a reusable preset
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons - Moved from footer */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-amber-500 hover:bg-amber-600">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isNew || isDuplicate ? 'Create' : 'Update'} Template
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Template Info & Settings */}
        <div className="space-y-6">
          <QuickSendFormFields
            formData={formData}
            updateFormData={updateFormData}
            selectedTemplate={selectedTemplate}
            selectedDesign={selectedCardDesign}
            noteStyleProfiles={noteStyleProfiles}
            onOpenTemplatePicker={() => setShowTemplatePicker(true)}
            onOpenDesignPicker={() => setShowDesignPicker(true)}
          />
          
          <QuickSendVisibilitySettings
            formData={formData}
            updateFormData={updateFormData}
            user={user}
          />
        </div>

        {/* Column 2: Card Design, Return Address & Physical Card Preview */}
        <div className="space-y-6">
          <CardDesignSelector 
            selectedDesign={selectedCardDesign}
            onOpenPicker={() => setShowDesignPicker(true)}
          />
          
          <ReturnAddressSelector 
            returnAddressMode={formData.returnAddressMode}
            onChange={(value) => updateFormData({ returnAddressMode: value })}
          />
          
          <PhysicalCardDisplay 
            selectedCardDesign={selectedCardDesign}
          />
        </div>

        {/* Column 3: Card Inside Preview */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <QuickSendPreviewPanel
            selectedTemplate={selectedTemplate}
            selectedNoteStyleProfile={selectedNoteStyleProfile}
            selectedCardDesign={selectedCardDesign}
            instanceSettings={instanceSettings}
            includeGreeting={formData.includeGreeting}
            includeSignature={formData.includeSignature}
            user={user}
            organization={organization}
          />
        </div>
      </div>

      {/* Modals */}
      <TemplatePickerModal
        open={showTemplatePicker}
        onOpenChange={setShowTemplatePicker}
        templates={templates}
        selectedId={formData.templateId}
        onSelect={(template) => updateFormData({ templateId: template.id })}
        user={user}
      />

      <CardDesignPickerModal
        open={showDesignPicker}
        onOpenChange={setShowDesignPicker}
        designs={cardDesigns}
        categories={cardDesignCategories}
        selectedId={formData.cardDesignId}
        onSelect={(design) => updateFormData({ cardDesignId: design.id })}
      />

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-600 hover:bg-red-700">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}