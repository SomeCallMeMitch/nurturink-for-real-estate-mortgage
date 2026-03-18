import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Get comprehensive team data for an organization - INLINED VERSION (JavaScript)
 * All role helpers are inlined to avoid import sync issues
 * 
 * @version 2026-01-26-inlined-js
 */

// =============================================================================
// INLINED ROLE CONSTANTS
// =============================================================================

const ORG_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  MEMBER: 'member',
};

const APP_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORGANIZATION_OWNER: 'organization_owner',
  ORGANIZATION_MANAGER: 'organization_manager',
  SALES_REP: 'sales_rep',
};

// =============================================================================
// INLINED ROLE FUNCTIONS
// =============================================================================

function mapLegacyAppRoleToOrgRole(appRole, isOrgOwnerFlag) {
  if (isOrgOwnerFlag || appRole === APP_ROLES.ORGANIZATION_OWNER) {
    return ORG_ROLES.OWNER;
  }
  if (appRole === APP_ROLES.ORGANIZATION_MANAGER) {
    return ORG_ROLES.MANAGER;
  }
  return ORG_ROLES.MEMBER;
}

async function getUserProfile(base44, userId, orgId) {
  try {
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      userId: userId,
      orgId: orgId
    });
    return profiles.length > 0 ? profiles[0] : null;
  } catch (error) {
    console.error('Error fetching UserProfile:', error);
    return null;
  }
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

Deno.serve(async (req) => {
  console.log('=== getOrganizationTeamData START (2026-01-26-inlined-js) ===');
  
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Current user:', JSON.stringify({ 
      id: user?.id, 
      email: user?.email, 
      appRole: user?.appRole, 
      orgId: user?.orgId 
    }));
    
    // Get current user's UserProfile to check permissions
    let currentUserOrgRole = null;
    let currentUserProfileId = null;
    if (user.orgId) {
      const currentUserProfile = await getUserProfile(base44, user.id, user.orgId);
      currentUserOrgRole = currentUserProfile?.orgRole || mapLegacyAppRoleToOrgRole(user.appRole, user.isOrgOwner);
      currentUserProfileId = currentUserProfile?.id || null;
      console.log('Current user profile:', JSON.stringify({ 
        orgRole: currentUserOrgRole, 
        profileId: currentUserProfileId 
      }));
    }
    
    // Verify user is organization owner, manager, or super admin
    const isOrgOwner = currentUserOrgRole === ORG_ROLES.OWNER || user.appRole === 'organization_owner' || user.isOrgOwner === true;
    const isOrgManager = currentUserOrgRole === ORG_ROLES.MANAGER || user.appRole === 'organization_manager';
    const isSuperAdmin = user.appRole === 'super_admin';
    
    console.log('Permission check:', JSON.stringify({ isOrgOwner, isOrgManager, isSuperAdmin }));
    
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
    
    console.log('Team members found:', teamMembers.length);
    
    // Fetch all UserProfiles for this organization
    let userProfiles = [];
    try {
      userProfiles = await base44.asServiceRole.entities.UserProfile.filter({
        orgId: targetOrgId
      });
      console.log('UserProfiles found:', userProfiles.length);
    } catch (profileError) {
      console.error('Error fetching UserProfiles:', profileError);
      // Continue without profiles - will use legacy mapping
    }
    
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
    
    console.log('Pending invitations found:', pendingInvitations.length);
    
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
      
      console.log(`Member ${member.email}: profile=${userProfile?.id || 'none'}, orgRole=${orgRole}, appRole=${member.appRole}, isOrgOwner=${member.isOrgOwner}`);
      
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
        profileId: currentUserProfileId
      }
    };
    
    console.log('=== getOrganizationTeamData SUCCESS ===');
    console.log('Summary:', JSON.stringify(summaryStats));
    
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
