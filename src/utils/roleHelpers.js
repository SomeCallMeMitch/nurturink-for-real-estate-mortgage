/**
 * Role hierarchy and permission helpers for NurturInk
 * 
 * This module provides centralized role checking functions to ensure
 * consistent permission enforcement across the application.
 * 
 * Role Structure:
 * - orgRole: Custom field for organization-specific roles ('owner', 'manager', 'member')
 * - appRole: Platform-managed field (kept for backward compatibility)
 * - isOrgOwner: Boolean flag (kept for backward compatibility)
 */

// =============================================================================
// ROLE CONSTANTS
// =============================================================================

/**
 * Organization role values (custom orgRole field)
 */
export const ORG_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  MEMBER: 'member',
};

/**
 * Legacy appRole values (platform-managed, kept for backward compatibility)
 */
export const APP_ROLES = {
  SUPER_ADMIN: 'super_admin',
  WHITELABEL_PARTNER: 'whitelabel_partner',
  ORGANIZATION_OWNER: 'organization_owner',
  SALES_REP: 'sales_rep',
};

// =============================================================================
// ROLE CHECK FUNCTIONS
// =============================================================================

/**
 * Check if user is a super admin
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isSuperAdmin(user) {
  if (!user) return false;
  return user.appRole === APP_ROLES.SUPER_ADMIN;
}

/**
 * Check if user is the actual organization owner
 * This is the person who created/owns the organization.
 * Only ONE person per organization should have this.
 * 
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isOrgOwner(user) {
  if (!user) return false;
  // Check new orgRole field first, then fall back to legacy checks
  if (user.orgRole === ORG_ROLES.OWNER) return true;
  // Legacy compatibility
  return user.isOrgOwner === true || user.appRole === APP_ROLES.ORGANIZATION_OWNER;
}

/**
 * Check if user is an organization manager
 * Managers have admin-like permissions but cannot delete org or promote to manager.
 * 
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isOrgManager(user) {
  if (!user) return false;
  return user.orgRole === ORG_ROLES.MANAGER;
}

/**
 * Check if user has organization admin privileges
 * This includes both owners AND managers.
 * Use this for most admin permission checks (allocate credits, manage templates, etc.)
 * 
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isOrgAdmin(user) {
  if (!user) return false;
  return isOrgOwner(user) || isOrgManager(user);
}

/**
 * Check if user has any elevated privileges (super admin or org admin)
 * 
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function hasAdminPrivileges(user) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

/**
 * Check if user is a regular team member (sales rep)
 * 
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isTeamMember(user) {
  if (!user) return false;
  if (user.orgRole === ORG_ROLES.MEMBER) return true;
  // Legacy compatibility
  return user.appRole === APP_ROLES.SALES_REP && !user.isOrgOwner;
}

// =============================================================================
// PERMISSION CHECK FUNCTIONS
// =============================================================================

/**
 * Check if user can allocate credits to team members
 * Requires: org owner, org manager, or super admin
 * 
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canAllocateCredits(user) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

/**
 * Check if user can purchase credits for the company pool
 * Requires: org owner, org manager, or super admin
 * 
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canPurchaseCompanyCredits(user) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

/**
 * Check if user can manage team members (invite, remove, change roles)
 * Requires: org owner, org manager, or super admin
 * 
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canManageTeam(user) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

/**
 * Check if user can create/edit organization templates
 * Requires: org owner, org manager, or super admin
 * 
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canManageOrgTemplates(user) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

/**
 * Check if user can edit organization settings
 * Requires: org owner, org manager, or super admin
 * 
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canEditOrgSettings(user) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

/**
 * Check if user can promote someone to manager
 * Requires: org owner or super admin (managers cannot promote)
 * 
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canPromoteToManager(user) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgOwner(user);
}

/**
 * Check if user can delete the organization
 * Requires: org owner or super admin (managers cannot delete)
 * 
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canDeleteOrganization(user) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgOwner(user);
}

/**
 * Check if currentUser can manage targetUser
 * - Super admins can manage anyone
 * - Org owners can manage managers and members in their org
 * - Org managers can only manage members in their org
 * 
 * @param {Object} currentUser - The user performing the action
 * @param {Object} targetUser - The user being managed
 * @returns {boolean}
 */
export function canManageUser(currentUser, targetUser) {
  if (!currentUser || !targetUser) return false;
  
  // Super admins can manage anyone
  if (isSuperAdmin(currentUser)) return true;
  
  // Can't manage yourself
  if (currentUser.id === targetUser.id) return false;
  
  // Must be in the same organization
  if (currentUser.orgId !== targetUser.orgId) return false;
  
  // Org owners can manage anyone in their org
  if (isOrgOwner(currentUser)) return true;
  
  // Org managers can only manage regular members
  if (isOrgManager(currentUser)) {
    return isTeamMember(targetUser);
  }
  
  return false;
}

