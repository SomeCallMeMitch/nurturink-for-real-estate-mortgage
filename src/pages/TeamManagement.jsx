import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getInvitableRoles, getOrgRoleDisplayName, ORG_ROLES } from '@/components/utils/roleHelpers';

// Inlined to avoid build cache issues
function getDefaultInviteRole(user, invitableRoles) {
  // Return the last available role (most restricted option - Member if available)
  return invitableRoles.length > 0 ? invitableRoles[invitableRoles.length - 1].value : ORG_ROLES.MEMBER;
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Users,
  UserCheck,
  Shield,
  Send,
  Search,
  Filter,
  Plus,
  Eye,
  Mail,
  UserX,
  UserCog,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import TeamMemberDetailsModal from '@/components/team/TeamMemberDetailsModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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

export default function TeamManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState(null);
  const [currentUserOrgProfile, setCurrentUserOrgProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState(''); // Will be set dynamically when modal opens
  const [inviting, setInviting] = useState(false);
  
  const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [changingRole, setChangingRole] = useState(false);
  
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  
  // Team member details modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedMemberForDetails, setSelectedMemberForDetails] = useState(null);

  const handleModalUpdate = async (updatedUser) => {
    if (updatedUser) {
      setMembers(prevMembers => prevMembers.map(m => 
        m.userId === updatedUser.id ? {
          ...m,
          credits: (updatedUser.companyAllocatedCredits || 0) + (updatedUser.personalPurchasedCredits || 0),
          companyAllocatedCredits: updatedUser.companyAllocatedCredits || 0,
          personalPurchasedCredits: updatedUser.personalPurchasedCredits || 0,
          canAccessCompanyPool: updatedUser.canAccessCompanyPool
        } : m
      ));
      if (selectedMemberForDetails && selectedMemberForDetails.userId === updatedUser.id) {
        setSelectedMemberForDetails(prev => ({ 
          ...prev,
          credits: (updatedUser.companyAllocatedCredits || 0) + (updatedUser.personalPurchasedCredits || 0),
          companyAllocatedCredits: updatedUser.companyAllocatedCredits || 0,
          personalPurchasedCredits: updatedUser.personalPurchasedCredits || 0,
          canAccessCompanyPool: updatedUser.canAccessCompanyPool
        }));
      }
    }
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      console.log('TeamManagement: Invoking getOrganizationTeamData...');
      const response = await base44.functions.invoke('getOrganizationTeamData');
      console.log('TeamManagement: Response received:', response);
      
      if (!response.data) {
        throw new Error('Invalid response from getOrganizationTeamData - no data property');
      }
      
      // Get current user's orgProfile from response
      const currentUserData = response.data.currentUser;
      setCurrentUserOrgProfile(currentUserData?.orgProfile || null);
      
      // Check permissions using orgRole from response
      const userOrgRole = currentUserData?.orgProfile?.orgRole;
      const isOrgOwner = userOrgRole === ORG_ROLES.OWNER || currentUser.appRole === 'organization_owner' || currentUser.isOrgOwner === true;
      const isOrgManager = userOrgRole === ORG_ROLES.MANAGER || currentUser.appRole === 'organization_manager';
      const isSuperAdmin = currentUser.appRole === 'super_admin';
      
      if (!isOrgOwner && !isOrgManager && !isSuperAdmin) {
        setError('Access denied. Only organization owners and managers can manage team members.');
        setLoading(false);
        return;
      }
      
      if (!currentUser.orgId) {
        setError('You must belong to an organization to manage team members.');
        setLoading(false);
        return;
      }
      
      setMembers(response.data.members || []);
      setSummaryStats(response.data.summaryStats || {
        totalMembers: 0,
        activeMembers: 0,
        admins: 0,
        cardsSent: 0
      });
      console.log('TeamManagement: Data loaded successfully');
      
    } catch (err) {
      console.error('Failed to load team data:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        fullError: err
      });
      setError(err.response?.data?.error || err.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(member =>
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    return date.toLocaleDateString();
  };

  const getRoleBadge = (member) => {
    // Use orgProfile.orgRole if available, fall back to legacy isOrgOwner
    const orgRole = member.orgProfile?.orgRole;
    
    if (orgRole === ORG_ROLES.OWNER || member.isOrgOwner) {
      return <Badge className="bg-purple-100 text-purple-800"><Shield className="w-3 h-3 mr-1" />Owner</Badge>;
    }
    if (orgRole === ORG_ROLES.MANAGER) {
      return <Badge className="bg-blue-100 text-blue-800"><UserCog className="w-3 h-3 mr-1" />Manager</Badge>;
    }
    return <Badge className="bg-amber-100 text-amber-800"><Users className="w-3 h-3 mr-1" />Member</Badge>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Pending': 'bg-yellow-100 text-yellow-800'
    };
    
    const icons = {
      'Active': <UserCheck className="w-3 h-3 mr-1" />,
      'Inactive': null,
      'Pending': <Mail className="w-3 h-3 mr-1" />
    };
    
    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        {icons[status]}
        {status}
      </Badge>
    );
  };

  // Get invitable roles based on current user's permissions
  const invitableRoles = useMemo(() => {
    if (!user) return [];
    
    // Create a user object with orgProfile for permission check
    const userWithProfile = {
      ...user,
      userProfile: currentUserOrgProfile // Note: property name is 'userProfile' not 'orgProfile'
    };
    return getInvitableRoles(userWithProfile);
  }, [user, currentUserOrgProfile]);
  
  // Set default invite role when modal opens
  useEffect(() => {
    if (inviteModalOpen && user && invitableRoles.length > 0) {
      setInviteRole(getDefaultInviteRole(user, invitableRoles));
    }
  }, [inviteModalOpen, user, invitableRoles]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address',
        variant: 'destructive'
      });
      return;
    }

    try {
      setInviting(true);
      
      // Use inviteTeamMember (standalone version with inlined helpers)
      const response = await base44.functions.invoke('inviteTeamMember', {
        email: inviteEmail.trim(),
        orgRole: inviteRole
      });

      toast({
        title: response.data.userAdded ? 'Member Added! 🎉' : 'Invitation Sent! 📧',
        description: response.data.message,
        className: 'bg-green-50 border-green-200 text-green-900'
      });

      if (response.data.simulatedEmail) {
        console.log('📧 Invitation details:', response.data.simulatedEmail);
      }

      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole(''); // Reset to empty - will be set dynamically on next open
      await loadData();
      
    } catch (error) {
      console.error('Failed to invite member:', error);
      toast({
        title: 'Invitation Failed',
        description: error.response?.data?.error || 'Failed to send invitation',
        variant: 'destructive'
      });
    } finally {
      setInviting(false);
    }
  };

  const handleOpenRoleChange = (member) => {
    setSelectedMember(member);
    // Use orgRole from orgProfile, fall back to legacy mapping
    const currentOrgRole = member.orgProfile?.orgRole || 
      (member.isOrgOwner ? ORG_ROLES.OWNER : ORG_ROLES.MEMBER);
    setNewRole(currentOrgRole);
    setRoleChangeDialogOpen(true);
  };

  const handleRoleChange = async () => {
    if (!selectedMember) return;

    try {
      setChangingRole(true);
      
      await base44.functions.invoke('updateTeamMemberRole', {
        userId: selectedMember.userId,
        orgRole: newRole
      });

      const roleLabel = newRole === ORG_ROLES.OWNER ? 'Owner' : 
                       newRole === ORG_ROLES.MANAGER ? 'Manager' : 'Member';

      toast({
        title: 'Role Updated! ✓',
        description: `${selectedMember.name}'s role has been changed to ${roleLabel}`,
        className: 'bg-green-50 border-green-200 text-green-900'
      });

      setRoleChangeDialogOpen(false);
      setSelectedMember(null);
      await loadData();
      
    } catch (error) {
      console.error('Failed to change role:', error);
      toast({
        title: 'Role Change Failed',
        description: error.response?.data?.error || 'Failed to update role',
        variant: 'destructive'
      });
    } finally {
      setChangingRole(false);
    }
  };

  const handleOpenRemove = (member) => {
    setMemberToRemove(member);
    setRemoveDialogOpen(true);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      setRemoving(true);
      
      if (memberToRemove.status === 'Pending') {
        await base44.functions.invoke('cancelInvitation', {
          invitationId: memberToRemove.invitationId
        });
        
        toast({
          title: 'Invitation Cancelled',
          description: `Invitation to ${memberToRemove.email} has been cancelled`,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      } else {
        await base44.functions.invoke('removeTeamMember', {
          userId: memberToRemove.userId
        });
        
        toast({
          title: 'Member Removed',
          description: `${memberToRemove.name} has been removed from your organization`,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      }

      setRemoveDialogOpen(false);
      setMemberToRemove(null);
      await loadData();
      
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast({
        title: 'Removal Failed',
        description: error.response?.data?.error || 'Failed to remove member',
        variant: 'destructive'
      });
    } finally {
      setRemoving(false);
    }
  };

  const handleOpenDetails = (member) => {
    setSelectedMemberForDetails(member);
    setDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading team data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => navigate(createPageUrl('Home'))}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Team Management</h1>
          <p className="text-lg text-gray-600">Manage your organization's team members and roles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Members</p>
                  <p className="text-3xl font-bold text-gray-900">{summaryStats?.totalMembers || 0}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active</p>
                  <p className="text-3xl font-bold text-green-600">{summaryStats?.activeMembers || 0}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Admins</p>
                  <p className="text-3xl font-bold text-purple-600">{summaryStats?.admins || 0}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cards Sent</p>
                  <p className="text-3xl font-bold text-orange-600">{summaryStats?.cardsSent || 0}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Send className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button 
                onClick={() => setInviteModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Invite Member
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={loadData}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                {searchQuery ? (
                  <>
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No members match your search</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="mt-3"
                    >
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No team members yet</p>
                    <Button 
                      onClick={() => setInviteModalOpen(true)}
                      className="mt-3 bg-orange-600 hover:bg-orange-700"
                    >
                      Invite Your First Member
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Member</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Role</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Credits</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Cards Sent</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Last Active</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <tr key={member.userId || member.invitationId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold">
                              {member.initials}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{member.name}</p>
                              <p className="text-sm text-gray-500">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {getRoleBadge(member)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {getStatusBadge(member.status)}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-semibold text-gray-900">{member.credits}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-semibold text-gray-900">{member.cardsSent}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm text-gray-600">{formatRelativeTime(member.lastActive)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {member.status !== 'Pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-600 hover:text-orange-600"
                                  onClick={() => handleOpenDetails(member)}
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-600 hover:text-purple-600"
                                  onClick={() => handleOpenRoleChange(member)}
                                  disabled={member.userId === user?.id}
                                  title="Change Role"
                                >
                                  <UserCog className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-600 hover:text-red-600"
                              onClick={() => handleOpenRemove(member)}
                              disabled={member.userId === user?.id}
                              title={member.status === 'Pending' ? 'Cancel Invitation' : 'Remove Member'}
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredMembers.length > 0 && (
              <div className="mt-4 text-center text-sm text-gray-500">
                Showing {filteredMembers.length} of {members.length} team members
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to add a new member to your organization
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="teammate@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="invite-role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {invitableRoles.map(roleOption => (
                      <SelectItem key={roleOption.value} value={roleOption.value}>
                        <div className="flex items-center gap-2">
                          {roleOption.value === ORG_ROLES.OWNER && <Shield className="w-4 h-4" />}
                          {roleOption.value === ORG_ROLES.MANAGER && <UserCog className="w-4 h-4" />}
                          {roleOption.value === ORG_ROLES.MEMBER && <Users className="w-4 h-4" />}
                          <span>{roleOption.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {inviteRole === ORG_ROLES.OWNER && 'Owners have full control over the organization'}
                  {inviteRole === ORG_ROLES.MANAGER && 'Managers can allocate credits and manage team members'}
                  {inviteRole === ORG_ROLES.MEMBER && 'Members can send cards using allocated credits'}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {inviting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={roleChangeDialogOpen} onOpenChange={setRoleChangeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Member Role</DialogTitle>
              <DialogDescription>
                Update {selectedMember?.name}'s role in your organization
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Label htmlFor="new-role">New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {invitableRoles.map(roleOption => (
                    <SelectItem key={roleOption.value} value={roleOption.value}>
                      <div className="flex items-center gap-2">
                        {roleOption.value === ORG_ROLES.OWNER && <Shield className="w-4 h-4" />}
                        {roleOption.value === ORG_ROLES.MANAGER && <UserCog className="w-4 h-4" />}
                        {roleOption.value === ORG_ROLES.MEMBER && <Users className="w-4 h-4" />}
                        <span>{roleOption.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleChangeDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRoleChange}
                disabled={changingRole}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {changingRole ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Role'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {memberToRemove?.status === 'Pending' ? 'Cancel Invitation?' : 'Remove Team Member?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {memberToRemove?.status === 'Pending' ? (
                  <>
                    Are you sure you want to cancel the invitation to <strong>{memberToRemove?.email}</strong>? 
                    They will no longer be able to accept the invitation.
                  </>
                ) : (
                  <>
                    Are you sure you want to remove <strong>{memberToRemove?.name}</strong> from your organization? 
                    They will lose access to all organization resources and their credit balance.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveMember}
                disabled={removing}
                className="bg-red-600 hover:bg-red-700"
              >
                {removing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  memberToRemove?.status === 'Pending' ? 'Cancel Invitation' : 'Remove Member'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Team Member Details Modal */}
        <TeamMemberDetailsModal
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
          member={selectedMemberForDetails}
          onUpdate={handleModalUpdate}
        />
      </div>
    </div>
  );
}