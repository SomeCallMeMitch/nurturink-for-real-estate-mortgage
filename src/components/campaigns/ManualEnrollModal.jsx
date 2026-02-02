import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

// Icons
import { Search, Users, Loader2, Calendar, AlertCircle } from 'lucide-react';

/**
 * ManualEnrollModal Component
 * Modal for manually enrolling clients into a campaign
 * 
 * @param {boolean} isOpen - Whether modal is open
 * @param {Function} onClose - Close handler
 * @param {string} campaignId - Campaign to enroll into
 * @param {string} campaignType - Type of campaign
 * @param {Function} onEnrollComplete - Callback after successful enrollment
 */
export default function ManualEnrollModal({ 
  isOpen, 
  onClose, 
  campaignId, 
  campaignType,
  onEnrollComplete 
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [page, setPage] = useState(1);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedIds(new Set());
      setPage(1);
    }
  }, [isOpen]);

  // Fetch eligible clients
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['eligibleClients', campaignId, searchQuery, page],
    queryFn: async () => {
      const response = await base44.functions.invoke('getCampaignEligibleClients', {
        campaignId,
        search: searchQuery,
        page,
        limit: 50
      });
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    enabled: isOpen && !!campaignId
  });

  const clients = data?.clients || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1 };

  // Bulk enroll mutation
  const enrollMutation = useMutation({
    mutationFn: async (clientIds) => {
      const response = await base44.functions.invoke('bulkEnrollClients', {
        campaignId,
        clientIds
      });
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    onSuccess: (result) => {
      toast({
        title: 'Clients Enrolled',
        description: `Successfully enrolled ${result.enrolled} client(s). ${result.skipped > 0 ? `${result.skipped} skipped.` : ''}`
      });
      queryClient.invalidateQueries({ queryKey: ['enrolledClients'] });
      queryClient.invalidateQueries({ queryKey: ['eligibleClients'] });
      onEnrollComplete?.();
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Enrollment Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Handle select/deselect
  const toggleSelection = (clientId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  };

  // Handle select all visible
  const toggleSelectAll = () => {
    if (selectedIds.size === clients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(clients.map(c => c.clientId)));
    }
  };

  // Handle enroll
  const handleEnroll = () => {
    if (selectedIds.size === 0) return;
    enrollMutation.mutate(Array.from(selectedIds));
  };

  // Get trigger label
  const getTriggerLabel = () => {
    switch (campaignType) {
      case 'birthday': return 'Birthday';
      case 'welcome': return 'Policy Start';
      case 'renewal': return 'Renewal Date';
      default: return 'Date';
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const isEnrolling = enrollMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add Clients to Campaign
          </DialogTitle>
          <DialogDescription>
            Select eligible clients to enroll in this campaign. Only clients with the required date field can be enrolled.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        {/* Client List */}
        <ScrollArea className="flex-1 min-h-[300px] border rounded-md">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-muted-foreground">Failed to load eligible clients</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                Retry
              </Button>
            </div>
          ) : clients.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No clients match your search' : 'All eligible clients are already enrolled'}
              </p>
            </div>
          ) : (
            <div>
              {/* Select All Header */}
              <div className="sticky top-0 bg-muted/80 backdrop-blur-sm border-b p-3 flex items-center gap-3">
                <Checkbox
                  checked={selectedIds.size === clients.length && clients.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedIds.size > 0 
                    ? `${selectedIds.size} selected` 
                    : `Select all (${pagination.total} eligible)`
                  }
                </span>
              </div>

              {/* Client Rows */}
              {clients.map(client => (
                <div 
                  key={client.clientId}
                  className={`flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 ${
                    selectedIds.has(client.clientId) ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => toggleSelection(client.clientId)}
                >
                  <Checkbox
                    checked={selectedIds.has(client.clientId)}
                    onCheckedChange={() => toggleSelection(client.clientId)}
                  />
                  
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                    {client.clientName?.substring(0, 2).toUpperCase() || '?'}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {client.clientName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {client.clientEmail || 'No email'}
                    </p>
                  </div>
                  
                  {/* Trigger Date */}
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">{getTriggerLabel()}</p>
                    <p className="font-medium flex items-center gap-1 justify-end">
                      <Calendar className="h-3 w-3" />
                      {formatDate(client.triggerDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isEnrolling}>
            Cancel
          </Button>
          <Button 
            onClick={handleEnroll} 
            disabled={selectedIds.size === 0 || isEnrolling}
          >
            {isEnrolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                Enroll {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}