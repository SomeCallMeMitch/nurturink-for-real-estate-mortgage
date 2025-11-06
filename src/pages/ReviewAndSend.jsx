
import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, AlertTriangle, AlertCircle, Send } from "lucide-react";
import { debounce } from "lodash";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import WorkflowSteps from "@/components/mailing/WorkflowSteps";
import EditModeSelector from "@/components/mailing/EditModeSelector";
import EnvelopePreview from "@/components/preview/EnvelopePreview";

// Helper to replace placeholders in address text
const replacePlaceholders = (text, client, user, organization) => {
  if (!text) return '';
  
  let result = text;
  
  // Organization placeholders
  if (organization) {
    result = result.replace(/\{\{org\.name\}\}/g, organization.name || '');
    result = result.replace(/\{\{org\.street\}\}/g, organization.companyReturnAddress?.street || '');
    result = result.replace(/\{\{org\.city\}\}/g, organization.companyReturnAddress?.city || '');
    result = result.replace(/\{\{org\.state\}\}/g, organization.companyReturnAddress?.state || '');
    result = result.replace(/\{\{org\.zipCode\}\}/g, organization.companyReturnAddress?.zip || '');
  }
  
  // User/Me placeholders
  if (user) {
    result = result.replace(/\{\{me\.fullName\}\}/g, user.full_name || '');
    result = result.replace(/\{\{me\.street\}\}/g, user.street || '');
    result = result.replace(/\{\{me\.city\}\}/g, user.city || '');
    result = result.replace(/\{\{me\.state\}\}/g, user.state || '');
    result = result.replace(/\{\{me\.zipCode\}\}/g, user.zipCode || '');
  }
  
  return result;
};

// Helper to format company address
const formatCompanyAddress = (organization) => {
  if (!organization?.companyReturnAddress) return null;
  
  const addr = organization.companyReturnAddress;
  const lines = [];
  
  // Add company name first if it exists
  if (addr.companyName) {
    lines.push(addr.companyName);
  } else if (organization.name) {
    lines.push(organization.name);
  }
  
  if (addr.street) lines.push(addr.street);
  if (addr.address2) lines.push(addr.address2);
  
  const cityStateZip = [addr.city, addr.state, addr.zip].filter(Boolean).join(' ');
  if (cityStateZip) lines.push(cityStateZip);
  
  return lines.length > 0 ? lines.join('\n') : null;
};

