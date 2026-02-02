import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarClock,
  Plus,
  Loader2,
  Play,
  Pause,
  Pencil,
  Trash2,
  Users,
  Calendar,
  Gift,
  RefreshCw,
  ChevronRight
} from "lucide-react";
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

export default function Campaigns() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Get user profile to get orgId
      const userProfiles = await base44.entities.UserProfile.filter({ userId: currentUser.id });
      if (userProfiles && userProfiles.length > 0) {
        setUserProfile(userProfiles[0]);
        
        // Load campaigns for this organization
        const orgCampaigns = await base44.entities.Campaign.filter({ 
          orgId: userProfiles[0].orgId 
        });
        setCampaigns(orgCampaigns);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
      toast({
        title: 'Error',
        description: 'Failed to load campaigns',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (campaign) => {
    try {
      const newStatus = campaign.status === 'active' ? 'paused' : 'active';
      
      const response = await base44.functions.invoke('updateCampaign', {
        campaignId: campaign.id,
        updates: { status: newStatus }
      });

      if (response.data.success) {
        toast({
          title: newStatus === 'active' ? 'Campaign Activated' : 'Campaign Paused',
          description: `"${campaign.name}" is now ${newStatus}`,
        });
        loadData();
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      console.error('Failed to toggle campaign status:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update campaign',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteClick = (campaign) => {
    setCampaignToDelete(campaign);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!campaignToDelete) return;

    try {
      setDeleting(true);
      const response = await base44.functions.invoke('deleteCampaign', {
        campaignId: campaignToDelete.id
      });

      if (response.data.success) {
        toast({
          title: 'Campaign Deleted',
          description: `"${campaignToDelete.name}" has been deleted`,
        });
        setDeleteDialogOpen(false);
        setCampaignToDelete(null);
        loadData();
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete campaign',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'birthday':
        return <Gift className="w-5 h-5 text-pink-500" />;
      case 'welcome':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'renewal':
        return <RefreshCw className="w-5 h-5 text-blue-500" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Paused</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canManageCampaigns = userProfile?.orgRole === 'owner' || userProfile?.orgRole === 'manager';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CalendarClock className="w-8 h-8 text-primary" />
              Campaigns
            </h1>
            <p className="text-gray-600 mt-1">
              Automate card sending for birthdays, welcomes, and renewals
            </p>
          </div>
          {canManageCampaigns && (
            <Button 
              onClick={() => navigate(createPageUrl('CampaignEdit') + '?id=new')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </Button>
          )}
        </div>

        {/* Campaigns List */}
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Campaigns Yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Create automated campaigns to send cards on birthdays, policy start dates, or renewal dates.
              </p>
              {canManageCampaigns && (
                <Button 
                  onClick={() => navigate(createPageUrl('CampaignEdit') + '?id=new')}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Campaign
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {getTypeIcon(campaign.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                          {getStatusBadge(campaign.status)}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {campaign.type === 'birthday' && 'Sends cards on client birthdays'}
                          {campaign.type === 'welcome' && 'Sends cards on policy start dates'}
                          {campaign.type === 'renewal' && 'Sends cards before renewal dates'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="capitalize">
                            {campaign.enrollmentMode === 'opt_out' ? 'Auto-enroll all clients' : 'Manual enrollment'}
                          </span>
                          {campaign.requiresApproval && (
                            <span className="text-amber-600">Requires approval</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {canManageCampaigns && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(campaign)}
                          className="gap-1"
                        >
                          {campaign.status === 'active' ? (
                            <>
                              <Pause className="w-4 h-4" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(createPageUrl('CampaignEdit') + `?id=${campaign.id}`)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(campaign)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(createPageUrl('CampaignDetails') + `?id=${campaign.id}`)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{campaignToDelete?.name}"? This will also delete all
                campaign steps, enrollments, and scheduled sends. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Campaign'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}