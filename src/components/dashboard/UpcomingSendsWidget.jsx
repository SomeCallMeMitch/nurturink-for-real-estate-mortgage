import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarClock, ChevronRight, Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';

/**
 * UpcomingSendsWidget Component
 * 
 * Shows upcoming scheduled sends for the next 7 days.
 * 
 * Props:
 * - orgId: Organization ID to fetch data for
 */
export default function UpcomingSendsWidget({ orgId }) {
  const navigate = useNavigate();

  // Fetch upcoming scheduled sends
  const { data, isLoading } = useQuery({
    queryKey: ['upcomingSends', orgId],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd');

      const response = await base44.functions.invoke('getScheduledSendsForOrg', {
        orgId,
        status: ['pending', 'awaiting_approval'],
        dateFrom: today,
        dateTo: nextWeek,
        limit: 50
      });

      const sends = response.data?.sends || [];

      // Group by date
      const groupedByDate = sends.reduce((acc, send) => {
        const date = send.scheduledDate;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(send);
        return acc;
      }, {});

      return {
        total: sends.length,
        groupedByDate,
        dates: Object.keys(groupedByDate).sort()
      };
    },
    enabled: !!orgId,
    refetchInterval: 120000 // Refresh every 2 minutes
  });

  const upcoming = data || { total: 0, groupedByDate: {}, dates: [] };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5" />
            Upcoming Sends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
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
            <CalendarClock className="w-5 h-5 text-primary" />
            Upcoming Sends
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(createPageUrl('ApprovalQueue'))}
          >
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Next 7 days</p>
      </CardHeader>
      <CardContent>
        {upcoming.dates.length > 0 ? (
          <div className="space-y-3">
            {upcoming.dates.slice(0, 5).map((date) => {
              const sendsOnDate = upcoming.groupedByDate[date] || [];
              const formattedDate = format(new Date(date), 'EEE, MMM d');
              const isToday = date === format(new Date(), 'yyyy-MM-dd');

              return (
                <div 
                  key={date}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg ${isToday ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                        {isToday ? 'Today' : formattedDate}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sendsOnDate.length} {sendsOnDate.length === 1 ? 'card' : 'cards'} scheduled
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {sendsOnDate.length}
                  </div>
                </div>
              );
            })}
            
            {/* Total Summary */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total upcoming</span>
                <span className="text-lg font-bold text-foreground">{upcoming.total} cards</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <CalendarClock className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No upcoming sends scheduled</p>
            <p className="text-xs text-muted-foreground mt-1">
              Cards will appear here when campaigns are active
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}