import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Check, X, RotateCcw, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
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

// Components
import ApprovalQueueTable from '@/components/approvalqueue/ApprovalQueueTable';
import ApprovalQueueFilters from '@/components/approvalqueue/ApprovalQueueFilters';
import SendDetailsModal from '@/components/approvalqueue/SendDetailsModal';

/**
 * ApprovalQueue Page
 * 
 * Main page for reviewing and approving/rejecting scheduled sends.
 * Features:
 * - Tabs for Pending, Approved, and Rejected sends
 * - Filtering by campaign, client, date range
 * - Bulk approve/reject actions
 * - Details modal for individual sends
 */
export default function ApprovalQueue() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // UI State
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filters, setFilters] = useState({
    search: '',
    campaignId: null,
    dateFrom: null,
    dateTo: null
  });
  const [detailsModal, setDetailsModal] = useState({ open: false, send: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, ids: [] });

  // Fetch current user for orgId
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch user profile for orgId
  const { data: userProfiles = [] } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => base44.entities.UserProfile.filter({ userId: user.id }),
    enabled: !!user?.id
  });

  const orgId = user?.orgId || userProfiles[0]?.orgId;

  // Fetch campaigns for filter dropdown
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns', orgId],
    queryFn: () => base44.entities.Campaign.filter({ orgId }),
    enabled: !!orgId
  });

  // Map tab to status filters
  const statusMap = {
    pending: ['awaiting_approval'],
    approved: ['pending', 'processing', 'sent'],
    rejected: ['failed', 'cancelled', 'insufficient_credits']
  };

  // Fetch scheduled sends
  const { data: sendsData, isLoading, refetch } = useQuery({
    queryKey: ['scheduledSends', orgId, activeTab, filters],
    queryFn: async () => {
      const response = await base44.functions.invoke('getScheduledSendsForOrg', {
        orgId,
        status: statusMap[activeTab],
        campaignId: filters.campaignId || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        limit: 200
      });
      return response.data;
    },
    enabled: !!orgId
  });

  const sends = sendsData?.sends || [];

  // Filter by search (client-side)
  const filteredSends = useMemo(() => {
    if (!filters.search) return sends;
    const searchLower = filters.search.toLowerCase();
    return sends.filter(send =>
      send.client?.fullName?.toLowerCase().includes(searchLower) ||
      send.client?.email?.toLowerCase().includes(searchLower)
    );
  }, [sends, filters.search]);

  // Count sends by tab for badge display
  const counts = useMemo(() => ({
    pending: sends.filter(s => statusMap.pending.includes(s.status)).length,
    approved: sends.filter(s => statusMap.approved.includes(s.status)).length,
    rejected: sends.filter(s => statusMap.rejected.includes(s.status)).length
  }), [sends]);

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async (ids) => {
      const response = await base44.functions.invoke('approveScheduledSend', {
        scheduledSendIds: ids
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scheduledSends'] });
      setSelectedIds(new Set());
      
      if (data.insufficientCreditsCount > 0) {
        toast({
          title: 'Partial Approval',
          description: `${data.approvedCount} approved, ${data.insufficientCreditsCount} failed due to insufficient credits.`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Sends Approved',
          description: `${data.approvedCount} send(s) have been approved.`
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Reject/Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: async (ids) => {
      const response = await base44.functions.invoke('cancelScheduledSend', {
        scheduledSendIds: ids
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scheduledSends'] });
      setSelectedIds(new Set());
      toast({
        title: 'Sends Cancelled',
        description: data.message
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Retry Mutation
  const retryMutation = useMutation({
    mutationFn: async (ids) => {
      // Retry each send individually
      const results = await Promise.all(
        ids.map(id => 
          base44.functions.invoke('retryFailedSends', { scheduledSendId: id })
        )
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledSends'] });
      setSelectedIds(new Set());
      toast({
        title: 'Sends Retried',
        description: 'Selected sends have been queued for retry.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Handlers
  const handleSelectionChange = (id, checked) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(filteredSends.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleApprove = (id) => {
    setConfirmDialog({ open: true, action: 'approve', ids: [id] });
  };

  const handleReject = (id) => {
    setConfirmDialog({ open: true, action: 'reject', ids: [id] });
  };

  const handleCancel = (id) => {
    setConfirmDialog({ open: true, action: 'cancel', ids: [id] });
  };

  const handleRetry = (id) => {
    retryMutation.mutate([id]);
  };

  const handleBulkApprove = () => {
    if (selectedIds.size === 0) return;
    setConfirmDialog({ open: true, action: 'approve', ids: Array.from(selectedIds) });
  };

  const handleBulkReject = () => {
    if (selectedIds.size === 0) return;
    setConfirmDialog({ open: true, action: 'reject', ids: Array.from(selectedIds) });
  };

  const handleConfirmAction = () => {
    const { action, ids } = confirmDialog;
    if (action === 'approve') {
      approveMutation.mutate(ids);
    } else if (action === 'reject' || action === 'cancel') {
      cancelMutation.mutate(ids);
    }
    setConfirmDialog({ open: false, action: null, ids: [] });
  };

  const handleViewDetails = (send) => {
    setDetailsModal({ open: true, send });
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      campaignId: null,
      dateFrom: null,
      dateTo: null
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedIds(new Set());
  };

  const isProcessing = approveMutation.isPending || cancelMutation.isPending || retryMutation.isPending;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Approval Queue</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage automated card sends before they go out.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Pending Approval
              {counts.pending > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-warning/20 text-warning rounded-full">
                  {counts.pending}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="w-4 h-4" />
              Rejected
            </TabsTrigger>
          </TabsList>

          {/* Bulk Actions - Pending Tab */}
          {activeTab === 'pending' && selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selected
              </span>
              <Button
                size="sm"
                onClick={handleBulkApprove}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                Approve All
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkReject}
                disabled={isProcessing}
              >
                <X className="w-4 h-4 mr-1" />
                Reject All
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <ApprovalQueueFilters
          campaigns={campaigns}
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Tab Content */}
        <TabsContent value="pending">
          <ApprovalQueueTable
            sends={filteredSends.filter(s => statusMap.pending.includes(s.status))}
            isLoading={isLoading}
            activeTab="pending"
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            onSelectAll={handleSelectAll}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        <TabsContent value="approved">
          <ApprovalQueueTable
            sends={filteredSends.filter(s => statusMap.approved.includes(s.status))}
            isLoading={isLoading}
            activeTab="approved"
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            onSelectAll={handleSelectAll}
            onCancel={handleCancel}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        <TabsContent value="rejected">
          <ApprovalQueueTable
            sends={filteredSends.filter(s => statusMap.rejected.includes(s.status))}
            isLoading={isLoading}
            activeTab="rejected"
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            onSelectAll={handleSelectAll}
            onRetry={handleRetry}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
      </Tabs>

      {/* Details Modal */}
      <SendDetailsModal
        open={detailsModal.open}
        onOpenChange={(open) => setDetailsModal({ open, send: open ? detailsModal.send : null })}
        send={detailsModal.send}
      />

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, action: null, ids: [] })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'approve' && 'Approve Scheduled Sends?'}
              {confirmDialog.action === 'reject' && 'Reject Scheduled Sends?'}
              {confirmDialog.action === 'cancel' && 'Cancel Scheduled Sends?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'approve' && (
                <>
                  This will approve {confirmDialog.ids.length} send(s) and move them to the pending queue.
                  Cards will be sent on their scheduled dates if credits are available.
                </>
              )}
              {confirmDialog.action === 'reject' && (
                <>
                  This will reject {confirmDialog.ids.length} send(s). They will not be sent.
                  You can retry them later if needed.
                </>
              )}
              {confirmDialog.action === 'cancel' && (
                <>
                  This will cancel {confirmDialog.ids.length} approved send(s).
                  The cards will not be sent.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {confirmDialog.action === 'approve' && 'Approve'}
              {confirmDialog.action === 'reject' && 'Reject'}
              {confirmDialog.action === 'cancel' && 'Cancel Send'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}