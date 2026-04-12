/**
 * Role hierarchy and permission helpers for NurturInk
 * @updated 2026-01-24
 * 
 * This module provides centralized role checking functions to ensure
 * consistent permission enforcement across the application.
 * 
 * Role Structure:
 * - UserProfile entity stores orgRole ('owner', 'manager', 'member')
 * - User entity has legacy fields (appRole, isOrgOwner) for backward compatibility
 * - Frontend receives merged user+profile data from context
 * 
 * NOTE: This file should NOT import base44 directly. 
 * Any async database operations should be done in the components that use these helpers.
 */

// =============================================================================
// ROLE CONSTANTS
// =============================================================================

export const ORG_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  MEMBER: 'member',
};

export const APP_ROLES = {
  SUPER_ADMIN: 'super_admin',
  WHITELABEL_PARTNER: 'whitelabel_partner',
  ORGANIZATION_OWNER: 'organization_owner',
  ORGANIZATION_MANAGER: 'organization_manager',
  SALES_REP: 'sales_rep',
};

export const ROLE_LABELS = {
  [ORG_ROLES.OWNER]: 'Owner',
  [ORG_ROLES.MANAGER]: 'Manager',
  [ORG_ROLES.MEMBER]: 'Member',
};

// =============================================================================
// ROLE EXTRACTION FUNCTIONS
// =============================================================================

/**
 * Get orgRole from user object (may have profile merged in)
 * @param {Object} user - User object (may have profile merged in)
 * @param {Object} profile - Optional separate UserProfile object
 * @returns {string|null} orgRole value
 */
export function getOrgRole(user, profile = null) {
  // Check profile first
  if (profile?.orgRole) return profile.orgRole;
  // Check if profile is merged into user
  if (user?.userProfile?.orgRole) return user.userProfile.orgRole;
  // Check user object directly (for backward compatibility)
  if (user?.orgRole) return user.orgRole;
  // Legacy fallback
  if (user?.isOrgOwner || user?.appRole === APP_ROLES.ORGANIZATION_OWNER) {
    return ORG_ROLES.OWNER;
  }
  if (user?.appRole === APP_ROLES.ORGANIZATION_MANAGER) {
    return ORG_ROLES.MANAGER;
  }
  return ORG_ROLES.MEMBER;
}

// =============================================================================
// ROLE CHECK FUNCTIONS
// =============================================================================

/**
 * Check if user is a super admin.
 * PHASE 2 / BATCH 4 / F-01: Removed user.role === 'admin' fallback.
 * Canonical source: user.appRole === 'super_admin' only.
 * user.role is a Base44 platform field and must not be used for app-level gating.
 */
export function isSuperAdmin(user) {
  if (!user) return false;
  return user.appRole === APP_ROLES.SUPER_ADMIN;
}

/**
 * Check if user is the organization owner
 */
export function isOrgOwner(user, profile = null) {
  if (!user) return false;
  const role = getOrgRole(user, profile);
  if (role === ORG_ROLES.OWNER) return true;
  // Legacy compatibility
  return user.isOrgOwner === true || user.appRole === APP_ROLES.ORGANIZATION_OWNER;
}

/**
 * Check if user is an organization manager
 */
export function isOrgManager(user, profile = null) {
  if (!user) return false;
  const role = getOrgRole(user, profile);
  return role === ORG_ROLES.MANAGER || user.appRole === APP_ROLES.ORGANIZATION_MANAGER;
}

/**
 * Check if user has organization admin privileges (owner OR manager)
 */
export function isOrgAdmin(user, profile = null) {
  if (!user) return false;
  return isOrgOwner(user, profile) || isOrgManager(user, profile);
}

/**
 * Check if user has any elevated privileges
 */
export function hasAdminPrivileges(user, profile = null) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user, profile);
}

/**
 * Check if user is a regular team member
 */
export function isTeamMember(user, profile = null) {
  if (!user) return false;
  const role = getOrgRole(user, profile);
  if (role === ORG_ROLES.MEMBER) return true;
  // Legacy compatibility
  return user.appRole === APP_ROLES.SALES_REP && !user.isOrgOwner;
}

// =============================================================================
// PERMISSION CHECK FUNCTIONS
// =============================================================================

export function canAllocateCredits(user, profile = null) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user, profile);
}

export function canPurchaseCompanyCredits(user, profile = null) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user, profile);
}

export function canManageTeam(user, profile = null) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user, profile);
}

export function canManageOrgTemplates(user, profile = null) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user, profile);
}

