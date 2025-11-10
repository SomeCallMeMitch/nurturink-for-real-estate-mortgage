
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Save, Loader2, AlertTriangle } from "lucide-react";
import { debounce } from "lodash";

import EditModeSelector from "@/components/mailing/EditModeSelector";
import PlaceholderModal from "@/components/mailing/PlaceholderModal";
import TemplateLibrary from "@/components/mailing/TemplateLibrary";
import CardPreview from "@/components/preview/CardPreview";
import WorkflowSteps from "@/components/mailing/WorkflowSteps";

// Default fallback settings if API fails
const FALLBACK_SETTINGS = {
  cardPreviewSettings: {
    fontSize: 22, // Changed from 24 to 22
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

// Inline autosave hook
function useAutosave(data, saveFn, delay = 500, enabled = true) {
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef(null);
  const errorRef = useRef(null);
  const initialLoadRef = useRef(true);
  const [, forceUpdate] = useState({});

  const debouncedSave = useRef(
    debounce(async (dataToSave) => {
      if (!enabled) return;
      
      try {
        isSavingRef.current = true;
        forceUpdate({});
        errorRef.current = null;
        
        await saveFn(dataToSave);
        
        lastSavedRef.current = new Date();
        isSavingRef.current = false;
        forceUpdate({});
      } catch (error) {
        console.error('Autosave error:', error);
        errorRef.current = error;
        isSavingRef.current = false;
        forceUpdate({});
      }
    }, delay)
  ).current;

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    if (!enabled) return;

    debouncedSave(data);

    return () => {
      debouncedSave.cancel();
    };
  }, [data, enabled, debouncedSave]);

  const saveNow = useCallback(async () => {
    debouncedSave.cancel();
    
    try {
      isSavingRef.current = true;
      forceUpdate({});
      errorRef.current = null;
      
      await saveFn(data);
      
      lastSavedRef.current = new Date();
      isSavingRef.current = false;
      forceUpdate({});
    } catch (error) {
      console.error('Manual save error:', error);
      errorRef.current = error;
      isSavingRef.current = false;
      forceUpdate({});
      throw error;
    }
  }, [data, saveFn, debouncedSave]);

  return {
    isSaving: isSavingRef.current,
    lastSaved: lastSavedRef.current,
    error: errorRef.current,
    saveNow
  };
}

