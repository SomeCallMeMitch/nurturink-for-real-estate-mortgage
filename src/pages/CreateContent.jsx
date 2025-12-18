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
import { Pill } from "@/components/ui/Pill";
import { debounce } from "lodash";

import EditModeSelector from "@/components/mailing/EditModeSelector";
import PlaceholderModal from "@/components/mailing/PlaceholderModal";
import TemplateLibrary from "@/components/mailing/TemplateLibrary";
import CardPreview from "@/components/preview/CardPreview";
import WorkflowSteps from "@/components/mailing/WorkflowSteps";

// Default fallback settings if API fails
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
    
    const canAccessPool = user.canAccessCompanyPool !== false;
    const companyCredits = canAccessPool ? (organization?.creditBalance || 0) : 0;
    
    return companyAllocated + companyCredits + personalPurchased;
  }, [user, organization]);

  // Load all data on mount
  useEffect(() => {
    console.log('ðŸš€ CreateContent mounted');
    console.log('ðŸ“‹ mailingBatchId from URL:', mailingBatchId);
    
    if (mailingBatchId) {
      loadData();
    } else {
      console.error('âŒ No mailing batch ID provided');
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
      
      console.log('ðŸ“¡ Step 1: Loading user...');
      const currentUser = await base44.auth.me();
      console.log('âœ… User loaded:', currentUser.email);
      
      // Enrich user object with additional data for placeholder replacement
      const enrichedUser = { ...currentUser };
      
      // Derive firstName and lastName from full_name if not already set
      if (currentUser.full_name && !currentUser.firstName) {
        const nameParts = currentUser.full_name.split(' ');
        enrichedUser.firstName = nameParts[0];
        enrichedUser.lastName = nameParts.slice(1).join(' ');
      }
      
      // Fetch user's default phone number
      try {
        const userPhones = await base44.entities.UserPhone.filter({ userId: currentUser.id, isDefault: true });
        if (userPhones.length > 0) {
          enrichedUser.phone = userPhones[0].phoneNumber;
        }
      } catch (error) {
        console.log('âš ï¸ Could not load user phone:', error);
      }
      
      setUser(enrichedUser);
      
      console.log('ðŸ“¡ Step 2: Loading organization...');
      if (currentUser.orgId) {
        const orgList = await base44.entities.Organization.filter({ id: currentUser.orgId });
        if (orgList && orgList.length > 0) {
          const currentOrganization = orgList[0];
          console.log('âœ… Organization loaded:', currentOrganization.name);
          setOrganization(currentOrganization);
          
          // Add organization's name as user's companyName if not already set
          if (!enrichedUser.companyName) {
            enrichedUser.companyName = currentOrganization.name;
          }
          // Add organization's phone if user doesn't have a default phone
          if (!enrichedUser.phone && currentOrganization.phone) {
            enrichedUser.phone = currentOrganization.phone;
          }
          setUser(enrichedUser);
        }
      }
      
      console.log('ðŸ“¡ Step 3: Loading mailing batch...');
      const batch = await base44.entities.MailingBatch.filter({ id: mailingBatchId });
      
      if (!batch || batch.length === 0) {
        throw new Error('Mailing batch not found');
      }
      
      const batchData = batch[0];
      console.log('âœ… Mailing batch loaded:', batchData.id);
      setMailingBatch(batchData);
      
      setLocalGlobalMessage(batchData.globalMessage || '');
      setLocalContentOverrides(batchData.contentOverrides || {});
      setLocalIncludeGreeting(batchData.includeGreeting);
      setLocalIncludeSignature(batchData.includeSignature);
      setLocalSelectedNoteStyleProfileId(batchData.selectedNoteStyleProfileId);
      setLocalGreetingOverrides(batchData.greetingOverrides || {});
      setLocalSignatureOverrides(batchData.signatureOverrides || {});
      setLocalNoteStyleProfileOverrides(batchData.noteStyleProfileOverrides || {});
      
      console.log('ðŸ“¡ Step 4: Loading clients...');
      const clientList = await base44.entities.Client.filter({
        id: { $in: batchData.selectedClientIds }
      });
      console.log('âœ… Clients loaded:', clientList.length);
      setClients(clientList);
      
      console.log('ðŸ“¡ Step 5: Loading templates...');
      const [personal, organizationTemplates, platform] = await Promise.all([
        base44.entities.Template.filter({ 
          createdByUserId: currentUser.id, 
          type: 'personal' 
        }),
        base44.entities.Template.filter({ 
          orgId: currentUser.orgId, 
          type: 'organization'
        }),
        base44.entities.Template.filter({ 
          type: 'platform',
          status: 'approved' 
        })
      ]);
      
      const allTemplates = [...personal, ...organizationTemplates, ...platform];
      console.log('âœ… Templates loaded:', allTemplates.length);
      setTemplates(allTemplates);
      
      // PHASE 3: Auto-apply default template if globalMessage is empty
      if (!batchData.globalMessage || batchData.globalMessage.trim() === '') {
        const defaultTemplate = allTemplates.find(t => t.isDefault === true);
        
        if (defaultTemplate) {
          console.log('ðŸŽ¯ PHASE 3: Auto-applying default template:', defaultTemplate.name);
          setLocalGlobalMessage(defaultTemplate.content);
          
          await base44.entities.MailingBatch.update(mailingBatchId, {
            globalMessage: defaultTemplate.content
          });
          
          console.log('âœ… Default template applied and saved');
        } else {
          console.log('â„¹ï¸ No default template found to auto-apply');
        }
      } else {
        console.log('â„¹ï¸ Global message already exists, skipping default template auto-apply');
      }
      
      console.log('ðŸ“¡ Step 6: Loading note style profiles...');
      const allOrgProfiles = await base44.entities.NoteStyleProfile.filter({
        orgId: currentUser.orgId
      });
      
      // Filter to only personal (user's own) and org-wide profiles
      const relevantProfiles = allOrgProfiles.filter(p => 
        p.userId === currentUser.id || p.isOrgWide === true
      );
      
      console.log('âœ… Note style profiles loaded:', {
        total: allOrgProfiles.length,
        relevant: relevantProfiles.length,
        personal: relevantProfiles.filter(p => p.userId === currentUser.id).length,
        orgWide: relevantProfiles.filter(p => p.isOrgWide === true).length
      });
      setNoteStyleProfiles(relevantProfiles);
      
      if (!batchData.selectedNoteStyleProfileId && relevantProfiles.length > 0) {
        const defaultProfile = relevantProfiles.find(p => p.isDefault) || relevantProfiles[0];
        setLocalSelectedNoteStyleProfileId(defaultProfile.id);
        console.log('âœ… Auto-selected default note style profile:', defaultProfile.name);
      }
      
      console.log('ðŸ“¡ Step 7: Loading instance settings...');
      try {
        const settingsResponse = await base44.functions.invoke('getInstanceSettings');
        setInstanceSettings(settingsResponse.data);
      } catch (settingsError) {
        console.error('âš ï¸ Failed to load instance settings, using fallback');
        setInstanceSettings(FALLBACK_SETTINGS);
      }
      
      console.log('ðŸ“¡ Step 8: Loading column width settings...'); 
      try {
        const layoutResponse = await base44.functions.invoke('getCreateContentLayoutSettings');
        setColumnWidths(layoutResponse.data);
      } catch (layoutError) {
        console.error('âš ï¸ Failed to load column width settings, using defaults');
      }
      
      console.log('âœ… All data loaded successfully');
      setLoading(false);
    } catch (err) {
      console.error('âŒ Failed to load data:', err);
      setError(err.message || 'Failed to load data');
      setErrorDetails(JSON.stringify({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      }, null, 2));
      setLoading(false);
    }
  };

  const saveChanges = async (data) => {
    await base44.entities.MailingBatch.update(mailingBatchId, data);
  };

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

  const { isSaving, lastSaved, saveNow } = useAutosave(
    autosaveData,
    saveChanges,
    500,
    !loading && mailingBatch !== null
  );

  const handleModeChange = (mode, recipientId) => {
    setEditMode(mode);
    setSelectedRecipientId(recipientId);
  };

  const handleRecipientClick = (clientId) => {
    setEditMode('individual');
    setSelectedRecipientId(clientId);
  };

  const getCurrentMessage = () => {
    if (editMode === 'bulk') {
      return localGlobalMessage;
    } else {
      return localContentOverrides[selectedRecipientId] || localGlobalMessage || '';
    }
  };

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

  const handleTemplateSelect = (template) => {
    handleMessageChange(template.content);
  };

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
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
      textarea.focus();
    }, 0);
  };

  const getCurrentIncludeGreeting = () => {
    if (editMode === 'individual' && selectedRecipientId) {
      if (localGreetingOverrides.hasOwnProperty(selectedRecipientId)) {
        return localGreetingOverrides[selectedRecipientId];
      }
    }
    return localIncludeGreeting;
  };

  const getCurrentIncludeSignature = () => {
    if (editMode === 'individual' && selectedRecipientId) {
      if (localSignatureOverrides.hasOwnProperty(selectedRecipientId)) {
        return localSignatureOverrides[selectedRecipientId];
      }
    }
    return localIncludeSignature;
  };

  const getCurrentNoteStyleProfileId = () => {
    if (editMode === 'individual' && selectedRecipientId) {
      if (localNoteStyleProfileOverrides.hasOwnProperty(selectedRecipientId)) {
        return localNoteStyleProfileOverrides[selectedRecipientId];
      }
    }
    return localSelectedNoteStyleProfileId;
  };

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

  const getCurrentClient = () => {
    if (editMode === 'individual' && selectedRecipientId) {
      return clients.find(c => c.id === selectedRecipientId);
    }
    return clients[0] || {};
  };

  const selectedNoteStyleProfile = useMemo(() => {
    const currentProfileId = getCurrentNoteStyleProfileId();
    if (!currentProfileId) return null;
    return noteStyleProfiles.find(p => p.id === currentProfileId);
  }, [getCurrentNoteStyleProfileId, noteStyleProfiles]);

  const hasCustomOverrides = (clientId) => {
    return !!(
      localContentOverrides[clientId] ||
      localGreetingOverrides.hasOwnProperty(clientId) ||
      localSignatureOverrides.hasOwnProperty(clientId) ||
      localNoteStyleProfileOverrides.hasOwnProperty(clientId)
    );
  };

  const recipients = useMemo(() => {
    return clients.map(client => ({
      id: client.id,
      name: client.fullName || 'Unnamed Client'
    }));
  }, [clients]);

  const handleContinue = async () => {
    try {
      console.log('ðŸ’¾ Saving changes before navigation...');
      await saveNow();
      console.log('âœ… Changes saved successfully');
      navigate(createPageUrl(`SelectDesign?mailingBatchId=${mailingBatchId}`));
    } catch (err) {
      console.error('âŒ Failed to save before navigation:', err);
      setError('Failed to save your changes. Please try again.');
      setErrorDetails(err.message || 'Unknown error during save before navigation');
    }
  };

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
              <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Page</h2>
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
              <h2 className="text-xl font-bold text-destructive mb-2">Mailing Batch Not Found</h2>
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
      <WorkflowSteps 
        currentStep={2} 
        creditsLeft={totalAvailableCredits}
        pageTitle="Create Content"
        onBackClick={handleBack}
      />
      
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          <div style={{ gridColumn: `span ${columnWidths.leftColumnSpan}` }} className="space-y-6">
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
                    <button className="hover:text-gray-700">â†</button>
                    <button className="hover:text-gray-700">â†’</button>
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
                            ? 'selection-active'
                            : 'border-l-4 border-l-transparent hover:bg-muted/50 text-foreground font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{client.fullName || 'Unnamed Client'}</span>
                          {hasCustom && !isEditing && (
                            <Pill variant="custom" size="sm">
                              Custom
                            </Pill>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <TemplateLibrary
              templates={templates}
              onTemplateSelect={handleTemplateSelect}
              user={user}
            />
          </div>

          <div style={{ gridColumn: `span ${columnWidths.centerColumnSpan}` }}>
            <Card>
              <CardContent className="pt-6 space-y-6">
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

                <EditModeSelector
                  mode={editMode}
                  selectedRecipientId={selectedRecipientId}
                  recipients={recipients}
                  onModeChange={handleModeChange}
                />

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

                <div>
                  <Textarea
                    ref={textareaRef}
                    value={getCurrentMessage()}
                    onChange={(e) => handleMessageChange(e.target.value)}
                    placeholder="Type your message here..."
                    className="min-h-[300px] text-sm"
                  />
                </div>

                <PlaceholderModal onPlaceholderSelect={handlePlaceholderSelect} />

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

          <div style={{ gridColumn: `span ${columnWidths.rightColumnSpan}` }}>
            <Card className="sticky top-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Preview for {getCurrentClient().fullName || 'Client'}</h3>
                
                <div className="flex justify-center px-4">
                  {instanceSettings && (
                    <div className="w-full max-w-[440px]">
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

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {clients.length} clients selected
          </div>
          
          <Button
            onClick={handleContinue}
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            Continue to Select Design
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}