
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
import PlaceholderSelector from "@/components/mailing/PlaceholderSelector";
import TemplateLibrary from "@/components/mailing/TemplateLibrary";
import CardPreview from "@/components/preview/CardPreview";

// Default fallback settings if API fails
const FALLBACK_SETTINGS = {
  cardPreviewSettings: {
    fontSize: 18,
    lineHeight: 1.1,
    baseTextWidth: 355,
    baseMarginLeft: 48,
    shortCardMaxLines: 13,
    maxPreviewLines: 19,
    topHalfPaddingTop: 125,
    gapAboveFold: 14,
    gapBelowFold: 14,
    shortBelowFold: 14,
    maxIndent: 16,
    indentAmplitude: 6,
    indentNoise: 2,
    indentFrequency: 0.35,
    shiftRight: 0,
    rightPadding: 12,
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
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [editMode, setEditMode] = useState('bulk');
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);
  
  // Local editable state (for autosave)
  const [localGlobalMessage, setLocalGlobalMessage] = useState('');
  const [localContentOverrides, setLocalContentOverrides] = useState({});
  const [localIncludeGreeting, setLocalIncludeGreeting] = useState(true);
  const [localIncludeSignature, setLocalIncludeSignature] = useState(true);
  const [localSelectedNoteStyleProfileId, setLocalSelectedNoteStyleProfileId] = useState(null);

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
      setUser(currentUser);
      
      console.log('📡 Step 2: Loading mailing batch...');
      const batch = await base44.entities.MailingBatch.filter({ id: mailingBatchId });
      console.log('✅ Mailing batch query result:', batch);
      
      if (!batch || batch.length === 0) {
        throw new Error('Mailing batch not found');
      }
      
      const batchData = batch[0];
      console.log('✅ Mailing batch loaded:', batchData.id);
      setMailingBatch(batchData);
      
      // Initialize local state from batch
      setLocalGlobalMessage(batchData.globalMessage || '');
      setLocalContentOverrides(batchData.contentOverrides || {});
      setLocalIncludeGreeting(batchData.includeGreeting);
      setLocalIncludeSignature(batchData.includeSignature);
      setLocalSelectedNoteStyleProfileId(batchData.selectedNoteStyleProfileId);
      
      console.log('📡 Step 3: Loading clients...');
      const clientList = await base44.entities.Client.filter({
        id: { $in: batchData.selectedClientIds }
      });
      console.log('✅ Clients loaded:', clientList.length);
      setClients(clientList);
      
      console.log('📡 Step 4: Loading templates...');
      const templateList = await base44.entities.Template.filter({
        $or: [
          { orgId: currentUser.orgId },
          { type: 'platform' }
        ]
      });
      console.log('✅ Templates loaded:', templateList.length);
      setTemplates(templateList);
      
      console.log('📡 Step 5: Loading note style profiles...');
      const profileList = await base44.entities.NoteStyleProfile.filter({
        orgId: currentUser.orgId
      });
      console.log('✅ Note style profiles loaded:', profileList.length);
      setNoteStyleProfiles(profileList);
      
      console.log('📡 Step 6: Loading instance settings...');
      try {
        const settingsResponse = await base44.functions.invoke('getInstanceSettings');
        console.log('✅ Instance settings loaded:', settingsResponse);
        setInstanceSettings(settingsResponse.data);
      } catch (settingsError) {
        console.error('⚠️ Failed to load instance settings, using fallback:', settingsError);
        console.error('Settings error details:', {
          message: settingsError.message,
          status: settingsError.response?.status,
          data: settingsError.response?.data
        });
        
        // Use fallback settings instead of failing
        setInstanceSettings(FALLBACK_SETTINGS);
      }
      
      console.log('✅ All data loaded successfully');
      setLoading(false);
    } catch (err) {
      console.error('❌ Failed to load data:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      
      setError(err.message || 'Failed to load data');
      setErrorDetails(JSON.stringify({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack?.split('\n').slice(0, 3)
      }, null, 2));
      setLoading(false);
    }
  };

  // Autosave function
  const saveChanges = async (data) => {
    await base44.entities.MailingBatch.update(mailingBatchId, data);
  };

  // Autosave data object
  const autosaveData = useMemo(() => ({
    globalMessage: localGlobalMessage,
    contentOverrides: localContentOverrides,
    includeGreeting: localIncludeGreeting,
    includeSignature: localIncludeSignature,
    selectedNoteStyleProfileId: localSelectedNoteStyleProfileId
  }), [localGlobalMessage, localContentOverrides, localIncludeGreeting, localIncludeSignature, localSelectedNoteStyleProfileId]);

  // Setup autosave
  const { isSaving, lastSaved } = useAutosave(
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

  // Get current client for preview
  const getCurrentClient = () => {
    if (editMode === 'individual' && selectedRecipientId) {
      return clients.find(c => c.id === selectedRecipientId);
    }
    // Return first client as sample for bulk mode
    return clients[0] || {};
  };

  // Get selected note style profile
  const selectedNoteStyleProfile = useMemo(() => {
    if (!localSelectedNoteStyleProfileId) return null;
    return noteStyleProfiles.find(p => p.id === localSelectedNoteStyleProfileId);
  }, [localSelectedNoteStyleProfileId, noteStyleProfiles]);

  // Prepare recipients for EditModeSelector
  const recipients = useMemo(() => 
    clients.map(client => ({
      id: client.id,
      name: client.fullName || 'Unnamed Client'
    })),
    [clients]
  );

  // Handle continue
  const handleContinue = () => {
    navigate(createPageUrl(`SelectDesign?mailingBatchId=${mailingBatchId}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading content editor...</p>
          <p className="text-sm text-gray-400 mt-2">Check browser console for debug logs</p>
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
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-sm text-blue-900 mb-2">Debug Checklist:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ URL parameter present: {mailingBatchId ? 'Yes' : 'No'}</li>
                <li>✓ User authenticated: {user ? 'Yes' : 'No'}</li>
                <li>✓ Browser console logs available</li>
                <li>✓ Network tab shows failed requests</li>
              </ul>
            </div>
            
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
              <p className="text-sm text-gray-500 mb-4">Batch ID: {mailingBatchId}</p>
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>Send a Card</span>
            <span>•</span>
            <span className="text-indigo-600 font-medium">Step 2 of 4</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Create Content</h1>
              <p className="text-gray-600">
                Compose your message for {clients.length} {clients.length === 1 ? 'recipient' : 'recipients'}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : lastSaved ? (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4 text-green-500" />
                  Saved {new Date(lastSaved).toLocaleTimeString()}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Three-Column Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Template Library */}
          <div className="col-span-3">
            <TemplateLibrary
              templates={templates}
              onTemplateSelect={handleTemplateSelect}
            />
          </div>

          {/* Center Column: Editor */}
          <div className="col-span-5 space-y-4">
            {/* Edit Mode Selector */}
            <Card>
              <CardContent className="pt-6">
                <EditModeSelector
                  mode={editMode}
                  selectedRecipientId={selectedRecipientId}
                  recipients={recipients}
                  onModeChange={handleModeChange}
                />
              </CardContent>
            </Card>

            {/* Recipient List */}
            <Card>
              <CardContent className="pt-6">
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {clients.map(client => {
                    const isEditing = editMode === 'individual' && selectedRecipientId === client.id;
                    const hasOverride = localContentOverrides[client.id];
                    
                    return (
                      <div
                        key={client.id}
                        className={`px-3 py-2 text-sm rounded transition-colors ${
                          isEditing
                            ? 'bg-[#fff8f8] border-l-3 border-l-[#d32f2f] font-medium pl-[13px]'
                            : 'border-l-3 border-l-transparent'
                        }`}
                      >
                        <span className="text-gray-900">{client.fullName || 'Unnamed Client'}</span>
                        {hasOverride && (
                          <span className="ml-2 text-xs text-indigo-600">(customized)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Message Editor */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <Textarea
                    ref={textareaRef}
                    value={getCurrentMessage()}
                    onChange={(e) => handleMessageChange(e.target.value)}
                    placeholder="Type your message here..."
                    className="min-h-[300px] font-mono text-sm"
                  />
                </div>

                <PlaceholderSelector onPlaceholderSelect={handlePlaceholderSelect} />
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note Style Profile
                  </label>
                  <Select
                    value={localSelectedNoteStyleProfileId || ''}
                    onValueChange={setLocalSelectedNoteStyleProfileId}
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

                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeGreeting"
                      checked={localIncludeGreeting}
                      onCheckedChange={setLocalIncludeGreeting}
                    />
                    <label htmlFor="includeGreeting" className="text-sm font-medium">
                      Include Greeting
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeSignature"
                      checked={localIncludeSignature}
                      onCheckedChange={setLocalIncludeSignature}
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
          <div className="col-span-4">
            <Card className="sticky top-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Live Preview</h3>
                
                {instanceSettings && (
                  <CardPreview
                    message={getCurrentMessage()}
                    client={getCurrentClient()}
                    user={user}
                    noteStyleProfile={selectedNoteStyleProfile}
                    selectedDesign={null}
                    previewSettings={instanceSettings.cardPreviewSettings}
                    includeGreeting={localIncludeGreeting}
                    includeSignature={localIncludeSignature}
                    randomIndentEnabled={true}
                    showLineCounter={false}
                  />
                )}
                
                {!instanceSettings && (
                  <div className="text-center py-12 text-gray-500">
                    Loading preview...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {editMode === 'bulk' ? 'Editing all recipients' : `Editing: ${getCurrentClient().fullName || 'Unnamed Client'}`}
          </div>
          
          <Button
            onClick={handleContinue}
            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            Continue to Design
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
