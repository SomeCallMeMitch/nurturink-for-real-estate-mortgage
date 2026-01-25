import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { ORG_ROLES, mapLegacyAppRoleToOrgRole, getUserProfile } from './utils/roleHelpers.ts';

/**
 * Get comprehensive team data for an organization
 * Returns team members with basic information, org roles, and pending invitations
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get current user's UserProfile to check permissions
    let currentUserOrgRole = null;
    if (user.orgId) {
      const currentUserProfile = await getUserProfile(base44, user.id, user.orgId);
      currentUserOrgRole = currentUserProfile?.orgRole || mapLegacyAppRoleToOrgRole(user.appRole, user.isOrgOwner);
    }
    
    // Verify user is organization owner, manager, or super admin
    const isOrgOwner = currentUserOrgRole === ORG_ROLES.OWNER || user.appRole === 'organization_owner' || user.isOrgOwner === true;
    const isOrgManager = currentUserOrgRole === ORG_ROLES.MANAGER || user.appRole === 'organization_manager';
    const isSuperAdmin = user.appRole === 'super_admin';
    
    // Super admins, org owners, and managers can access team data
    if (!isOrgOwner && !isOrgManager && !isSuperAdmin) {
      return Response.json(
        { error: 'Access denied. Only organization owners, managers, and super admins can view team data.' },
        { status: 403 }
      );
    }
    
    // Determine which organization to query
    const targetOrgId = user.orgId;
    
    if (!targetOrgId) {
      // For super_admin without orgId, provide helpful error
      if (isSuperAdmin) {
        return Response.json(
          { error: 'You need to be assigned to an organization to view team data. Please set your orgId in your user profile or use the admin dashboard to select an organization.' },
          { status: 400 }
        );
      }
      return Response.json(
        { error: 'No organization found' },
        { status: 400 }
      );
    }
    
    // Fetch all users in the organization
    const teamMembers = await base44.asServiceRole.entities.User.filter({
      orgId: targetOrgId
    });
    
    // Fetch all UserProfiles for this organization
    const userProfiles = await base44.asServiceRole.entities.UserProfile.filter({
      orgId: targetOrgId
    });
    
    // Create a map for quick lookup
    const profileMap = new Map();
    userProfiles.forEach(profile => {
      profileMap.set(profile.userId, profile);
    });
    
    // Fetch pending invitations
    const pendingInvitations = await base44.asServiceRole.entities.Invitation.filter({
      orgId: targetOrgId,
      status: 'pending'
    });
    
    // Map team members to response format with orgRole from UserProfile
    const membersWithStats = teamMembers.map((member) => {
      // Generate initials for avatar
      const nameParts = (member.full_name || member.email).split(' ');
      const initials = nameParts.length >= 2 
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : (nameParts[0][0] || 'U').toUpperCase();
      
      // Get orgRole from UserProfile, fall back to legacy mapping
      const userProfile = profileMap.get(member.id);
      const orgRole = userProfile?.orgRole || mapLegacyAppRoleToOrgRole(member.appRole, member.isOrgOwner);
      
      return {
        userId: member.id,
        name: member.full_name || member.email,
        email: member.email,
        initials: initials,
        role: member.appRole || 'sales_rep', // Legacy field
        isOrgOwner: orgRole === ORG_ROLES.OWNER || member.appRole === 'organization_owner' || member.isOrgOwner === true,
        // New orgProfile object for frontend
        orgProfile: {
          orgRole: orgRole,
          profileId: userProfile?.id || null
        },
        status: 'Active',
        credits: (member.companyAllocatedCredits || 0) + (member.personalPurchasedCredits || 0),
        companyAllocatedCredits: member.companyAllocatedCredits || 0,
        personalPurchasedCredits: member.personalPurchasedCredits || 0,
        canAccessCompanyPool: member.canAccessCompanyPool || false,
        cardsSent: 0, // Stats will be added in future optimization
        cardsSentThisMonth: 0, // Stats will be added in future optimization
        lastActive: member.updated_date || member.created_date,
        createdAt: member.created_date
      };
    });
    
    // Add pending invitations to the list
    const pendingMembers = pendingInvitations.map(invitation => ({
      invitationId: invitation.id,
      userId: null,
      name: invitation.email,
      email: invitation.email,
      initials: invitation.email[0].toUpperCase(),
      role: invitation.role, // Legacy field
      isOrgOwner: invitation.orgRole === ORG_ROLES.OWNER || invitation.role === 'organization_owner',
      // New orgProfile object for frontend
      orgProfile: {
        orgRole: invitation.orgRole || mapLegacyAppRoleToOrgRole(invitation.role, false),
        profileId: null
      },
      status: 'Pending',
      credits: 0,
      companyAllocatedCredits: 0,
      personalPurchasedCredits: 0,
      canAccessCompanyPool: false,
      cardsSent: 0,
      cardsSentThisMonth: 0,
      lastActive: invitation.createdAt,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt
    }));
    
    // Combine active members and pending invitations
    const allMembers = [...membersWithStats, ...pendingMembers];
    
    // Sort by created date (newest first)
    allMembers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Calculate summary statistics
    const activeMembers = membersWithStats.filter(m => m.status === 'Active').length;
    const ownerCount = membersWithStats.filter(m => m.orgProfile.orgRole === ORG_ROLES.OWNER).length;
    const managerCount = membersWithStats.filter(m => m.orgProfile.orgRole === ORG_ROLES.MANAGER).length;
    const totalCardsSent = membersWithStats.reduce((sum, m) => sum + m.cardsSent, 0);
    
    const summaryStats = {
      totalMembers: allMembers.length,
      activeMembers: activeMembers,
      owners: ownerCount,
      managers: managerCount,
      admins: ownerCount + managerCount, // For backward compatibility
      cardsSent: totalCardsSent
    };
    
    // Include current user's orgProfile in response for frontend permission checks
    const currentUserData = {
      id: user.id,
      orgId: user.orgId,
      appRole: user.appRole,
      orgProfile: {
        orgRole: currentUserOrgRole,
        profileId: null // Will be set if profile exists
      }
    };
    
    return Response.json({
      members: allMembers,
      summaryStats: summaryStats,
      currentUser: currentUserData
    });
    
  } catch (error) {
    console.error('Error in getOrganizationTeamData:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to fetch team data',
        details: error.stack
      },
      { status: 500 }
    );
  }
});
