import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { isOrgAdmin, isSuperAdmin, ORG_ROLES } from './utils/roleHelpers.ts';

/**
 * Get comprehensive team data for an organization
 * Returns team members with basic information and pending invitations
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user can access team data (owner, manager, or super admin)
    if (!isOrgAdmin(user) && !isSuperAdmin(user)) {
      return Response.json(
        { error: 'Access denied. Only organization owners, managers, and super admins can view team data.' },
        { status: 403 }
      );
    }
    
    // Determine which organization to query
    const targetOrgId = user.orgId;
    
    if (!targetOrgId) {
      if (isSuperAdmin(user)) {
        return Response.json(
          { error: 'You need to be assigned to an organization to view team data.' },
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
    
    // Create a map of userId -> UserProfile for quick lookup
    const profileMap = new Map();
    for (const profile of userProfiles) {
      profileMap.set(profile.userId, profile);
    }
    
    // Fetch pending invitations
    const pendingInvitations = await base44.asServiceRole.entities.Invitation.filter({
      orgId: targetOrgId,
      status: 'pending'
    });
    
    // Map team members to response format
    const membersWithStats = teamMembers.map((member) => {
      // Get UserProfile for this member
      const profile = profileMap.get(member.id);
      
      // Determine orgRole from UserProfile or fall back to legacy
      let orgRole = profile?.orgRole || null;
      if (!orgRole) {
        // Legacy fallback
        if (member.isOrgOwner || member.appRole === 'organization_owner') {
          orgRole = ORG_ROLES.OWNER;
        } else {
          orgRole = ORG_ROLES.MEMBER;
        }
      }
      
      // Generate initials for avatar
      const nameParts = (member.full_name || member.email).split(' ');
      const initials = nameParts.length >= 2 
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : (nameParts[0][0] || 'U').toUpperCase();
      
      return {
        userId: member.id,
        name: member.full_name || member.email,
        email: member.email,
        initials: initials,
        role: member.appRole || 'sales_rep', // Legacy field
        orgRole: orgRole, // New field from UserProfile
        isOrgOwner: orgRole === ORG_ROLES.OWNER,
        isOrgManager: orgRole === ORG_ROLES.MANAGER,
        status: 'Active',
        credits: (member.companyAllocatedCredits || 0) + (member.personalPurchasedCredits || 0),
        companyAllocatedCredits: member.companyAllocatedCredits || 0,
        personalPurchasedCredits: member.personalPurchasedCredits || 0,
        canAccessCompanyPool: member.canAccessCompanyPool || false,
        cardsSent: 0,
        cardsSentThisMonth: 0,
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
      orgRole: invitation.orgRole || ORG_ROLES.MEMBER, // New field
      isOrgOwner: invitation.orgRole === ORG_ROLES.OWNER || invitation.role === 'organization_owner',
      isOrgManager: invitation.orgRole === ORG_ROLES.MANAGER,
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
    const adminCount = membersWithStats.filter(m => m.isOrgOwner || m.isOrgManager).length;
    const totalCardsSent = membersWithStats.reduce((sum, m) => sum + m.cardsSent, 0);
    
    const summaryStats = {
      totalMembers: allMembers.length,
      activeMembers: activeMembers,
      admins: adminCount,
      cardsSent: totalCardsSent
    };
    
    return Response.json({
      members: allMembers,
      summaryStats: summaryStats
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
