import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pill, getStatusVariant } from '@/components/ui/Pill';
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
  Loader2,
  Package,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

/**
 * AdminSends Page - Phase 1
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
      const batches = await base44.entities.MailingBatch.list('-created_date', 100);
      setMailingBatches(batches);
      
      // Get unique user IDs to fetch user details
      const userIds = [...new Set(batches.map(b => b.userId).filter(Boolean))];
      
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

  // Get status pill variant
  const getStatusPillVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'sending': return 'color1';
      case 'ready_to_send': return 'warning';
      case 'draft': return 'muted';
      default: return 'muted';
    }
  };

  // Get Scribe status pill variant
  const getScribeStatusPillVariant = (scribeStatus) => {
    switch (scribeStatus) {
      case 'delivered': return 'success';
      case 'shipped': return 'success';
      case 'printed': return 'color1';
      case 'printing': return 'color1';
      case 'processing': return 'warning';
      case 'pending': return 'warning';
      case 'queued': return 'warning';
      case 'cancelled': return 'danger';
      case 'delete': return 'danger';
      case 'paused': return 'muted';
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
            View and track all outgoing mail batches.
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="ready_to_send">Ready to Send</SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive">{error}</p>
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
              : 'No mailing batches have been created yet.'}
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
                        <Package className="w-6 h-6 text-secondary-foreground" />
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
                          {batch.scribeStatus && batch.scribeStatus !== 'draft' && (
                            <Pill variant={getScribeStatusPillVariant(batch.scribeStatus)} size="sm">
                              Scribe: {formatStatus(batch.scribeStatus)}
                            </Pill>
                          )}
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
                          
                          {/* Created Date */}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {batch.created_date 
                              ? format(new Date(batch.created_date), 'MMM d, yyyy h:mm a')
                              : 'Unknown date'}
                          </span>
                        </div>
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