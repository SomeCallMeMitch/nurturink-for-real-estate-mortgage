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
  ArrowLeft,
  Search,
  Calendar,
  Users,
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
  Loader2,
  Eye,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

/**
 * Shared Status Utilities (inline)
 */
function getStatusPillVariant(status) {
  const variantMap = {
    completed: 'success',
    delivered: 'success',
    sent: 'success',
    sending: 'color1',
    printed: 'color1',
    printing: 'color1',
    submitted: 'color1',
    processing: 'color1',
    ready_to_send: 'warning',
    queued: 'warning',
    queued_for_sending: 'warning',
    pending_print: 'warning',
    pending: 'warning',
    pending_review: 'warning',
    failed: 'danger',
    cancelled: 'danger',
    partial: 'warning',
    draft: 'muted',
    paused: 'muted'
  };
  return variantMap[status] || 'muted';
}

function formatStatus(status) {
  if (!status) return 'Unknown';
  return status
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * AdminSendDetails Page
 * 
 * Shows detailed information for a selected MailingBatch including:
 * - Batch summary with Scribe campaign breakdown
 * - List of individual Notes (cards) within the batch
 * - Processing errors if any
 * - APPROVAL CONTROLS for pending_review batches
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
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    if (batchId) {
      loadData();
    } else {
      setError('No batch ID provided');
      setLoading(false);
    }
  }, [batchId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the mailing batch
      const batchList = await base44.entities.MailingBatch.filter({ id: batchId });
      if (!batchList || batchList.length === 0) {
        setError('Mailing batch not found');
        setLoading(false);
        return;
      }
      const batchData = batchList[0];
      setBatch(batchData);
      
      // Fetch sender user
      if (batchData.userId) {
        try {
          const userList = await base44.entities.User.filter({ id: batchData.userId });
          if (userList?.length > 0) setSender(userList[0]);
        } catch (e) {
          console.warn('Could not fetch sender:', e);
        }
      }
      
      // Fetch organization
      if (batchData.organizationId) {
        try {
          const orgList = await base44.entities.Organization.filter({ id: batchData.organizationId });
          if (orgList?.length > 0) setOrganization(orgList[0]);
        } catch (e) {
          console.warn('Could not fetch organization:', e);
        }
      }
      
      // Fetch notes by mailingBatchId
      let noteList = [];
      try {
        noteList = await base44.entities.Note.filter({ mailingBatchId: batchId });
      } catch (e) {
        console.warn('Could not fetch notes by mailingBatchId, trying fallback:', e);
        if (batchData.selectedClientIds?.length > 0) {
          noteList = await base44.entities.Note.filter({
            userId: batchData.userId,
            clientId: { $in: batchData.selectedClientIds }
          });
        }
      }
      setNotes(noteList);
      
      // Fetch mailings for these notes
      const mailingMap = {};
      if (noteList.length > 0) {
        try {
          const mailingList = await base44.entities.Mailing.filter({ 
            mailingBatchId: batchId 
          });
          mailingList.forEach(m => { 
            mailingMap[m.noteId] = m; 
          });
        } catch (e) {
          console.warn('Could not fetch mailings by mailingBatchId:', e);
        }
      }
      setMailings(mailingMap);
      
      // Fetch clients
      const clientIds = [...new Set([
        ...(batchData.selectedClientIds || []),
        ...noteList.map(n => n.clientId).filter(Boolean)
      ])];
      
      if (clientIds.length > 0) {
        try {
          const clientList = await base44.entities.Client.filter({ id: { $in: clientIds } });
          const clientMap = {};
          clientList.forEach(c => { clientMap[c.id] = c; });
          setClients(clientMap);
        } catch (e) {
          console.warn('Could not fetch clients:', e);
        }
      }
      
      // Fetch card designs used
      const designIds = [...new Set([
        batchData.selectedCardDesignId,
        ...noteList.map(n => n.cardDesignId).filter(Boolean)
      ].filter(Boolean))];
      
      if (designIds.length > 0) {
        try {
          const designList = await base44.entities.CardDesign.filter({ id: { $in: designIds } });
          const designMap = {};
          designList.forEach(d => { designMap[d.id] = d; });
          setCardDesigns(designMap);
        } catch (e) {
          console.warn('Could not fetch card designs:', e);
        }
      }
      
    } catch (err) {
      console.error('Failed to load send details:', err);
      setError('Could not load send details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter notes based on search
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

  // Navigate back to all sends
  const handleBack = () => {
    navigate(createPageUrl('AdminSends'));
  };

  // ============================================================
  // APPROVAL HANDLERS
  // ============================================================
  
  const handleApproveBatch = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to send this batch to Scribe?\n\n` +
      `This will submit ${notes.length} card(s) for printing and mailing.\n\n` +
      `This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      setApproving(true);
      
      const result = await base44.functions.invoke('submitBatchToScribe', {
        mailingBatchId: batchId
      });
      
      if (result.success) {
        toast({
          title: 'Batch Submitted to Scribe',
          description: `Successfully created ${result.campaignsCreated} campaign(s) with ${result.totalContacts} contact(s).`,
          duration: 5000,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
        loadData(); // Refresh to show new status
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to approve batch:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to send batch to Scribe',
        variant: 'destructive',
        duration: 5000
      });
      loadData(); // Refresh to show any status changes
    } finally {
      setApproving(false);
    }
  };

  const handleRejectBatch = async () => {
    const reason = window.prompt('Reason for rejection (optional):');
    
    if (reason === null) return; // User clicked cancel
    
    try {
      setRejecting(true);
      
      const creditsToRefund = batch.totalCreditsUsed || notes.length;
      const currentUser = await base44.auth.me();
      
      // Create a RefundRequest instead of directly refunding
      if (creditsToRefund > 0) {
        await base44.entities.RefundRequest.create({
          mailingBatchId: batchId,
          userId: batch.userId,
          organizationId: batch.organizationId || null,
          creditsRequested: creditsToRefund,
          refundTo: 'personal', // Default to personal, super admin can change when approving
          status: 'pending',
          rejectionReason: reason || 'No reason provided',
          requestedBy: currentUser.id
        });
        
        console.log(`Created refund request for ${creditsToRefund} credits`);
      }
      
      // Update batch status to cancelled
      await base44.entities.MailingBatch.update(batchId, {
        status: 'cancelled',
        processingErrors: [
          ...(batch.processingErrors || []),
          {
            error: `Rejected by admin${reason ? `: ${reason}` : ''}`,
            timestamp: new Date().toISOString(),
            refundRequested: creditsToRefund
          }
        ]
      });
      
      // Update all notes to cancelled
      for (const note of notes) {
        await base44.entities.Note.update(note.id, { status: 'cancelled' });
      }
      
      toast({
        title: 'Batch Rejected',
        description: creditsToRefund > 0 
          ? `Batch cancelled. Refund request for ${creditsToRefund} credits submitted for approval.`
          : 'Batch cancelled.',
        duration: 5000
      });
      
      navigate(createPageUrl('AdminSends'));
    } catch (error) {
      console.error('Failed to reject batch:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject batch',
        variant: 'destructive'
      });
    } finally {
      setRejecting(false);
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
          <ArrowLeft className="w-4 h-4" />
          Back to All Sends
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

  const cardCount = notes.length || batch?.selectedClientIds?.length || 0;
  const globalDesign = cardDesigns[batch?.selectedCardDesignId];
  const isPendingReview = batch?.status === 'pending_review';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Send Details</h1>
            <p className="text-muted-foreground">
              Batch #{batchId?.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={loadData} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* PENDING REVIEW APPROVAL BANNER */}
      {isPendingReview && (
        <Card className="border-2 border-amber-400 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-amber-800">Pending Review</h3>
                  <p className="text-sm text-amber-700">
                    This batch is ready to send. Review the cards below and approve when ready.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleRejectBatch}
                  disabled={rejecting || approving}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  {rejecting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Rejecting...</>
                  ) : (
                    <><XCircle className="w-4 h-4 mr-2" />Reject</>
                  )}
                </Button>
                <Button 
                  onClick={handleApproveBatch}
                  disabled={approving || rejecting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {approving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending to Scribe...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" />Approve & Send to Scribe</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Summary Card */}
      <Card className="border border-subtle">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Batch Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Status */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <Pill variant={getStatusPillVariant(batch?.status)}>
                {formatStatus(batch?.status)}
              </Pill>
            </div>
            
            {/* Card Count */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Cards</p>
              <p className="font-semibold text-foreground flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {cardCount} {cardCount === 1 ? 'card' : 'cards'}
              </p>
            </div>
            
            {/* Credits Used */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Credits Used</p>
              <p className="font-semibold text-foreground">
                {batch?.totalCreditsUsed || cardCount} credits
              </p>
            </div>
            
            {/* Processed Date */}
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
            
            {/* Sender */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Sender</p>
              <p className="font-semibold text-foreground flex items-center gap-1">
                <User className="w-4 h-4" />
                {sender?.full_name || sender?.email || 'Unknown'}
              </p>
            </div>
            
            {/* Organization */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Organization</p>
              <p className="font-semibold text-foreground">
                {organization?.name || 'Unknown'}
              </p>
            </div>
            
            {/* Card Design */}
            {globalDesign && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Card Design</p>
                <div className="flex items-center gap-2">
                  {globalDesign.outsideImageUrl && (
                    <img 
                      src={globalDesign.outsideImageUrl} 
                      alt="" 
                      className="w-8 h-10 object-cover rounded border"
                    />
                  )}
                  <p className="font-semibold text-foreground">{globalDesign.name}</p>
                </div>
              </div>
            )}
            
            {/* Return Address Mode */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Return Address</p>
              <p className="font-semibold text-foreground capitalize">
                {batch?.returnAddressModeGlobal || 'Company'}
              </p>
            </div>
          </div>
          
          {/* Global Message Preview */}
          {batch?.globalMessage && (
            <div className="mt-6 pt-6 border-t border-subtle">
              <p className="text-sm text-muted-foreground mb-2">Message Template</p>
              <div className="p-4 bg-surface-1 rounded-lg">
                <p className="text-foreground whitespace-pre-wrap text-sm font-mono">
                  {batch.globalMessage}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scribe Campaigns Section - only show if campaigns exist */}
      {batch?.scribeCampaigns && batch.scribeCampaigns.length > 0 && (
        <Collapsible open={campaignsExpanded} onOpenChange={setCampaignsExpanded}>
          <Card className="border border-subtle">
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-4 cursor-pointer hover:bg-surface-1/50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Scribe Campaigns ({batch.scribeCampaigns.length})
                  </div>
                  {campaignsExpanded ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {batch.scribeCampaigns.map((campaign, index) => {
                    const design = cardDesigns[campaign.cardDesignId];
                    
                    return (
                      <div 
                        key={campaign.scribeCampaignId || index}
                        className="p-4 bg-surface-1 rounded-lg border border-subtle"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Pill variant={getStatusPillVariant(campaign.status)} size="sm">
                              {formatStatus(campaign.status)}
                            </Pill>
                            {campaign.scribeCampaignId && (
                              <div className="flex items-center gap-1">
                                <code className="text-xs font-mono bg-white px-2 py-1 rounded border">
                                  Campaign #{campaign.scribeCampaignId}
                                </code>
                                <button 
                                  onClick={() => copyToClipboard(campaign.scribeCampaignId, `campaign-${index}`)}
                                  className="p-1 hover:bg-white rounded"
                                >
                                  {copiedId === `campaign-${index}` ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {campaign.contactCount} contacts
                          </span>
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
                            <p className="font-medium">
                              {campaign.submittedAt 
                                ? format(new Date(campaign.submittedAt), 'MMM d, h:mm a')
                                : '-'}
                            </p>
                          </div>
                        </div>
                        
                        {campaign.errorMessage && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            {campaign.errorMessage}
                          </div>
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
      {batch?.processingErrors && batch.processingErrors.length > 0 && (
        <Collapsible open={errorsExpanded} onOpenChange={setErrorsExpanded}>
          <Card className="border border-red-200 bg-red-50/50">
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-4 cursor-pointer hover:bg-red-100/50 transition-colors">
                <CardTitle className="flex items-center justify-between text-red-700">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Processing Errors ({batch.processingErrors.length})
                  </div>
                  {errorsExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {batch.processingErrors.map((err, index) => {
                    const client = clients[err.clientId];
                    return (
                      <div 
                        key={index}
                        className="p-3 bg-white border border-red-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-red-800">
                              {client?.fullName || (err.clientId ? `Client ${err.clientId?.slice(-8)}` : 'System Error')}
                            </p>
                            <p className="text-sm text-red-600">{err.error}</p>
                          </div>
                          <span className="text-xs text-red-500">
                            {err.timestamp && format(new Date(err.timestamp), 'h:mm a')}
                          </span>
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
              <FileText className="w-5 h-5" />
              Cards in This Batch ({notes.length})
            </CardTitle>
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search recipients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? 'No matching cards' : 'No cards yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? 'Try adjusting your search query.'
                  : 'Cards will appear here once the batch is processed.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotes.map((note) => {
                const client = clients[note.clientId];
                const mailing = mailings[note.id];
                const design = cardDesigns[note.cardDesignId];
                
                // Use mailing address if available, otherwise fall back to client
                const address = mailing?.recipientAddress || (client ? {
                  name: client.fullName,
                  street: client.street,
                  city: client.city,
                  state: client.state,
                  zip: client.zipCode
                } : null);
                
                return (
                  <div
                    key={note.id}
                    className="p-4 bg-surface-1 rounded-lg border border-subtle cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCardClick(note.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Card design thumbnail */}
                        <div className="w-12 h-16 rounded border bg-white overflow-hidden flex-shrink-0">
                          {design?.outsideImageUrl ? (
                            <img 
                              src={design.outsideImageUrl} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        {/* Recipient info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">
                              {address?.name || client?.fullName || 'Unknown Recipient'}
                            </h4>
                            <Pill variant={getStatusPillVariant(note.status)} size="sm">
                              {formatStatus(note.status)}
                            </Pill>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {address && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {address.street && `${address.street}, `}{address.city}, {address.state} {address.zip}
                              </span>
                            )}
                          </div>
                          
                          {/* Message preview */}
                          {note.message && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1 font-mono">
                              {note.message.substring(0, 100)}
                              {note.message.length > 100 ? '...' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Bottom Approval Bar for pending_review - sticky */}
      {isPendingReview && (
        <div className="sticky bottom-4 mt-6">
          <Card className="border-2 border-amber-400 bg-amber-50 shadow-lg">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800">
                  <Eye className="w-5 h-5" />
                  <span className="font-medium">
                    Review complete? {notes.length} card(s) ready to send.
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleRejectBatch}
                    disabled={rejecting || approving}
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button 
                    onClick={handleApproveBatch}
                    disabled={approving || rejecting}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {approving ? (
                      <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Sending...</>
                    ) : (
                      <><Send className="w-4 h-4 mr-1" />Approve & Send</>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}