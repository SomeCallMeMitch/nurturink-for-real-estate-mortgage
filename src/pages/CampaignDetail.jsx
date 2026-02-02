import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/components/ui/use-toast";

// Icons
import { 
  ArrowLeft, 
  Cake, 
  Gift, 
  RefreshCw, 
  Users, 
  Send, 
  Calendar,
  CheckCircle,
  Play,
  Pause,
  Trash2,
  Search,
  UserPlus,
  Settings,
  Clock,
  AlertCircle,
  Loader2,
  XCircle
} from 'lucide-react';

// Components
import EnrolledClientRow from '@/components/campaigns/EnrolledClientRow';
import ManualEnrollModal from '@/components/campaigns/ManualEnrollModal';

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

export default function CampaignDetail() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get campaign ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');

  // State
  const [activeTab, setActiveTab] = useState('enrolled');
  const [enrollmentFilter, setEnrollmentFilter] = useState('enrolled');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [scheduledFilter, setScheduledFilter] = useState('pending');
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch campaign details
  const { data: campaignData, isLoading: isLoadingCampaign, isError: isCampaignError, refetch: refetchCampaign } = useQuery({
    queryKey: ['campaignDetails', campaignId],
    queryFn: async () => {
      const response = await base44.functions.invoke('getCampaignDetails', { campaignId });
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    enabled: !!campaignId
  });

  // Fetch enrolled clients
  const { data: enrolledData, isLoading: isLoadingEnrolled, refetch: refetchEnrolled } = useQuery({
    queryKey: ['enrolledClients', campaignId, enrollmentFilter, searchQuery, page],
    queryFn: async () => {
      const response = await base44.functions.invoke('getEnrolledClients', {
        campaignId,
        status: enrollmentFilter,
        search: searchQuery,
        page,
        limit: 25
      });
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    enabled: !!campaignId && activeTab === 'enrolled'
  });

  // Fetch scheduled sends
  const { data: scheduledSends = [], isLoading: isLoadingScheduled } = useQuery({
    queryKey: ['scheduledSends', campaignId, scheduledFilter],
    queryFn: async () => {
      const sends = await base44.entities.ScheduledSend.filter({ campaignId });
      return sends.filter(s => {
        if (scheduledFilter === 'all') return true;
        return s.status === scheduledFilter;
      }).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
    },
    enabled: !!campaignId && activeTab === 'scheduled'
  });

  // Update campaign mutation
  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      const response = await base44.functions.invoke('updateCampaign', { campaignId, updates });
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    onSuccess: () => {
      toast({ title: 'Campaign updated' });
      refetchCampaign();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Delete campaign mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('deleteCampaign', { campaignId });
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    onSuccess: () => {
      toast({ title: 'Campaign deleted' });
      navigate(createPageUrl('Campaigns'));
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Exclude client mutation
  const excludeMutation = useMutation({
    mutationFn: async (clientId) => {
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
      toast({ title: 'Client excluded' });
      refetchEnrolled();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Reactivate client mutation
  const reactivateMutation = useMutation({
    mutationFn: async (clientId) => {
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
      toast({ title: 'Client reactivated' });
      refetchEnrolled();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Toggle pause/resume
  const handleToggleStatus = () => {
    const newStatus = campaign?.status === 'active' ? 'paused' : 'active';
    updateMutation.mutate({ status: newStatus });
  };

  // Handle enrollment complete
  const handleEnrollComplete = () => {
    refetchEnrolled();
    refetchCampaign();
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const campaign = campaignData?.campaign;
  const stats = campaignData?.stats || {};
  const enrolledClients = enrolledData?.clients || [];
  const pagination = enrolledData?.pagination || { total: 0, totalPages: 1 };

  // Loading state
  if (isLoadingCampaign) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-32 w-full mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state
  if (isCampaignError || !campaign) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Link to={createPageUrl('Campaigns')}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </Link>
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Campaign not found</h3>
            <p className="text-muted-foreground">The campaign you're looking for doesn't exist or you don't have access.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeConfig = CAMPAIGN_TYPE_CONFIG[campaign.type] || CAMPAIGN_TYPE_CONFIG.birthday;
  const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status] || CAMPAIGN_STATUS_CONFIG.draft;
  const TypeIcon = typeConfig.icon;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Back Button */}
      <Link to={createPageUrl('Campaigns')}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${typeConfig.color}`}>
            <TypeIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{campaign.name}</h1>
            <div className="flex items-center gap-2 mt-2">
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

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            disabled={updateMutation.isPending}
          >
            {campaign.status === 'active' ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Enrolled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.totalEnrolled || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cards Sent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{stats.totalSent || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming (30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold">{stats.upcomingCount || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Success Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">
                {stats.totalSent > 0 
                  ? `${Math.round((stats.totalSent / (stats.totalSent + (stats.totalFailed || 0))) * 100)}%`
                  : '-'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="enrolled" className="gap-2">
            <Users className="h-4 w-4" />
            Enrolled Clients
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <Clock className="h-4 w-4" />
            Scheduled Sends
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Enrolled Clients Tab */}
        <TabsContent value="enrolled">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Enrolled Clients</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search clients..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      className="pl-9"
                    />
                  </div>
                  <Select value={enrollmentFilter} onValueChange={(v) => { setEnrollmentFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enrolled">Active</SelectItem>
                      <SelectItem value="excluded">Excluded</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setEnrollModalOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Clients
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingEnrolled ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : enrolledClients.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No clients found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'No clients match your search.' : 'No clients are enrolled in this campaign yet.'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setEnrollModalOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Clients
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="divide-y divide-border">
                    {enrolledClients.map(enrollment => (
                      <EnrolledClientRow
                        key={enrollment.enrollmentId}
                        enrollment={enrollment}
                        campaignType={campaign.type}
                        onExclude={(clientId) => excludeMutation.mutate(clientId)}
                        onReactivate={(clientId) => reactivateMutation.mutate(clientId)}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages} ({pagination.total} clients)
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
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Sends Tab */}
        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Scheduled Sends</CardTitle>
                <Select value={scheduledFilter} onValueChange={setScheduledFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Upcoming</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="skipped">Cancelled</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingScheduled ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : scheduledSends.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No scheduled sends</h3>
                  <p className="text-muted-foreground">
                    {scheduledFilter === 'pending' 
                      ? 'No upcoming sends scheduled.' 
                      : 'No sends match this filter.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {scheduledSends.map(send => (
                    <div 
                      key={send.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">Client #{send.clientId.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground">
                          Scheduled: {formatDate(send.scheduledDate)}
                        </p>
                      </div>
                      <Badge variant="secondary" className={
                        send.status === 'sent' ? 'bg-green-100 text-green-700' :
                        send.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                        send.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {send.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Settings</CardTitle>
              <CardDescription>View and manage campaign configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Campaign Name</label>
                  <p className="text-foreground font-medium">{campaign.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Campaign Type</label>
                  <p className="text-foreground font-medium capitalize">{campaign.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Enrollment Mode</label>
                  <p className="text-foreground font-medium">
                    {campaign.enrollmentMode === 'opt_out' ? 'Auto-enroll (Opt-out)' : 'Manual (Opt-in)'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Requires Approval</label>
                  <p className="text-foreground font-medium">{campaign.requiresApproval ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Return Address</label>
                  <p className="text-foreground font-medium capitalize">{campaign.returnAddressMode || 'Company'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-foreground font-medium">{formatDate(campaign.created_date)}</p>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h4 className="text-sm font-medium text-destructive mb-2">Danger Zone</h4>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manual Enroll Modal */}
      <ManualEnrollModal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        campaignId={campaignId}
        campaignType={campaign.type}
        onEnrollComplete={handleEnrollComplete}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{campaign.name}"? This action cannot be undone.
              All scheduled sends will be cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}