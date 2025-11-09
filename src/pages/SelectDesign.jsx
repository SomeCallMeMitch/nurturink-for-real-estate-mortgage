
import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, Loader2, ArrowRight, Check, AlertTriangle, ArrowLeft } from "lucide-react";
import { debounce } from "lodash";

import WorkflowSteps from "@/components/mailing/WorkflowSteps";
import EditModeSelector from "@/components/mailing/EditModeSelector";
import CardPreview from "@/components/preview/CardPreview";

export default function SelectDesign() {
  const navigate = useNavigate();
  
  // Get mailingBatchId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const mailingBatchId = urlParams.get('mailingBatchId') || urlParams.get('mailingbatchid');
  
  // Core data
  const [mailingBatch, setMailingBatch] = useState(null);
  const [clients, setClients] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [instanceSettings, setInstanceSettings] = useState(null);
  const [noteStyleProfile, setNoteStyleProfile] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [editMode, setEditMode] = useState('bulk');
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [hoveredDesignId, setHoveredDesignId] = useState(null);
  
  // Local state for design selection
  const [localSelectedDesignId, setLocalSelectedDesignId] = useState(null);
  const [localDesignOverrides, setLocalDesignOverrides] = useState({});

  // NEW: Calculate total available credits (company pool + personal)
  const totalAvailableCredits = useMemo(() => {
    if (!user) return 0;
    
    const personalCredits = user.creditBalance || 0;
    const companyCredits = organization?.creditBalance || 0;
    
    return personalCredits + companyCredits;
  }, [user, organization]);

  useEffect(() => {
    if (mailingBatchId) {
      loadData();
    } else {
      setError('No mailing batch ID provided');
      setLoading(false);
    }
  }, [mailingBatchId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log('🚀 SelectDesign: Starting data load...');
      
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setFavoriteIds(currentUser.favoriteCardDesignIds || []);
      console.log('✅ User loaded:', currentUser.email);
      
      // Load organization
      if (currentUser.orgId) {
        const orgList = await base44.entities.Organization.filter({ id: currentUser.orgId });
        if (orgList && orgList.length > 0) {
          setOrganization(orgList[0]);
          console.log('✅ Organization loaded:', orgList[0].name);
        }
      }
      
      // Load mailing batch
      const batch = await base44.entities.MailingBatch.filter({ id: mailingBatchId });
      if (!batch || batch.length === 0) {
        throw new Error('Mailing batch not found');
      }
      
      const batchData = batch[0];
      console.log('✅ Mailing batch loaded:', {
        id: batchData.id,
        globalMessage: batchData.globalMessage,
        globalMessageLength: batchData.globalMessage?.length || 0,
        contentOverrides: batchData.contentOverrides,
        selectedNoteStyleProfileId: batchData.selectedNoteStyleProfileId,
        includeGreeting: batchData.includeGreeting,
        includeSignature: batchData.includeSignature
      });
      
      setMailingBatch(batchData);
      
      // Load clients
      const clientList = await base44.entities.Client.filter({
        id: { $in: batchData.selectedClientIds }
      });
      console.log('✅ Clients loaded:', clientList.length);
      setClients(clientList);
      
      // Load card designs (platform only for now)
      const designList = await base44.entities.CardDesign.filter({ type: 'platform' });
      setDesigns(designList);
      console.log('✅ Card designs loaded:', designList.length);
      
      // Auto-select default design if none is selected yet
      if (!batchData.selectedCardDesignId && designList.length > 0) {
        const defaultDesign = designList.find(d => d.isDefault) || designList[0];
        
        // Set local state
        setLocalSelectedDesignId(defaultDesign.id);
        setLocalDesignOverrides(batchData.cardDesignOverrides || {});
        
        // Immediately save to database
        await base44.entities.MailingBatch.update(mailingBatchId, {
          selectedCardDesignId: defaultDesign.id
        });
        
        console.log('✅ Auto-selected default card design:', defaultDesign.name);
      } else {
        // Initialize local state from existing batch data
        setLocalSelectedDesignId(batchData.selectedCardDesignId);
        setLocalDesignOverrides(batchData.cardDesignOverrides || {});
      }
      
      // Load categories
      const categoryList = await base44.entities.CardDesignCategory.filter({ orgId: null });
      setCategories(categoryList.sort((a, b) => a.sortOrder - b.sortOrder));
      
      // Load note style profile if selected
      if (batchData.selectedNoteStyleProfileId) {
        const profiles = await base44.entities.NoteStyleProfile.filter({
          id: batchData.selectedNoteStyleProfileId
        });
        if (profiles.length > 0) {
          setNoteStyleProfile(profiles[0]);
          console.log('✅ Note style profile loaded:', profiles[0].name, {
            defaultGreeting: profiles[0].defaultGreeting,
            signatureText: profiles[0].signatureText,
            handwritingFont: profiles[0].handwritingFont
          });
        }
      } else {
        console.log('⚠️ No note style profile selected in batch');
      }
      
      // Load instance settings
      try {
        const settingsResponse = await base44.functions.invoke('getInstanceSettings');
        setInstanceSettings(settingsResponse.data);
        console.log('✅ Instance settings loaded');
      } catch (settingsError) {
        console.error('⚠️ Failed to load instance settings, using fallback:', settingsError);
        // Use fallback settings
        setInstanceSettings({
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

  // Debounced save function
  const debouncedSave = useMemo(
    () => debounce(async (designId, overrides) => {
      try {
        setSaving(true);
        await base44.entities.MailingBatch.update(mailingBatchId, {
          selectedCardDesignId: designId,
          cardDesignOverrides: overrides
        });
        setSaving(false);
      } catch (error) {
        console.error('Failed to save design selection:', error);
        setSaving(false);
      }
    }, 500),
    [mailingBatchId]
  );

  // Handle mode change
  const handleModeChange = (mode, recipientId) => {
    setEditMode(mode);
    setSelectedRecipientId(recipientId);
  };

  // Handle recipient click
  const handleRecipientClick = (clientId) => {
    setEditMode('individual');
    setSelectedRecipientId(clientId);
  };

  // Get current design ID based on mode
  const getCurrentDesignId = () => {
    if (editMode === 'bulk') {
      return localSelectedDesignId;
    } else {
      return localDesignOverrides[selectedRecipientId] || localSelectedDesignId;
    }
  };

  // Memoize current client - updates when recipient changes
  const getCurrentClient = useMemo(() => {
    const client = editMode === 'individual' && selectedRecipientId
      ? clients.find(c => c.id === selectedRecipientId)
      : clients[0];
    
    console.log('🔍 getCurrentClient:', {
      editMode,
      selectedRecipientId,
      clientName: client?.fullName,
      clientFirstName: client?.firstName
    });
    
    return client || {};
  }, [editMode, selectedRecipientId, clients]);

  // Memoize current message - updates when recipient or batch changes
  const getCurrentMessage = useMemo(() => {
    if (!mailingBatch) {
      console.log('🔍 getCurrentMessage: No mailing batch yet');
      return '';
    }
    
    const message = editMode === 'individual' && selectedRecipientId
      ? mailingBatch.contentOverrides?.[selectedRecipientId] || mailingBatch.globalMessage || ''
      : mailingBatch.globalMessage || '';
    
    console.log('🔍 getCurrentMessage:', {
      editMode,
      selectedRecipientId,
      hasContentOverride: !!(mailingBatch.contentOverrides?.[selectedRecipientId]),
      globalMessage: mailingBatch.globalMessage,
      messageLength: message.length,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
    });
    
    return message;
  }, [mailingBatch, editMode, selectedRecipientId]);

  // Handle design selection
  const handleDesignSelect = (designId) => {
    if (editMode === 'bulk') {
      setLocalSelectedDesignId(designId);
      debouncedSave(designId, localDesignOverrides);
    } else {
      const newOverrides = {
        ...localDesignOverrides,
        [selectedRecipientId]: designId
      };
      setLocalDesignOverrides(newOverrides);
      debouncedSave(localSelectedDesignId, newOverrides);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (e, designId) => {
    e.stopPropagation();
    
    const newFavorites = favoriteIds.includes(designId)
      ? favoriteIds.filter(id => id !== designId)
      : [...favoriteIds, designId];
    
    setFavoriteIds(newFavorites);
    
    try {
      await base44.auth.updateMe({
        favoriteCardDesignIds: newFavorites
      });
    } catch (error) {
      console.error('Failed to update favorites:', error);
      setFavoriteIds(favoriteIds); // Revert on error
    }
  };

  // Filter designs
  const filteredDesigns = useMemo(() => {
    let filtered = designs;
    
    // Tab filtering
    if (activeTab === 'favorites') {
      filtered = filtered.filter(d => favoriteIds.includes(d.id));
    }
    
    // Category filtering
    if (selectedCategoryId !== 'all') {
      filtered = filtered.filter(d => 
        d.cardDesignCategoryIds && d.cardDesignCategoryIds.includes(selectedCategoryId)
      );
    }
    
    // Search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => d.name.toLowerCase().includes(query));
    }
    
    return filtered;
  }, [designs, activeTab, selectedCategoryId, searchQuery, favoriteIds]);

  // Get selected design object
  const selectedDesign = useMemo(() => {
    const designId = getCurrentDesignId();
    return designs.find(d => d.id === designId);
  }, [designs, editMode, selectedRecipientId, localSelectedDesignId, localDesignOverrides]);

  // Prepare recipients for EditModeSelector
  const recipients = useMemo(() => 
    clients.map(client => ({
      id: client.id,
      name: client.fullName || 'Unnamed Client'
    })),
    [clients]
  );

  // NEW: Handle back navigation
  const handleBack = () => {
    navigate(createPageUrl(`CreateContent?mailingBatchId=${mailingBatchId}`));
  };

  // Handle continue
  const handleContinue = () => {
    if (!localSelectedDesignId) {
      alert('Please select a card design before continuing');
      return;
    }
    
    navigate(createPageUrl(`ReviewAndSend?mailingBatchId=${mailingBatchId}`));
  };

  // Favorite count
  const favoriteCount = useMemo(() => 
    designs.filter(d => favoriteIds.includes(d.id)).length,
    [designs, favoriteIds]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading design library...</p>
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

  console.log('🎨 Rendering SelectDesign with:', {
    selectedDesign: selectedDesign?.name,
    currentMessage: getCurrentMessage,
    currentMessageLength: getCurrentMessage.length,
    currentClient: getCurrentClient?.fullName,
    noteStyleProfile: noteStyleProfile?.name,
    includeGreeting: mailingBatch?.includeGreeting,
    includeSignature: mailingBatch?.includeSignature,
    user: user?.full_name,
    organization: organization?.name
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* NEW: Page Header with Back Button and Title */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Select Design</h1>
        </div>
      </div>

      {/* Workflow Steps Header - UPDATED with correct credits */}
      <WorkflowSteps currentStep={3} creditsLeft={totalAvailableCredits} />
      
      <div className="max-w-[1600px] mx-auto p-6">
        {/* Three-Column Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Recipients */}
          <div className="col-span-3 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900">Recipients</h3>
                  <div className="text-sm font-medium text-gray-900">
                    {clients.length} {clients.length === 1 ? 'recipient' : 'recipients'}
                  </div>
                </div>

                {/* Edit Mode Selector */}
                <div className="mb-4">
                  <EditModeSelector
                    mode={editMode}
                    selectedRecipientId={selectedRecipientId}
                    recipients={recipients}
                    onModeChange={handleModeChange}
                  />
                </div>
                
                {/* Recipients List */}
                <div className="max-h-[500px] overflow-y-auto space-y-1">
                  {clients.map(client => {
                    const isEditing = editMode === 'individual' && selectedRecipientId === client.id;
                    const hasOverride = localDesignOverrides[client.id];
                    
                    return (
                      <button
                        key={client.id}
                        onClick={() => handleRecipientClick(client.id)}
                        className={`w-full text-left px-3 py-2.5 text-sm rounded transition-all ${
                          isEditing
                            ? 'bg-[#fff8f8] border-l-4 border-l-[#d32f2f] font-semibold text-gray-900'
                            : 'border-l-4 border-l-transparent hover:bg-gray-50 text-gray-900'
                        } ${hasOverride ? 'font-medium' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{client.fullName || 'Unnamed Client'}</span>
                          {hasOverride && !isEditing && (
                            <span className="text-xs text-orange-600">Custom</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* Save Status */}
                {saving && (
                  <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center Column: Design Browser */}
          <div className="col-span-5">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Card Design</h2>
                
                {/* Search and Filter */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search designs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 mb-6">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'all'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All Designs ({designs.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'favorites'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Favorites ({favoriteCount})
                  </button>
                </div>
                
                {/* Design Grid */}
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredDesigns.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        {searchQuery || selectedCategoryId !== 'all' 
                          ? 'No designs match your filters' 
                          : activeTab === 'favorites'
                          ? 'No favorite designs yet'
                          : 'No card designs available'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {filteredDesigns.map(design => {
                        const isSelected = design.id === getCurrentDesignId();
                        const isFavorite = favoriteIds.includes(design.id);
                        const isHovered = hoveredDesignId === design.id;
                        const displayImageUrl = isHovered ? design.insideImageUrl : design.outsideImageUrl;
                        
                        return (
                          <div
                            key={design.id}
                            onClick={() => handleDesignSelect(design.id)}
                            onMouseEnter={() => setHoveredDesignId(design.id)}
                            onMouseLeave={() => setHoveredDesignId(null)}
                            className={`relative cursor-pointer rounded-lg border-2 transition-all hover:shadow-lg ${
                              isSelected 
                                ? 'border-orange-500 shadow-lg' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {/* Selected Indicator */}
                            {isSelected && (
                              <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white rounded-full p-1.5">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                            
                            {/* Favorite Star */}
                            <button
                              onClick={(e) => handleToggleFavorite(e, design.id)}
                              className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  isFavorite 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-400 hover:text-yellow-400'
                                }`}
                              />
                            </button>
                            
                            {/* Single Design Image with Hover Effect */}
                            <div className="relative rounded-t-lg overflow-hidden bg-gray-100" style={{ aspectRatio: '412/600' }}>
                              <img
                                src={displayImageUrl || design.imageUrl}
                                alt={design.name}
                                className="w-full h-full object-cover transition-opacity duration-300"
                              />
                              
                              {/* Inside/Outside Label */}
                              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium">
                                {isHovered ? 'Inside' : 'Outside'}
                              </div>
                            </div>
                            
                            {/* Design Info */}
                            <div className="p-3 bg-white rounded-b-lg">
                              <p className="font-medium text-sm text-gray-900 truncate">
                                {design.name}
                              </p>
                              {design.isDefault && (
                                <span className="text-xs text-green-600">Default</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Preview */}
          <div className="col-span-4">
            <Card className="sticky top-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Preview for {getCurrentClient.fullName || 'Client'}
                </h3>
                
                <div className="flex justify-center">
                  {instanceSettings && selectedDesign ? (
                    <div className="w-full max-w-[440px]">
                      <CardPreview
                        message={getCurrentMessage}
                        client={getCurrentClient}
                        user={user}
                        organization={organization}
                        noteStyleProfile={noteStyleProfile}
                        selectedDesign={selectedDesign}
                        previewSettings={instanceSettings.cardPreviewSettings}
                        includeGreeting={mailingBatch?.includeGreeting ?? true}
                        includeSignature={mailingBatch?.includeSignature ?? true}
                        randomIndentEnabled={true}
                        showLineCounter={false}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      {!selectedDesign ? 'Select a design to preview' : 'Loading preview...'}
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
            <span className="font-medium">{clients.length} clients selected</span>
            {localSelectedDesignId && (
              <span className="ml-4">
                • Design: <span className="font-medium">{designs.find(d => d.id === localSelectedDesignId)?.name}</span>
              </span>
            )}
          </div>
          
          <Button
            onClick={handleContinue}
            disabled={!localSelectedDesignId}
            className="bg-orange-500 hover:bg-orange-600 gap-2"
          >
            Continue to Review
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
