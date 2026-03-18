import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Remove a team member from the organization
 * Note: This doesn't delete the user account, just removes them from the org
 * 
 * Role hierarchy:
 * - Super Admin: Can remove anyone
 * - Owner: Can remove managers and members (not other owners)
 * - Manager: Can only remove members
 * - Member: Cannot remove anyone
 * 
 * @version 2026-01-26-role-hierarchy
 */

// Inlined role constants
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

// Map legacy appRole to new orgRole
function mapLegacyAppRoleToOrgRole(appRole, isOrgOwnerFlag) {
  if (isOrgOwnerFlag || appRole === APP_ROLES.ORGANIZATION_OWNER) {
    return ORG_ROLES.OWNER;
  }
  if (appRole === APP_ROLES.ORGANIZATION_MANAGER) {
    return ORG_ROLES.MANAGER;
  }
  return ORG_ROLES.MEMBER;
}

// Get user's orgRole from UserProfile or fallback to legacy mapping
async function getUserOrgRole(base44, userId, orgId, appRole, isOrgOwnerFlag) {
  try {
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      userId: userId,
      orgId: orgId
    });
    if (profiles.length > 0 && profiles[0].orgRole) {
      return profiles[0].orgRole;
    }
  } catch (error) {
    console.error('Error fetching UserProfile:', error);
  }
  // Fallback to legacy mapping
  return mapLegacyAppRoleToOrgRole(appRole, isOrgOwnerFlag);
}

Deno.serve(async (req) => {
  console.log('=== removeTeamMember START (2026-01-26-role-hierarchy) ===');
  
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Current user:', JSON.stringify({
      id: user.id,
      email: user.email,
      appRole: user.appRole,
      isOrgOwner: user.isOrgOwner,
      orgId: user.orgId
    }));
    
    // Get current user's orgRole
    const currentUserOrgRole = await getUserOrgRole(
      base44, 
      user.id, 
      user.orgId, 
      user.appRole, 
      user.isOrgOwner
    );
    const isSuperAdmin = user.appRole === APP_ROLES.SUPER_ADMIN;
    
    console.log('Current user orgRole:', currentUserOrgRole, 'isSuperAdmin:', isSuperAdmin);
    
    // Check if user has any removal permissions
    if (currentUserOrgRole === ORG_ROLES.MEMBER && !isSuperAdmin) {
      return Response.json(
        { error: 'Access denied. Only organization owners and managers can remove team members.' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { userId } = body;
    
    // Validate input
    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    // Prevent user from removing themselves
    if (userId === user.id) {
      return Response.json(
        { error: 'You cannot remove yourself from the organization' },
        { status: 400 }
      );
    }
    
    // Load the target user
    const targetUsers = await base44.asServiceRole.entities.User.filter({
      id: userId
    });
    
    if (targetUsers.length === 0) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const targetUser = targetUsers[0];
    
    console.log('Target user:', JSON.stringify({
      id: targetUser.id,
      email: targetUser.email,
      appRole: targetUser.appRole,
      isOrgOwner: targetUser.isOrgOwner,
      orgId: targetUser.orgId
    }));
    
    // Verify user belongs to the same organization
    if (targetUser.orgId !== user.orgId) {
      return Response.json(
        { error: 'This user does not belong to your organization' },
        { status: 403 }
      );
    }
    
    // Get target user's orgRole
    const targetUserOrgRole = await getUserOrgRole(
      base44,
      targetUser.id,
      targetUser.orgId,
      targetUser.appRole,
      targetUser.isOrgOwner
    );
    
    console.log('Target user orgRole:', targetUserOrgRole);
    
    // Role hierarchy permission check
    // Super admins can remove anyone
    if (!isSuperAdmin) {
      // Owners cannot remove other owners
      if (currentUserOrgRole === ORG_ROLES.OWNER && targetUserOrgRole === ORG_ROLES.OWNER) {
        return Response.json(
          { error: 'Owners cannot remove other owners. Contact a super admin for assistance.' },
          { status: 403 }
        );
      }
      
      // Managers can only remove members
      if (currentUserOrgRole === ORG_ROLES.MANAGER) {
        if (targetUserOrgRole === ORG_ROLES.OWNER) {
          return Response.json(
            { error: 'Managers cannot remove organization owners.' },
            { status: 403 }
          );
        }
        if (targetUserOrgRole === ORG_ROLES.MANAGER) {
          return Response.json(
            { error: 'Managers cannot remove other managers. Contact an organization owner.' },
            { status: 403 }
          );
        }
      }
    }
    
    console.log('Permission check passed. Removing user from organization...');
    
    // Remove user from organization (set orgId to null, reset role)
    await base44.asServiceRole.entities.User.update(userId, {
      orgId: null,
      appRole: 'user',
      isOrgOwner: false
    });
    
    // Also remove/update UserProfile if it exists
    try {
      const targetProfiles = await base44.asServiceRole.entities.UserProfile.filter({
        userId: userId,
        orgId: user.orgId
      });
      if (targetProfiles.length > 0) {
        await base44.asServiceRole.entities.UserProfile.delete(targetProfiles[0].id);
        console.log('Deleted UserProfile:', targetProfiles[0].id);
      }
    } catch (profileError) {
      console.error('Error removing UserProfile:', profileError);
      // Continue - user is still removed from org
    }
    
    // Send notification email to the removed user
    try {
      await base44.integrations.Core.SendEmail({
        to: targetUser.email,
        subject: 'You have been removed from the organization',
        body: `Hello,\n\nYou have been removed from the organization by ${user.full_name || user.email}.\n\nIf you believe this was done in error, please contact your organization administrator.\n\nBest regards,\nNurturInk Team`,
        from_name: 'NurturInk'
      });
      console.log('Removal notification email sent to:', targetUser.email);
    } catch (emailError) {
      console.error('Failed to send removal notification email:', emailError);
      // Continue - removal was successful even if email failed
    }
    
    console.log('=== removeTeamMember SUCCESS ===');
    
    return Response.json({
      success: true,
      message: 'Team member removed successfully',
      userId: userId
    });
    
  } catch (error) {
    console.error('Error in removeTeamMember:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to remove team member',
        details: error.stack
      },
      { status: 500 }
    );
  }
});
