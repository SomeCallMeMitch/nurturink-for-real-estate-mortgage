import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Update a team member's role - INLINED VERSION (JavaScript)
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

function isSuperAdmin(user) {
  if (!user) return false;
  return user.appRole === APP_ROLES.SUPER_ADMIN || user.role === 'admin';
}

function isOrgOwner(user) {
  if (!user) return false;
  return user.isOrgOwner === true || user.appRole === APP_ROLES.ORGANIZATION_OWNER;
}

function isOrgManager(user) {
  if (!user) return false;
  return user.appRole === APP_ROLES.ORGANIZATION_MANAGER;
}

function isOrgAdmin(user) {
  if (!user) return false;
  return isOrgOwner(user) || isOrgManager(user);
}

function mapLegacyAppRoleToOrgRole(appRole, isOrgOwnerFlag) {
  if (isOrgOwnerFlag || appRole === APP_ROLES.ORGANIZATION_OWNER) {
    return ORG_ROLES.OWNER;
  }
  if (appRole === APP_ROLES.ORGANIZATION_MANAGER) {
    return ORG_ROLES.MANAGER;
  }
  return ORG_ROLES.MEMBER;
}

function mapOrgRoleToLegacyAppRole(orgRole) {
  switch (orgRole) {
    case ORG_ROLES.OWNER:
      return APP_ROLES.ORGANIZATION_OWNER;
    case ORG_ROLES.MANAGER:
      return APP_ROLES.ORGANIZATION_MANAGER;
    case ORG_ROLES.MEMBER:
    default:
      return APP_ROLES.SALES_REP;
  }
}

function getOrgRoleDisplayName(orgRole) {
  switch (orgRole) {
    case ORG_ROLES.OWNER: return 'Owner';
    case ORG_ROLES.MANAGER: return 'Manager';
    case ORG_ROLES.MEMBER: return 'Member';
    default: return orgRole || 'Member';
  }
}

function canAssignRole(user, targetRole) {
  if (!user) return false;
  
  // Super admins can assign any role
  if (isSuperAdmin(user)) return true;
  
  // Determine the user's orgRole
  let userOrgRole = user.orgProfile?.orgRole;
  if (!userOrgRole) {
    userOrgRole = mapLegacyAppRoleToOrgRole(user.appRole, user.isOrgOwner);
  }
  
  // Owners can assign manager and member
  if (userOrgRole === ORG_ROLES.OWNER) {
    return targetRole === ORG_ROLES.MANAGER || targetRole === ORG_ROLES.MEMBER;
  }
  
  // Managers can only assign member
  if (userOrgRole === ORG_ROLES.MANAGER) {
    return targetRole === ORG_ROLES.MEMBER;
  }
  
  // Members cannot assign any role
  return false;
}

