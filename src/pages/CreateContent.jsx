import React, { useState, useEffect, useRef, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Save, Loader2 } from "lucide-react";
import { useAutosave } from "@/hooks/useAutosave";

import EditModeSelector from "@/components/mailing/EditModeSelector";
import PlaceholderSelector from "@/components/mailing/PlaceholderSelector";
import TemplateLibrary from "@/components/mailing/TemplateLibrary";
import CardPreview from "@/components/preview/CardPreview";

export default function CreateContent() {
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  
  // Get mailingBatchId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const mailingBatchId = urlParams.get('mailingBatchId');
  
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
    if (mailingBatchId) {
      loadData();
    } else {
      setError('Missing mailing batch ID');
      setLoading(false);
    }
  }, [mailingBatchId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Fetch mailing batch
      const batch = await base44.entities.MailingBatch.filter({ id: mailingBatchId });
      if (!batch || batch.length === 0) {
        throw new Error('Mailing batch not found');
      }
      
      const batchData = batch[0];
      setMailingBatch(batchData);
      
      // Initialize local state from batch
      setLocalGlobalMessage(batchData.globalMessage || '');
      setLocalContentOverrides(batchData.contentOverrides || {});
      setLocalIncludeGreeting(batchData.includeGreeting);
      setLocalIncludeSignature(batchData.includeSignature);
      setLocalSelectedNoteStyleProfileId(batchData.selectedNoteStyleProfileId);
      
      // Fetch selected clients
      const clientList = await base44.entities.Client.filter({
        id: { $in: batchData.selectedClientIds }
      });
      setClients(clientList);
      
      // Fetch templates
      const templateList = await base44.entities.Template.filter({
        $or: [
          { orgId: currentUser.orgId },
          { type: 'platform' }
        ]
      });
      setTemplates(templateList);
      
      // Fetch note style profiles
      const profileList = await base44.entities.NoteStyleProfile.filter({
        orgId: currentUser.orgId
      });
      setNoteStyleProfiles(profileList);
      
      // Fetch instance settings
      const settingsResponse = await base44.functions.invoke('getInstanceSettings');
      setInstanceSettings(settingsResponse.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data');
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
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
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