/**
 * Check if currentUser can change targetUser's role to newRole
 * 
 * @param {Object} currentUser - The user performing the action
 * @param {Object} targetUser - The user whose role is being changed
 * @param {string} newRole - The new orgRole value
 * @returns {boolean}
 */
export function canChangeUserRole(currentUser, targetUser, newRole) {
  if (!currentUser || !targetUser || !newRole) return false;
  
  // Super admins can change any role
  if (isSuperAdmin(currentUser)) return true;
  
  // Can't change your own role
  if (currentUser.id === targetUser.id) return false;
  
  // Must be in the same organization
  if (currentUser.orgId !== targetUser.orgId) return false;
  
  // Org owners can promote to manager or demote to member
  if (isOrgOwner(currentUser)) {
    return [ORG_ROLES.MANAGER, ORG_ROLES.MEMBER].includes(newRole);
  }
  
  // Org managers can only change between member roles (not promote to manager)
  if (isOrgManager(currentUser)) {
    // Managers can't promote anyone to manager or owner
    if (newRole === ORG_ROLES.MANAGER || newRole === ORG_ROLES.OWNER) return false;
    // Managers can only manage regular members
    return isTeamMember(targetUser);
  }
  
  return false;
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Get display name for an orgRole value
 * 
 * @param {string} orgRole - The orgRole value
 * @returns {string} Human-readable role name
 */
export function getOrgRoleDisplayName(orgRole) {
  const displayNames = {
    [ORG_ROLES.OWNER]: 'Owner',
    [ORG_ROLES.MANAGER]: 'Manager',
    [ORG_ROLES.MEMBER]: 'Member',
  };
  return displayNames[orgRole] || orgRole || 'Member';
}

/**
 * Get display name for a user's role (handles legacy appRole too)
 * 
 * @param {Object} user - User object
 * @returns {string} Human-readable role name
 */
export function getUserRoleDisplayName(user) {
  if (!user) return 'Unknown';
  
  // Check super admin first
  if (isSuperAdmin(user)) return 'Super Admin';
  
  // Check orgRole
  if (user.orgRole) {
    return getOrgRoleDisplayName(user.orgRole);
  }
  
  // Legacy fallback
  if (user.isOrgOwner || user.appRole === APP_ROLES.ORGANIZATION_OWNER) {
    return 'Owner';
  }
  
  if (user.appRole === APP_ROLES.SALES_REP) {
    return 'Member';
  }
  
  return 'Member';
}

/**
 * Get badge variant for a role (for UI styling)
 * 
 * @param {Object} user - User object
 * @returns {string} Badge variant name
 */
export function getRoleBadgeVariant(user) {
  if (!user) return 'secondary';
  
  if (isSuperAdmin(user)) return 'destructive';
  if (isOrgOwner(user)) return 'default';
  if (isOrgManager(user)) return 'outline';
  return 'secondary';
}

/**
 * Get available roles for team invitations based on inviter's role
 * 
 * @param {Object} inviter - The user sending the invitation
 * @returns {Array} Array of { value, label } objects for role options
 */
export function getInvitableRoles(inviter) {
  if (!inviter) return [];
  
  if (isSuperAdmin(inviter)) {
    return [
      { value: ORG_ROLES.MEMBER, label: 'Member' },
      { value: ORG_ROLES.MANAGER, label: 'Manager' },
      { value: ORG_ROLES.OWNER, label: 'Owner' },
    ];
  }
  
  if (isOrgOwner(inviter)) {
    return [
      { value: ORG_ROLES.MEMBER, label: 'Member' },
      { value: ORG_ROLES.MANAGER, label: 'Manager' },
    ];
  }
  
  if (isOrgManager(inviter)) {
    return [
      { value: ORG_ROLES.MEMBER, label: 'Member' },
    ];
  }
  
  return [];
}

/**
 * Get available roles for changing a user's role
 * 
 * @param {Object} currentUser - The user performing the change
 * @param {Object} targetUser - The user whose role is being changed
 * @returns {Array} Array of { value, label } objects for role options
 */
export function getAssignableRoles(currentUser, targetUser) {
  if (!currentUser || !targetUser) return [];
  
  // Can't change your own role
  if (currentUser.id === targetUser.id) return [];
  
  if (isSuperAdmin(currentUser)) {
    return [
      { value: ORG_ROLES.MEMBER, label: 'Member' },
      { value: ORG_ROLES.MANAGER, label: 'Manager' },
    ];
  }
  
  if (isOrgOwner(currentUser)) {
    // Owners can promote to manager or demote to member
    return [
      { value: ORG_ROLES.MEMBER, label: 'Member' },
      { value: ORG_ROLES.MANAGER, label: 'Manager' },
    ];
  }
  
  // Managers can't change roles
  return [];
}
