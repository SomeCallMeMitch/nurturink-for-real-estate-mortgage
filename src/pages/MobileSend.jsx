import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Send, Loader2, X, ChevronLeft, ChevronRight, Check, Eye, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * MobileSend Component
 * 
 * 3-step QuickCard sending flow:
 * 1. Select clients - compact list with name + city only
 * 2. Select QuickCard - shows card front image from linked CardDesign
 * 3. Review and Send - shows recipient names and selected QuickCard
 * 
 * Data relationships:
 * - QuickSendTemplate.cardDesignId → CardDesign (has outsideImageUrl/frontImageUrl)
 * - QuickSendTemplate.templateId → Template (has content for message)
 * - QuickSendTemplate.returnAddressMode → 'company' | 'rep' | 'none'
 * 
 * Progress colors:
 * - Completed: Green (#22c55e)
 * - Active: Burnt orange (#c87533)
 * - Pending: Gray
 */

// Helper function to replace placeholders with client data
const replacePlaceholders = (text, client, user, organization) => {
  if (!text) return '';
  
  let result = text;
  
  // Client placeholders
  if (client) {
    result = result.replace(/\{\{client\.firstName\}\}/gi, client.firstName || '');
    result = result.replace(/\{\{client\.lastName\}\}/gi, client.lastName || '');
    result = result.replace(/\{\{client\.fullName\}\}/gi, 
      [client.firstName, client.lastName].filter(Boolean).join(' ') || '');
    result = result.replace(/\{\{client\.company\}\}/gi, client.company || '');
    result = result.replace(/\{\{client\.city\}\}/gi, client.city || '');
    result = result.replace(/\{\{client\.state\}\}/gi, client.state || '');
  }
  
  // User placeholders
  if (user) {
    result = result.replace(/\{\{user\.firstName\}\}/gi, user.firstName || '');
    result = result.replace(/\{\{user\.lastName\}\}/gi, user.lastName || '');
    result = result.replace(/\{\{user\.full_name\}\}/gi, user.full_name || '');
    result = result.replace(/\{\{user\.companyName\}\}/gi, user.companyName || '');
    result = result.replace(/\{\{user\.phone\}\}/gi, user.phone || '');
    result = result.replace(/\{\{user\.email\}\}/gi, user.email || '');
  }
  
  // Organization placeholders
  if (organization) {
    result = result.replace(/\{\{org\.name\}\}/gi, organization.name || '');
    result = result.replace(/\{\{organization\.name\}\}/gi, organization.name || '');
  }
  
  return result;
};

// Progress indicator component
function ProgressIndicator({ currentStep, clientsSelected, templateSelected }) {
  const steps = [
    { number: 1, label: 'Clients', isCompleted: clientsSelected },
    { number: 2, label: 'QuickCard', isCompleted: templateSelected },
    { number: 3, label: 'Send', isCompleted: false },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isPast = currentStep > step.number;
          const isCompleted = step.isCompleted || isPast;

          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    isCompleted && !isActive
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-[#c87533] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`text-xs font-medium ${
                  isActive ? 'text-[#c87533]' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full ${
                  currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Filter pill component
function FilterPill({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
        active 
          ? 'bg-gray-900 text-white' 
          : 'bg-gray-100 text-gray-600 active:bg-gray-200'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-1 ${active ? 'text-gray-400' : 'text-gray-400'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// Return address mode badge
function ReturnAddressBadge({ mode }) {
  const config = {
    company: { label: 'Company Return Address', bg: 'bg-blue-100', text: 'text-blue-800' },
    rep: { label: 'Rep Return Address', bg: 'bg-green-100', text: 'text-green-800' },
    none: { label: 'No Return Address', bg: 'bg-gray-100', text: 'text-gray-600' }
  };
  
  const { label, bg, text } = config[mode] || config.none;
  
  return (
    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${bg}`}>
      <MapPin className={`w-4 h-4 ${text}`} />
      <span className={`text-sm font-medium ${text}`}>{label}</span>
    </div>
  );
}

export default function MobileSend() {
  const { toast } = useToast();
  
  // Core data
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [clients, setClients] = useState([]);
  const [quickCards, setQuickCards] = useState([]);
  const [cardDesigns, setCardDesigns] = useState({});
  const [templates, setTemplates] = useState({});
  
  // Selection state
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedQuickCard, setSelectedQuickCard] = useState(null);
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(1);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewClientIndex, setPreviewClientIndex] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load organization if user has one
      if (currentUser.orgId) {
        try {
          const orgList = await base44.entities.Organization.filter({ id: currentUser.orgId });
          if (orgList.length > 0) {
            setOrganization(orgList[0]);
          }
        } catch (e) {
          console.error('Failed to load organization:', e);
        }
      }
      
      // Load clients and QuickSendTemplates
      const [clientList, quickCardList] = await Promise.all([
        base44.entities.Client.filter({}, '-createdAt', 100),
        base44.entities.QuickSendTemplate.filter({ isActive: true }, '-createdAt', 50)
      ]);
      
      setClients(clientList);
      setQuickCards(quickCardList);

      // Extract unique cardDesignIds and templateIds to fetch
      const cardDesignIds = [...new Set(quickCardList.map(qc => qc.cardDesignId).filter(Boolean))];
      const templateIds = [...new Set(quickCardList.map(qc => qc.templateId).filter(Boolean))];

      // Load CardDesigns for images
      if (cardDesignIds.length > 0) {
        try {
          const designPromises = cardDesignIds.map(id => 
            base44.entities.CardDesign.filter({ id })
          );
          const designResults = await Promise.all(designPromises);
          const designMap = {};
          designResults.forEach(result => {
            if (result.length > 0) {
              designMap[result[0].id] = result[0];
            }
          });
          setCardDesigns(designMap);
        } catch (e) {
          console.error('Failed to load card designs:', e);
        }
      }

      // Load Templates for message content
      if (templateIds.length > 0) {
        try {
          const templatePromises = templateIds.map(id => 
            base44.entities.Template.filter({ id })
          );
          const templateResults = await Promise.all(templatePromises);
          const templateMap = {};
          templateResults.forEach(result => {
            if (result.length > 0) {
              templateMap[result[0].id] = result[0];
            }
          });
          setTemplates(templateMap);
        } catch (e) {
          console.error('Failed to load templates:', e);
        }
      }

    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to get card design for a QuickCard
  const getCardDesign = (quickCard) => {
    if (!quickCard?.cardDesignId) return null;
    return cardDesigns[quickCard.cardDesignId];
  };

  // Helper to get template for a QuickCard
  const getTemplate = (quickCard) => {
    if (!quickCard?.templateId) return null;
    return templates[quickCard.templateId];
  };

  // Helper to get front image URL
  const getFrontImageUrl = (quickCard) => {
    const design = getCardDesign(quickCard);
    return design?.outsideImageUrl || design?.frontImageUrl || design?.imageUrl || null;
  };

  // Helper to get message content
  const getMessageContent = (quickCard) => {
    const template = getTemplate(quickCard);
    return template?.content || quickCard?.previewSnippet || '';
  };

  const toggleClientSelection = (clientId) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSend = async () => {
    if (selectedClients.length === 0 || !selectedQuickCard) {
      toast({
        title: 'Missing selections',
        description: 'Please select clients and a QuickCard',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSending(true);

      const response = await base44.functions.invoke('initializeMailingBatch', {
        clientIds: selectedClients,
        quickSendTemplateId: selectedQuickCard.id
      });

      if (response.data.success) {
        toast({
          title: 'Success!',
          description: `Notes queued for ${selectedClients.length} client${selectedClients.length > 1 ? 's' : ''}`,
          duration: 3000,
          className: 'bg-green-50 border-green-200 text-green-900'
        });

        // Reset state
        setSelectedClients([]);
        setSelectedQuickCard(null);
        setStep(1);
      }
    } catch (error) {
      console.error('Failed to send notes:', error);
      toast({
        title: 'Send failed',
        description: error.response?.data?.error || 'Failed to send notes',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  // Open preview modal
  const openPreview = (quickCard) => {
    setSelectedQuickCard(quickCard);
    setPreviewClientIndex(0);
    setPreviewOpen(true);
  };

  // Navigate to next client in preview
  const nextPreviewClient = () => {
    if (previewClientIndex < selectedClients.length - 1) {
      setPreviewClientIndex(prev => prev + 1);
    }
  };

  // Navigate to previous client in preview
  const prevPreviewClient = () => {
    if (previewClientIndex > 0) {
      setPreviewClientIndex(prev => prev - 1);
    }
  };

  // Get current preview client
  const previewClient = useMemo(() => {
    if (selectedClients.length === 0) return null;
    const clientId = selectedClients[previewClientIndex];
    return clients.find(c => c.id === clientId);
  }, [selectedClients, previewClientIndex, clients]);

  const filteredClients = useMemo(() => {
    let result = clients;
    
    if (activeFilter === 'selected') {
      result = result.filter(c => selectedClients.includes(c.id));
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.firstName?.toLowerCase().includes(query) ||
        c.lastName?.toLowerCase().includes(query) ||
        c.city?.toLowerCase().includes(query)
      );
    }
    
    result.sort((a, b) => {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    return result;
  }, [clients, searchQuery, activeFilter, selectedClients]);

  const selectedClientDetails = useMemo(() => {
    return selectedClients.map(id => clients.find(c => c.id === id)).filter(Boolean);
  }, [selectedClients, clients]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#c87533] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors -ml-1"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Send QuickCard</h1>
            <p className="text-sm text-gray-500">
              {step === 1 && 'Select clients to send to'}
              {step === 2 && 'Choose a QuickCard'}
              {step === 3 && 'Review and send your notes'}
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator 
          currentStep={step}
          clientsSelected={selectedClients.length > 0}
          templateSelected={selectedQuickCard !== null}
        />
      </div>

      {/* Content Area */}
      <div className="px-4 pt-4 pb-32">
        
        {/* STEP 1: Select Clients */}
        {step === 1 && (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#c87533] focus:border-[#c87533]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>

            <div className="flex gap-2 mb-3">
              <FilterPill label="All" count={clients.length} active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
              <FilterPill label="Selected" count={selectedClients.length} active={activeFilter === 'selected'} onClick={() => setActiveFilter('selected')} />
            </div>

            <div className="space-y-2">
              {filteredClients.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500">No clients found</p>
                </div>
              ) : (
                filteredClients.map((client) => {
                  const displayName = [client.firstName, client.lastName].filter(Boolean).join(' ') || 'Unnamed';
                  const cityState = [client.city, client.state].filter(Boolean).join(', ');
                  const isSelected = selectedClients.includes(client.id);
                  
                  return (
                    <button
                      key={client.id}
                      onClick={() => toggleClientSelection(client.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        isSelected ? 'border-[#c87533] bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-base truncate">{displayName}</p>
                          {cityState && <p className="text-sm text-gray-500 truncate">{cityState}</p>}
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#c87533] flex items-center justify-center ml-3 flex-shrink-0">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* STEP 2: Select QuickCard */}
        {step === 2 && (
          <div className="space-y-3">
            {quickCards.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">No QuickCards available</p>
                <p className="text-xs text-gray-400 mt-1">Create QuickCards in the desktop app</p>
              </div>
            ) : (
              quickCards.map((qc) => {
                const isSelected = selectedQuickCard?.id === qc.id;
                const frontImageUrl = getFrontImageUrl(qc);
                const messagePreview = getMessageContent(qc);
                
                return (
                  <button
                    key={qc.id}
                    onClick={() => setSelectedQuickCard(qc)}
                    className={`w-full text-left rounded-xl border-2 transition-all overflow-hidden ${
                      isSelected ? 'border-[#c87533] bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex">
                      {/* Card Front Image */}
                      {frontImageUrl ? (
                        <div className="w-20 h-24 flex-shrink-0 bg-gray-100">
                          <img src={frontImageUrl} alt={qc.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 h-24 flex-shrink-0 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                          <span className="text-orange-400 text-xs text-center px-1">No image</span>
                        </div>
                      )}
                      
                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div>
                          <p className="font-semibold text-gray-900 text-base truncate">{qc.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                            {messagePreview ? messagePreview.substring(0, 80) + (messagePreview.length > 80 ? '...' : '') : 'No preview available'}
                          </p>
                          {qc.purpose && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{qc.purpose}</span>
                          )}
                        </div>
                        
                        {isSelected && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openPreview(qc); }}
                            className="self-end mt-2 text-[#c87533] text-sm font-medium flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" /> Preview
                          </button>
                        )}
                      </div>
                      
                      {isSelected && (
                        <div className="flex items-center pr-3">
                          <div className="w-6 h-6 rounded-full bg-[#c87533] flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 text-base mb-3">Recipients</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedClientDetails.map((client) => {
                  const displayName = [client.firstName, client.lastName].filter(Boolean).join(' ') || 'Unnamed';
                  const cityState = [client.city, client.state].filter(Boolean).join(', ');
                  return (
                    <div key={client.id} className="flex items-center justify-between py-1">
                      <span className="font-medium text-gray-900 text-sm">{displayName}</span>
                      {cityState && <span className="text-xs text-gray-500">{cityState}</span>}
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
                {selectedClients.length} recipient{selectedClients.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-base">QuickCard</h3>
                <button
                  onClick={() => openPreview(selectedQuickCard)}
                  className="text-[#c87533] text-sm font-medium flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" /> Preview
                </button>
              </div>
              
              {(() => {
                const frontImageUrl = getFrontImageUrl(selectedQuickCard);
                const messagePreview = getMessageContent(selectedQuickCard);
                return (
                  <div className="flex gap-3">
                    {frontImageUrl ? (
                      <div className="w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <img src={frontImageUrl} alt={selectedQuickCard?.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-20 flex-shrink-0 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{selectedQuickCard?.name}</p>
                      {messagePreview && <p className="text-sm text-gray-600 line-clamp-2 mt-1">{messagePreview.substring(0, 60)}...</p>}
                    </div>
                  </div>
                );
              })()}
              
              {/* Return Address Mode */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <ReturnAddressBadge mode={selectedQuickCard?.returnAddressMode || 'company'} />
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
              <div className="flex justify-between items-center">
                <span className="text-[#c87533] font-medium">Credits to use:</span>
                <span className="text-xl font-bold text-[#c87533]">{selectedClients.length}</span>
              </div>
              <p className="text-xs text-orange-600 mt-1">1 credit per recipient</p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-10">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="flex-1 px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-base hover:bg-gray-50 active:bg-gray-100 transition-colors">
            Back
          </button>
        )}
        
        {step < 3 && (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 ? selectedClients.length === 0 : !selectedQuickCard}
            className="flex-1 px-4 py-3 bg-[#c87533] text-white rounded-xl font-semibold text-base hover:bg-[#b5682e] active:bg-[#a55a28] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {step === 1 ? 'Continue to QuickCard' : 'Review and Send'}
          </button>
        )}
        
        {step === 3 && (
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex-1 px-4 py-3 bg-[#c87533] text-white rounded-xl font-semibold text-base hover:bg-[#b5682e] active:bg-[#a55a28] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {sending ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : <><Send className="w-5 h-5" /> Send Notes</>}
          </button>
        )}
      </div>

      {/* Enhanced Preview Modal with Client Navigation */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-lg pr-8">{selectedQuickCard?.name}</DialogTitle>
            <button 
              onClick={() => setPreviewOpen(false)} 
              className="absolute right-4 top-4 p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 mt-2">
            {/* Card Front Image */}
            {(() => {
              const frontImageUrl = getFrontImageUrl(selectedQuickCard);
              return frontImageUrl && (
                <div className="aspect-[4/5] rounded-lg overflow-hidden bg-gray-100 max-h-48">
                  <img src={frontImageUrl} alt="Card front" className="w-full h-full object-cover" />
                </div>
              );
            })()}
            
            {/* Client Navigation */}
            {selectedClients.length > 0 && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                <button 
                  onClick={prevPreviewClient}
                  disabled={previewClientIndex === 0}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="text-center">
                  <p className="font-medium text-gray-900 text-sm">
                    {previewClient ? [previewClient.firstName, previewClient.lastName].filter(Boolean).join(' ') : 'No client'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {previewClientIndex + 1} of {selectedClients.length}
                  </p>
                </div>
                
                <button 
                  onClick={nextPreviewClient}
                  disabled={previewClientIndex >= selectedClients.length - 1}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {/* Message Preview with Placeholders Replaced */}
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-xs text-amber-700 font-medium mb-2">Message Preview</p>
              <p className="text-sm text-gray-500 italic mb-3">
                This is the text content. The actual card will be handwritten and may look different.
              </p>
              <div className="bg-white rounded-lg p-3 border border-amber-100">
                <p className="text-sm text-gray-800 whitespace-pre-wrap font-serif leading-relaxed">
                  {replacePlaceholders(
                    getMessageContent(selectedQuickCard),
                    previewClient,
                    user,
                    organization
                  ) || 'No message content'}
                </p>
              </div>
            </div>
            
            {/* Return Address Mode */}
            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-2">Return Address</p>
              <ReturnAddressBadge mode={selectedQuickCard?.returnAddressMode || 'company'} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}