import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

// Icons
import {
  Plus,
  Cake,
  Gift,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Eye,
  MoreVertical,
  ShieldCheck,
  Users,
  Calendar,
  Send,
  Megaphone,
  AlertCircle
} from 'lucide-react';

// Campaign type configuration
const CAMPAIGN_TYPE_CONFIG = {
  birthday: { label: 'Birthday', icon: Cake, color: 'bg-pink-100 text-pink-700' },
  welcome: { label: 'Welcome', icon: Gift, color: 'bg-blue-100 text-blue-700' },
  renewal: { label: 'Renewal', icon: RefreshCw, color: 'bg-green-100 text-green-700' }
};

// Campaign status configuration
const CAMPAIGN_STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-700' },
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' }
};

export default function Campaigns() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);

  // Fetch campaigns data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await base44.functions.invoke('listCampaigns', {});
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to load campaigns');
      }
      return response.data.campaigns;
    }
  });

  // Update campaign mutation (for pause/resume)
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ campaignId, updates }) => {
      const response = await base44.functions.invoke('updateCampaign', { campaignId, updates });
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update campaign');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign updated successfully' });
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId) => {
      const response = await base44.functions.invoke('deleteCampaign', { campaignId });
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete campaign');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign deleted successfully' });
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  // Handle pause/resume toggle
  const handleToggleStatus = (campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    updateCampaignMutation.mutate({ campaignId: campaign.id, updates: { status: newStatus } });
  };

  // Handle delete confirmation
  const handleDeleteClick = (campaign) => {
    setCampaignToDelete(campaign);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (campaignToDelete) {
      deleteCampaignMutation.mutate(campaignToDelete.id);
    }
  };

  // Calculate stats
  const campaigns = data || [];
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalEnrolled = campaigns.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
  const totalUpcoming = campaigns.reduce((sum, c) => sum + (c.upcomingCount || 0), 0);

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Automate card sending for birthdays, welcomes, and renewals
          </p>
        </div>
        <Link to={createPageUrl('CampaignSetupWizard')}>
          <Button className="mt-4 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-12" /> : totalCampaigns}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-12" /> : activeCampaigns}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Enrolled Clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-12" /> : totalEnrolled}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming (7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-12" /> : totalUpcoming}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load campaigns</h3>
              <p className="text-muted-foreground mb-4">{error?.message || 'An unexpected error occurred'}</p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && campaigns.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center py-12">
              <div className="bg-muted rounded-full p-4 mb-4">
                <Megaphone className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Create your first automated campaign to send cards for birthdays, 
                welcome sequences, or policy renewals.
              </p>
              <Link to={createPageUrl('CampaignSetupWizard')}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Campaign
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      {!isLoading && !isError && campaigns.length > 0 && (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const typeConfig = CAMPAIGN_TYPE_CONFIG[campaign.type] || CAMPAIGN_TYPE_CONFIG.birthday;
            const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status] || CAMPAIGN_STATUS_CONFIG.draft;
            const TypeIcon = typeConfig.icon;

            return (
              <Card 
                key={campaign.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(createPageUrl(`CampaignDetail?id=${campaign.id}`))}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Campaign Icon & Name */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`p-3 rounded-lg ${typeConfig.color}`}>
                        <TypeIcon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg truncate">{campaign.name}</h3>
                          {campaign.requiresApproval && (
                            <ShieldCheck className="h-4 w-4 text-blue-600" title="Requires approval" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className={typeConfig.color}>
                            {typeConfig.label}
                          </Badge>
                          <Badge variant="secondary" className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {campaign.enrollmentMode === 'opt_out' ? 'Auto-enroll' : 'Opt-in'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{campaign.enrolledCount} enrolled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-muted-foreground" />
                        <span>{campaign.upcomingCount} upcoming</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Next: {formatDate(campaign.nextSendDate)}</span>
                      </div>
                    </div>

                    {/* Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(createPageUrl(`CampaignDetail?id=${campaign.id}`));
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(campaign);
                        }}>
                          {campaign.status === 'active' ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause Campaign
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Activate Campaign
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(campaign);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Campaign
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{campaignToDelete?.name}"? This action cannot be undone.
              All scheduled sends for this campaign will also be cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}