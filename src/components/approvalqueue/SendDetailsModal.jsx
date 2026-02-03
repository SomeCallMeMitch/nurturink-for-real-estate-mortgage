import React from 'react';
import { format } from 'date-fns';
import { X, User, Calendar, Mail, MapPin, Image, FileText, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/**
 * SendDetailsModal Component
 * 
 * Displays detailed information about a ScheduledSend.
 * 
 * Props:
 * - open: Boolean
 * - onOpenChange: (open) => void
 * - send: ScheduledSend object with populated campaign, step, client
 */
export default function SendDetailsModal({ open, onOpenChange, send }) {
  if (!send) return null;

  // Status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'bg-pill-color1-bg text-pill-color1-fg' },
      awaiting_approval: { label: 'Awaiting Approval', className: 'bg-pill-warning-bg text-pill-warning-fg' },
      processing: { label: 'Processing', className: 'bg-pill-color2-bg text-pill-color2-fg' },
      sent: { label: 'Sent', className: 'bg-pill-success-bg text-pill-success-fg' },
      failed: { label: 'Failed', className: 'bg-pill-danger-bg text-pill-danger-fg' },
      cancelled: { label: 'Cancelled', className: 'bg-pill-muted-bg text-pill-muted-fg' },
      insufficient_credits: { label: 'No Credits', className: 'bg-pill-danger-bg text-pill-danger-fg' }
    };
    const config = statusConfig[status] || { label: status, className: 'bg-pill-muted-bg text-pill-muted-fg' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Scheduled Send Details</span>
            {getStatusBadge(send.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Client Information */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Client
            </h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="font-medium text-foreground">
                {send.client?.fullName || 'Unknown Client'}
              </p>
              {send.client?.email && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  {send.client.email}
                </p>
              )}
              {send.client?.street && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {send.client.street}, {send.client.city}, {send.client.state} {send.client.zipCode}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Campaign Information */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Campaign
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{send.campaign?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{send.campaign?.type || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Step</p>
                <p className="font-medium">Card {send.step?.stepOrder || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Timing</p>
                <p className="font-medium">
                  {send.step?.timingDays !== undefined
                    ? `${send.step.timingDays > 0 ? '+' : ''}${send.step.timingDays} days`
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Schedule Information */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Scheduled Date</p>
                <p className="font-medium">{formatDate(send.scheduledDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-medium">{formatDateTime(send.created_date)}</p>
              </div>
              {send.processedAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Processed</p>
                  <p className="font-medium">{formatDateTime(send.processedAt)}</p>
                </div>
              )}
              {send.sentAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Sent</p>
                  <p className="font-medium">{formatDateTime(send.sentAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          {(send.customMessage || send.step?.messageText) && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Message
                </h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">
                    {send.customMessage || send.step?.messageText}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Failure Reason */}
          {send.failureReason && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-destructive mb-3">
                  Failure Reason
                </h4>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive">
                    {send.failureReason}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}