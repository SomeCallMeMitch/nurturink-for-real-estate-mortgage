import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Send } from "lucide-react";
import { debounce } from "lodash";
import { useToast } from "@/components/ui/use-toast";
import { Pill } from "@/components/ui/Pill";

// Components
import WorkflowSteps from "@/components/mailing/WorkflowSteps";
import EditModeSelector from "@/components/mailing/EditModeSelector";
import EnvelopePreview from "@/components/preview/EnvelopePreview";
import NotEnoughCreditsModal from "@/components/modals/NotEnoughCreditsModal";

// Extracted components
import { AddressEditDialog } from "@/components/review/AddressEditDialog";
import { ReturnAddressSelector } from "@/components/review/ReturnAddressSelector";
import { CreditStatusBanner } from "@/components/review/CreditStatusBanner";

// Utilities
import {
  formatCompanyAddress,
  formatRepAddress,
  getAddressPreviewText
} from "@/components/utils/addressHelpers";

export default function ReviewAndSend() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get mailingBatchId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const mailingBatchId = urlParams.get('mailingBatchId') || urlParams.get('mailingbatchid');
  
  // Core data
  const [mailingBatch, setMailingBatch] = useState(null);
  const [clients, setClients] = useState([]);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [instanceSettings, setInstanceSettings] = useState(null);
  const [noteStyleProfile, setNoteStyleProfile] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState('bulk');
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Local state for return address configuration
  const [localReturnAddressModeGlobal, setLocalReturnAddressModeGlobal] = useState('company');
  const [localReturnAddressModeOverrides, setLocalReturnAddressModeOverrides] = useState({});

  // Dialog state
  const [companyAddressDialogOpen, setCompanyAddressDialogOpen] = useState(false);
  const [repAddressDialogOpen, setRepAddressDialogOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // NEW: Credit checking state
  const [creditCheckResult, setCreditCheckResult] = useState(null);
  const [checkingCredits, setCheckingCredits] = useState(false);
  const [showNotEnoughCreditsModal, setShowNotEnoughCreditsModal] = useState(false);

  // Calculate total available credits with CORRECTED hierarchy
  const totalAvailableCredits = useMemo(() => {
    if (!user) return 0;
    
    const companyAllocated = user.companyAllocatedCredits || 0;
    const personalPurchased = user.personalPurchasedCredits || 0;
    
    // Only include company pool if user has access
    const canAccessPool = user.canAccessCompanyPool !== false; // Default to true if undefined
    const companyCredits = canAccessPool ? (organization?.creditBalance || 0) : 0;
    
    return companyAllocated + companyCredits + personalPurchased;
  }, [user, organization]);

  // Load all data on mount
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
      
      // Load user
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load organization
      if (currentUser.orgId) {
        const orgList = await base44.entities.Organization.filter({ id: currentUser.orgId });
        if (orgList && orgList.length > 0) {
          setOrganization(orgList[0]);
        }
      }
      
      // Load instance settings FIRST to get default
      let defaultReturnMode = 'company'; // fallback
      try {
        const settingsResponse = await base44.functions.invoke('getInstanceSettings');
        setInstanceSettings(settingsResponse.data);
        defaultReturnMode = settingsResponse.data?.envelopeLayoutSettings?.defaultReturnAddressMode || 'company';
      } catch (settingsError) {
        console.error('Failed to load instance settings:', settingsError);
      }
      
      // Load mailing batch
      const batch = await base44.entities.MailingBatch.filter({ id: mailingBatchId });
      if (!batch || batch.length === 0) {
        throw new Error('Mailing batch not found');
      }
      
      const batchData = batch[0];
      setMailingBatch(batchData);
      
      // Initialize local state from batch, using default if not set
      const initialMode = batchData.returnAddressModeGlobal || defaultReturnMode;
      setLocalReturnAddressModeGlobal(initialMode);
      setLocalReturnAddressModeOverrides(batchData.returnAddressModeOverrides || {});
      
      // If batch doesn't have a mode set, save the default
      if (!batchData.returnAddressModeGlobal) {
        await base44.entities.MailingBatch.update(mailingBatchId, {
          returnAddressModeGlobal: initialMode
        });
      }
      
      // Load clients
      const clientList = await base44.entities.Client.filter({
        id: { $in: batchData.selectedClientIds }
      });
      setClients(clientList);
      
      // Load note style profile
      if (batchData.selectedNoteStyleProfileId) {
        const profiles = await base44.entities.NoteStyleProfile.filter({
          id: batchData.selectedNoteStyleProfileId
        });
        if (profiles.length > 0) {
          setNoteStyleProfile(profiles[0]);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data');
      setLoading(false);
    }
  };

  // NEW: Check credit availability
  const checkCreditAvailability = useCallback(async () => {
    if (!clients.length) return;
    
    try {
      setCheckingCredits(true);
      
      const response = await base44.functions.invoke('checkCreditAvailability', {
        creditsNeeded: clients.length
      });
      
      setCreditCheckResult(response.data);
      
      // If not available, don't show modal automatically, wait for user to click send
      
    } catch (error) {
      console.error('Failed to check credit availability:', error);
      toast({
        title: 'Credit check failed',
        description: 'Unable to verify credit balance. Please try again.',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setCheckingCredits(false);
    }
  }, [clients.length, toast]);

  // Check credits when component loads and clients are available
  useEffect(() => {
    if (clients.length > 0 && user) {
      checkCreditAvailability();
    }
  }, [clients.length, user?.id, checkCreditAvailability]);

  // Debounced save function
  const debouncedSave = useMemo(
    () => debounce(async (modeGlobal, modeOverrides) => {
      try {
        setSaving(true);
        await base44.entities.MailingBatch.update(mailingBatchId, {
          returnAddressModeGlobal: modeGlobal,
          returnAddressModeOverrides: modeOverrides
        });
        setSaving(false);
      } catch (error) {
        console.error('Failed to save return address settings:', error);
        setSaving(false);
      }
    }, 500),
    [mailingBatchId]
  );

  // Handle back navigation
  const handleBack = () => {
    navigate(createPageUrl(`SelectDesign?mailingBatchId=${mailingBatchId}`));
  };

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

  // Get current return address mode
  const getCurrentReturnAddressMode = () => {
    if (editMode === 'bulk') {
      return localReturnAddressModeGlobal;
    } else {
      return localReturnAddressModeOverrides[selectedRecipientId] || localReturnAddressModeGlobal;
    }
  };

  // Get effective return address mode for a client
  const getEffectiveReturnAddressMode = (clientId) => {
    return localReturnAddressModeOverrides[clientId] || localReturnAddressModeGlobal;
  };

  // Handle return address mode selection
  const handleReturnAddressModeSelect = (mode) => {
    if (editMode === 'bulk') {
      setLocalReturnAddressModeGlobal(mode);
      debouncedSave(mode, localReturnAddressModeOverrides);
    } else {
      const newOverrides = {
        ...localReturnAddressModeOverrides,
        [selectedRecipientId]: mode
      };
      setLocalReturnAddressModeOverrides(newOverrides);
      debouncedSave(localReturnAddressModeGlobal, newOverrides);
    }
  };

  // Get current client
  const getCurrentClient = useMemo(() => {
    if (editMode === 'individual' && selectedRecipientId) {
      return clients.find(c => c.id === selectedRecipientId);
    }
    // Default to the first client or an empty object if no clients
    return clients[0] || {}; 
  }, [editMode, selectedRecipientId, clients]);

  // Prepare recipients for EditModeSelector
  const recipients = useMemo(() => 
    clients.map(client => ({
      id: client.id,
      name: client.fullName || 'Unnamed Client'
    })),
    [clients]
  );

  // Check if company address exists
  const hasCompanyAddress = useMemo(() => {
    return organization?.companyReturnAddress?.street ? true : false;
  }, [organization]);

  // Check if rep address exists
  const hasRepAddress = useMemo(() => {
    return user?.street ? true : false;
  }, [user]);



  // Handle opening company address dialog
  const handleOpenCompanyAddressDialog = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCompanyAddressDialogOpen(true);
  };

  // Handle opening rep address dialog
  const handleOpenRepAddressDialog = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setRepAddressDialogOpen(true);
  };

  // Handle saving company address
  const handleSaveCompanyAddress = async (addressData) => {
    try {
      setSavingAddress(true);
      
      await base44.entities.Organization.update(organization.id, {
        companyReturnAddress: {
          companyName: addressData.companyName || organization.name,
          street: addressData.street,
          address2: addressData.address2,
          city: addressData.city,
          state: addressData.state,
          zip: addressData.zipCode
        }
      });
      
      // Reload data to refresh organization
      await loadData();
      
      setCompanyAddressDialogOpen(false);
      
      toast({
        title: 'Company address saved',
        description: 'Company return address updated successfully',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to save company address:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to save company address',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setSavingAddress(false);
    }
  };

  // Handle saving rep address
  const handleSaveRepAddress = async (addressData) => {
    try {
      setSavingAddress(true);
      
      await base44.auth.updateMe({
        returnAddressName: addressData.returnAddressName,
        street: addressData.street,
        address2: addressData.address2,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode
      });
      
      // Reload data to refresh user
      await loadData();
      
      setRepAddressDialogOpen(false);
      
      toast({
        title: 'Your address saved',
        description: 'Your return address updated successfully',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to save rep address:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to save your address',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setSavingAddress(false);
    }
  };

  // UPDATED: Handle send with credit check
  const handleSend = async () => {
    try {
      // Check if we have enough credits
      if (!creditCheckResult) {
        // Need to check credits first
        await checkCreditAvailability();
        return; // Wait for check to complete, user will click again
      }
      
      if (!creditCheckResult.available) {
        // Not enough credits - show modal
        setShowNotEnoughCreditsModal(true);
        return;
      }
      
      setSaving(true);
      
      // Validate that we have necessary data
      if (!noteStyleProfile) {
        toast({
          title: 'Missing card design',
          description: 'Please select a card design before sending',
          variant: 'destructive',
          duration: 3000
        });
        setSaving(false);
        return;
      }
      
      // Call backend function to process the mailing batch
      console.log('🚀 Processing mailing batch:', mailingBatchId);
      const response = await base44.functions.invoke('processMailingBatch', {
        mailingBatchId: mailingBatchId
      });
      
      console.log('✅ Batch processed successfully:', response.data);
      
      // Check for partial success (some failures)
      if (response.data.partialSuccess) {
        toast({
          title: 'Partially sent',
          description: `${response.data.processedCount} of ${response.data.totalClients} notes sent successfully`,
          variant: 'warning',
          duration: 5000
        });
      } else {
        toast({
          title: 'Notes sent successfully!',
          description: `${response.data.processedCount} notes have been queued for sending`,
          duration: 3000
        });
      }
      
      // Navigate to confirmation page
      navigate(createPageUrl(`MailingConfirmation?mailingBatchId=${mailingBatchId}`));
      
    } catch (error) {
      console.error('❌ Failed to send notes:', error);
      
      toast({
        title: 'Failed to send',
        description: error.response?.data?.error || error.message || 'Failed to send notes. Please try again.',
        variant: 'destructive',
        duration: 5000
      });
      
      setSaving(false);
    }
  };

  // Get current credit summary for display
  const creditSummary = useMemo(() => {
    if (!creditCheckResult || !user) return null;
    
    const companyCredits = creditCheckResult.companyPoolCredits || 0;
    const personalCredits = creditCheckResult.personalCredits || 0;
    const total = creditCheckResult.totalAvailable || 0;
    
    return {
      companyCredits,
      personalCredits,
      total,
      hasCompanyPool: organization && companyCredits > 0,
      sufficient: creditCheckResult.available
    };
  }, [creditCheckResult, user, organization]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading review page...</p>
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
        currentStep={4} 
        creditsLeft={totalAvailableCredits}
        pageTitle="Review & Send"
        onBackClick={handleBack}
      />
      
      <div className="max-w-[1600px] mx-auto p-6">
        {/* Credit Status Banner */}
        <CreditStatusBanner
          creditCheckResult={creditCheckResult}
          creditSummary={creditSummary}
          clientCount={clients.length}
          onPurchaseCredits={() => navigate(createPageUrl('Credits'))}
          onRefresh={checkCreditAvailability}
          checking={checkingCredits}
        />

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
                
                {/* Recipients List with Numbers and Pills */}
                <div className="max-h-[600px] overflow-y-auto space-y-2">
                  {clients.map((client, index) => {
                    const isEditing = editMode === 'individual' && selectedRecipientId === client.id;
                    const effectiveMode = getEffectiveReturnAddressMode(client.id);
                    
                    return (
                      <button
                        key={client.id}
                        onClick={() => handleRecipientClick(client.id)}
                        type="button"
                        className={`w-full text-left px-3 py-2.5 rounded transition-all ${isEditing ? 'selection-active' : 'border-l-4 border-l-transparent hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-gray-900">
                            {index + 1}. {client.fullName || 'Unnamed Client'}
                          </span>
                          <Pill
                            variant={effectiveMode === 'company' ? 'color1' : effectiveMode === 'rep' ? 'success' : 'muted'}
                            size="sm"
                          >
                            {effectiveMode === 'company' ? 'Company' :
                             effectiveMode === 'rep' ? 'Rep' :
                             'None'}
                          </Pill>
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

          {/* Center Column: Return Address Configuration */}
          <div className="col-span-5">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Return Address</h2>
                
                {/* Edit Mode Selector */}
                <EditModeSelector
                  mode={editMode}
                  selectedRecipientId={selectedRecipientId}
                  recipients={recipients}
                  onModeChange={handleModeChange}
                />
                
                {/* Return Address Options */}
                <ReturnAddressSelector
                  currentMode={getCurrentReturnAddressMode()}
                  onModeSelect={handleReturnAddressModeSelect}
                  hasCompanyAddress={hasCompanyAddress}
                  hasRepAddress={hasRepAddress}
                  companyAddressPreview={formatCompanyAddress(organization)}
                  repAddressPreview={formatRepAddress(user)}
                  onAddCompanyAddress={handleOpenCompanyAddressDialog}
                  onAddRepAddress={handleOpenRepAddressDialog}
                  userName={user?.full_name}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Envelope Preview */}
          <div className="col-span-4">
            <Card className="sticky top-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Envelope Preview
                </h3>
                
                <div className="flex justify-center">
                  {instanceSettings?.envelopeLayoutSettings ? (
                    <EnvelopePreview
                      envelopeSettings={instanceSettings.envelopeLayoutSettings}
                      client={getCurrentClient}
                      user={user}
                      organization={organization}
                      returnAddressMode={getCurrentReturnAddressMode()}
                    />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      Loading preview...
                    </div>
                  )}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Preview Info
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Recipient:</strong> {getCurrentClient?.fullName || 'Sample Client'}</p>
                    <p><strong>Return Address Mode:</strong> {getCurrentReturnAddressMode()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky Footer - UPDATED with credit info */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{clients.length} recipients ready to send</span>
            </div>
            
            {creditSummary && (
              <div className="text-sm">
                <span className={`font-semibold ${
                  creditSummary.sufficient ? 'text-green-600' : 'text-red-600'
                }`}>
                  {creditSummary.total} credits available
                </span>
                <span className="text-gray-500 ml-2">
                  ({clients.length} needed)
                </span>
              </div>
            )}
          </div>
          
          <Button
            onClick={handleSend}
            className={`gap-2 text-lg px-8 py-6 ${
              creditSummary && !creditSummary.sufficient
                ? 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
            disabled={saving || checkingCredits || (creditCheckResult && !creditCheckResult.available)}
          >
            {saving ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Sending...</>
            ) : checkingCredits ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Checking Credits...</>
            ) : (
              <><Send className="w-5 h-5" />Send Notes</>
            )}
          </Button>
        </div>
      </div>

      {/* Company Address Dialog */}
      <AddressEditDialog
        open={companyAddressDialogOpen}
        onOpenChange={setCompanyAddressDialogOpen}
        type="company"
        initialAddress={organization?.companyReturnAddress || { companyName: organization?.name }}
        onSave={handleSaveCompanyAddress}
        saving={savingAddress}
      />

      {/* Rep Address Dialog */}
      <AddressEditDialog
        open={repAddressDialogOpen}
        onOpenChange={setRepAddressDialogOpen}
        type="rep"
        initialAddress={user}
        onSave={handleSaveRepAddress}
        saving={savingAddress}
        userName={user?.full_name}
      />

      {/* NEW: Not Enough Credits Modal */}
      <NotEnoughCreditsModal
        open={showNotEnoughCreditsModal}
        onClose={() => setShowNotEnoughCreditsModal(false)}
        creditInfo={creditCheckResult}
      />
    </div>
  );
}