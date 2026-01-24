/**
 * Role Helper Utilities for Frontend
 * 
 * These utilities provide consistent role checking across the frontend application.
 * Roles are stored in the UserProfile entity (1:1 with User) but synced to User object
 * properties for easy frontend access.
 * 
 * Role Hierarchy:
 * - owner: Full control of organization (only one per org)
 * - manager: Admin capabilities without ownership
 * - member: Regular team member (sales rep)
 */

import { base44 } from '@/api/base44Client';

// =============================================================================
// CONSTANTS
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
  SALES_REP: 'sales_rep',
};

// =============================================================================
// FETCH HELPERS
// =============================================================================

/**
 * Fetches the UserProfile for a given user ID
 * @param {string} userId 
 * @returns {Promise<Object|null>}
 */
export async function fetchUserProfile(userId) {
  try {
    const profiles = await base44.entities.UserProfile.filter({ userId });
    if (profiles && profiles.length > 0) {
      return profiles[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching UserProfile:', error);
    return null;
  }
}

/**
 * Fetches the UserProfile for a given user ID and org ID
 * @param {string} userId 
 * @param {string} orgId 
 * @returns {Promise<Object|null>}
 */
export async function fetchUserProfileForOrg(userId, orgId) {
  try {
    const profiles = await base44.entities.UserProfile.filter({ userId, orgId });
    if (profiles && profiles.length > 0) {
      return profiles[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching UserProfile for org:', error);
    return null;
  }
}

// =============================================================================
// ROLE CHECK FUNCTIONS (Sync - use User object with legacy fields)
// =============================================================================

/**
 * Check if user is a super admin
 * @param {Object} user 
 * @returns {boolean}
 */
export function isSuperAdmin(user) {
  if (!user) return false;
  return user.appRole === APP_ROLES.SUPER_ADMIN;
}

/**
 * Check if user is org owner
 * @param {Object} user 
 * @returns {boolean}
 */
export function isOrgOwner(user) {
  if (!user) return false;
  // Check new role field
  if (user.orgRole === ORG_ROLES.OWNER) return true;
  // Fallback to legacy fields
  return user.isOrgOwner === true || user.appRole === APP_ROLES.ORGANIZATION_OWNER;
}

/**
 * Check if user is org manager
 * @param {Object} user 
 * @returns {boolean}
 */
export function isOrgManager(user) {
  if (!user) return false;
  // Check new role field
  if (user.orgRole === ORG_ROLES.MANAGER) return true;
  // Fallback to legacy fields
  return user.appRole === 'organization_manager';
}

/**
 * Check if user is org admin (owner OR manager)
 * @param {Object} user 
 * @returns {boolean}
 */
export function isOrgAdmin(user) {
  if (!user) return false;
  return isOrgOwner(user) || isOrgManager(user);
}

/**
 * Check if user has any admin privileges (Super Admin or Org Admin)
 * @param {Object} user 
 * @returns {boolean}
 */
export function hasAdminPrivileges(user) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

/**
 * Check if user is a regular team member
 * @param {Object} user 
 * @returns {boolean}
 */
export function isTeamMember(user) {
  if (!user) return false;
  if (user.orgRole === ORG_ROLES.MEMBER) return true;
  return user.appRole === APP_ROLES.SALES_REP && !user.isOrgOwner;
}

// =============================================================================
// PERMISSION CHECK FUNCTIONS
// =============================================================================

export function canAllocateCredits(user) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

export function canPurchaseCompanyCredits(user) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

export function canManageTeam(user) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

export function canPromoteToManager(user) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgOwner(user);
}

export function canDeleteOrganization(user) {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgOwner(user);
}

export function canManageUser(currentUser, targetUser) {
  if (!currentUser || !targetUser) return false;
  if (isSuperAdmin(currentUser)) return true;
  if (currentUser.id === targetUser.id) return false;
  if (currentUser.orgId !== targetUser.orgId) return false;
  if (isOrgOwner(currentUser)) return true;
  if (isOrgManager(currentUser)) return isTeamMember(targetUser);
  return false;
}

export function canChangeUserRole(currentUser, targetUser, newRole) {
  if (!currentUser || !targetUser || !newRole) return false;
  if (isSuperAdmin(currentUser)) return true;
  if (currentUser.id === targetUser.id) return false;
  if (currentUser.orgId !== targetUser.orgId) return false;
  
  if (isOrgOwner(currentUser)) {
    return [ORG_ROLES.MANAGER, ORG_ROLES.MEMBER].includes(newRole);
  }
  
  if (isOrgManager(currentUser)) {
    if (newRole === ORG_ROLES.MANAGER || newRole === ORG_ROLES.OWNER) return false;
    return isTeamMember(targetUser);
  }
  
  return false;
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

export function getOrgRoleDisplayName(orgRole) {
  const displayNames = {
    [ORG_ROLES.OWNER]: 'Owner',
    [ORG_ROLES.MANAGER]: 'Manager',
    [ORG_ROLES.MEMBER]: 'Member',
  };
  return displayNames[orgRole] || orgRole || 'Member';
}

export function getUserRoleDisplayName(user) {
  if (!user) return 'Unknown';
  if (isSuperAdmin(user)) return 'Super Admin';
  if (user.orgRole) return getOrgRoleDisplayName(user.orgRole);
  if (user.isOrgOwner || user.appRole === APP_ROLES.ORGANIZATION_OWNER) return 'Owner';
  if (user.appRole === APP_ROLES.SALES_REP) return 'Member';
  return 'Member';
}

export function mapLegacyRoleToOrgRole(legacyRole) {
  if (legacyRole === 'organization_owner' || legacyRole === 'admin') return ORG_ROLES.OWNER;
  if (legacyRole === 'organization_manager' || legacyRole === 'manager') return ORG_ROLES.MANAGER;
  return ORG_ROLES.MEMBER;
}

export function mapOrgRoleToLegacyAppRole(orgRole) {
  if (orgRole === ORG_ROLES.OWNER) return APP_ROLES.ORGANIZATION_OWNER;
  return APP_ROLES.SALES_REP;
}

export function isValidRole(role) {
  return ['owner', 'manager', 'member'].includes(role);
}