export default function CreateContent() {
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  
  // Get mailingBatchId from URL - handle both camelCase and lowercase
  const urlParams = new URLSearchParams(window.location.search);
  const mailingBatchId = urlParams.get('mailingBatchId') || urlParams.get('mailingbatchid');
  
  // Core data
  const [mailingBatch, setMailingBatch] = useState(null);
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [noteStyleProfiles, setNoteStyleProfiles] = useState([]);
  const [instanceSettings, setInstanceSettings] = useState(null);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null); 
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [editMode, setEditMode] = useState('bulk');
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);

  // Add state for column widths
  const [columnWidths, setColumnWidths] = useState({ 
    leftColumnSpan: 5, 
    centerColumnSpan: 3, 
    rightColumnSpan: 4 
  });
  
  // Local editable state (for autosave)
  const [localGlobalMessage, setLocalGlobalMessage] = useState('');
  const [localContentOverrides, setLocalContentOverrides] = useState({});
  const [localIncludeGreeting, setLocalIncludeGreeting] = useState(true);
  const [localIncludeSignature, setLocalIncludeSignature] = useState(true);
  const [localSelectedNoteStyleProfileId, setLocalSelectedNoteStyleProfileId] = useState(null);
  
  // New override states for individual client options
  const [localGreetingOverrides, setLocalGreetingOverrides] = useState({});
  const [localSignatureOverrides, setLocalSignatureOverrides] = useState({});
  const [localNoteStyleProfileOverrides, setLocalNoteStyleProfileOverrides] = useState({});

  // Calculate total available credits with CORRECTED hierarchy
  const totalAvailableCredits = useMemo(() => {
    if (!user) return 0;
    
    const companyAllocated = user.companyAllocatedCredits || 0;
    const personalPurchased = user.personalPurchasedCredits || 0;
    
    // Only include company pool if user has access
    // user.canAccessCompanyPool can be undefined, true, or false.
    // If undefined or true, access is granted. If explicitly false, access is denied.
    const canAccessPool = user.canAccessCompanyPool !== false;
    const companyCredits = canAccessPool ? (organization?.creditBalance || 0) : 0;
    
    return companyAllocated + companyCredits + personalPurchased;
  }, [user, organization]);

  // Load all data on mount
  useEffect(() => {
    console.log('🚀 CreateContent mounted');
    console.log('📋 mailingBatchId from URL:', mailingBatchId);
    
    if (mailingBatchId) {
      loadData();
    } else {
      console.error('❌ No mailing batch ID provided');
      setError('No mailing batch ID provided');
      setErrorDetails('URL parameters: ' + window.location.search);
      setLoading(false);
    }
  }, [mailingBatchId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetails(null);
      
      console.log('📡 Step 1: Loading user...');
      const currentUser = await base44.auth.me();
      console.log('✅ User loaded:', currentUser.email);
      console.log('👤 User orgId:', currentUser.orgId);
      setUser(currentUser);
      
      // Load organization data
      console.log('📡 Step 2: Loading organization...');
      if (currentUser.orgId) {
        const orgList = await base44.entities.Organization.filter({ id: currentUser.orgId });
        if (orgList && orgList.length > 0) {
          console.log('✅ Organization loaded:', orgList[0].name);
          setOrganization(orgList[0]);
        } else {
          console.log('⚠️ Organization not found for orgId:', currentUser.orgId);
        }
      } else {
        console.log('⚠️ User has no orgId');
      }
      
      console.log('📡 Step 3: Loading mailing batch...');
      const batch = await base44.entities.MailingBatch.filter({ id: mailingBatchId });
      console.log('✅ Mailing batch query result:', batch);
      
      if (!batch || batch.length === 0) {
        throw new Error('Mailing batch not found');
      }
      
      const batchData = batch[0];
      console.log('✅ Mailing batch loaded:', batchData.id);
      setMailingBatch(batchData);
      
      // Initialize local state from batch (including new override states)
      setLocalGlobalMessage(batchData.globalMessage || '');
      setLocalContentOverrides(batchData.contentOverrides || {});
      setLocalIncludeGreeting(batchData.includeGreeting);
      setLocalIncludeSignature(batchData.includeSignature);
      setLocalSelectedNoteStyleProfileId(batchData.selectedNoteStyleProfileId);
      
      // Initialize override states from batch
      setLocalGreetingOverrides(batchData.greetingOverrides || {});
      setLocalSignatureOverrides(batchData.signatureOverrides || {});
      setLocalNoteStyleProfileOverrides(batchData.noteStyleProfileOverrides || {});
      
      console.log('📡 Step 4: Loading clients...');
      const clientList = await base44.entities.Client.filter({
        id: { $in: batchData.selectedClientIds }
      });
      console.log('✅ Clients loaded:', clientList.length);
      setClients(clientList);
      
      console.log('📡 Step 5: Loading templates...');
      
      // Load all templates using the same queries as Templates page
      const [personal, organizationTemplates, platform] = await Promise.all([
        base44.entities.Template.filter({ 
          createdByUserId: currentUser.id, 
          type: 'personal' 
        }),
        base44.entities.Template.filter({ 
          orgId: currentUser.orgId, 
          type: 'organization',
          status: 'approved'
        }),
        base44.entities.Template.filter({ 
          type: 'platform',
          isDefault: true, 
          status: 'approved' 
        })
      ]);
      
      // Combine all templates
      const allTemplates = [...personal, ...organizationTemplates, ...platform];
      
      console.log('✅ Templates loaded:', {
        personal: personal.length,
        organization: organizationTemplates.length,
        platform: platform.length,
        total: allTemplates.length
      });
      
      setTemplates(allTemplates);
      
      console.log('📡 Step 6: Loading note style profiles...');
      const profileList = await base44.entities.NoteStyleProfile.filter({
        orgId: currentUser.orgId
      });
      console.log('✅ Note style profiles loaded:', profileList.length);
      setNoteStyleProfiles(profileList);
      
      // Auto-select default profile if batch doesn't have one selected
      if (!batchData.selectedNoteStyleProfileId && profileList.length > 0) {
        const defaultProfile = profileList.find(p => p.isDefault) || profileList[0];
        setLocalSelectedNoteStyleProfileId(defaultProfile.id);
        console.log('✅ Auto-selected default note style profile:', defaultProfile.name);
      }
      
      console.log('📡 Step 7: Loading instance settings...');
      try {
        const settingsResponse = await base44.functions.invoke('getInstanceSettings');
        console.log('✅ Instance settings loaded:', settingsResponse);
        setInstanceSettings(settingsResponse.data);
      } catch (settingsError) {
        console.error('⚠️ Failed to load instance settings, using fallback:', settingsError);
        setInstanceSettings(FALLBACK_SETTINGS);
      }
      
      console.log('📡 Step 8: Loading column width settings...'); 
      try {
        const layoutResponse = await base44.functions.invoke('getCreateContentLayoutSettings');
        console.log('✅ Column width settings loaded:', layoutResponse);
        setColumnWidths(layoutResponse.data);
      } catch (layoutError) {
        console.error('⚠️ Failed to load column width settings, using defaults:', layoutError);
        // Keep default values already set in state
      }
      
      console.log('✅ All data loaded successfully');
      setLoading(false);
    } catch (err) {
      console.error('❌ Failed to load data:', err);
      setError(err.message || 'Failed to load data');
      setErrorDetails(JSON.stringify({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      }, null, 2));
      setLoading(false);
    }
  };

  // Autosave function
  const saveChanges = async (data) => {
    await base44.entities.MailingBatch.update(mailingBatchId, data);
  };

  // Updated autosave data object to include new overrides
  const autosaveData = useMemo(() => ({
    globalMessage: localGlobalMessage,
    contentOverrides: localContentOverrides,
    includeGreeting: localIncludeGreeting,
    includeSignature: localIncludeSignature,
    selectedNoteStyleProfileId: localSelectedNoteStyleProfileId,
    greetingOverrides: localGreetingOverrides,
    signatureOverrides: localSignatureOverrides,
    noteStyleProfileOverrides: localNoteStyleProfileOverrides
  }), [
    localGlobalMessage, 
    localContentOverrides, 
    localIncludeGreeting, 
    localIncludeSignature, 
    localSelectedNoteStyleProfileId,
    localGreetingOverrides,
    localSignatureOverrides,
    localNoteStyleProfileOverrides
  ]);

  // Setup autosave
  const { isSaving, lastSaved, saveNow } = useAutosave(
    autosaveData,
    saveChanges,
    500,
    !loading && mailingBatch !== null
  );

  // Handle edit mode change
  const handleModeChange = (mode, recipientId) => {
    setEditMode(mode);
    setSelectedRecipientId(recipientId);
  };

  // Handle clicking on a recipient name in the list
  const handleRecipientClick = (clientId) => {
    setEditMode('individual');
    setSelectedRecipientId(clientId);
  };

  // Get current message based on mode
  const getCurrentMessage = () => {
    if (editMode === 'bulk') {
      return localGlobalMessage;
    } else {
      return localContentOverrides[selectedRecipientId] || localGlobalMessage || '';
    }
  };

  // Update message based on mode
  const handleMessageChange = (newMessage) => {
    if (editMode === 'bulk') {
      setLocalGlobalMessage(newMessage);
    } else {
      setLocalContentOverrides(prev => ({
        ...prev,
        [selectedRecipientId]: newMessage
      }));
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    handleMessageChange(template.content);
  };

  // Handle placeholder insertion
  const handlePlaceholderSelect = (placeholder) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentMessage = getCurrentMessage();
    
    const newMessage = 
      currentMessage.slice(0, start) + 
      placeholder + 
      currentMessage.slice(end);
    
    handleMessageChange(newMessage);
    
    // Set cursor position after placeholder
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
      textarea.focus();
    }, 0);
  };

  // Get current greeting value based on mode
  const getCurrentIncludeGreeting = () => {
    if (editMode === 'individual' && selectedRecipientId) {
      // Check if there's an override for this client
      if (localGreetingOverrides.hasOwnProperty(selectedRecipientId)) {
        return localGreetingOverrides[selectedRecipientId];
      }
    }
    // Fall back to global setting
    return localIncludeGreeting;
  };

  // Get current signature value based on mode
  const getCurrentIncludeSignature = () => {
    if (editMode === 'individual' && selectedRecipientId) {
      // Check if there's an override for this client
      if (localSignatureOverrides.hasOwnProperty(selectedRecipientId)) {
        return localSignatureOverrides[selectedRecipientId];
      }
    }
    // Fall back to global setting
    return localIncludeSignature;
  };

  // Get current note style profile value based on mode
  const getCurrentNoteStyleProfileId = () => {
    if (editMode === 'individual' && selectedRecipientId) {
      // Check if there's an override for this client
      if (localNoteStyleProfileOverrides.hasOwnProperty(selectedRecipientId)) {
        return localNoteStyleProfileOverrides[selectedRecipientId];
      }
    }
    // Fall back to global setting
    return localSelectedNoteStyleProfileId;
  };

  // Handle greeting checkbox change
  const handleGreetingChange = (checked) => {
    if (editMode === 'bulk') {
      setLocalIncludeGreeting(checked);
    } else {
      setLocalGreetingOverrides(prev => ({
        ...prev,
        [selectedRecipientId]: checked
      }));
    }
  };

  // Handle signature checkbox change
  const handleSignatureChange = (checked) => {
    if (editMode === 'bulk') {
      setLocalIncludeSignature(checked);
    } else {
      setLocalSignatureOverrides(prev => ({
        ...prev,
        [selectedRecipientId]: checked
      }));
    }
  };

  // Handle note style profile change
  const handleNoteStyleProfileChange = (profileId) => {
    if (editMode === 'bulk') {
      setLocalSelectedNoteStyleProfileId(profileId);
    } else {
      setLocalNoteStyleProfileOverrides(prev => ({
        ...prev,
        [selectedRecipientId]: profileId
      }));
    }
  };

  // Get current client for preview
  const getCurrentClient = () => {
    if (editMode === 'individual' && selectedRecipientId) {
      return clients.find(c => c.id === selectedRecipientId);
    }
    // Return first client as sample for bulk mode
    return clients[0] || {};
  };

  // Get selected note style profile (updated to use getCurrentNoteStyleProfileId)
  const selectedNoteStyleProfile = useMemo(() => {
    const currentProfileId = getCurrentNoteStyleProfileId();
    if (!currentProfileId) return null;
    return noteStyleProfiles.find(p => p.id === currentProfileId);
  }, [getCurrentNoteStyleProfileId, noteStyleProfiles]);

  // PHASE 2: Helper function to check if a client has any custom overrides
  const hasCustomOverrides = (clientId) => {
    return !!(
      localContentOverrides[clientId] ||
      localGreetingOverrides.hasOwnProperty(clientId) ||
      localSignatureOverrides.hasOwnProperty(clientId) ||
      localNoteStyleProfileOverrides.hasOwnProperty(clientId)
    );
  };

  // Prepare recipients for EditModeSelector
  const recipients = useMemo(() => 
    clients.map(client => ({
      id: client.id,
      name: client.fullName || 'Unnamed Client'
    })),
    [clients]
  );

  // UPDATED: Handle continue - save before navigating
  const handleContinue = async () => {
    try {
      // Save any pending changes before navigating
      console.log('💾 Saving changes before navigation...');
      await saveNow();
      console.log('✅ Changes saved successfully');
      
      // Navigate to next step
      navigate(createPageUrl(`SelectDesign?mailingBatchId=${mailingBatchId}`));
    } catch (err) {
      console.error('❌ Failed to save before navigation:', err);
      // Display a user-friendly error message
      setError('Failed to save your changes. Please try again.');
      setErrorDetails(err.message || 'Unknown error during save before navigation');
    }
  };

  // NEW: Handle back navigation
  const handleBack = () => {
    navigate(createPageUrl(`FindClients?mailingBatchId=${mailingBatchId}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading content editor...</p>
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
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Page</h2>
              <p className="text-gray-600 mb-4">{error}</p>
            </div>
            
            {errorDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Debug Information:</h3>
                <pre className="text-xs text-gray-600 overflow-auto max-h-64 whitespace-pre-wrap">
                  {errorDetails}
                </pre>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate(createPageUrl('Home'))}>
                Go Home
              </Button>
              <Button onClick={() => navigate(createPageUrl('FindClients'))} variant="outline">
                Back to Clients
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

  if (!mailingBatch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-600 mb-2">Mailing Batch Not Found</h2>
              <p className="text-gray-600 mb-4">The requested mailing batch could not be found.</p>
              <Button onClick={() => navigate(createPageUrl('FindClients'))}>
                Back to Clients
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Workflow Steps Header with Back Button and Title */}
      <WorkflowSteps 
        currentStep={2} 
        creditsLeft={totalAvailableCredits}
        pageTitle="Create Content"
        onBackClick={handleBack}
      />
      
      <div className="max-w-[1600px] mx-auto p-6">
        {/* Three-Column Layout - DYNAMIC WIDTHS */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Recipients + Template Library */}
          <div style={{ gridColumn: `span ${columnWidths.leftColumnSpan}` }} className="space-y-6">
            {/* Recipients Section - INCREASED FONT SIZE BY 25% */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-gray-900">Recipients</h3>
                  <div className="text-sm font-medium text-gray-900">
                    {clients.length} {clients.length === 1 ? 'recipient' : 'recipients'}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-900 mb-3 font-medium">
                  <span>1/{clients.length}</span>
                  <div className="flex gap-1">
                    <button className="hover:text-gray-700">←</button>
                    <button className="hover:text-gray-700">→</button>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {clients.map(client => {
                    const isEditing = editMode === 'individual' && selectedRecipientId === client.id;
                    const hasCustom = hasCustomOverrides(client.id);
                    
                    return (
                      <button
                        key={client.id}
                        onClick={() => handleRecipientClick(client.id)}
                        className={`w-full text-left px-3 py-2 text-base rounded transition-all ${
                          isEditing
                            ? 'bg-[#fff8f8] border-l-4 border-l-[#d32f2f] font-semibold text-gray-900'
                            : 'border-l-4 border-l-transparent hover:bg-gray-50 text-gray-900 font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{client.fullName || 'Unnamed Client'}</span>
                          {hasCustom && !isEditing && (
                            <span className="px-2 py-0.5 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full">
                              Custom
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Template Library */}
            <TemplateLibrary
              templates={templates}
              onTemplateSelect={handleTemplateSelect}
              user={user}
            />
          </div>

          {/* Center Column: Message Editor */}
          <div style={{ gridColumn: `span ${columnWidths.centerColumnSpan}` }}>
            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Save Status */}
                <div className="flex items-center justify-end text-xs text-gray-500">
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Saving...
                    </span>
                  ) : lastSaved ? (
                    <span className="flex items-center gap-2 text-green-600">
                      <Save className="w-3 h-3" />
                      Saved
                    </span>
                  ) : null}
                </div>

                {/* Edit Mode Selector */}
                <EditModeSelector
                  mode={editMode}
                  selectedRecipientId={selectedRecipientId}
                  recipients={recipients}
                  onModeChange={handleModeChange}
                />

                {/* Writing Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Writing Style
                  </label>
                  <Select
                    value={getCurrentNoteStyleProfileId() || ''}
                    onValueChange={handleNoteStyleProfileChange}
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
                  <Textarea
                    ref={textareaRef}
                    value={getCurrentMessage()}
                    onChange={(e) => handleMessageChange(e.target.value)}
                    placeholder="Type your message here..."
                    className="min-h-[300px] text-sm"
                  />
                </div>

                {/* Placeholder Buttons - REPLACED WITH MODAL */}
                <PlaceholderModal onPlaceholderSelect={handlePlaceholderSelect} />

                {/* Include Options */}
                <div className="flex items-center gap-6 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeGreeting"
                      checked={getCurrentIncludeGreeting()}
                      onCheckedChange={handleGreetingChange}
                    />
                    <label htmlFor="includeGreeting" className="text-sm font-medium">
                      Include Greeting
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeSignature"
                      checked={getCurrentIncludeSignature()}
                      onCheckedChange={handleSignatureChange}
                    />
                    <label htmlFor="includeSignature" className="text-sm font-medium">
                      Include Signature
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Preview */}
          <div style={{ gridColumn: `span ${columnWidths.rightColumnSpan}` }}>
            <Card className="sticky top-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Preview for {getCurrentClient().fullName || 'Client'}</h3>
                
                {/* Preview container with proper width and padding */}
                <div className="flex justify-center px-4">
                  {instanceSettings && (
                    <div className="w-full max-w-[440px]">
                      {/* Updated to use new getters */}
                      <CardPreview
                        message={getCurrentMessage()}
                        client={getCurrentClient()}
                        user={user}
                        organization={organization} 
                        noteStyleProfile={selectedNoteStyleProfile}
                        selectedDesign={null}
                        previewSettings={instanceSettings.cardPreviewSettings}
                        includeGreeting={getCurrentIncludeGreeting()}
                        includeSignature={getCurrentIncludeSignature()}
                        randomIndentEnabled={true}
                        showLineCounter={true}
                      />
                    </div>
                  )}
                  
                  {!instanceSettings && (
                    <div className="text-center py-12 text-gray-500">
                      Loading preview...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {clients.length} clients selected
          </div>
          
          <Button
            onClick={handleContinue}
            className="bg-orange-500 hover:bg-orange-600 gap-2"
          >
            Continue to Select Design
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
