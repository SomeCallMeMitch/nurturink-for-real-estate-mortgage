import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pill } from '@/components/ui/Pill';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Search,
  Calendar,
  ChevronRight,
  ChevronDown,
  Package,
  User,
  MapPin,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  RefreshCw,
  Mail,
  XCircle,
  Copy,
  Send,
  Eye,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

/**
 * Shared Status Utilities
 */
function getStatusPillVariant(status) {
  const variantMap = {
    completed: 'success', delivered: 'success', sent: 'success',
    sending: 'color1', printed: 'color1', printing: 'color1', submitted: 'color1', processing: 'color1',
    ready_to_send: 'warning', queued: 'warning', queued_for_sending: 'warning',
    pending_print: 'warning', pending: 'warning', pending_review: 'warning',
    failed: 'danger', cancelled: 'danger',
    partial: 'warning', draft: 'muted', paused: 'muted'
  };
  return variantMap[status] || 'muted';
}

function formatStatus(status) {
  if (!status) return 'Unknown';
  return status.split(/[_-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

/**
 * AdminSendDetails Page
 * 
 * Shows detailed information for a MailingBatch including:
 * - Batch summary with sender info
 * - Approve & Send to Scribe button (for pending_review batches)
 * - Scribe campaign breakdown
 * - Processing errors
 * - List of individual cards
 */
export default function AdminSendDetails() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const urlParams = new URLSearchParams(window.location.search);
  const batchId = urlParams.get('id');
  
  // Data state
  const [batch, setBatch] = useState(null);
  const [notes, setNotes] = useState([]);
  const [mailings, setMailings] = useState({});
  const [clients, setClients] = useState({});
  const [cardDesigns, setCardDesigns] = useState({});
  const [sender, setSender] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI state
  const [campaignsExpanded, setCampaignsExpanded] = useState(true);
  const [errorsExpanded, setErrorsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  // Approval state
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (batchId) loadData();
    else { setError('No batch ID provided'); setLoading(false); }
  }, [batchId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch batch
      const batchList = await base44.entities.MailingBatch.filter({ id: batchId });
      if (!batchList?.length) { setError('Mailing batch not found'); setLoading(false); return; }
      const batchData = batchList[0];
      setBatch(batchData);
      
      // Fetch sender
      if (batchData.userId) {
        try {
          const userList = await base44.entities.User.filter({ id: batchData.userId });
          if (userList?.length) setSender(userList[0]);
        } catch (e) { console.warn('Could not fetch sender:', e); }
      }
      
      // Fetch organization
      if (batchData.organizationId) {
        try {
          const orgList = await base44.entities.Organization.filter({ id: batchData.organizationId });
          if (orgList?.length) setOrganization(orgList[0]);
        } catch (e) { console.warn('Could not fetch organization:', e); }
      }
      
      // Fetch notes by mailingBatchId
      let noteList = [];
      try {
        noteList = await base44.entities.Note.filter({ mailingBatchId: batchId });
      } catch (e) {
        console.warn('Could not fetch notes by mailingBatchId:', e);
        // Fallback for older records
        if (batchData.selectedClientIds?.length && batchData.userId) {
          noteList = await base44.entities.Note.filter({
            userId: batchData.userId,
            clientId: { $in: batchData.selectedClientIds }
          });
        }
      }
      setNotes(noteList);
      
      // Fetch mailings
      try {
        const mailingList = await base44.entities.Mailing.filter({ mailingBatchId: batchId });
        const map = {};
        mailingList.forEach(m => { map[m.noteId] = m; });
        setMailings(map);
      } catch (e) { console.warn('Could not fetch mailings:', e); }
      
      // Fetch clients
      const clientIds = [...new Set([
        ...(batchData.selectedClientIds || []),
        ...noteList.map(n => n.clientId).filter(Boolean)
      ])];
      if (clientIds.length) {
        try {
          const clientList = await base44.entities.Client.filter({ id: { $in: clientIds } });
          const map = {};
          clientList.forEach(c => { map[c.id] = c; });
          setClients(map);
        } catch (e) { console.warn('Could not fetch clients:', e); }
      }
      
      // Fetch card designs
      const designIds = [...new Set([
        batchData.selectedCardDesignId,
        ...noteList.map(n => n.cardDesignId).filter(Boolean)
      ].filter(Boolean))];
      if (designIds.length) {
        try {
          const designList = await base44.entities.CardDesign.filter({ id: { $in: designIds } });
          const map = {};
          designList.forEach(d => { map[d.id] = d; });
          setCardDesigns(map);
        } catch (e) { console.warn('Could not fetch card designs:', e); }
      }
      
    } catch (err) {
      console.error('Failed to load send details:', err);
      setError('Could not load send details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter notes
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(note => {
      const client = clients[note.clientId];
      const recipientName = note.recipientName?.toLowerCase() || '';
      const clientName = client?.fullName?.toLowerCase() || '';
      const message = note.message?.toLowerCase() || '';
      return recipientName.includes(query) || clientName.includes(query) || message.includes(query);
    });
  }, [notes, searchQuery, clients]);

  // Copy to clipboard
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Navigate to card details
  const handleCardClick = (noteId) => {
    navigate(createPageUrl(`AdminCardDetails?id=${noteId}&batchId=${batchId}`));
  };

  // Navigate back
  const handleBack = () => navigate(createPageUrl('AdminSends'));

  // ============================================================
  // APPROVE & SEND TO SCRIBE
  // ============================================================
  
  const handleApproveAndSend = async () => {
    setApproving(true);
    
    try {
      const result = await base44.functions.invoke('submitBatchToScribe', {
        mailingBatchId: batchId
      });
      
      if (result.success) {
        toast({
          title: 'Batch Approved & Sent',
          description: `${result.campaignsCreated} campaign(s) submitted to Scribe with ${result.totalContacts} total contacts.`,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
        
        // Reload data to show updated status
        loadData();
      } else {
        throw new Error(result.error || 'Unknown error');
      }
      
    } catch (err) {
      console.error('Failed to approve batch:', err);
      toast({
        title: 'Approval Failed',
        description: err.message || 'Could not submit batch to Scribe.',
        variant: 'destructive'
      });
    } finally {
      setApproving(false);
      setShowApprovalDialog(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to All Sends
        </Button>
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const cardCount = batch?.selectedClientIds?.length || 0;
  const globalDesign = cardDesigns[batch?.selectedCardDesignId];
  const isPendingReview = batch?.status === 'pending_review';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Send Details</h1>
            <p className="text-muted-foreground">Batch #{batchId?.slice(-8).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Pill variant={getStatusPillVariant(batch?.status)} size="md">
            {formatStatus(batch?.status)}
          </Pill>
          <Button variant="outline" onClick={loadData} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PENDING REVIEW ALERT WITH APPROVE BUTTON */}
      {/* ============================================================ */}
      {isPendingReview && (
        <Card className="border-2 border-amber-400 bg-amber-50">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Eye className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">
                    Awaiting Admin Approval
                  </h3>
                  <p className="text-amber-700">
                    This batch has {cardCount} card{cardCount !== 1 ? 's' : ''} ready to send. 
                    Review the details below, then approve to submit to Scribe.
                  </p>
                </div>
              </div>
              <Button 
                size="lg"
                onClick={() => setShowApprovalDialog(true)}
                disabled={approving}
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                {approving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Approve & Send to Scribe
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Summary Card */}
      <Card className="border border-subtle">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" /> Batch Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <Pill variant={getStatusPillVariant(batch?.status)}>{formatStatus(batch?.status)}</Pill>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Cards</p>
              <p className="font-semibold text-foreground flex items-center gap-1">
                <Mail className="w-4 h-4" /> {cardCount} card{cardCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Credits Used</p>
              <p className="font-semibold text-foreground">{batch?.totalCreditsUsed || 0} credits</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created</p>
              <p className="font-semibold text-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {batch?.processedAt 
                  ? format(new Date(batch.processedAt), 'MMM d, yyyy h:mm a')
                  : batch?.created_at
                    ? format(new Date(batch.created_at), 'MMM d, yyyy h:mm a')
                    : 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Sender</p>
              <p className="font-semibold text-foreground flex items-center gap-1">
                <User className="w-4 h-4" /> {sender?.full_name || sender?.email || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Organization</p>
              <p className="font-semibold text-foreground">{organization?.name || 'Unknown'}</p>
            </div>
            {globalDesign && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Card Design</p>
                <div className="flex items-center gap-2">
                  {globalDesign.outsideImageUrl && (
                    <img src={globalDesign.outsideImageUrl} alt="" className="w-8 h-10 object-cover rounded border" />
                  )}
                  <p className="font-semibold text-foreground">{globalDesign.name}</p>
                </div>
              </div>
            )}
          </div>
          
          {batch?.globalMessage && (
            <div className="mt-6 pt-6 border-t border-subtle">
              <p className="text-sm text-muted-foreground mb-2">Global Message</p>
              <div className="p-4 bg-surface-1 rounded-lg">
                <p className="text-foreground whitespace-pre-wrap text-sm">{batch.globalMessage}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scribe Campaigns Section */}
      {batch?.scribeCampaigns?.length > 0 && (
        <Collapsible open={campaignsExpanded} onOpenChange={setCampaignsExpanded}>
          <Card className="border border-subtle">
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-4 cursor-pointer hover:bg-surface-1/50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Scribe Campaigns ({batch.scribeCampaigns.length})
                  </div>
                  {campaignsExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {batch.scribeCampaigns.map((campaign, index) => {
                    const design = cardDesigns[campaign.cardDesignId];
                    return (
                      <div key={campaign.scribeCampaignId || index} className="p-4 bg-surface-1 rounded-lg border border-subtle">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Pill variant={getStatusPillVariant(campaign.status)} size="sm">{formatStatus(campaign.status)}</Pill>
                            {campaign.scribeCampaignId && (
                              <div className="flex items-center gap-1">
                                <code className="text-xs font-mono bg-white px-2 py-1 rounded border">Campaign #{campaign.scribeCampaignId}</code>
                                <button onClick={() => copyToClipboard(campaign.scribeCampaignId, `campaign-${index}`)} className="p-1 hover:bg-white rounded">
                                  {copiedId === `campaign-${index}` ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                                </button>
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{campaign.contactCount} contacts</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Design</p>
                            <p className="font-medium">{design?.name || 'Unknown'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Return Address</p>
                            <p className="font-medium capitalize">{campaign.returnAddressMode || 'company'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Submitted</p>
                            <p className="font-medium">{campaign.submittedAt ? format(new Date(campaign.submittedAt), 'MMM d, h:mm a') : '-'}</p>
                          </div>
                        </div>
                        {campaign.errorMessage && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">{campaign.errorMessage}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Processing Errors Section */}
      {batch?.processingErrors?.length > 0 && (
        <Collapsible open={errorsExpanded} onOpenChange={setErrorsExpanded}>
          <Card className="border border-red-200 bg-red-50/50">
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-4 cursor-pointer hover:bg-red-100/50 transition-colors">
                <CardTitle className="flex items-center justify-between text-red-700">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Processing Errors ({batch.processingErrors.length})
                  </div>
                  {errorsExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {batch.processingErrors.map((err, index) => {
                    const client = clients[err.clientId];
                    return (
                      <div key={index} className="p-3 bg-white border border-red-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-red-800">{client?.fullName || `Client ${err.clientId?.slice(-8)}`}</p>
                            <p className="text-sm text-red-600">{err.error}</p>
                          </div>
                          <span className="text-xs text-red-500">{err.timestamp && format(new Date(err.timestamp), 'h:mm a')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Individual Cards Section */}
      <Card className="border border-subtle">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> Cards in This Batch ({notes.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search recipients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{searchQuery ? 'No matching cards' : 'No cards yet'}</h3>
              <p className="text-muted-foreground">{searchQuery ? 'Try adjusting your search query.' : 'Cards will appear here once the batch is processed.'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotes.map((note) => {
                const client = clients[note.clientId];
                const mailing = mailings[note.id];
                const design = cardDesigns[note.cardDesignId];
                const address = mailing?.recipientAddress || (client ? { name: client.fullName, city: client.city, state: client.state } : null);
                
                return (
                  <div key={note.id} className="p-4 bg-surface-1 rounded-lg border border-subtle cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick(note.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 rounded border bg-white overflow-hidden flex-shrink-0">
                          {design?.outsideImageUrl ? <img src={design.outsideImageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><FileText className="w-5 h-5 text-muted-foreground" /></div>}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{note.recipientName || address?.name || 'Unknown Recipient'}</h4>
                            <Pill variant={getStatusPillVariant(note.status)} size="sm">{formatStatus(note.status)}</Pill>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{address.city}, {address.state}</span>}
                            {note.scribeCampaignId && <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" />Campaign #{note.scribeCampaignId}</span>}
                            {note.sentDate && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{format(new Date(note.sentDate), 'MMM d, h:mm a')}</span>}
                          </div>
                          {note.message && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{note.message.substring(0, 80)}{note.message.length > 80 ? '...' : ''}</p>}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Confirmation Dialog */}
      <AlertDialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-green-600" />
              Approve & Send to Scribe?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will submit <strong>{cardCount} card{cardCount !== 1 ? 's' : ''}</strong> to Scribe for printing and mailing.
              <br /><br />
              <strong>Sender:</strong> {sender?.full_name || 'Unknown'}<br />
              <strong>Credits used:</strong> {batch?.totalCreditsUsed || cardCount}
              <br /><br />
              This action cannot be undone. Cards will be printed and mailed to the recipients.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveAndSend}
              disabled={approving}
              className="bg-green-600 hover:bg-green-700"
            >
              {approving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Approve & Send
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}