async function upsertUserProfile(base44, userId, orgId, orgRole) {
  // Try to find existing profile
  const existingProfiles = await base44.asServiceRole.entities.UserProfile.filter({
    userId: userId,
    orgId: orgId
  });
  
  if (existingProfiles.length > 0) {
    const profile = existingProfiles[0];
    // Update role if provided and different
    if (orgRole && profile.orgRole !== orgRole) {
      return await base44.asServiceRole.entities.UserProfile.update(profile.id, {
        orgRole: orgRole
      });
    }
    return profile;
  }
  
  // Create new profile
  return await base44.asServiceRole.entities.UserProfile.create({
    userId: userId,
    orgId: orgId,
    orgRole: orgRole || ORG_ROLES.MEMBER
  });
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

Deno.serve(async (req) => {
  console.log('=== updateTeamMemberRole START (2026-01-26-inlined-js) ===');
  
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    console.log('Current user:', JSON.stringify({ 
      id: user?.id, 
      email: user?.email, 
      appRole: user?.appRole, 
      orgId: user?.orgId, 
      isOrgOwner: user?.isOrgOwner 
    }));
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user can manage team (org owner, org manager, or super admin)
    const canManage = isOrgAdmin(user) || isSuperAdmin(user);
    console.log('Permission check - isOrgAdmin:', isOrgAdmin(user), 'isSuperAdmin:', isSuperAdmin(user), 'canManage:', canManage);
    
    if (!canManage) {
      return Response.json(
        { error: 'Access denied. Only organization owners and managers can update team member roles.' },
        { status: 403 }
      );
    }
    
    if (!user.orgId) {
      return Response.json(
        { error: 'You must belong to an organization to manage team members' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { userId, role, orgRole } = body;
    
    console.log('Request body:', JSON.stringify({ userId, role, orgRole }));
    
    // Validate inputs
    if (!userId) {
      return Response.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Determine the role to use (prefer new orgRole, fall back to legacy role)
    let finalOrgRole = orgRole;
    
    // Handle new orgRole field
    if (orgRole) {
      console.log('Processing orgRole:', orgRole);
      const validOrgRoles = [ORG_ROLES.OWNER, ORG_ROLES.MANAGER, ORG_ROLES.MEMBER];
      
      if (!validOrgRoles.includes(orgRole)) {
        console.log('VALIDATION FAILED: Invalid orgRole');
        return Response.json(
          { error: `Invalid orgRole "${orgRole}". Must be "owner", "manager", or "member"` },
          { status: 400 }
        );
      }
    } 
    // Handle legacy role field (backwards compatibility)
    else if (role) {
      console.log('Processing legacy role:', role);
      if (!['sales_rep', 'organization_owner', 'organization_manager'].includes(role)) {
        return Response.json(
          { error: 'Invalid role. Must be "sales_rep", "organization_manager", or "organization_owner"' },
          { status: 400 }
        );
      }
      // Map legacy role to new orgRole
      if (role === 'organization_owner') {
        finalOrgRole = ORG_ROLES.OWNER;
      } else if (role === 'organization_manager') {
        finalOrgRole = ORG_ROLES.MANAGER;
      } else {
        finalOrgRole = ORG_ROLES.MEMBER;
      }
    } else {
      return Response.json(
        { error: 'Role is required (orgRole or role)' },
        { status: 400 }
      );
    }
    
    console.log('Final orgRole:', finalOrgRole);
    
    // Check if user can assign this role
    if (!canAssignRole(user, finalOrgRole)) {
      console.log('PERMISSION DENIED: User cannot assign role:', finalOrgRole);
      
      let errorMessage = 'You do not have permission to assign this role.';
      if (finalOrgRole === ORG_ROLES.OWNER) {
        errorMessage = 'Only super admins can assign the owner role.';
      } else if (finalOrgRole === ORG_ROLES.MANAGER) {
        errorMessage = 'Only organization owners can assign the manager role.';
      }
      
      return Response.json(
        { error: errorMessage },
        { status: 403 }
      );
    }
    
    // Get the target user
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
    console.log('Target user:', JSON.stringify({ id: targetUser.id, email: targetUser.email, orgId: targetUser.orgId }));
    
    // Verify target user is in the same organization
    if (targetUser.orgId !== user.orgId) {
      return Response.json(
        { error: 'You can only update roles for members of your organization' },
        { status: 403 }
      );
    }
    
    // Prevent users from changing their own role (except super admins)
    if (targetUser.id === user.id && !isSuperAdmin(user)) {
      return Response.json(
        { error: 'You cannot change your own role' },
        { status: 403 }
      );
    }
    
    // Map orgRole to legacy appRole for backward compatibility
    const legacyAppRole = mapOrgRoleToLegacyAppRole(finalOrgRole);
    const isOwner = finalOrgRole === ORG_ROLES.OWNER;
    
    // Update the user's legacy fields for backward compatibility
    await base44.asServiceRole.entities.User.update(userId, {
      appRole: legacyAppRole,
      isOrgOwner: isOwner
    });
    
    console.log('Updated User entity with appRole:', legacyAppRole, 'isOrgOwner:', isOwner);
    
    // Update or create UserProfile (source of truth for role)
    try {
      await upsertUserProfile(base44, userId, targetUser.orgId, finalOrgRole);
      console.log('UserProfile updated/created with orgRole:', finalOrgRole);
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
    
    console.log('=== updateTeamMemberRole SUCCESS ===');
    console.log(`Updated ${targetUser.email} to role: ${finalOrgRole}`);
    
    return Response.json({
      success: true,
      message: 'Team member role updated successfully',
      userId: userId,
      orgRole: finalOrgRole,
      newRole: legacyAppRole // Legacy field for backward compatibility
    });
    
  } catch (error) {
    console.error('Error in updateTeamMemberRole:', error);
    return Response.json({
      success: false,
      error: 'error',
      message: error.message || 'Failed to update team member role'
    }, { status: 500 });
  }
});
