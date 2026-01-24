import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { 
  isOrgOwner,
  isSuperAdmin,
  canChangeUserRole,
  ORG_ROLES,
  mapOrgRoleToLegacyAppRole,
  getOrgRoleDisplayName,
  upsertUserProfile,
  getUserProfileForOrg,
  checkUserRoleAsync
} from './utils/roleHelpers.ts';

/**
 * Update a team member's role within the organization
 * 
 * Permission rules:
 * - Super admins can change any role
 * - Org owners can promote to manager or demote to member
 * - Org managers cannot change roles (they can only invite members)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    const { userId, newRole, newOrgRole } = body;
    
    // Validate inputs
    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    // Determine the role to use (prefer new orgRole, fall back to legacy role)
    let finalOrgRole = newOrgRole;
    
    // Handle new orgRole field
    if (newOrgRole) {
      if (![ORG_ROLES.OWNER, ORG_ROLES.MANAGER, ORG_ROLES.MEMBER].includes(newOrgRole)) {
        return Response.json(
          { error: 'Invalid orgRole. Must be "owner", "manager", or "member"' },
          { status: 400 }
        );
      }
    } 
    // Handle legacy role field
    else if (newRole) {
      if (!['sales_rep', 'organization_owner', 'organization_manager'].includes(newRole)) {
        return Response.json(
          { error: 'Invalid role. Must be "sales_rep", "organization_manager", or "organization_owner"' },
          { status: 400 }
        );
      }
      if (newRole === 'organization_owner') {
        finalOrgRole = ORG_ROLES.OWNER;
      } else if (newRole === 'organization_manager') {
        finalOrgRole = ORG_ROLES.MANAGER;
      } else {
        finalOrgRole = ORG_ROLES.MEMBER;
      }
    } else {
      return Response.json(
        { error: 'newRole or newOrgRole is required' },
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
    
    // Verify user belongs to the same organization (unless super admin)
    if (!isSuperAdmin(user) && targetUser.orgId !== user.orgId) {
      return Response.json(
        { error: 'This user does not belong to your organization' },
        { status: 403 }
      );
    }
    
    // Check if current user can change the target user's role
    if (!canChangeUserRole(user, targetUser, finalOrgRole)) {
      if (!isOrgOwner(user) && !isSuperAdmin(user)) {
        return Response.json(
          { error: 'Only organization owners can change team member roles' },
          { status: 403 }
        );
      }
      if (userId === user.id) {
        return Response.json(
          { error: 'You cannot change your own role' },
          { status: 400 }
        );
      }
      return Response.json(
        { error: 'You do not have permission to assign this role' },
        { status: 403 }
      );
    }
    
    // Check target user's current role from UserProfile
    const targetRoleInfo = await checkUserRoleAsync(userId, targetUser.orgId);
    
    // Prevent demoting the only owner
    if (targetRoleInfo.isOwner && finalOrgRole !== ORG_ROLES.OWNER) {
      // Check if there are other org owners via UserProfile
      const orgProfiles = await base44.entities.UserProfile.filter({
        orgId: targetUser.orgId,
        orgRole: 'owner'
      });
      
      if (orgProfiles.length <= 1) {
        return Response.json(
          { error: 'Cannot demote the only organization owner. Promote another member to owner first.' },
          { status: 400 }
        );
      }
    }
    
    // Map to legacy appRole for backward compatibility
    const finalLegacyRole = mapOrgRoleToLegacyAppRole(finalOrgRole);
    
    // Update the user's legacy fields on User entity
    await base44.asServiceRole.entities.User.update(userId, {
      appRole: finalLegacyRole,
      isOrgOwner: finalOrgRole === ORG_ROLES.OWNER
    });
    
    // Update or create UserProfile with new role
    await upsertUserProfile(userId, targetUser.orgId, finalOrgRole);
    
    // Send notification email to the user about role change
    try {
      await base44.functions.invoke('sendRoleChangedEmail', {
        user_email: targetUser.email,
        user_name: targetUser.full_name || targetUser.email,
        new_role: getOrgRoleDisplayName(finalOrgRole),
        changed_by_name: user.full_name || user.email
      });
    } catch (emailError) {
      console.error('Failed to send role change notification email:', emailError);
    }
    
    return Response.json({
      success: true,
      message: 'Team member role updated successfully',
      userId: userId,
      newRole: finalLegacyRole,
      newOrgRole: finalOrgRole
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
