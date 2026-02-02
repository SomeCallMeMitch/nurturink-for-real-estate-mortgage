import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill } from '@/components/ui/Pill';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import {
  Plus,
  Search,
  MoreVertical,
  Play,
  Pause,
  Pencil,
  Trash2,
  Copy,
  Calendar,
  Users,
  Mail,
  RefreshCw,
  Cake,
  UserPlus,
  CalendarClock,
  Target,
} from 'lucide-react';

// Campaign type configuration
const CAMPAIGN_TYPES = {
  birthday: { label: 'Birthday', icon: Cake, color: 'color2' },
  welcome: { label: 'Welcome', icon: UserPlus, color: 'color1' },
  renewal: { label: 'Renewal', icon: CalendarClock, color: 'color3' },
};

// Campaign status configuration
const CAMPAIGN_STATUSES = {
  draft: { label: 'Draft', variant: 'muted' },
  active: { label: 'Active', variant: 'success' },
  paused: { label: 'Paused', variant: 'warning' },
};

export default function Campaigns() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data state
  const [campaigns, setCampaigns] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Get user's orgId from UserProfile
      const userProfiles = await base44.entities.UserProfile.filter({ userId: currentUser.id });
      if (!userProfiles || userProfiles.length === 0) {
        setError('User profile not found. Please complete your profile setup.');
        return;
      }
      const orgId = userProfiles[0].orgId;

      // Fetch campaigns for this organization
      const campaignList = await base44.entities.Campaign.filter({ orgId });
      setCampaigns(campaignList);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setError('Could not load campaigns. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((c) => c.type === typeFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }

    // Sort by created_date descending (newest first)
    filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    return filtered;
  }, [campaigns, statusFilter, typeFilter, searchQuery]);

  // Permission helper - can user manage campaigns?
  const canManageCampaigns = () => {
    if (!user) return false;
    const role = user.appRole || user.orgRole;
    return ['owner', 'manager', 'organization_owner', 'super_admin'].includes(role);
  };

  // Action handlers
  const handleCreateCampaign = () => {
    navigate(createPageUrl('CampaignWizard?id=new'));
  };

  const handleEditCampaign = (campaign) => {
    navigate(createPageUrl(`CampaignWizard?id=${campaign.id}`));
  };

  const handleDuplicateCampaign = (campaign) => {
    navigate(createPageUrl(`CampaignWizard?id=new&duplicate=${campaign.id}`));
  };

  const handleToggleStatus = async (campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';

    try {
      const response = await base44.functions.invoke('updateCampaign', {
        campaignId: campaign.id,
        updates: { status: newStatus },
      });

      if (response.data.success) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaign.id ? { ...c, status: newStatus } : c))
        );
        toast({
          title: `Campaign ${newStatus === 'active' ? 'Activated' : 'Paused'}`,
          description: `"${campaign.name}" is now ${newStatus}.`,
          className: 'bg-green-50 border-green-200 text-green-900',
        });
      }
    } catch (err) {
      console.error('Failed to toggle campaign status:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to update campaign status.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (campaign) => {
    setCampaignToDelete(campaign);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!campaignToDelete) return;

    setIsDeleting(true);
    try {
      const response = await base44.functions.invoke('deleteCampaign', {
        campaignId: campaignToDelete.id,
      });

      if (response.data.success) {
        setCampaigns((prev) => prev.filter((c) => c.id !== campaignToDelete.id));
        toast({
          title: 'Campaign Deleted',
          description: `"${campaignToDelete.name}" has been permanently deleted.`,
          className: 'bg-green-50 border-green-200 text-green-900',
        });
      }
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to delete campaign.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
    }
  };

  // Render campaign type with icon
  const renderCampaignType = (type) => {
    const config = CAMPAIGN_TYPES[type] || { label: type, icon: Target, color: 'muted' };
    const Icon = config.icon;
    return (
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span>{config.label}</span>
      </div>
    );
  };

  // Render campaign status pill
  const renderStatusPill = (status) => {
    const config = CAMPAIGN_STATUSES[status] || { label: status, variant: 'muted' };
    return <Pill variant={config.variant}>{config.label}</Pill>;
  };

  return (
    <div className="container mx-auto py-4 px-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Automated Campaigns</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Set up automated card sending for birthdays, welcomes, and renewals.
            </p>
          </div>
        </div>
        {canManageCampaigns() && (
          <Button onClick={handleCreateCampaign} className="gap-2">
            <Plus className="w-5 h-5" />
            New Campaign
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="birthday">Birthday</SelectItem>
                <SelectItem value="welcome">Welcome</SelectItem>
                <SelectItem value="renewal">Renewal</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={fetchData} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Campaigns</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No campaigns match your filters.'
                : 'Create your first automated campaign to start sending cards automatically.'}
            </p>
            {canManageCampaigns() &&
              !searchQuery &&
              statusFilter === 'all' &&
              typeFilter === 'all' && (
                <Button onClick={handleCreateCampaign} className="gap-2">
                  <Plus className="w-5 h-5" />
                  Create Your First Campaign
                </Button>
              )}
          </CardContent>
        </Card>
      )}

      {/* Campaigns Table */}
      {!isLoading && !error && filteredCampaigns.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow
                    key={campaign.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEditCampaign(campaign)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{campaign.name}</p>
                        {campaign.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {campaign.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{renderCampaignType(campaign.type)}</TableCell>
                    <TableCell>{renderStatusPill(campaign.status)}</TableCell>
                    <TableCell>
                      <Pill variant={campaign.enrollmentMode === 'opt_out' ? 'color1' : 'muted'} size="sm">
                        {campaign.enrollmentMode === 'opt_out' ? 'Auto-enroll' : 'Opt-in'}
                      </Pill>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(campaign.created_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCampaign(campaign);
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateCampaign(campaign);
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {campaign.status !== 'draft' && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(campaign);
                              }}
                            >
                              {campaign.status === 'active' ? (
                                <>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(campaign);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{campaignToDelete?.name}"? This will also
              delete all campaign steps, enrollments, and scheduled sends. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}