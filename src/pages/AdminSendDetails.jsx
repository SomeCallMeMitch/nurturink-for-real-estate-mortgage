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
  ArrowLeft,
  Search,
  Calendar,
  Users,
  ChevronRight,
  Loader2,
  Package,
  User,
  MapPin,
  FileText,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

/**
 * AdminSendDetails Page - Phase 2
 * 
 * Shows detailed information for a selected MailingBatch
 * and lists all individual Note records (cards) within it.
 * 
 * Clicking a card navigates to AdminCardDetails page (Phase 3).
 */
export default function AdminSendDetails() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const batchId = urlParams.get('id');
  
  // Data state
  const [batch, setBatch] = useState(null);
  const [notes, setNotes] = useState([]);
  const [clients, setClients] = useState({});
  const [cardDesigns, setCardDesigns] = useState({});
  const [sender, setSender] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');

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
        const userList = await base44.entities.User.filter({ id: batchData.userId });
        if (userList && userList.length > 0) {
          setSender(userList[0]);
        }
      }
      
      // Fetch organization
      if (batchData.organizationId) {
        const orgList = await base44.entities.Organization.filter({ id: batchData.organizationId });
        if (orgList && orgList.length > 0) {
          setOrganization(orgList[0]);
        }
      }
      
      // Fetch notes associated with this batch via mailingId or by matching clients
      // Since notes reference mailingId, we'll fetch by that if available
      // Otherwise, we'll construct from the batch's selectedClientIds
      let noteList = [];
      
      // Try to fetch notes that reference this batch
      // Notes don't have a direct batchId field, but we can match by client IDs and user
      if (batchData.selectedClientIds && batchData.selectedClientIds.length > 0) {
        // Fetch clients first
        const clientList = await base44.entities.Client.filter({ 
          id: { $in: batchData.selectedClientIds } 
        });
        const clientMap = {};
        clientList.forEach(c => { clientMap[c.id] = c; });
        setClients(clientMap);
        
        // Fetch notes for these clients by this user (approximate match)
        // In a real scenario, we'd have a batchId on Note entity
        noteList = await base44.entities.Note.filter({
          userId: batchData.userId,
          clientId: { $in: batchData.selectedClientIds }
        });
      }
      
      setNotes(noteList);
      
      // Fetch card designs used
      const designIds = [...new Set([
        batchData.selectedCardDesignId,
        ...noteList.map(n => n.cardDesignId).filter(Boolean)
      ].filter(Boolean))];
      
      if (designIds.length > 0) {
        const designList = await base44.entities.CardDesign.filter({ 
          id: { $in: designIds } 
        });
        const designMap = {};
        designList.forEach(d => { designMap[d.id] = d; });
        setCardDesigns(designMap);
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

  // Get status pill variant
  const getStatusPillVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'sending': return 'color1';
      case 'ready_to_send': return 'warning';
      case 'draft': return 'muted';
      case 'delivered': return 'success';
      case 'sent': return 'color1';
      case 'queued': return 'warning';
      case 'queued_for_sending': return 'warning';
      case 'pending_print': return 'warning';
      case 'printed': return 'color1';
      case 'failed': return 'danger';
      default: return 'muted';
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Navigate to card details
  const handleCardClick = (noteId) => {
    navigate(createPageUrl(`AdminCardDetails?id=${noteId}&batchId=${batchId}`));
  };

  // Navigate back to all sends
  const handleBack = () => {
    navigate(createPageUrl('AdminSends'));
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
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  const cardCount = batch?.selectedClientIds?.length || 0;
  const globalDesign = cardDesigns[batch?.selectedCardDesignId];

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Send Details
            </h1>
            <p className="text-muted-foreground">
              Batch #{batchId?.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

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
            
            {/* Scribe Status */}
            {batch?.scribeStatus && batch.scribeStatus !== 'draft' && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Scribe Status</p>
                <Pill variant={getStatusPillVariant(batch?.scribeStatus)}>
                  {formatStatus(batch?.scribeStatus)}
                </Pill>
              </div>
            )}
            
            {/* Card Count */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Cards</p>
              <p className="font-semibold text-foreground flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {cardCount} {cardCount === 1 ? 'card' : 'cards'}
              </p>
            </div>
            
            {/* Created Date */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created</p>
              <p className="font-semibold text-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {batch?.created_date 
                  ? format(new Date(batch.created_date), 'MMM d, yyyy h:mm a')
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
            
            {/* Scribe Campaign ID */}
            {batch?.scribeCampaignId && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Scribe Campaign ID</p>
                <p className="font-mono text-sm text-foreground">{batch.scribeCampaignId}</p>
              </div>
            )}
          </div>
          
          {/* Global Message Preview */}
          {batch?.globalMessage && (
            <div className="mt-6 pt-6 border-t border-subtle">
              <p className="text-sm text-muted-foreground mb-2">Global Message</p>
              <div className="p-4 bg-surface-1 rounded-lg">
                <p className="text-foreground whitespace-pre-wrap text-sm">
                  {batch.globalMessage}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cards List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Individual Cards ({filteredNotes.length})
          </h2>
          
          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Empty state for notes */}
        {filteredNotes.length === 0 && notes.length === 0 && (
          <div className="text-center py-12 bg-surface-1 rounded-lg border border-subtle">
            <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No Cards Found</h3>
            <p className="text-muted-foreground">
              No individual card records are associated with this batch yet.
            </p>
          </div>
        )}

        {/* Filtered empty state */}
        {filteredNotes.length === 0 && notes.length > 0 && (
          <div className="text-center py-12 bg-surface-1 rounded-lg border border-subtle">
            <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No Matches</h3>
            <p className="text-muted-foreground">
              No cards match your search. Try a different term.
            </p>
          </div>
        )}

        {/* Cards list */}
        {filteredNotes.length > 0 && (
          <div className="space-y-2">
            {filteredNotes.map((note) => {
              const client = clients[note.clientId];
              const design = cardDesigns[note.cardDesignId];
              
              return (
                <Card
                  key={note.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border border-subtle"
                  onClick={() => handleCardClick(note.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      {/* Left: Card Info */}
                      <div className="flex items-center gap-4">
                        {/* Card Design Thumbnail */}
                        <div className="w-12 h-16 rounded bg-surface-1 border border-subtle overflow-hidden flex-shrink-0">
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
                        
                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">
                              {note.recipientName || client?.fullName || 'Unknown Recipient'}
                            </h4>
                            <Pill variant={getStatusPillVariant(note.status)} size="sm">
                              {formatStatus(note.status)}
                            </Pill>
                          </div>
                          
                          {/* Address */}
                          {client && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {[client.street, client.city, client.state, client.zipCode]
                                .filter(Boolean).join(', ')}
                            </p>
                          )}
                          
                          {/* Message snippet */}
                          {note.message && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {note.message.substring(0, 100)}
                              {note.message.length > 100 ? '...' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Right: Arrow and date */}
                      <div className="flex items-center gap-4">
                        {note.sentDate && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(note.sentDate), 'MMM d, yyyy')}
                          </p>
                        )}
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Show clients from batch if no notes exist */}
        {notes.length === 0 && Object.keys(clients).length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-2">
              Showing selected clients for this batch (no card records created yet):
            </p>
            {Object.values(clients).map((client) => (
              <Card key={client.id} className="border border-subtle">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {client.fullName || `${client.firstName} ${client.lastName}`}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {[client.street, client.city, client.state, client.zipCode]
                          .filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}