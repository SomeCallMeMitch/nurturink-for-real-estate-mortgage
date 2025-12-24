import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pill } from '@/components/ui/Pill';
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  FileText,
  Mail,
  Clock,
  Building,
  Palette,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Truck,
  Printer,
  Send
} from 'lucide-react';
import { format } from 'date-fns';

/**
 * AdminCardDetails Page - Phase 3
 * 
 * Shows detailed information for a single Note (card) record
 * including recipient info, message content, card design preview,
 * and delivery status tracking.
 */
export default function AdminCardDetails() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const noteId = urlParams.get('id');
  const batchId = urlParams.get('batchId');
  
  // Data state
  const [note, setNote] = useState(null);
  const [client, setClient] = useState(null);
  const [cardDesign, setCardDesign] = useState(null);
  const [sender, setSender] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [noteStyleProfile, setNoteStyleProfile] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (noteId) {
      loadData();
    } else {
      setError('No card ID provided');
      setLoading(false);
    }
  }, [noteId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the note
      const noteList = await base44.entities.Note.filter({ id: noteId });
      if (!noteList || noteList.length === 0) {
        setError('Card not found');
        setLoading(false);
        return;
      }
      const noteData = noteList[0];
      setNote(noteData);
      
      // Fetch related data in parallel
      const promises = [];
      
      // Client
      if (noteData.clientId) {
        promises.push(
          base44.entities.Client.filter({ id: noteData.clientId })
            .then(list => list?.[0] && setClient(list[0]))
        );
      }
      
      // Card Design
      if (noteData.cardDesignId) {
        promises.push(
          base44.entities.CardDesign.filter({ id: noteData.cardDesignId })
            .then(list => list?.[0] && setCardDesign(list[0]))
        );
      }
      
      // Sender
      if (noteData.userId) {
        promises.push(
          base44.entities.User.filter({ id: noteData.userId })
            .then(list => list?.[0] && setSender(list[0]))
        );
      }
      
      // Organization
      if (noteData.orgId) {
        promises.push(
          base44.entities.Organization.filter({ id: noteData.orgId })
            .then(list => list?.[0] && setOrganization(list[0]))
        );
      }
      
      // Note Style Profile
      if (noteData.noteStyleProfileId) {
        promises.push(
          base44.entities.NoteStyleProfile.filter({ id: noteData.noteStyleProfileId })
            .then(list => list?.[0] && setNoteStyleProfile(list[0]))
        );
      }
      
      // Template
      if (noteData.templateId) {
        promises.push(
          base44.entities.Template.filter({ id: noteData.templateId })
            .then(list => list?.[0] && setTemplate(list[0]))
        );
      }
      
      await Promise.all(promises);
      
    } catch (err) {
      console.error('Failed to load card details:', err);
      setError('Could not load card details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get status pill variant
  const getStatusPillVariant = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'sent': return 'success';
      case 'printed': return 'color1';
      case 'pending_print': return 'warning';
      case 'queued_for_sending': return 'warning';
      case 'queued': return 'warning';
      case 'draft': return 'muted';
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

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'sent': return <Send className="w-5 h-5 text-blue-600" />;
      case 'printed': return <Printer className="w-5 h-5 text-blue-600" />;
      case 'pending_print': return <Clock className="w-5 h-5 text-amber-600" />;
      case 'queued_for_sending': return <Clock className="w-5 h-5 text-amber-600" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  // Navigate back
  const handleBack = () => {
    if (batchId) {
      navigate(createPageUrl(`AdminSendDetails?id=${batchId}`));
    } else {
      navigate(createPageUrl('AdminSends'));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Card Details</h1>
          <p className="text-muted-foreground">
            Card #{noteId?.slice(-8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Card Information */}
        <div className="space-y-6">
          
          {/* Status Card */}
          <Card className="border border-subtle">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(note?.status)}
                Status & Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Status</span>
                  <Pill variant={getStatusPillVariant(note?.status)} size="lg">
                    {formatStatus(note?.status)}
                  </Pill>
                </div>
                
                {note?.sentDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sent Date</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(note.sentDate), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                )}
                
                {note?.deliveryTrackingId && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tracking ID</span>
                    <span className="font-mono text-sm">{note.deliveryTrackingId}</span>
                  </div>
                )}
                
                {note?.deliveryStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Delivery Status</span>
                    <span className="font-semibold">{note.deliveryStatus}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Credit Cost</span>
                  <span className="font-semibold">{note?.creditCost || 1} credit(s)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipient Card */}
          <Card className="border border-subtle">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Recipient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold text-lg">
                    {note?.recipientName || client?.fullName || 'Unknown'}
                  </p>
                </div>
                
                {client && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-semibold flex items-start gap-1">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {client.street}
                          {client.address2 && <><br />{client.address2}</>}
                          <br />
                          {client.city}, {client.state} {client.zipCode}
                        </span>
                      </p>
                    </div>
                    
                    {client.email && (
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-semibold">{client.email}</p>
                      </div>
                    )}
                    
                    {client.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-semibold">{client.phone}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sender & Organization Card */}
          <Card className="border border-subtle">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Sender Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Sent By</p>
                  <p className="font-semibold">
                    {note?.senderName || sender?.full_name || 'Unknown'}
                  </p>
                  {sender?.email && (
                    <p className="text-sm text-muted-foreground">{sender.email}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Organization</p>
                  <p className="font-semibold">{organization?.name || 'Unknown'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-semibold">
                    {note?.created_date 
                      ? format(new Date(note.created_date), 'MMM d, yyyy h:mm a')
                      : 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Card Preview & Message */}
        <div className="space-y-6">
          
          {/* Card Design Preview */}
          <Card className="border border-subtle">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Card Design
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cardDesign ? (
                <div className="space-y-4">
                  <p className="font-semibold text-lg">{cardDesign.name}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Outside/Front */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Outside</p>
                      <div className="aspect-[5.5/4] rounded-lg border border-subtle overflow-hidden bg-surface-1">
                        {cardDesign.outsideImageUrl ? (
                          <img 
                            src={cardDesign.outsideImageUrl} 
                            alt="Card Outside" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Inside */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Inside</p>
                      <div className="aspect-[5.5/4] rounded-lg border border-subtle overflow-hidden bg-surface-1">
                        {cardDesign.insideImageUrl ? (
                          <img 
                            src={cardDesign.insideImageUrl} 
                            alt="Card Inside" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {cardDesign.category && (
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-semibold">{cardDesign.category}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-muted-foreground">No card design assigned</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Content */}
          <Card className="border border-subtle">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Message Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Template used */}
                {template && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Template Used</p>
                    <Pill variant="color1" size="sm">{template.name}</Pill>
                  </div>
                )}
                
                {/* Writing Style */}
                {noteStyleProfile && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Writing Style</p>
                    <p className="font-semibold">{noteStyleProfile.name}</p>
                    {noteStyleProfile.handwritingFont && (
                      <p className="text-sm text-muted-foreground">
                        Font: {noteStyleProfile.handwritingFont}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Message */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Message</p>
                  <div className="p-4 bg-surface-1 rounded-lg border border-subtle">
                    <p className="whitespace-pre-wrap text-foreground font-caveat text-lg leading-relaxed">
                      {note?.message || 'No message content'}
                    </p>
                  </div>
                </div>
                
                {/* Signature */}
                {note?.signature && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Signature</p>
                    <div className="p-4 bg-surface-1 rounded-lg border border-subtle">
                      <p className="whitespace-pre-wrap text-foreground font-caveat text-lg">
                        {note.signature}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Outcome Tracking (if available) */}
          {(note?.outcome || note?.outcomeRating || note?.outcomeDetails) && (
            <Card className="border border-subtle">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Outcome
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {note.outcome && (
                    <div>
                      <p className="text-sm text-muted-foreground">Result</p>
                      <Pill variant={note.outcome === 'sale_closed' ? 'success' : 'muted'}>
                        {formatStatus(note.outcome)}
                      </Pill>
                    </div>
                  )}
                  
                  {note.outcomeRating && (
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="font-semibold">{note.outcomeRating} / 5 stars</p>
                    </div>
                  )}
                  
                  {note.outcomeDetails && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-foreground">{note.outcomeDetails}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}