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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Calendar,
  Users,
  ChevronRight,
  Package,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Mail,
  Eye,
  Send
} from 'lucide-react';
import { format } from 'date-fns';

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

function getStatusIcon(status) {
  switch (status) {
    case 'completed':
    case 'delivered':
    case 'sent':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'pending_review':
      return <Eye className="w-4 h-4 text-amber-600" />;
    case 'sending':
    case 'processing':
    case 'printing':
      return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
    case 'failed':
    case 'cancelled':
      return <XCircle className="w-4 h-4 text-red-600" />;
    case 'partial':
      return <AlertCircle className="w-4 h-4 text-amber-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
}

/**
 * AdminSends Page
 * 
 * Lists all MailingBatch records with:
 * - Prominent display of pending_review batches needing approval
 * - Filter by status
 * - Search functionality
 * - Click to view details
 */
export default function AdminSends() {
  const navigate = useNavigate();
  
  // Data state
  const [batches, setBatches] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      // Determine which batches to load based on role
      let batchList = [];
      
      if (user.appRole === 'super_admin') {
        // Super admin sees all batches
        batchList = await base44.entities.MailingBatch.filter({});
      } else if (user.organizationId) {
        // Org admin sees batches from their org
        batchList = await base44.entities.MailingBatch.filter({
          organizationId: user.organizationId
        });
      } else {
        // Regular user sees only their own batches
        batchList = await base44.entities.MailingBatch.filter({
          userId: user.id
        });
      }
      
      // Filter to only show processed batches (have been submitted at least once)
      // Include: pending_review, sending, completed, partial, failed, cancelled
      // Exclude: draft (not yet submitted)
      const processedBatches = batchList.filter(b => 
        b.status !== 'draft' && 
        (b.processedAt || b.scribeCampaigns?.length > 0 || b.status === 'pending_review')
      );
      
      // Sort: pending_review first, then by date descending
      processedBatches.sort((a, b) => {
        // pending_review always first
        if (a.status === 'pending_review' && b.status !== 'pending_review') return -1;
        if (b.status === 'pending_review' && a.status !== 'pending_review') return 1;
        
        // Then by date descending
        const dateA = new Date(a.processedAt || a.created_at);
        const dateB = new Date(b.processedAt || b.created_at);
        return dateB - dateA;
      });
      
      setBatches(processedBatches);
      
      // Load user info for sender names
      const userIds = [...new Set(processedBatches.map(b => b.userId).filter(Boolean))];
      if (userIds.length > 0) {
        try {
          const userList = await base44.entities.User.filter({ id: { $in: userIds } });
          const userMap = {};
          userList.forEach(u => { userMap[u.id] = u; });
          setUsers(userMap);
        } catch (e) {
          console.warn('Could not fetch users:', e);
        }
      }
      
    } catch (error) {
      console.error('Failed to load sends:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter batches
  const filteredBatches = useMemo(() => {
    let result = batches;
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(b => b.status === statusFilter);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => {
        const sender = users[b.userId];
        const senderName = sender?.full_name?.toLowerCase() || '';
        const senderEmail = sender?.email?.toLowerCase() || '';
        const batchId = b.id?.toLowerCase() || '';
        return senderName.includes(query) || senderEmail.includes(query) || batchId.includes(query);
      });
    }
    
    return result;
  }, [batches, statusFilter, searchQuery, users]);

  // Count pending review
  const pendingReviewCount = batches.filter(b => b.status === 'pending_review').length;

  // Handle row click
  const handleBatchClick = (batchId) => {
    navigate(createPageUrl(`AdminSendDetails?id=${batchId}`));
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sent Cards</h1>
          <p className="text-muted-foreground">
            View and manage mailing batches
          </p>
        </div>
        <Button variant="outline" onClick={loadData} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Pending Review Alert */}
      {pendingReviewCount > 0 && (
        <Card className="border-2 border-amber-400 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Eye className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800">
                    {pendingReviewCount} Batch{pendingReviewCount > 1 ? 'es' : ''} Awaiting Review
                  </h3>
                  <p className="text-sm text-amber-700">
                    These batches need approval before sending to Scribe.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setStatusFilter('pending_review')}
                className="bg-amber-500 hover:bg-amber-600"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Pending
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        {/* Search */}
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
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_review">
              <span className="flex items-center gap-2">
                <Eye className="w-3 h-3 text-amber-600" />
                Pending Review
              </span>
            </SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Clear filters */}
        {(searchQuery || statusFilter !== 'all') && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Batches List */}
      {filteredBatches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {batches.length === 0 ? 'No sends yet' : 'No matching batches'}
            </h3>
            <p className="text-muted-foreground">
              {batches.length === 0 
                ? 'Sent card batches will appear here.'
                : 'Try adjusting your search or filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredBatches.map((batch) => {
            const sender = users[batch.userId];
            const cardCount = batch.selectedClientIds?.length || 0;
            const campaignCount = batch.scribeCampaigns?.length || 0;
            const isPendingReview = batch.status === 'pending_review';
            
            return (
              <Card 
                key={batch.id}
                className={`cursor-pointer transition-shadow hover:shadow-md ${
                  isPendingReview ? 'border-2 border-amber-400 bg-amber-50/50' : 'border border-subtle'
                }`}
                onClick={() => handleBatchClick(batch.id)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Status Icon */}
                      <div className={`p-2 rounded-full ${
                        isPendingReview ? 'bg-amber-100' : 'bg-surface-1'
                      }`}>
                        {getStatusIcon(batch.status)}
                      </div>
                      
                      {/* Batch Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {sender?.full_name || sender?.email || 'Unknown Sender'}
                          </h3>
                          <Pill variant={getStatusPillVariant(batch.status)} size="sm">
                            {formatStatus(batch.status)}
                          </Pill>
                          {isPendingReview && (
                            <span className="text-xs font-medium text-amber-700 bg-amber-200 px-2 py-0.5 rounded">
                              NEEDS APPROVAL
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {cardCount} card{cardCount !== 1 ? 's' : ''}
                          </span>
                          
                          {campaignCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Package className="w-3.5 h-3.5" />
                              {campaignCount} campaign{campaignCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {batch.processedAt 
                              ? format(new Date(batch.processedAt), 'MMM d, yyyy h:mm a')
                              : batch.created_at
                                ? format(new Date(batch.created_at), 'MMM d, yyyy h:mm a')
                                : 'Unknown'}
                          </span>
                          
                          {batch.totalCreditsUsed > 0 && (
                            <span className="text-xs">
                              {batch.totalCreditsUsed} credits
                            </span>
                          )}
                        </div>
                        
                        {/* Show errors summary if any */}
                        {batch.processingErrors?.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            {batch.processingErrors.length} error{batch.processingErrors.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action hint */}
                    <div className="flex items-center gap-2">
                      {isPendingReview && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Send className="w-3 h-3 mr-1" />
                          Review
                        </Button>
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
      
      {/* Summary Footer */}
      {filteredBatches.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredBatches.length} of {batches.length} batch{batches.length !== 1 ? 'es' : ''}
        </div>
      )}
    </div>
  );
}