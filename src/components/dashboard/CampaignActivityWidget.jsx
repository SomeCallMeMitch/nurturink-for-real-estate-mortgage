import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

/**
 * CampaignActivityWidget Component
 * 
 * Shows summary of recent campaign send activity.
 * 
 * Props:
 * - orgId: Organization ID to fetch data for
 */
export default function CampaignActivityWidget({ orgId }) {
  const navigate = useNavigate();

  // Fetch campaign activity stats
  const { data, isLoading } = useQuery({
    queryKey: ['campaignActivity', orgId],
    queryFn: async () => {
      // Get recent scheduled sends (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const dateFrom = format(sevenDaysAgo, 'yyyy-MM-dd');

      const response = await base44.functions.invoke('getScheduledSendsForOrg', {
        orgId,
        dateFrom,
        limit: 100
      });

      const sends = response.data?.sends || [];

      // Calculate stats
      const stats = {
        total: sends.length,
        sent: sends.filter(s => s.status === 'sent').length,
        pending: sends.filter(s => ['pending', 'awaiting_approval', 'processing'].includes(s.status)).length,
        failed: sends.filter(s => ['failed', 'insufficient_credits', 'cancelled'].includes(s.status)).length,
        recentSends: sends.slice(0, 5)
      };

      return stats;
    },
    enabled: !!orgId,
    refetchInterval: 120000 // Refresh every 2 minutes
  });

  const stats = data || { total: 0, sent: 0, pending: 0, failed: 0, recentSends: [] };

  // Status badge helper
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'bg-pill-color1-bg text-pill-color1-fg' },
      awaiting_approval: { label: 'Awaiting', className: 'bg-pill-warning-bg text-pill-warning-fg' },
      processing: { label: 'Processing', className: 'bg-pill-color2-bg text-pill-color2-fg' },
      sent: { label: 'Sent', className: 'bg-pill-success-bg text-pill-success-fg' },
      failed: { label: 'Failed', className: 'bg-pill-danger-bg text-pill-danger-fg' },
      cancelled: { label: 'Cancelled', className: 'bg-pill-muted-bg text-pill-muted-fg' },
      insufficient_credits: { label: 'No Credits', className: 'bg-pill-danger-bg text-pill-danger-fg' }
    };
    const config = statusConfig[status] || { label: status, className: 'bg-pill-muted-bg text-pill-muted-fg' };
    return <Badge className={`text-xs ${config.className}`}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Campaign Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Campaign Activity
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(createPageUrl('Campaigns'))}
          >
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Last 7 days</p>
      </CardHeader>
      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.sent}</div>
            <div className="text-xs text-muted-foreground">Sent</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.failed}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
        </div>

        {/* Recent Activity List */}
        {stats.recentSends.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Recent Sends
            </p>
            {stats.recentSends.map((send) => (
              <div 
                key={send.id}
                className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {send.client?.fullName || 'Unknown Client'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {send.campaign?.name || 'Unknown Campaign'}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(send.scheduledDate), 'MMM d')}
                  </span>
                  {getStatusBadge(send.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No campaign activity yet</p>
            <Button 
              variant="link" 
              size="sm"
              onClick={() => navigate(createPageUrl('Campaigns'))}
              className="mt-2"
            >
              Create a campaign
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}