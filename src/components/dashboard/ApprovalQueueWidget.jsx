import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ChevronRight, Loader2 } from 'lucide-react';

/**
 * ApprovalQueueWidget Component
 * 
 * Displays count of sends awaiting approval with link to full queue.
 * 
 * Props:
 * - orgId: Organization ID to fetch data for
 */
export default function ApprovalQueueWidget({ orgId }) {
  const navigate = useNavigate();

  // Fetch count of awaiting_approval sends
  const { data, isLoading } = useQuery({
    queryKey: ['approvalQueueCount', orgId],
    queryFn: async () => {
      const response = await base44.functions.invoke('getScheduledSendsForOrg', {
        orgId,
        status: ['awaiting_approval'],
        limit: 1 // We only need the count
      });
      return response.data;
    },
    enabled: !!orgId,
    refetchInterval: 60000 // Refresh every minute
  });

  const pendingCount = data?.count || 0;

  const handleClick = () => {
    navigate(createPageUrl('ApprovalQueue'));
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${pendingCount > 0 ? 'border-warning/50 bg-warning/5' : ''}`}
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
        <Clock className={`h-5 w-5 ${pendingCount > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Loading...</span>
          </div>
        ) : (
          <>
            <div className={`text-3xl font-bold ${pendingCount > 0 ? 'text-warning' : 'text-foreground'}`}>
              {pendingCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingCount === 1 ? 'Card awaiting review' : 'Cards awaiting review'}
            </p>
            {pendingCount > 0 && (
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto mt-2 text-warning"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                Review now <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}