export function canEditOrgSettings(user, profile = null) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user, profile);
}

export function canPromoteToManager(user, profile = null) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgOwner(user, profile);
}

export function canPromoteToOwner(user) {
  if (!user) return false;
  return isSuperAdmin(user);
}

export function canDeleteOrganization(user, profile = null) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgOwner(user, profile);
}

export function canManageUser(currentUser, targetUser, currentProfile = null, targetProfile = null) {
  if (!currentUser || !targetUser) return false;
  if (isSuperAdmin(currentUser)) return true;
  if (currentUser.id === targetUser.id) return false;
  if (currentUser.orgId !== targetUser.orgId) return false;
  if (isOrgOwner(currentUser, currentProfile)) return true;
  if (isOrgManager(currentUser, currentProfile)) {
    return isTeamMember(targetUser, targetProfile);
  }
  return false;
}

export function canChangeUserRole(currentUser, targetUser, newRole, currentProfile = null) {
  if (!currentUser || !targetUser || !newRole) return false;
  if (isSuperAdmin(currentUser)) return true;
  if (currentUser.id === targetUser.id) return false;
  if (currentUser.orgId !== targetUser.orgId) return false;
  if (isOrgOwner(currentUser, currentProfile)) {
    return [ORG_ROLES.MANAGER, ORG_ROLES.MEMBER].includes(newRole);
  }
  return false;
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

export function getOrgRoleDisplayName(orgRole) {
  return ROLE_LABELS[orgRole] || orgRole || 'Member';
}

export function getUserRoleDisplayName(user, profile = null) {
  if (!user) return 'Unknown';
  if (isSuperAdmin(user)) return 'Super Admin';
  
  const role = getOrgRole(user, profile);
  if (role) return getOrgRoleDisplayName(role);
  
  // Legacy fallback
  if (user.isOrgOwner || user.appRole === APP_ROLES.ORGANIZATION_OWNER) return 'Owner';
  if (user.appRole === APP_ROLES.ORGANIZATION_MANAGER) return 'Manager';
  if (user.appRole === APP_ROLES.SALES_REP) return 'Member';
  return 'Member';
}

export function getRoleBadgeVariant(user, profile = null) {
  if (!user) return 'secondary';
  if (isSuperAdmin(user)) return 'destructive';
  if (isOrgOwner(user, profile)) return 'default';
  if (isOrgManager(user, profile)) return 'outline';
  return 'secondary';
}

/**
 * Get the list of roles that a user can invite
 * Returns array of { value, label } objects for dropdown
 */
export function getInvitableRoles(inviter, profile = null) {
  if (!inviter) return [];
  
  if (isSuperAdmin(inviter)) {
    return [
      { value: ORG_ROLES.MEMBER, label: 'Member' },
      { value: ORG_ROLES.MANAGER, label: 'Manager' },
      { value: ORG_ROLES.OWNER, label: 'Owner' },
    ];
  }
  
  if (isOrgOwner(inviter, profile)) {
    // Owners can invite managers and members, but NOT other owners
    return [
      { value: ORG_ROLES.MEMBER, label: 'Member' },
      { value: ORG_ROLES.MANAGER, label: 'Manager' },
    ];
  }
  
  if (isOrgManager(inviter, profile)) {
    // Managers can only invite members
    return [
      { value: ORG_ROLES.MEMBER, label: 'Member' },
    ];
  }
  
  return [];
}

/**
 * Get the list of roles as simple string array
 */
export function getInvitableRoleValues(inviter, profile = null) {
  return getInvitableRoles(inviter, profile).map(r => r.value);
}

/**
 * Check if a user can assign a specific role
 */
export function canAssignRole(currentUser, targetRole, profile = null) {
  const invitableRoles = getInvitableRoleValues(currentUser, profile);
  return invitableRoles.includes(targetRole);
}

export function getAssignableRoles(currentUser, targetUser, currentProfile = null) {
  if (!currentUser || !targetUser) return [];
  if (currentUser.id === targetUser.id) return [];
  
  if (isSuperAdmin(currentUser)) {
    return [
      { value: ORG_ROLES.MEMBER, label: 'Member' },
      { value: ORG_ROLES.MANAGER, label: 'Manager' },
      { value: ORG_ROLES.OWNER, label: 'Owner' },
    ];
  }
  
  if (isOrgOwner(currentUser, currentProfile)) {
    return [
      { value: ORG_ROLES.MEMBER, label: 'Member' },
      { value: ORG_ROLES.MANAGER, label: 'Manager' },
    ];
  }
  
  return [];
}