import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pill } from '@/components/ui/Pill';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Send,
  Calendar,
  Users,
  ChevronRight,
  Package,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

/**
 * Shared Status Utilities (inline to avoid import issues)
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
    'payment-pending': 'warning',
    'expect-48-hour-delay': 'warning',
    failed: 'danger',
    cancelled: 'danger',
    partial: 'warning',
    delete: 'danger',
    draft: 'muted',
    paused: 'muted',
    'on-going': 'muted'
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
 * AdminSends Page
 * 
 * Displays a paginated list of all MailingBatch records.
 * Each row shows batch details and links to AdminSendDetails page.
 * 
 * Uses whitelabel CSS variables for consistent theming.
 */
export default function AdminSends() {
  const navigate = useNavigate();
  
  // Data state
  const [mailingBatches, setMailingBatches] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all mailing batches, sorted by created_date descending
      // Only fetch batches that have been sent (not drafts in progress)
      const batches = await base44.entities.MailingBatch.list('-created_date', 100);
      
      // Filter to only show batches that have been processed (have status other than just draft)
      // or have scribeCampaigns array populated
      const processedBatches = batches.filter(b => 
        b.status === 'completed' || 
        b.status === 'sending' || 
        b.status === 'partial' ||
        b.status === 'failed' ||
        (b.scribeCampaigns && b.scribeCampaigns.length > 0)
      );
      
      setMailingBatches(processedBatches);
      
      // Get unique user IDs to fetch user details
      const userIds = [...new Set(processedBatches.map(b => b.userId).filter(Boolean))];
      
      if (userIds.length > 0) {
        const userList = await base44.entities.User.filter({ id: { $in: userIds } });
        const userMap = {};
        userList.forEach(u => { userMap[u.id] = u; });
        setUsers(userMap);
      }
      
    } catch (err) {
      console.error('Failed to load mailing batches:', err);
      setError('Could not load sends. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter batches based on search and status
  const filteredBatches = useMemo(() => {
    let filtered = mailingBatches;
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    // Search filter (by user name or batch ID)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => {
        const user = users[b.userId];
        const userName = user?.full_name?.toLowerCase() || '';
        const userEmail = user?.email?.toLowerCase() || '';
        const batchId = b.id?.toLowerCase() || '';
        return userName.includes(query) || userEmail.includes(query) || batchId.includes(query);
      });
    }
    
    return filtered;
  }, [mailingBatches, statusFilter, searchQuery, users]);

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'sending':
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  // Calculate campaign stats for a batch
  const getCampaignStats = (batch) => {
    if (!batch.scribeCampaigns || batch.scribeCampaigns.length === 0) {
      return null;
    }
    
    const total = batch.scribeCampaigns.length;
    const submitted = batch.scribeCampaigns.filter(c => c.status === 'submitted').length;
    const failed = batch.scribeCampaigns.filter(c => c.status === 'failed').length;
    
    return { total, submitted, failed };
  };

  // Navigate to send details
  const handleRowClick = (batchId) => {
    navigate(createPageUrl(`AdminSendDetails?id=${batchId}`));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Sends</h1>
          <p className="mt-1 text-muted-foreground">
            View and track all outgoing mail batches sent through Scribe.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadData}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by sender name, email, or batch ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredBatches.length === 0 && (
        <div className="text-center py-16 bg-surface-1 rounded-lg border border-subtle">
          <Send className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Sends Found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all'
              ? 'No sends match your filters. Try adjusting your search or status filter.'
              : 'No mailing batches have been sent yet.'}
          </p>
        </div>
      )}

      {/* Sends List */}
      {!loading && !error && filteredBatches.length > 0 && (
        <div className="space-y-3">
          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            Showing {filteredBatches.length} of {mailingBatches.length} sends
          </p>
          
          {/* List of batch cards */}
          {filteredBatches.map((batch) => {
            const sender = users[batch.userId];
            const cardCount = batch.selectedClientIds?.length || 0;
            const campaignStats = getCampaignStats(batch);
            
            return (
              <Card
                key={batch.id}
                className="cursor-pointer hover:shadow-md transition-shadow border border-subtle"
                onClick={() => handleRowClick(batch.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Left: Batch Info */}
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                        {getStatusIcon(batch.status)}
                      </div>
                      
                      {/* Details */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">
                            Batch #{batch.id?.slice(-8).toUpperCase()}
                          </h4>
                          <Pill variant={getStatusPillVariant(batch.status)} size="sm">
                            {formatStatus(batch.status)}
                          </Pill>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {/* Sender */}
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {sender?.full_name || sender?.email || 'Unknown Sender'}
                          </span>
                          
                          {/* Card Count */}
                          <span className="flex items-center gap-1">
                            <Send className="w-3.5 h-3.5" />
                            {cardCount} {cardCount === 1 ? 'card' : 'cards'}
                          </span>
                          
                          {/* Campaign Stats */}
                          {campaignStats && (
                            <span className="flex items-center gap-1">
                              <Package className="w-3.5 h-3.5" />
                              {campaignStats.total} {campaignStats.total === 1 ? 'campaign' : 'campaigns'}
                              {campaignStats.failed > 0 && (
                                <span className="text-red-600">({campaignStats.failed} failed)</span>
                              )}
                            </span>
                          )}
                          
                          {/* Sent/Created Date */}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {batch.processedAt 
                              ? format(new Date(batch.processedAt), 'MMM d, yyyy h:mm a')
                              : batch.created_date 
                                ? format(new Date(batch.created_date), 'MMM d, yyyy h:mm a')
                                : 'Unknown date'}
                          </span>
                        </div>
                        
                        {/* Credits Used */}
                        {batch.totalCreditsUsed > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {batch.totalCreditsUsed} credits used
                          </p>
                        )}
                        
                        {/* Processing Errors Summary */}
                        {batch.processingErrors && batch.processingErrors.length > 0 && (
                          <p className="text-sm text-red-600 mt-1">
                            {batch.processingErrors.length} error{batch.processingErrors.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Right: Arrow */}
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
