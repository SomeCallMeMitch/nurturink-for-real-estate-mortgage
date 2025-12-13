import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MobileLayout from '@/components/mobile/MobileLayout';
import { Search, Send, Loader2, CheckCircle, X, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function MobileSend() {
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(1); // 1: Select clients, 2: Select template, 3: Confirm
  const [whitelabelSettings, setWhitelabelSettings] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteClientIds, setFavoriteClientIds] = useState([]);
  const [user, setUser] = useState(null);
  const [cardDesigns, setCardDesigns] = useState([]);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [showFavoriteTemplates, setShowFavoriteTemplates] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load current user
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load whitelabel settings for logo
      try {
        const settings = await base44.entities.WhitelabelSettings.filter({});
        if (settings.length > 0) {
          setWhitelabelSettings(settings[0]);
        }
      } catch (wlError) {
        console.error('Failed to load whitelabel settings:', wlError);
      }
      
      // Load favorite clients
      try {
        const favorites = await base44.entities.FavoriteClient.filter({ userId: currentUser.id });
        setFavoriteClientIds(favorites.map(f => f.clientId));
      } catch (favError) {
        console.error('Failed to load favorites:', favError);
      }
      
      const [clientList, templateList, designList] = await Promise.all([
        base44.entities.Client.filter({}, '-created_date', 100),
        base44.entities.QuickSendTemplate.filter({}, '-created_date', 50),
        base44.entities.CardDesign.filter({}, '-created_date', 200)
      ]);
      
      setClients(clientList);
      setTemplates(templateList);
      setCardDesigns(designList);
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

  const toggleClientSelection = (clientId) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSend = async () => {
    if (selectedClients.length === 0 || !selectedTemplate) {
      toast({
        title: 'Missing selections',
        description: 'Please select clients and a template',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSending(true);

      const response = await base44.functions.invoke('initializeMailingBatch', {
        clientIds: selectedClients,
        quickSendTemplateId: selectedTemplate.id
      });

      if (response.data.success) {
        toast({
          title: 'Success!',
          description: `Notes queued for ${selectedClients.length} client${selectedClients.length > 1 ? 's' : ''}`,
          duration: 3000
        });

        setSelectedClients([]);
        setSelectedTemplate(null);
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

  const filteredClients = clients.filter(client => {
    // Filter by favorites if toggle is on
    if (showFavorites && !favoriteClientIds.includes(client.id)) {
      return false;
    }
    
    // Filter by search query
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      client.fullName?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.city?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header with Logo - Fixed */}
        <div className="fixed top-0 left-0 right-0 z-[60] bg-white border-b border-gray-200 px-4 py-1.5">
          <div className="flex items-center gap-3">
            {whitelabelSettings?.logoUrl ? (
              <img 
                src={whitelabelSettings.logoUrl} 
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-[#c87533] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">RS</span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">Send a QuickCard</h1>
              <p className="text-sm text-gray-500">Select Recipient & QuickCard</p>
            </div>
          </div>
        </div>

        {/* Progress Steps - Horizontal with inline labels - Fixed */}
        <div className="fixed top-[60px] left-0 right-0 z-[55] bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex-1 flex items-center">
              <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#c87533]' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${
                  step > 1 ? 'bg-green-500 text-white' : step === 1 ? 'bg-[#c87533] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap ${step > 1 ? 'text-green-500' : ''}`}>Clients</span>
              </div>
              <div className={`flex-1 h-0.5 mx-2 ${step > 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            </div>

            <div className="flex-1 flex items-center">
              <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#c87533]' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${
                  step > 2 ? 'bg-green-500 text-white' : step === 2 ? 'bg-[#c87533] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
                </div>
                <span className="text-xs font-semibold whitespace-nowrap">QuickCard</span>
              </div>
              <div className={`flex-1 h-0.5 mx-2 ${step > 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            </div>

            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#c87533]' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs ${
                step === 3 ? 'bg-[#c87533] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className="text-xs font-semibold whitespace-nowrap">Review & Send</span>
            </div>
          </div>
        </div>

        {/* Main Content - Padding for fixed header + progress */}
        <div className="pt-[104px] p-4">

        {/* Step 1: Select Clients */}
        {step === 1 && (
          <>
            <div className="flex gap-2 mb-2 mt-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`px-3 py-3 rounded-lg border transition-colors ${
                  showFavorites 
                    ? 'bg-[#c87533] border-[#c87533] text-white' 
                    : 'bg-white border-gray-300 text-gray-600'
                }`}
              >
                <Star className={`w-5 h-5 ${showFavorites ? 'fill-current' : ''}`} />
              </button>
            </div>

            {selectedClients.length > 0 && (
              <div className="bg-orange-50 border border-[#c87533] rounded-lg p-2.5 mb-2">
                <p className="text-sm text-[#c87533] font-medium">
                  {selectedClients.length} selected
                </p>
              </div>
            )}

            <div className="space-y-1.5 mb-32">
              {filteredClients.map((client) => {
                const cityState = [client.city, client.state].filter(Boolean).join(', ');
                const isSelected = selectedClients.includes(client.id);
                
                return (
                  <div
                    key={client.id}
                    onClick={() => toggleClientSelection(client.id)}
                    className={`bg-white rounded-lg shadow p-2.5 cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-green-500 bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-gray-900 text-base">
                          {client.fullName}
                        </span>
                        {cityState && (
                          <span className="text-sm text-gray-500 ml-2">
                            {cityState}
                          </span>
                        )}
                        {client.company && (
                          <p className="text-sm text-gray-500 mt-0.5">{client.company}</p>
                        )}
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Step 2: Select Template */}
        {step === 2 && (
          <>
            {/* Search and Filters */}
            <div className="flex gap-2 mb-2 mt-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search QuickCards..."
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                />
                {templateSearchQuery && (
                  <button
                    onClick={() => setTemplateSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFavoriteTemplates(!showFavoriteTemplates)}
                className={`px-3 py-3 rounded-lg border transition-colors ${
                  showFavoriteTemplates 
                    ? 'bg-[#c87533] border-[#c87533] text-white' 
                    : 'bg-white border-gray-300 text-gray-600'
                }`}
              >
                <Star className={`w-5 h-5 ${showFavoriteTemplates ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="space-y-1.5 mb-4">
              {templates
                .filter(template => {
                  // Filter by search query
                  if (templateSearchQuery.trim()) {
                    const query = templateSearchQuery.toLowerCase();
                    return (
                      template.name?.toLowerCase().includes(query) ||
                      template.globalMessage?.toLowerCase().includes(query) ||
                      template.purpose?.toLowerCase().includes(query)
                    );
                  }
                  return true;
                })
                .map((template) => {
                  const isSelected = selectedTemplate?.id === template.id;

                  // FIXED: Use correct field name from QuickSendTemplate entity schema
                  const cardDesign = cardDesigns.find(d => d.id === template.cardDesignId);

                  return (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`bg-white rounded-lg shadow p-3 cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-green-500 bg-green-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Card Image Preview */}
                        {cardDesign?.frontImageUrl && (
                          <div className="w-16 h-20 flex-shrink-0 rounded overflow-hidden border border-gray-200">
                            <img 
                              src={cardDesign.frontImageUrl} 
                              alt="Card preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Template Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-base">{template.name}</h3>
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            )}
                          </div>

                          {/* FIXED: Use previewSnippet field from QuickSendTemplate entity */}
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {template.previewSnippet || 'No preview available'}
                          </p>
                          {template.purpose && (
                            <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {template.purpose}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-white text-gray-700 border border-gray-200 rounded-xl py-3.5 font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedTemplate}
                className="flex-1 bg-[#c87533] text-white rounded-xl py-3.5 font-semibold disabled:opacity-50"
              >
                Review
              </button>
            </div>
          </>
        )}

        </div>

        {/* Step 3: Confirm and Send */}
        {step === 3 && (
          <div className="p-4">
            <div className="space-y-3 mb-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Recipients ({selectedClients.length})</h3>
                <div className="space-y-1.5">
                  {clients.filter(c => selectedClients.includes(c.id)).map(client => {
                    const cityState = [client.city, client.state].filter(Boolean).join(', ');
                    return (
                      <div key={client.id} className="text-sm">
                        <span className="font-medium text-gray-900">{client.fullName}</span>
                        {cityState && (
                          <span className="text-gray-500 ml-2">{cityState}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">QuickCard</h3>
                <p className="text-gray-900 font-medium">{selectedTemplate?.name}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                  {selectedTemplate?.globalMessage}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-white text-gray-700 border border-gray-200 rounded-xl py-3.5 font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 bg-[#c87533] text-white rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send QuickCards
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Sticky Continue Button - Only on Step 1 when clients are selected */}
        {step === 1 && selectedClients.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-2 z-[45]">
            <button
              onClick={() => setStep(2)}
              className="max-w-md mx-auto block bg-orange-400 text-white rounded-xl py-2 px-6 font-semibold"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}