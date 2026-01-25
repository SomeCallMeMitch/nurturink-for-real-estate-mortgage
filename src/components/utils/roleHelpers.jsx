/**
 * Frontend role helpers for NurturInk
 * Provides utilities for role-based UI rendering and permissions
 */

// =============================================================================
// ROLE CONSTANTS (must match backend)
// =============================================================================

export const ORG_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  MEMBER: 'member',
};

// =============================================================================
// ROLE CHECK FUNCTIONS
// =============================================================================

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(user) {
  if (!user) return false;
  return user.appRole === 'super_admin' || user.role === 'admin';
}

/**
 * Check if user is an organization owner
 */
export function isOrgOwner(user) {
  if (!user) return false;
  // Check UserProfile first, then fall back to legacy fields
  if (user.userProfile?.orgRole === ORG_ROLES.OWNER) return true;
  return user.isOrgOwner === true || user.appRole === 'organization_owner';
}

/**
 * Check if user is an organization manager
 */
export function isOrgManager(user) {
  if (!user) return false;
  // Check UserProfile first, then fall back to legacy fields
  if (user.userProfile?.orgRole === ORG_ROLES.MANAGER) return true;
  return user.appRole === 'organization_manager';
}

/**
 * Check if user has organization admin privileges (owner OR manager)
 */
export function isOrgAdmin(user) {
  if (!user) return false;
  return isOrgOwner(user) || isOrgManager(user);
}

/**
 * Get user's organization role
 */
export function getUserOrgRole(user) {
  if (!user) return null;
  
  // Check UserProfile first (source of truth)
  if (user.userProfile?.orgRole) {
    return user.userProfile.orgRole;
  }
  
  // Fall back to legacy fields
  if (user.isOrgOwner || user.appRole === 'organization_owner') {
    return ORG_ROLES.OWNER;
  }
  if (user.appRole === 'organization_manager') {
    return ORG_ROLES.MANAGER;
  }
  return ORG_ROLES.MEMBER;
}

/**
 * Get display name for orgRole
 */
export function getOrgRoleDisplayName(orgRole) {
  switch (orgRole) {
    case ORG_ROLES.OWNER: return 'Owner';
    case ORG_ROLES.MANAGER: return 'Manager';
    case ORG_ROLES.MEMBER: return 'Member';
    default: return orgRole || 'Member';
  }
}

/**
 * Get roles that the current user can invite
 * @param {object} user - The current user object (with potential userProfile)
 * @returns {Array} - Array of role objects with value and label
 */
export function getInvitableRoles(user) {
  if (!user) return [];
  
  // Super admins can invite all roles
  if (isSuperAdmin(user)) {
    return [
      { value: ORG_ROLES.OWNER, label: 'Owner' },
      { value: ORG_ROLES.MANAGER, label: 'Manager' },
      { value: ORG_ROLES.MEMBER, label: 'Member' }
    ];
  }
  
  const userOrgRole = getUserOrgRole(user);
  
  // Owners can invite managers and members
  if (userOrgRole === ORG_ROLES.OWNER) {
    return [
      { value: ORG_ROLES.MANAGER, label: 'Manager' },
      { value: ORG_ROLES.MEMBER, label: 'Member' }
    ];
  }
  
  // Managers can only invite members
  if (userOrgRole === ORG_ROLES.MANAGER) {
    return [
      { value: ORG_ROLES.MEMBER, label: 'Member' }
    ];
  }
  
  // Members cannot invite anyone
  return [];
}

/**
 * Get default role for invitations based on current user
 * @param {object} user - The current user object
 * @returns {string} - Default role value
 */
export function getDefaultInviteRole(user) {
  const invitableRoles = getInvitableRoles(user);
  // Return the first available role (most restricted option)
  return invitableRoles.length > 0 ? invitableRoles[0].value : ORG_ROLES.MEMBER;
}