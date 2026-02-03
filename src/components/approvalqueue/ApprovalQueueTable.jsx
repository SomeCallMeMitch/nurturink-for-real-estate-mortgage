import React from 'react';
import { format } from 'date-fns';
import { Check, X, RotateCcw, Ban, Eye, Image, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * ApprovalQueueTable Component
 * 
 * Displays a table of ScheduledSend records with actions based on current tab.
 * 
 * Props:
 * - sends: Array of ScheduledSend records (with populated campaign, step, client)
 * - isLoading: Boolean loading state
 * - activeTab: 'pending' | 'approved' | 'rejected'
 * - selectedIds: Set of selected send IDs
 * - onSelectionChange: (id, checked) => void
 * - onSelectAll: (checked) => void
 * - onApprove: (id) => void
 * - onReject: (id) => void
 * - onCancel: (id) => void
 * - onRetry: (id) => void
 * - onViewDetails: (send) => void
 */
export default function ApprovalQueueTable({
  sends = [],
  isLoading,
  activeTab,
  selectedIds = new Set(),
  onSelectionChange,
  onSelectAll,
  onApprove,
  onReject,
  onCancel,
  onRetry,
  onViewDetails
}) {
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

  // Truncate message for snippet display
  const truncateMessage = (text, maxLength = 50) => {
    if (!text) return '—';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // Check if all current sends are selected
  const allSelected = sends.length > 0 && sends.every(s => selectedIds.has(s.id));
  const someSelected = sends.some(s => selectedIds.has(s.id)) && !allSelected;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (sends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No sends found</h3>
        <p className="text-sm text-muted-foreground">
          {activeTab === 'pending' && 'There are no sends awaiting approval.'}
          {activeTab === 'approved' && 'No approved sends in this period.'}
          {activeTab === 'rejected' && 'No rejected or failed sends.'}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Card</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sends.map((send) => (
              <TableRow 
                key={send.id}
                className={selectedIds.has(send.id) ? 'bg-selection-bg' : ''}
              >
                {/* Checkbox */}
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(send.id)}
                    onCheckedChange={(checked) => onSelectionChange(send.id, checked)}
                  />
                </TableCell>

                {/* Scheduled Date */}
                <TableCell className="font-medium">
                  {formatDate(send.scheduledDate)}
                </TableCell>

                {/* Client Name */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {send.client?.fullName || 'Unknown Client'}
                    </span>
                    {send.client?.email && (
                      <span className="text-xs text-muted-foreground">
                        {send.client.email}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Campaign */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-foreground">
                      {send.campaign?.name || 'Unknown Campaign'}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {send.campaign?.type || ''}
                    </span>
                  </div>
                </TableCell>

                {/* Card Design */}
                <TableCell>
                  {send.step?.cardDesignId ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-6 bg-muted rounded flex items-center justify-center">
                            <Image className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="text-sm">Card</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Card Design ID: {send.step.cardDesignId}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Message Snippet */}
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm text-muted-foreground cursor-help">
                        {truncateMessage(send.customMessage || send.step?.messageText)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{send.customMessage || send.step?.messageText || 'No message'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>

                {/* Status */}
                <TableCell>
                  {getStatusBadge(send.status)}
                  {send.failureReason && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-1 text-destructive cursor-help">ⓘ</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{send.failureReason}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* View Details */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewDetails(send)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Details</TooltipContent>
                    </Tooltip>

                    {/* Pending Tab Actions */}
                    {activeTab === 'pending' && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => onApprove(send.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Approve</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => onReject(send.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reject</TooltipContent>
                        </Tooltip>
                      </>
                    )}

                    {/* Approved Tab Actions */}
                    {activeTab === 'approved' && send.status === 'pending' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => onCancel(send.id)}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Cancel Send</TooltipContent>
                      </Tooltip>
                    )}

                    {/* Rejected Tab Actions */}
                    {activeTab === 'rejected' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => onRetry(send.id)}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Retry</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}