// Helper to format rep address
const formatRepAddress = (user) => {
  if (!user?.street) return null;
  
  const lines = [];
  
  // Add name first if it exists
  if (user.returnAddressName) {
    lines.push(user.returnAddressName);
  } else if (user.full_name) {
    lines.push(user.full_name);
  }
  
  if (user.street) lines.push(user.street);
  if (user.address2) lines.push(user.address2);
  
  const cityStateZip = [user.city, user.state, user.zipCode].filter(Boolean).join(' ');
  if (cityStateZip) lines.push(cityStateZip);
  
  return lines.length > 0 ? lines.join('\n') : null;
};

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

  // Add dialog state for editing addresses
  const [companyAddressDialogOpen, setCompanyAddressDialogOpen] = useState(false);
  const [repAddressDialogOpen, setRepAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState({
    companyName: '', // New field
    returnAddressName: '', // New field
    street: '',
    address2: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [savingAddress, setSavingAddress] = useState(false);

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

  // Get mini address preview for an option
  const getAddressPreview = (mode) => {
    if (mode === 'company') {
      return hasCompanyAddress ? formatCompanyAddress(organization) : null;
    } else if (mode === 'rep') {
      return hasRepAddress ? formatRepAddress(user) : null;
    } else {
      return 'No return address';
    }
  };

  // Handle opening company address dialog
  const handleOpenCompanyAddressDialog = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (organization?.companyReturnAddress) {
      setEditingAddress({
        companyName: organization.companyReturnAddress.companyName || organization.name || '',
        street: organization.companyReturnAddress.street || '',
        address2: organization.companyReturnAddress.address2 || '',
        city: organization.companyReturnAddress.city || '',
        state: organization.companyReturnAddress.state || '',
        zipCode: organization.companyReturnAddress.zip || ''
      });
    } else {
      setEditingAddress({
        companyName: organization?.name || '',
        street: '',
        address2: '',
        city: '',
        state: '',
        zipCode: ''
      });
    }
    setCompanyAddressDialogOpen(true);
  };

  // Handle opening rep address dialog
  const handleOpenRepAddressDialog = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setEditingAddress({
      returnAddressName: user?.returnAddressName || user?.full_name || '',
      street: user?.street || '',
      address2: user?.address2 || '',
      city: user?.city || '',
      state: user?.state || '',
      zipCode: user?.zipCode || ''
    });
    setRepAddressDialogOpen(true);
  };

  // Handle saving company address
  const handleSaveCompanyAddress = async () => {
    try {
      setSavingAddress(true);
      
      await base44.entities.Organization.update(organization.id, {
        companyReturnAddress: {
          companyName: editingAddress.companyName || organization.name,
          street: editingAddress.street,
          address2: editingAddress.address2,
          city: editingAddress.city,
          state: editingAddress.state,
          zip: editingAddress.zipCode
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
  const handleSaveRepAddress = async () => {
    try {
      setSavingAddress(true);
      
      await base44.auth.updateMe({
        returnAddressName: editingAddress.returnAddressName,
        street: editingAddress.street,
        address2: editingAddress.address2,
        city: editingAddress.city,
        state: editingAddress.state,
        zipCode: editingAddress.zipCode
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

  // Handle send
  const handleSend = async () => {
    // TODO: Implement actual sending logic
    // For now, just navigate to confirmation or home
    alert('Sending functionality coming soon!');
  };

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
      {/* Workflow Steps Header */}
      <WorkflowSteps currentStep={4} creditsLeft={user?.creditBalance || 0} />
      
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
                
                {/* Recipients List with Numbers and Pills */}
                <div className="max-h-[600px] overflow-y-auto space-y-2">
                  {clients.map((client, index) => {
                    const isEditing = editMode === 'individual' && selectedRecipientId === client.id;
                    const effectiveMode = getEffectiveReturnAddressMode(client.id);
                    // const hasOverride = localReturnAddressModeOverrides[client.id]; // Not used in current display
                    
                    return (
                      <button
                        key={client.id}
                        onClick={() => handleRecipientClick(client.id)}
                        className={`w-full text-left px-3 py-2.5 rounded transition-all ${
                          isEditing
                            ? 'bg-[#fff8f8] border-l-4 border-l-[#d32f2f] font-semibold'
                            : 'border-l-4 border-l-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-gray-900">
                            {index + 1}. {client.fullName || 'Unnamed Client'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            effectiveMode === 'company' ? 'bg-blue-100 text-blue-800' :
                            effectiveMode === 'rep' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {effectiveMode === 'company' ? 'Company' :
                             effectiveMode === 'rep' ? 'Rep' :
                             'None'}
                          </span>
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
                
                {/* Return Address Options - Card Style */}
                <div className="space-y-3">
                  {/* Company Option */}
                  <button
                    onClick={() => handleReturnAddressModeSelect('company')}
                    disabled={!hasCompanyAddress}
                    type="button"
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      getCurrentReturnAddressMode() === 'company'
                        ? 'border-orange-500 bg-orange-50'
                        : hasCompanyAddress
                        ? 'border-gray-200 hover:border-gray-300 bg-white'
                        : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Company</h3>
                      {getCurrentReturnAddressMode() === 'company' && (
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    {hasCompanyAddress ? (
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {getAddressPreview('company')}
                      </p>
                    ) : (
                      <div className="flex items-start gap-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          No company address set.{' '}
                          <a
                            href="#"
                            onClick={handleOpenCompanyAddressDialog}
                            className="underline font-medium hover:text-red-700"
                          >
                            Add in Settings
                          </a>
                          {' '}or choose Rep/None
                        </div>
                      </div>
                    )}
                  </button>

                  {/* Rep Option */}
                  <button
                    onClick={() => handleReturnAddressModeSelect('rep')}
                    disabled={!hasRepAddress}
                    type="button"
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      getCurrentReturnAddressMode() === 'rep'
                        ? 'border-orange-500 bg-orange-50'
                        : hasRepAddress
                        ? 'border-gray-200 hover:border-gray-300 bg-white'
                        : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Rep</h3>
                      {getCurrentReturnAddressMode() === 'rep' && (
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    {hasRepAddress ? (
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {getAddressPreview('rep')}
                      </p>
                    ) : (
                      <div className="flex items-start gap-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          {user?.full_name || 'You'} don't have a return address on file.{' '}
                          <a
                            href="#"
                            onClick={handleOpenRepAddressDialog}
                            className="underline font-medium hover:text-red-700"
                          >
                            Add Address
                          </a>
                          {' '}or choose Company/None
                        </div>
                      </div>
                    )}
                  </button>

                  {/* None Option */}
                  <button
                    onClick={() => handleReturnAddressModeSelect('none')}
                    type="button"
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      getCurrentReturnAddressMode() === 'none'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">None</h3>
                      {getCurrentReturnAddressMode() === 'none' && (
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {getAddressPreview('none')}
                    </p>
                  </button>
                </div>
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
                      returnAddressMode={getCurrentReturnAddressMode()} // Pass the mode
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
                    <p><strong>Recipient:</strong> {getCurrentClient.fullName || 'Sample Client'}</p>
                    <p><strong>Return Address Mode:</strong> {getCurrentReturnAddressMode()}</p>
                  </div>
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
            <span className="font-medium">{clients.length} recipients ready to send</span>
          </div>
          
          <Button
            onClick={handleSend}
            className="bg-orange-500 hover:bg-orange-600 gap-2 text-lg px-8 py-6"
          >
            <Send className="w-5 h-5" />
            Send Notes
          </Button>
        </div>
      </div>

      {/* Company Address Dialog */}
      <Dialog open={companyAddressDialogOpen} onOpenChange={setCompanyAddressDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Company Return Address</DialogTitle>
            <DialogDescription>
              This address will be used when "Company" is selected as the return address
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="company-name-edit">Company Name</Label>
              <Input
                id="company-name-edit"
                value={editingAddress.companyName || ''}
                onChange={(e) => setEditingAddress({ ...editingAddress, companyName: e.target.value })}
                placeholder="Acme Corporation"
              />
            </div>

            <div>
              <Label htmlFor="company-street-edit">Street Address *</Label>
              <Input
                id="company-street-edit"
                value={editingAddress.street}
                onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })}
                placeholder="123 Business Ave"
              />
            </div>

            <div>
              <Label htmlFor="company-address2-edit">Address Line 2</Label>
              <Input
                id="company-address2-edit"
                value={editingAddress.address2}
                onChange={(e) => setEditingAddress({ ...editingAddress, address2: e.target.value })}
                placeholder="Suite 100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="company-city-edit">City *</Label>
                <Input
                  id="company-city-edit"
                  value={editingAddress.city}
                  onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                  placeholder="Denver"
                />
              </div>
              <div>
                <Label htmlFor="company-state-edit">State *</Label>
                <Input
                  id="company-state-edit"
                  value={editingAddress.state}
                  onChange={(e) => setEditingAddress({ ...editingAddress, state: e.target.value })}
                  placeholder="CO"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company-zip-edit">ZIP Code *</Label>
              <Input
                id="company-zip-edit"
                value={editingAddress.zipCode}
                onChange={(e) => setEditingAddress({ ...editingAddress, zipCode: e.target.value })}
                placeholder="80202"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSaveCompanyAddress}
                disabled={savingAddress || !editingAddress.street || !editingAddress.city || !editingAddress.state || !editingAddress.zipCode}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {savingAddress ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  'Save Address'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCompanyAddressDialogOpen(false)}
                disabled={savingAddress}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rep Address Dialog */}
      <Dialog open={repAddressDialogOpen} onOpenChange={setRepAddressDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Your Return Address</DialogTitle>
            <DialogDescription>
              This address will be used when "Rep" is selected as the return address
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="rep-name-edit">Name *</Label>
              <Input
                id="rep-name-edit"
                value={editingAddress.returnAddressName || ''}
                onChange={(e) => setEditingAddress({ ...editingAddress, returnAddressName: e.target.value })}
                placeholder="John Smith"
              />
            </div>

            <div>
              <Label htmlFor="rep-street-edit">Street Address *</Label>
              <Input
                id="rep-street-edit"
                value={editingAddress.street}
                onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <Label htmlFor="rep-address2-edit">Address Line 2</Label>
              <Input
                id="rep-address2-edit"
                value={editingAddress.address2}
                onChange={(e) => setEditingAddress({ ...editingAddress, address2: e.target.value })}
                placeholder="Apt 4B"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="rep-city-edit">City *</Label>
                <Input
                  id="rep-city-edit"
                  value={editingAddress.city}
                  onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                  placeholder="Denver"
                />
              </div>
              <div>
                <Label htmlFor="rep-state-edit">State *</Label>
                <Input
                  id="rep-state-edit"
                  value={editingAddress.state}
                  onChange={(e) => setEditingAddress({ ...editingAddress, state: e.target.value })}
                  placeholder="CO"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="rep-zip-edit">ZIP Code *</Label>
              <Input
                id="rep-zip-edit"
                value={editingAddress.zipCode}
                onChange={(e) => setEditingAddress({ ...editingAddress, zipCode: e.target.value })}
                placeholder="80202"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSaveRepAddress}
                disabled={savingAddress || !editingAddress.street || !editingAddress.city || !editingAddress.state || !editingAddress.zipCode}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {savingAddress ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  'Save Address'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setRepAddressDialogOpen(false)}
                disabled={savingAddress}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
