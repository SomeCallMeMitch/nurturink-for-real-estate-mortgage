import React, { useState, useEffect, useRef, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
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
  const [template, setTemplate] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Editable state
  const [messageContent, setMessageContent] = useState('');
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
          setTemplate(loadedTemplate);
          setMessageContent(loadedTemplate.content || '');
        } else {
          throw new Error('Template not found');
        }
      } else {
        console.log('📝 Creating new template');
        setMessageContent('');
      }
      
      console.log('✅ All data loaded successfully');
      setLoading(false);
    } catch (err) {
      console.error('❌ Failed to load data:', err);
      setError(err.message || 'Failed to load data');
      setLoading(false);
    }
  };

  // Handle placeholder insertion
  const handlePlaceholderSelect = (placeholder) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newContent = 
      messageContent.slice(0, start) + 
      placeholder + 
      messageContent.slice(end);
    
    setMessageContent(newContent);
    
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
          
          <h1 className="text-3xl font-bold text-gray-900">
            Template Preview (Development)
          </h1>
          <p className="text-gray-600 mt-1">
            Testing the live preview feature for templates
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Editor */}
          <div className="col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isNew ? 'New Template' : template?.name || 'Template'}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Writing Style Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Writing Style
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content
                  </label>
                  <Textarea
                    ref={textareaRef}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type your message here..."
                    className="min-h-[300px] text-sm"
                  />
                </div>

                {/* Placeholder Button */}
                <PlaceholderModal onPlaceholderSelect={handlePlaceholderSelect} />

                {/* Include Options */}
                <div className="flex items-center gap-6 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeGreeting"
                      checked={includeGreeting}
                      onCheckedChange={setIncludeGreeting}
                    />
                    <label htmlFor="includeGreeting" className="text-sm font-medium">
                      Include Greeting
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeSignature"
                      checked={includeSignature}
                      onCheckedChange={setIncludeSignature}
                    />
                    <label htmlFor="includeSignature" className="text-sm font-medium">
                      Include Signature
                    </label>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Preview Notes:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Preview uses sample client data: {SAMPLE_CLIENT.fullName}</li>
                    <li>• Changes update live on the right side</li>
                    <li>• This is a development/testing page</li>
                    <li>• Final version will be integrated into EditTemplate</li>
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
                        message={messageContent}
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