import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Users,
  UserCheck,
  Shield,
  ShieldCheck,
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
import {
  isOrgAdmin,
  isOrgOwner,
  isOrgManager,
  isSuperAdmin,
  canPromoteToManager,
  getInvitableRoles,
  getAssignableRoles,
  getUserRoleDisplayName,
  getRoleBadgeVariant,
  ORG_ROLES
} from '@/utils/roleHelpers';

export default function TeamManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteOrgRole, setInviteOrgRole] = useState(ORG_ROLES.MEMBER);
  const [inviting, setInviting] = useState(false);
  
  const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newOrgRole, setNewOrgRole] = useState('');
  const [changingRole, setChangingRole] = useState(false);
  
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  
  // Team member details modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedMemberForDetails, setSelectedMemberForDetails] = useState(null);

  // Get available roles for the current user
  const invitableRoles = useMemo(() => getInvitableRoles(user), [user]);
  const canInviteManager = useMemo(() => canPromoteToManager(user), [user]);

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
      
      // Check if user can manage team (owner, manager, or super admin)
      if (!isOrgAdmin(currentUser) && !isSuperAdmin(currentUser)) {
        setError('Access denied. Only organization owners and managers can manage team members.');
        setLoading(false);
        return;
      }
      
      if (!currentUser.orgId) {
        setError('You must belong to an organization to manage team members.');
        setLoading(false);
        return;
      }
      
      console.log('TeamManagement: Invoking getOrganizationTeamData...');
      const response = await base44.functions.invoke('getOrganizationTeamData');
      console.log('TeamManagement: Response received:', response);
      
      if (!response.data) {
        throw new Error('Invalid response from getOrganizationTeamData - no data property');
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
    // Check new orgRole first, then fall back to legacy checks
    const orgRole = member.orgRole || (member.isOrgOwner ? ORG_ROLES.OWNER : ORG_ROLES.MEMBER);
    
    if (orgRole === ORG_ROLES.OWNER || member.isOrgOwner) {
      return <Badge className="bg-purple-100 text-purple-800"><Shield className="w-3 h-3 mr-1" />Owner</Badge>;
    }
    if (orgRole === ORG_ROLES.MANAGER) {
      return <Badge className="bg-blue-100 text-blue-800"><ShieldCheck className="w-3 h-3 mr-1" />Manager</Badge>;
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
      
      const response = await base44.functions.invoke('inviteTeamMember', {
        email: inviteEmail.trim(),
        orgRole: inviteOrgRole
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
      setInviteOrgRole(ORG_ROLES.MEMBER);
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
    // Determine current role
    const currentOrgRole = member.orgRole || (member.isOrgOwner ? ORG_ROLES.OWNER : ORG_ROLES.MEMBER);
    setNewOrgRole(currentOrgRole);
    setRoleChangeDialogOpen(true);
  };

  const handleRoleChange = async () => {
    if (!selectedMember) return;

    try {
      setChangingRole(true);
      
      await base44.functions.invoke('updateTeamMemberRole', {
        userId: selectedMember.userId,
        newOrgRole: newOrgRole
      });

      const roleDisplayNames = {
        [ORG_ROLES.OWNER]: 'Owner',
        [ORG_ROLES.MANAGER]: 'Manager',
        [ORG_ROLES.MEMBER]: 'Member'
      };

      toast({
        title: 'Role Updated! ✓',
        description: `${selectedMember.name}'s role has been changed to ${roleDisplayNames[newOrgRole] || newOrgRole}`,
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
          description: `${memberToRemove.name} has been removed from the organization`,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      }

      setRemoveDialogOpen(false);
      setMemberToRemove(null);
      await loadData();
      
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast({
        title: memberToRemove.status === 'Pending' ? 'Failed to Cancel' : 'Removal Failed',
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

  // Check if current user can manage a specific member
  const canManageMember = (member) => {
    if (!user) return false;
    if (isSuperAdmin(user)) return true;
    if (member.userId === user.id) return false;
    
    // Owners can manage anyone
    if (isOrgOwner(user)) return true;
    
    // Managers can only manage regular members
    if (isOrgManager(user)) {
      const memberOrgRole = member.orgRole || (member.isOrgOwner ? ORG_ROLES.OWNER : ORG_ROLES.MEMBER);
      return memberOrgRole === ORG_ROLES.MEMBER;
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">Access Error</h2>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600">Manage your organization's team members</p>
          </div>
          <Button 
            onClick={() => setInviteModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {/* Stats Cards */}
        {summaryStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{summaryStats.totalMembers}</p>
                    <p className="text-sm text-gray-500">Total Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{summaryStats.activeMembers}</p>
                    <p className="text-sm text-gray-500">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{summaryStats.admins}</p>
                    <p className="text-sm text-gray-500">Admins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Send className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{summaryStats.cardsSent}</p>
                    <p className="text-sm text-gray-500">Cards Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Team Members Table */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Team Members</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={loadData}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredMembers.length === 0 ? (
              <div className="p-12 text-center">
                {searchQuery ? (
                  <>
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No members found matching "{searchQuery}"</p>
                    <Button 
                      variant="outline" 
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
                                {canPromoteToManager(user) && (
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
                                )}
                              </>
                            )}
                            {canManageMember(member) && (
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
                            )}
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

        {/* Invite Modal */}
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
                <Select value={inviteOrgRole} onValueChange={setInviteOrgRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ORG_ROLES.MEMBER}>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Member</span>
                      </div>
                    </SelectItem>
                    {canInviteManager && (
                      <>
                        <SelectItem value={ORG_ROLES.MANAGER}>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Manager</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={ORG_ROLES.OWNER}>
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>Owner</span>
                          </div>
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {inviteOrgRole === ORG_ROLES.OWNER && 'Owners have full control over the organization'}
                  {inviteOrgRole === ORG_ROLES.MANAGER && 'Managers can allocate credits and manage team members'}
                  {inviteOrgRole === ORG_ROLES.MEMBER && 'Members can send cards using allocated credits'}
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

        {/* Role Change Dialog */}
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
              <Select value={newOrgRole} onValueChange={setNewOrgRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ORG_ROLES.MEMBER}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Member</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={ORG_ROLES.MANAGER}>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Manager</span>
                    </div>
                  </SelectItem>
                  {isOrgOwner(user) && (
                    <SelectItem value={ORG_ROLES.OWNER}>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>Owner</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-2">
                {newOrgRole === ORG_ROLES.OWNER && 'Owners have full control over the organization'}
                {newOrgRole === ORG_ROLES.MANAGER && 'Managers can allocate credits and manage team members'}
                {newOrgRole === ORG_ROLES.MEMBER && 'Members can send cards using allocated credits'}
              </p>
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

        {/* Remove Member Dialog */}
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
