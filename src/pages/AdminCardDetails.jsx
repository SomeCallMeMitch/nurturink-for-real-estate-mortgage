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
  Clock,
  Building,
  Palette,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Truck,
  Printer,
  Send,
  Package,
  Copy,
  Mail,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';

/**
 * AdminCardDetails Page
 * 
 * Shows detailed information for a single Note (card) including:
 * - Recipient info with address FROM MAILING (not current client)
 * - Return address used FROM MAILING
 * - Message content with handwriting preview
 * - Card design images
 * - Scribe tracking timeline
 * - Outcome tracking
 */
export default function AdminCardDetails() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const noteId = urlParams.get('id');
  const batchId = urlParams.get('batchId');
  
  const [note, setNote] = useState(null);
  const [mailing, setMailing] = useState(null);
  const [client, setClient] = useState(null);
  const [cardDesign, setCardDesign] = useState(null);
  const [sender, setSender] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [noteStyleProfile, setNoteStyleProfile] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (noteId) loadData();
    else {
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
      if (!noteList?.length) {
        setError('Card not found');
        return;
      }
      const noteData = noteList[0];
      setNote(noteData);
      
      // Fetch mailing (contains the actual addresses used)
      if (noteData.mailingId) {
        try {
          const mailingList = await base44.entities.Mailing.filter({ id: noteData.mailingId });
          if (mailingList?.[0]) setMailing(mailingList[0]);
        } catch (e) {
          console.warn('Could not fetch mailing by ID:', e);
        }
      }
      // Fallback: try to find mailing by noteId
      if (!mailing) {
        try {
          const mailingList = await base44.entities.Mailing.filter({ noteId: noteId });
          if (mailingList?.[0]) setMailing(mailingList[0]);
        } catch (e) {
          console.warn('Could not fetch mailing by noteId:', e);
        }
      }
      
      // Fetch related data in parallel
      const promises = [];
      
      if (noteData.clientId) {
        promises.push(
          base44.entities.Client.filter({ id: noteData.clientId })
            .then(list => list?.[0] && setClient(list[0]))
            .catch(() => {})
        );
      }
      
      if (noteData.cardDesignId) {
        promises.push(
          base44.entities.CardDesign.filter({ id: noteData.cardDesignId })
            .then(list => list?.[0] && setCardDesign(list[0]))
            .catch(() => {})
        );
      }
      
      if (noteData.userId) {
        promises.push(
          base44.entities.User.filter({ id: noteData.userId })
            .then(list => list?.[0] && setSender(list[0]))
            .catch(() => {})
        );
      }
      
      if (noteData.orgId) {
        promises.push(
          base44.entities.Organization.filter({ id: noteData.orgId })
            .then(list => list?.[0] && setOrganization(list[0]))
            .catch(() => {})
        );
      }
      
      if (noteData.noteStyleProfileId) {
        promises.push(
          base44.entities.NoteStyleProfile.filter({ id: noteData.noteStyleProfileId })
            .then(list => list?.[0] && setNoteStyleProfile(list[0]))
            .catch(() => {})
        );
      }
      
      if (noteData.templateId) {
        promises.push(
          base44.entities.Template.filter({ id: noteData.templateId })
            .then(list => list?.[0] && setTemplate(list[0]))
            .catch(() => {})
        );
      }
      
      await Promise.all(promises);
      
    } catch (err) {
      console.error('Failed to load card details:', err);
      setError('Could not load card details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusPillVariant = (status) => {
    const map = {
      delivered: 'success', sent: 'success',
      printed: 'color1', 
      pending_print: 'warning', queued_for_sending: 'warning', queued: 'warning',
      draft: 'muted',
      failed: 'danger'
    };
    return map[status] || 'muted';
  };

  const formatStatus = (s) => s ? s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Unknown';

  const getStatusIcon = (status) => {
    const icons = {
      delivered: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      sent: <Send className="w-5 h-5 text-blue-600" />,
      printed: <Printer className="w-5 h-5 text-blue-600" />,
      pending_print: <Clock className="w-5 h-5 text-amber-600" />,
      queued_for_sending: <Clock className="w-5 h-5 text-amber-600" />,
      failed: <XCircle className="w-5 h-5 text-red-600" />
    };
    return icons[status] || <FileText className="w-5 h-5 text-gray-600" />;
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBack = () => {
    if (batchId) navigate(createPageUrl(`AdminSendDetails?id=${batchId}`));
    else navigate(createPageUrl('AdminSends'));
  };

  // Format address object to string
  const formatAddress = (addr) => {
    if (!addr) return null;
    const parts = [
      addr.name,
      addr.street,
      addr.address2,
      [addr.city, addr.state, addr.zip].filter(Boolean).join(', ')
    ].filter(Boolean);
    return parts.join('\n');
  };

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );

  if (error) return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={handleBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p className="text-destructive">{error}</p>
      </div>
    </div>
  );

  // Get addresses - prefer Mailing (actual sent addresses) over Client (current addresses)
  const recipientAddress = mailing?.recipientAddress || (client ? {
    name: client.fullName,
    street: client.street,
    address2: client.address2,
    city: client.city,
    state: client.state,
    zip: client.zipCode
  } : null);
  
  const returnAddress = mailing?.returnAddress;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Card Details</h1>
          <p className="text-muted-foreground">Card #{noteId?.slice(-8).toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(note?.status)}
          <Pill variant={getStatusPillVariant(note?.status)} size="md">
            {formatStatus(note?.status)}
          </Pill>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Status Timeline */}
          <Card className="border border-subtle">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" /> Delivery Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Timeline */}
                <div className="relative">
                  {[
                    { status: 'queued_for_sending', label: 'Queued', icon: Clock },
                    { status: 'pending_print', label: 'Processing', icon: Package },
                    { status: 'printed', label: 'Printed', icon: Printer },
                    { status: 'sent', label: 'Shipped', icon: Truck },
                    { status: 'delivered', label: 'Delivered', icon: CheckCircle2 }
                  ].map((step, i, arr) => {
                    const statusOrder = ['queued_for_sending', 'pending_print', 'printed', 'sent', 'delivered'];
                    const currentIndex = statusOrder.indexOf(note?.status);
                    const stepIndex = statusOrder.indexOf(step.status);
                    const isComplete = stepIndex <= currentIndex && currentIndex >= 0;
                    const isCurrent = step.status === note?.status;
                    const isFailed = note?.status === 'failed';
                    
                    return (
                      <div key={step.status} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isFailed ? 'bg-red-100' :
                          isComplete ? 'bg-green-100' : 
                          isCurrent ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <step.icon className={`w-4 h-4 ${
                            isFailed ? 'text-red-600' :
                            isComplete ? 'text-green-600' : 
                            isCurrent ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isComplete || isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                        </div>
                        {isComplete && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      </div>
                    );
                  })}
                </div>
                
                {note?.status === 'failed' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">Delivery Failed</p>
                    <p className="text-sm text-red-600">This card could not be processed. Please contact support.</p>
                  </div>
                )}
                
                {/* Dates */}
                <div className="pt-4 border-t border-subtle space-y-2">
                  {note?.created_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span>{format(new Date(note.created_date), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  )}
                  {note?.sentDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sent</span>
                      <span>{format(new Date(note.sentDate), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  )}
                </div>
                
                {/* Scribe Info */}
                {note?.scribeCampaignId && (
                  <div className="pt-4 border-t border-subtle">
                    <p className="text-sm text-muted-foreground mb-1">Scribe Campaign ID</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm bg-surface-1 px-2 py-1 rounded">{note.scribeCampaignId}</code>
                      <button
                        onClick={() => copyToClipboard(note.scribeCampaignId, 'scribe')}
                        className="p-1 hover:bg-surface-1 rounded"
                      >
                        {copiedId === 'scribe' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recipient Card - Uses MAILING address */}
          <Card className="border border-subtle">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" /> Recipient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold text-lg">{note?.recipientName || client?.fullName || 'Unknown'}</p>
                </div>
                
                {recipientAddress && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Mailing Address
                      {mailing && <span className="text-xs ml-1">(as sent)</span>}
                    </p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <p className="whitespace-pre-line">{formatAddress(recipientAddress)}</p>
                    </div>
                  </div>
                )}
                
                {client?.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{client.email}</p>
                  </div>
                )}
                
                {client?.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold">{client.phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Return Address Card - Uses MAILING return address */}
          <Card className="border border-subtle">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" /> Return Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {returnAddress ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill variant="muted" size="sm">
                      {note?.returnAddressMode || mailing?.returnAddressMode || 'custom'}
                    </Pill>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <p className="whitespace-pre-line">{formatAddress(returnAddress)}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No return address</p>
                  <Pill variant="muted" size="sm" className="mt-2">none</Pill>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sender Card */}
          <Card className="border border-subtle">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" /> Sender Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Sent By</p>
                  <p className="font-semibold">{note?.senderName || sender?.full_name || 'Unknown'}</p>
                  {sender?.email && <p className="text-sm text-muted-foreground">{sender.email}</p>}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Organization</p>
                  <p className="font-semibold">{organization?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credit Cost</p>
                  <p className="font-semibold">{note?.creditCost || 1} credit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Card Design Preview */}
          <Card className="border border-subtle">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" /> Card Design
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cardDesign ? (
                <div className="space-y-4">
                  <p className="font-semibold text-lg">{cardDesign.name}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Outside */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Outside (Front)</p>
                      <div className="aspect-[5.5/4] rounded-lg border overflow-hidden bg-surface-1">
                        {cardDesign.outsideImageUrl ? (
                          <img src={cardDesign.outsideImageUrl} alt="Card Outside" className="w-full h-full object-cover" />
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
                      <div className="aspect-[5.5/4] rounded-lg border overflow-hidden bg-surface-1">
                        {cardDesign.insideImageUrl ? (
                          <img src={cardDesign.insideImageUrl} alt="Card Inside" className="w-full h-full object-cover" />
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
                      <Pill variant="muted" size="sm">{cardDesign.category}</Pill>
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
                <MessageSquare className="w-5 h-5" /> Message Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {template && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Template Used</p>
                    <Pill variant="color1" size="sm">{template.name || note?.templateName}</Pill>
                  </div>
                )}
                
                {noteStyleProfile && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Writing Style</p>
                    <p className="font-semibold">{noteStyleProfile.name}</p>
                  </div>
                )}
                
                {/* Message */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Message</p>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="whitespace-pre-wrap text-foreground font-caveat text-xl leading-relaxed">
                      {note?.message || 'No message content'}
                    </p>
                  </div>
                </div>
                
                {note?.signature && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Signature</p>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="whitespace-pre-wrap text-foreground font-caveat text-xl">
                        {note.signature}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Outcome Tracking */}
          {(note?.outcome || note?.outcomeRating || note?.outcomeDetails) && (
            <Card className="border border-subtle">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Outcome
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {note.outcome && (
                    <div>
                      <p className="text-sm text-muted-foreground">Result</p>
                      <Pill variant={note.outcome === 'sale_closed' ? 'success' : note.outcome === 'referral_generated' ? 'color1' : 'muted'}>
                        {formatStatus(note.outcome)}
                      </Pill>
                    </div>
                  )}
                  
                  {note.outcomeRating && (
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className={star <= note.outcomeRating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                        ))}
                        <span className="ml-1 text-sm text-muted-foreground">({note.outcomeRating}/5)</span>
                      </div>
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

          {/* Batch Link */}
          {(note?.mailingBatchId || batchId) && (
            <Card className="border border-subtle">
              <CardContent className="p-4">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => navigate(createPageUrl(`AdminSendDetails?id=${note?.mailingBatchId || batchId}`))}
                >
                  <Package className="w-4 h-4" />
                  View Full Batch
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
