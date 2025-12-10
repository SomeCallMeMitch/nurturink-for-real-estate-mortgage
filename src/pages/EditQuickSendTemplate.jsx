import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import CardPreview from '@/components/preview/CardPreview';
import {
  Loader2,
  ArrowLeft,
  Save,
  Search,
  FileText,
  Palette,
  Zap
} from 'lucide-react';

export default function EditQuickSendTemplate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form state
  const [templateId, setTemplateId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    purpose: 'thank_you',
    templateId: null,
    noteStyleProfileId: null,
    cardDesignId: null,
    returnAddressMode: 'company',
    includeGreeting: true,
    includeSignature: true,
    type: 'personal'
  });
  
  // Related data
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedNoteStyle, setSelectedNoteStyle] = useState(null);
  const [selectedCardDesign, setSelectedCardDesign] = useState(null);
  
  // Available options
  const [templates, setTemplates] = useState([]);
  const [noteStyles, setNoteStyles] = useState([]);
  const [cardDesigns, setCardDesigns] = useState([]);
  const [cardPreviewSettings, setCardPreviewSettings] = useState(null);
  
  // Modal states
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [designSelectorOpen, setDesignSelectorOpen] = useState(false);
  
  // Search states
  const [templateSearch, setTemplateSearch] = useState('');
  const [designSearch, setDesignSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      // Load available options and settings
      const [templatesData, stylesData, designsData, settingsData] = await Promise.all([
        base44.entities.Template.list(),
        base44.entities.NoteStyleProfile.list(),
        base44.entities.CardDesign.list(),
        base44.entities.InstanceSettings.list()
      ]);
      
      setTemplates(templatesData);
      setNoteStyles(stylesData);
      setCardDesigns(designsData);
      
      // Load card preview settings
      console.log('🔧 EditQuickSendTemplate: InstanceSettings data:', settingsData);
      if (settingsData && settingsData.length > 0) {
        console.log('🔧 EditQuickSendTemplate: cardPreviewSettings from DB:', settingsData[0].cardPreviewSettings);
        setCardPreviewSettings(settingsData[0].cardPreviewSettings);
      } else {
        console.warn('⚠️ EditQuickSendTemplate: No InstanceSettings found in database!');
      }
      
      // Check if editing existing template
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      const duplicateFrom = params.get('duplicateFrom');
      
      if (id) {
        // Load existing template
        const existing = await base44.entities.QuickSendTemplate.filter({ id });
        if (existing.length > 0) {
          const template = existing[0];
          setTemplateId(template.id);
          setFormData({
            name: template.name,
            purpose: template.purpose,
            templateId: template.templateId,
            noteStyleProfileId: template.noteStyleProfileId,
            cardDesignId: template.cardDesignId,
            returnAddressMode: template.returnAddressMode,
            includeGreeting: template.includeGreeting,
            includeSignature: template.includeSignature,
            type: template.type
          });
          
          // Load related data
          if (template.templateId) {
            const t = templatesData.find(t => t.id === template.templateId);
            setSelectedTemplate(t);
          }
          if (template.noteStyleProfileId) {
            const s = stylesData.find(s => s.id === template.noteStyleProfileId);
            setSelectedNoteStyle(s);
          }
          if (template.cardDesignId) {
            const d = designsData.find(d => d.id === template.cardDesignId);
            setSelectedCardDesign(d);
          }
        }
      } else if (duplicateFrom) {
        // Duplicate from existing
        const existing = await base44.entities.QuickSendTemplate.filter({ id: duplicateFrom });
        if (existing.length > 0) {
          const template = existing[0];
          setFormData({
            name: `${template.name} (Copy)`,
            purpose: template.purpose,
            templateId: template.templateId,
            noteStyleProfileId: template.noteStyleProfileId,
            cardDesignId: template.cardDesignId,
            returnAddressMode: template.returnAddressMode,
            includeGreeting: template.includeGreeting,
            includeSignature: template.includeSignature,
            type: 'personal' // Always make duplicates personal
          });
          
          // Load related data
          if (template.templateId) {
            const t = templatesData.find(t => t.id === template.templateId);
            setSelectedTemplate(t);
          }
          if (template.noteStyleProfileId) {
            const s = stylesData.find(s => s.id === template.noteStyleProfileId);
            setSelectedNoteStyle(s);
          }
          if (template.cardDesignId) {
            const d = designsData.find(d => d.id === template.cardDesignId);
            setSelectedCardDesign(d);
          }
        }
      } else {
        // Set default type based on user role
        if (user.appRole === 'super_admin') {
          setFormData(prev => ({ ...prev, type: 'platform' }));
        } else if (user.appRole === 'organization_owner' || user.isOrgOwner) {
          setFormData(prev => ({ ...prev, type: 'organization' }));
        }
        
        // Set default template and card design for preview
        if (templatesData.length > 0) {
          const defaultTemplate = templatesData[0];
          setSelectedTemplate(defaultTemplate);
          setFormData(prev => ({ ...prev, templateId: defaultTemplate.id }));
        }
        
        if (designsData.length > 0) {
          const defaultDesign = designsData.find(d => d.isDefault) || designsData[0];
          setSelectedCardDesign(defaultDesign);
          setFormData(prev => ({ ...prev, cardDesignId: defaultDesign.id }));
        }
      }
      
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load template data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    console.log('📝 EditQuickSendTemplate: Selected template:', template.name, template.id);
    setSelectedTemplate(template);
    setFormData(prev => ({ ...prev, templateId: template.id }));
    setTemplateSelectorOpen(false);
  };

  const handleSelectNoteStyle = (styleId) => {
    const style = noteStyles.find(s => s.id === styleId);
    setSelectedNoteStyle(style);
    setFormData(prev => ({ ...prev, noteStyleProfileId: styleId }));
  };

  const handleSelectCardDesign = (design) => {
    console.log('🎨 EditQuickSendTemplate: Selected card design:', design.name, design.id);
    setSelectedCardDesign(design);
    setFormData(prev => ({ ...prev, cardDesignId: design.id }));
    setDesignSelectorOpen(false);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a template name',
        variant: 'destructive'
      });
      return;
    }
    
    if (!formData.templateId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a message template',
        variant: 'destructive'
      });
      return;
    }
    
    if (!formData.cardDesignId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a card design',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Generate preview snippet
      const previewSnippet = selectedTemplate?.content 
        ? selectedTemplate.content.substring(0, 100) 
        : null;
      
      const saveData = {
        ...formData,
        previewSnippet,
        createdByUserId: currentUser.id,
        orgId: currentUser.orgId
      };
      
      if (templateId) {
        // Update existing
        await base44.entities.QuickSendTemplate.update(templateId, saveData);
        toast({
          title: 'Template Updated',
          description: 'Quick Send Template has been updated successfully',
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      } else {
        // Create new
        await base44.entities.QuickSendTemplate.create(saveData);
        toast({
          title: 'Template Created',
          description: 'Quick Send Template has been created successfully',
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      }
      
      navigate(createPageUrl('QuickSendTemplates'));
      
    } catch (error) {
      console.error('Failed to save template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
    t.content.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const filteredDesigns = cardDesigns.filter(d =>
    d.name.toLowerCase().includes(designSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl('QuickSendTemplates'))}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {templateId ? 'Edit' : 'Create'} Quick Send Template
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Bundle message, style, and design into a reusable preset
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Template Name*</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Thank You - Post Job"
                />
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose*</Label>
                <Select
                  value={formData.purpose}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, purpose: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thank_you">Thank You</SelectItem>
                    <SelectItem value="referral_request">Referral Request</SelectItem>
                    <SelectItem value="review_request">Review Request</SelectItem>
                    <SelectItem value="review_and_referral">Review & Referral</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="anniversary">Anniversary</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="just_because">Just Because</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type (for admins) */}
              {(currentUser?.appRole === 'super_admin' || currentUser?.isOrgOwner) && (
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <RadioGroup
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="personal" id="personal" />
                      <Label htmlFor="personal" className="font-normal">Personal (only me)</Label>
                    </div>
                    {(currentUser?.appRole === 'organization_owner' || currentUser?.isOrgOwner) && (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="organization" id="organization" />
                        <Label htmlFor="organization" className="font-normal">Organization (all team members)</Label>
                      </div>
                    )}
                    {currentUser?.appRole === 'super_admin' && (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="platform" id="platform" />
                        <Label htmlFor="platform" className="font-normal">Platform (all users)</Label>
                      </div>
                    )}
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Bundle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Message Template */}
              <div className="space-y-2">
                <Label>Message Template*</Label>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setTemplateSelectorOpen(true)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {selectedTemplate ? selectedTemplate.name : 'Select Message'}
                </Button>
                {selectedTemplate && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {selectedTemplate.content}
                  </p>
                )}
              </div>

              {/* Writing Style */}
              <div className="space-y-2">
                <Label htmlFor="style">Writing Style</Label>
                <Select
                  value={formData.noteStyleProfileId || 'default'}
                  onValueChange={(value) => handleSelectNoteStyle(value === 'default' ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Default style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default style</SelectItem>
                    {noteStyles.map(style => (
                      <SelectItem key={style.id} value={style.id}>
                        {style.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Card Design */}
              <div className="space-y-2">
                <Label>Card Design*</Label>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setDesignSelectorOpen(true)}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  {selectedCardDesign ? selectedCardDesign.name : 'Select Design'}
                </Button>
                {selectedCardDesign && (
                  <div className="mt-2">
                    <img
                      src={selectedCardDesign.insideImageUrl}
                      alt={selectedCardDesign.name}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Greeting & Signature */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="greeting"
                    checked={formData.includeGreeting}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, includeGreeting: checked }))
                    }
                  />
                  <Label htmlFor="greeting" className="font-normal">Include Greeting</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="signature"
                    checked={formData.includeSignature}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, includeSignature: checked }))
                    }
                  />
                  <Label htmlFor="signature" className="font-normal">Include Signature</Label>
                </div>
              </div>

              {/* Return Address */}
              <div className="space-y-2">
                <Label>Return Address</Label>
                <RadioGroup
                  value={formData.returnAddressMode}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, returnAddressMode: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="company" />
                    <Label htmlFor="company" className="font-normal">Company Address</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rep" id="rep" />
                    <Label htmlFor="rep" className="font-normal">Rep Address</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none" className="font-normal">No Return Address</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                console.log('🖼️ EditQuickSendTemplate Preview Render Check:', {
                  hasTemplate: !!selectedTemplate,
                  hasDesign: !!selectedCardDesign,
                  hasSettings: !!cardPreviewSettings,
                  settingsValue: cardPreviewSettings
                });
                
                if (selectedTemplate && selectedCardDesign && cardPreviewSettings) {
                  console.log('✅ EditQuickSendTemplate: Rendering CardPreview with:', {
                    message: selectedTemplate.content?.substring(0, 50) + '...',
                    design: selectedCardDesign.name,
                    settings: cardPreviewSettings
                  });
                  return (
                    <CardPreview
                      message={selectedTemplate.content}
                      cardDesign={selectedCardDesign}
                      noteStyleProfile={selectedNoteStyle}
                      includeGreeting={formData.includeGreeting}
                      includeSignature={formData.includeSignature}
                      cardPreviewSettings={cardPreviewSettings}
                    />
                  );
                } else {
                  return (
                    <div className="text-center py-12 text-muted-foreground">
                      <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>
                        {!cardPreviewSettings 
                          ? 'Loading preview settings...' 
                          : !selectedTemplate
                          ? 'Select a message template'
                          : 'Select a card design'
                        }
                      </p>
                    </div>
                  );
                }
              })()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg">
        <div className="container mx-auto max-w-7xl flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl('QuickSendTemplates'))}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {templateId ? 'Update' : 'Create'} Template
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Template Selector Modal */}
      <Dialog open={templateSelectorOpen} onOpenChange={setTemplateSelectorOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Message Template</DialogTitle>
            <DialogDescription>
              Choose a message template for this Quick Send preset
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid gap-3 max-h-[50vh] overflow-y-auto">
              {filteredTemplates.map(template => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{template.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.content}
                        </p>
                      </div>
                      {template.id === formData.templateId && (
                        <Badge>Selected</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Card Design Selector Modal */}
      <Dialog open={designSelectorOpen} onOpenChange={setDesignSelectorOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Card Design</DialogTitle>
            <DialogDescription>
              Choose a card design for this Quick Send preset
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search designs..."
                value={designSearch}
                onChange={(e) => setDesignSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto">
              {filteredDesigns.map(design => (
                <Card
                  key={design.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSelectCardDesign(design)}
                >
                  <CardContent className="p-3">
                    <img
                      src={design.insideImageUrl}
                      alt={design.name}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <h4 className="font-semibold text-sm">{design.name}</h4>
                    {design.id === formData.cardDesignId && (
                      <Badge className="mt-2">Selected</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}