import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

// Icons
import { 
  Megaphone, 
  Cake, 
  Gift, 
  RefreshCw, 
  UserPlus, 
  UserX, 
  UserCheck,
  ExternalLink,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Campaign type icons
const CAMPAIGN_TYPE_ICONS = {
  birthday: Cake,
  welcome: Gift,
  renewal: RefreshCw
};

// Campaign type colors
const CAMPAIGN_TYPE_COLORS = {
  birthday: 'bg-pink-100 text-pink-700',
  welcome: 'bg-blue-100 text-blue-700',
  renewal: 'bg-green-100 text-green-700'
};

/**
 * ClientCampaignsList Component
 * Shows campaigns a client is enrolled in and available campaigns
 * 
 * @param {string} clientId - Client ID
 * @param {string} clientBirthday - Client's birthday
 * @param {string} clientPolicyStartDate - Client's policy start date
 * @param {string} clientRenewalDate - Client's renewal date
 */
export default function ClientCampaignsList({ 
  clientId,
  clientBirthday,
  clientPolicyStartDate,
  clientRenewalDate
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch client campaigns
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['clientCampaigns', clientId],
    queryFn: async () => {
      const response = await base44.functions.invoke('getClientCampaigns', { clientId });
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    enabled: !!clientId
  });

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: async (campaignId) => {
      const response = await base44.functions.invoke('enrollClientInCampaign', {
        campaignId,
        clientId
      });
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    onSuccess: () => {
      toast({ title: 'Client enrolled in campaign' });
      queryClient.invalidateQueries({ queryKey: ['clientCampaigns', clientId] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Exclude mutation
  const excludeMutation = useMutation({
    mutationFn: async (campaignId) => {
      const response = await base44.functions.invoke('excludeClientFromCampaign', {
        campaignId,
        clientId
      });
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    onSuccess: () => {
      toast({ title: 'Client excluded from campaign' });
      queryClient.invalidateQueries({ queryKey: ['clientCampaigns', clientId] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Reactivate mutation (same as enroll)
  const reactivateMutation = useMutation({
    mutationFn: async (campaignId) => {
      const response = await base44.functions.invoke('enrollClientInCampaign', {
        campaignId,
        clientId
      });
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    onSuccess: () => {
      toast({ title: 'Client reactivated in campaign' });
      queryClient.invalidateQueries({ queryKey: ['clientCampaigns', clientId] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const enrolled = data?.enrolled || [];
  const available = data?.available || [];

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Campaign Enrollments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Campaign Enrollments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-muted-foreground">Failed to load campaigns</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Campaign Enrollments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enrolled Campaigns */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Enrolled Campaigns</h4>
          {enrolled.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Not enrolled in any campaigns</p>
          ) : (
            <div className="space-y-2">
              {enrolled.map(campaign => {
                const TypeIcon = CAMPAIGN_TYPE_ICONS[campaign.campaignType] || Megaphone;
                const isExcluded = campaign.status === 'excluded';
                const isPending = excludeMutation.isPending || reactivateMutation.isPending;

                return (
                  <div 
                    key={campaign.enrollmentId}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${isExcluded ? 'bg-muted/50 opacity-70' : 'bg-card'}`}
                  >
                    <div className={`p-2 rounded-lg ${CAMPAIGN_TYPE_COLORS[campaign.campaignType] || 'bg-gray-100'}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={createPageUrl(`CampaignDetail?id=${campaign.campaignId}`)}
                          className="font-medium hover:underline truncate"
                        >
                          {campaign.campaignName}
                        </Link>
                        <Badge 
                          variant="secondary"
                          className={isExcluded ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                        >
                          {isExcluded ? 'Excluded' : 'Active'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enrolled {formatDate(campaign.enrolledAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        asChild
                      >
                        <Link to={createPageUrl(`CampaignDetail?id=${campaign.campaignId}`)}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      {isExcluded ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => reactivateMutation.mutate(campaign.campaignId)}
                          disabled={isPending}
                        >
                          {reactivateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => excludeMutation.mutate(campaign.campaignId)}
                          disabled={isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          {excludeMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserX className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Campaigns */}
        {available.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Available Campaigns</h4>
            <div className="space-y-2">
              {available.map(campaign => {
                const TypeIcon = CAMPAIGN_TYPE_ICONS[campaign.campaignType] || Megaphone;
                const canEnroll = campaign.hasRequiredField;

                return (
                  <div 
                    key={campaign.campaignId}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className={`p-2 rounded-lg ${CAMPAIGN_TYPE_COLORS[campaign.campaignType] || 'bg-gray-100'}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={createPageUrl(`CampaignDetail?id=${campaign.campaignId}`)}
                        className="font-medium hover:underline truncate block"
                      >
                        {campaign.campaignName}
                      </Link>
                      {!canEnroll && (
                        <p className="text-sm text-amber-600">
                          Missing {campaign.requiredField.replace('_', ' ')}
                        </p>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => enrollMutation.mutate(campaign.campaignId)}
                      disabled={!canEnroll || enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-1" />
                      )}
                      Enroll
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {enrolled.length === 0 && available.length === 0 && (
          <div className="text-center py-6">
            <Megaphone className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No campaigns available</p>
            <Button variant="outline" size="sm" asChild className="mt-2">
              <Link to={createPageUrl('Campaigns')}>View All Campaigns</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}