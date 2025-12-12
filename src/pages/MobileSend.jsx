import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Send, Loader2, X, ChevronLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function ProgressStep({ step, number, label, isActive, isCompleted }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
          isCompleted
            ? 'bg-green-500 text-white'
            : isActive
            ? 'bg-[#c87533] text-white'
            : 'bg-gray-200 text-gray-500'
        }`}
      >
        {isCompleted ? '✓' : number}
      </div>
      <span className={`text-xs font-medium text-center leading-tight ${
        isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'
      }`}>
        {label}
      </span>
    </div>
  );
}

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
        <span className={`ml-1 ${active ? 'text-gray-300' : 'text-gray-400'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

export default function MobileSend() {
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(1);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientList, templateList] = await Promise.all([
        base44.entities.Client.filter({}, '-createdAt', 100),
        base44.entities.QuickSendTemplate.filter({}, '-createdAt', 50)
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
  }, [clients, activeFilter, searchQuery, selectedClients]);

  const clientCount = clients.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#c87533] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">Send Notes</h1>
          <p className="text-xs text-gray-500">Select clients and a template</p>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <ProgressStep 
            step={1}
            number="1"
            label="Clients"
            isActive={step === 1}
            isCompleted={selectedClients.length > 0}
          />
          
          <div className={`flex-1 h-1 rounded-full ${
            selectedClients.length > 0 ? 'bg-green-500' : 'bg-gray-200'
          }`}></div>
          
          <ProgressStep 
            step={2}
            number="2"
            label="Template"
            isActive={step === 2}
            isCompleted={selectedTemplate !== null}
          />
          
          <div className={`flex-1 h-1 rounded-full ${
            selectedTemplate && step >= 3 ? 'bg-green-500' : 'bg-gray-200'
          }`}></div>
          
          <ProgressStep 
            step={3}
            number="3"
            label="Send"
            isActive={step === 3}
            isCompleted={false}
          />
        </div>
      </div>

      <div className="px-4 pt-3">
        {step === 1 && (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="flex gap-2 mb-3">
              <FilterPill
                label="All"
                active={activeFilter === 'all'}
                count={clientCount}
                onClick={() => setActiveFilter('all')}
              />
              <FilterPill
                label="Selected"
                active={activeFilter === 'selected'}
                count={selectedClients.length}
                onClick={() => setActiveFilter('selected')}
              />
            </div>

            <div className="space-y-2 mb-20">
              {filteredClients.map((client) => {
                const displayName = [client.firstName, client.lastName].filter(Boolean).join(' ') || 'Unnamed';
                const cityState = [client.city, client.state].filter(Boolean).join(', ');
                const isSelected = selectedClients.includes(client.id);
                
                return (
                  <div
                    key={client.id}
                    onClick={() => toggleClientSelection(client.id)}
                    className={`bg-white rounded-lg p-2.5 cursor-pointer transition-all border-2 ${
                      isSelected
                        ? 'border-[#c87533] bg-orange-50'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{displayName}</h3>
                        {cityState && (
                          <p className="text-xs text-gray-600 truncate">{cityState}</p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-[#c87533] rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-20">
              <button
                onClick={() => setStep(2)}
                disabled={selectedClients.length === 0}
                className="w-full bg-[#c87533] text-white rounded-lg py-3 font-semibold text-sm disabled:opacity-50 hover:bg-[#b5682e] active:bg-[#a55a28] transition-colors"
              >
                Continue to QuickCard
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2 mb-20">
              {templates.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                
                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`bg-white rounded-lg p-3 cursor-pointer transition-all border-2 ${
                      isSelected
                        ? 'border-[#c87533] bg-orange-50'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm flex-1">{template.name}</h3>
                      {isSelected && (
                        <div className="w-5 h-5 bg-[#c87533] rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {template.globalMessage || 'No preview available'}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(template);
                      }}
                      className="text-xs text-[#c87533] font-medium hover:underline"
                    >
                      Preview
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2 z-20">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedTemplate}
                className="flex-1 bg-[#c87533] text-white rounded-lg py-3 font-semibold text-sm disabled:opacity-50 hover:bg-[#b5682e] active:bg-[#a55a28] transition-colors"
              >
                Review and Send
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-3 mb-20">
              <div className="bg-white rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">Recipients</h3>
                <div className="space-y-1">
                  {clients
                    .filter(c => selectedClients.includes(c.id))
                    .map(client => {
                      const displayName = [client.firstName, client.lastName].filter(Boolean).join(' ') || 'Unnamed';
                      return (
                        <div key={client.id} className="text-sm text-gray-700">
                          {displayName}
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-2">Template</h3>
                <p className="text-gray-900 font-medium text-sm">{selectedTemplate?.name}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-3">
                  {selectedTemplate?.globalMessage}
                </p>
              </div>
            </div>

            <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2 z-20">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 bg-[#c87533] text-white rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#b5682e] active:bg-[#a55a28] transition-colors"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Notes
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg">{previewTemplate?.name}</DialogTitle>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </DialogHeader>
          <div className="mt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {previewTemplate?.globalMessage || 'No preview available'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}