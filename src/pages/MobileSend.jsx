import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MobileLayout from '@/components/mobile/MobileLayout';
import { Search, Send, Loader2, CheckCircle, X } from 'lucide-react';
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load whitelabel settings for logo
      try {
        const settings = await base44.entities.WhitelabelSettings.filter({});
        if (settings.length > 0) {
          setWhitelabelSettings(settings[0]);
        }
      } catch (wlError) {
        console.error('Failed to load whitelabel settings:', wlError);
      }
      
      const [clientList, templateList] = await Promise.all([
        base44.entities.Client.filter({}, '-created_date', 100),
        base44.entities.QuickSendTemplate.filter({}, '-created_date', 50)
      ]);
      
      setClients(clientList);
      setTemplates(templateList);
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
      <div className="min-h-screen bg-gray-50">
        {/* Header with Logo */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
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
              <p className="text-sm text-gray-500">Select Recipients and a QuickCard to send</p>
            </div>
          </div>
        </div>

        {/* Progress Steps - Horizontal with lines */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex-1 flex items-center">
              <div className={`flex flex-col items-center ${step >= 1 ? 'text-[#d32f2f]' : 'text-gray-400'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${
                  step > 1 ? 'bg-green-500 text-white' : step === 1 ? 'bg-[#d32f2f] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                </div>
                <span className="text-xs font-medium mt-1">Clients</span>
              </div>
              <div className={`flex-1 h-0.5 mx-2 ${step > 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            </div>

            <div className="flex-1 flex items-center">
              <div className={`flex flex-col items-center ${step >= 2 ? 'text-[#d32f2f]' : 'text-gray-400'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${
                  step > 2 ? 'bg-green-500 text-white' : step === 2 ? 'bg-[#d32f2f] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
                </div>
                <span className="text-xs font-medium mt-1">QuickCard</span>
              </div>
              <div className={`flex-1 h-0.5 mx-2 ${step > 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            </div>

            <div className={`flex flex-col items-center ${step >= 3 ? 'text-[#d32f2f]' : 'text-gray-400'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${
                step === 3 ? 'bg-[#d32f2f] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className="text-xs font-medium mt-1">Send</span>
            </div>
          </div>
        </div>

        <div className="p-4">

        {/* Step 1: Select Clients */}
        {step === 1 && (
          <>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d32f2f]"
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

            {selectedClients.length > 0 && (
              <div className="bg-orange-50 border border-[#c87533] rounded-lg p-2.5 mb-2">
                <p className="text-sm text-[#c87533] font-medium">
                  {selectedClients.length} selected
                </p>
              </div>
            )}

            <div className="space-y-1.5 mb-4">
              {filteredClients.map((client) => {
                const cityState = [client.city, client.state].filter(Boolean).join(', ');
                const isSelected = selectedClients.includes(client.id);
                
                return (
                  <div
                    key={client.id}
                    onClick={() => toggleClientSelection(client.id)}
                    className={`bg-white rounded-lg shadow p-2.5 cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-[#d32f2f] bg-[#fff8f8]' : ''
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
                        <CheckCircle className="w-5 h-5 text-[#d32f2f] flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={selectedClients.length === 0}
              className="w-full bg-[#c87533] text-white rounded-xl py-3.5 font-semibold disabled:opacity-50"
            >
              Continue to QuickCards
            </button>
          </>
        )}

        {/* Step 2: Select Template */}
        {step === 2 && (
          <>
            <div className="space-y-1.5 mb-4">
              {templates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                
                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`bg-white rounded-lg shadow p-3 cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-[#d32f2f] bg-[#fff8f8]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-base flex-1">{template.name}</h3>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-[#d32f2f] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.globalMessage || 'No preview available'}
                    </p>
                    {template.purpose && (
                      <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {template.purpose}
                      </span>
                    )}
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
      </div>
    </MobileLayout>
  );
}