import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Update a team member's role within the organization
 * Supports both new orgRole system (owner/manager/member) and legacy appRole system
 * @version 2026-01-26
 */

// Role constants
const ORG_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  MEMBER: 'member'
};

// Map orgRole to legacy appRole
const orgRoleToAppRole = {
  'owner': 'organization_owner',
  'manager': 'organization_manager',
  'member': 'sales_rep'
};

// Map legacy appRole to orgRole
const appRoleToOrgRole = {
  'organization_owner': 'owner',
  'organization_manager': 'manager',
  'sales_rep': 'member'
};

// Valid orgRoles
const VALID_ORG_ROLES = ['owner', 'manager', 'member'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's UserProfile to check orgRole
    let userOrgRole = null;
    try {
      const userProfiles = await base44.asServiceRole.entities.UserProfile.filter({
        userId: user.id,
        orgId: user.orgId
      });
      if (userProfiles.length > 0) {
        userOrgRole = userProfiles[0].orgRole;
      }
    } catch (e) {
      console.error('Failed to fetch user profile:', e);
    }
    
    // Check permissions - owner, manager, or super admin can change roles
    const isOrgOwner = userOrgRole === ORG_ROLES.OWNER || user.appRole === 'organization_owner' || user.isOrgOwner === true;
    const isOrgManager = userOrgRole === ORG_ROLES.MANAGER || user.appRole === 'organization_manager';
    const isSuperAdmin = user.appRole === 'super_admin';
    
    if (!isOrgOwner && !isOrgManager && !isSuperAdmin) {
      return Response.json(
        { error: 'Access denied. Only organization owners and managers can change team member roles.' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { userId, newRole, orgRole } = body;
    
    // Validate inputs
    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    // Support both orgRole (new) and newRole (legacy) parameters
    let finalOrgRole = orgRole || appRoleToOrgRole[newRole] || newRole;
    
    if (!finalOrgRole || !VALID_ORG_ROLES.includes(finalOrgRole)) {
      return Response.json(
        { error: 'Invalid role. Must be "owner", "manager", or "member"' },
        { status: 400 }
      );
    }
    
    // Permission checks for role assignment
    // Managers can only assign 'member' role
    if (isOrgManager && !isOrgOwner && !isSuperAdmin) {
      if (finalOrgRole !== ORG_ROLES.MEMBER) {
        return Response.json(
          { error: 'Managers can only assign member role' },
          { status: 403 }
        );
      }
    }
    
    // Only owners and super admins can assign owner role
    if (finalOrgRole === ORG_ROLES.OWNER && !isOrgOwner && !isSuperAdmin) {
      return Response.json(
        { error: 'Only organization owners can assign owner role' },
        { status: 403 }
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
    
    // Verify user belongs to the same organization
    if (targetUser.orgId !== user.orgId) {
      return Response.json(
        { error: 'This user does not belong to your organization' },
        { status: 403 }
      );
    }
    
    // Prevent user from demoting themselves if they're the only owner
    if (userId === user.id && finalOrgRole !== ORG_ROLES.OWNER) {
      // Check if there are other org owners via UserProfile
      const orgProfiles = await base44.asServiceRole.entities.UserProfile.filter({
        orgId: user.orgId,
        orgRole: ORG_ROLES.OWNER
      });
      
      // Also check legacy way
      const orgUsers = await base44.asServiceRole.entities.User.filter({
        orgId: user.orgId
      });
      const legacyOwnerCount = orgUsers.filter(u => 
        u.appRole === 'organization_owner' || u.isOrgOwner === true
      ).length;
      
      const totalOwners = Math.max(orgProfiles.length, legacyOwnerCount);
      
      if (totalOwners <= 1) {
        return Response.json(
          { error: 'Cannot demote yourself. You are the only organization owner. Promote another member first.' },
          { status: 400 }
        );
      }
    }
    
    // Map orgRole to appRole for legacy compatibility
    const appRole = orgRoleToAppRole[finalOrgRole] || finalOrgRole;
    
    // Update the user's legacy role fields
    await base44.asServiceRole.entities.User.update(userId, {
      appRole: appRole,
      isOrgOwner: finalOrgRole === ORG_ROLES.OWNER
    });
    
    // Update or create UserProfile with new orgRole
    try {
      const existingProfiles = await base44.asServiceRole.entities.UserProfile.filter({
        userId: userId,
        orgId: targetUser.orgId
      });
      
      if (existingProfiles.length > 0) {
        await base44.asServiceRole.entities.UserProfile.update(existingProfiles[0].id, {
          orgRole: finalOrgRole,
          updatedAt: new Date().toISOString()
        });
      } else {
        await base44.asServiceRole.entities.UserProfile.create({
          userId: userId,
          orgId: targetUser.orgId,
          orgRole: finalOrgRole,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (profileError) {
      console.error('Failed to update UserProfile:', profileError);
      // Continue - the legacy role is still updated
    }
    
    // Role display names
    const roleDisplayNames = {
      'owner': 'Owner',
      'manager': 'Manager',
      'member': 'Member'
    };
    
    console.log(`📧 [SIMULATED EMAIL] To: ${targetUser.email}`);
    console.log(`Subject: Your role has been updated`);
    console.log(`Body: Your role has been changed to ${roleDisplayNames[finalOrgRole] || finalOrgRole}.`);
    
    return Response.json({
      success: true,
      message: 'Team member role updated successfully',
      userId: userId,
      orgRole: finalOrgRole,
      newRole: appRole // Legacy field for backwards compatibility
    });
    
  } catch (error) {
    console.error('Error in updateTeamMemberRole:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to update team member role',
        details: error.stack
      },
      { status: 500 }
    );
  }
});