import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MobileLayout from '@/components/mobile/MobileLayout';
import { Search, Send, Loader2, CheckCircle } from 'lucide-react';
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
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
      <div className="p-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Send Notes</h1>
          <p className="text-gray-600">Select clients and a template</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow p-4">
          <div className={`flex-1 text-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              {selectedClients.length > 0 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <span className="text-xs font-medium">Clients</span>
          </div>

          <div className={`flex-1 text-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              {selectedTemplate ? <CheckCircle className="w-5 h-5" /> : '2'}
            </div>
            <span className="text-xs font-medium">Template</span>
          </div>

          <div className={`flex-1 text-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              3
            </div>
            <span className="text-xs font-medium">Send</span>
          </div>
        </div>

        {/* Step 1: Select Clients */}
        {step === 1 && (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {selectedClients.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  {selectedClients.length} client{selectedClients.length > 1 ? 's' : ''} selected
                </p>
              </div>
            )}

            <div className="space-y-2 mb-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => toggleClientSelection(client.id)}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
                    selectedClients.includes(client.id)
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{client.fullName}</h3>
                      <p className="text-sm text-gray-600">
                        {client.city}, {client.state}
                      </p>
                    </div>
                    {selectedClients.includes(client.id) && (
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={selectedClients.length === 0}
              className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium disabled:opacity-50"
            >
              Continue to Templates
            </button>
          </>
        )}

        {/* Step 2: Select Template */}
        {step === 2 && (
          <>
            <div className="space-y-3 mb-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    {selectedTemplate?.id === template.id && (
                      <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
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
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedTemplate}
                className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-medium disabled:opacity-50"
              >
                Review
              </button>
            </div>
          </>
        )}

        {/* Step 3: Confirm and Send */}
        {step === 3 && (
          <>
            <div className="space-y-4 mb-4">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Recipients</h3>
                <p className="text-gray-600">
                  {selectedClients.length} client{selectedClients.length > 1 ? 's' : ''} selected
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Template</h3>
                <p className="text-gray-900 font-medium">{selectedTemplate?.name}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                  {selectedTemplate?.globalMessage}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium"
              >
                Back
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Notes
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  );
}