// components/quicksend/QuickSendSendModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Zap, User, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

/**
 * QuickSendSendModal
 * Search existing clients, select one, fire the send.
 *
 * Props:
 *   open           — boolean
 *   onOpenChange   — (bool) => void
 *   template       — QuickSendTemplate object
 *   thumbnailUrl   — card design image URL
 *   previewSnippet — message preview text
 */
export default function QuickSendSendModal({
  open,
  onOpenChange,
  template,
  thumbnailUrl,
  previewSnippet,
}) {
  const { toast } = useToast();
  const [clients, setClients]               = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [search, setSearch]                 = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [sending, setSending]               = useState(false);

  // Load clients when modal opens
  useEffect(() => {
    if (!open) { setSearch(''); setSelectedClient(null); return; }
    const load = async () => {
      setLoadingClients(true);
      try {
        const list = await base44.entities.Client.list({}, '-created_date', 500);
        setClients(list || []);
      } catch {
        setClients([]);
      } finally {
        setLoadingClients(false);
      }
    };
    load();
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients.slice(0, 50);
    return clients.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [clients, search]);

  const handleSend = async () => {
    if (!selectedClient || !template) return;
    setSending(true);
    try {
      await base44.functions.invoke('processMobileQuickSend', {
        quickSendTemplateId: template.id,
        clientIds: [selectedClient.id],
      });
      toast({ title: 'Card queued!', description: `Sending to ${selectedClient.name}.` });
      onOpenChange(false);
    } catch (err) {
      toast({ title: 'Send failed', description: err.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: '#d15704' }} />
            Send QuickSend
          </DialogTitle>
          <DialogDescription>
            Choose a recipient for this card.
          </DialogDescription>
        </DialogHeader>

        {/* Card preview strip */}
        <div className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border">
          <div
            className="flex-shrink-0 rounded-md overflow-hidden bg-muted border border-border"
            style={{ width: '56px', height: '40px' }}
          >
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug line-clamp-1">
              {template.name}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {previewSnippet || 'No preview available'}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search clients by name or city..."
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedClient(null); }}
            className="pl-9"
          />
        </div>

        {/* Client list */}
        <div className="border border-border rounded-lg overflow-hidden" style={{ maxHeight: '240px', overflowY: 'auto' }}>
          {loadingClients ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {search ? 'No clients match your search.' : 'No clients found.'}
            </div>
          ) : (
            filtered.map(client => {
              const isSelected = selectedClient?.id === client.id;
              const sub = [client.city, client.state].filter(Boolean).join(', ');
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(isSelected ? null : client)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-border last:border-0 ${
                    isSelected ? 'bg-orange-50' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                    isSelected ? 'text-white' : 'bg-muted text-muted-foreground'
                  }`}
                    style={isSelected ? { backgroundColor: '#d15704' } : {}}
                  >
                    {isSelected
                      ? <Check className="w-3.5 h-3.5" />
                      : (client.name?.[0] || <User className="w-3.5 h-3.5" />)
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug ${isSelected ? 'text-foreground' : 'text-foreground'}`}>
                      {client.name}
                    </p>
                    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2"
            style={{ backgroundColor: '#d15704', color: '#ffffff' }}
            disabled={!selectedClient || sending}
            onClick={handleSend}
          >
            {sending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Zap className="w-4 h-4" />
            }
            {sending ? 'Sending...' : `Send to ${selectedClient?.name?.split(' ')[0] || '...'}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}