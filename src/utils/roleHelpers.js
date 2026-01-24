/**
 * Role hierarchy and permission helpers for NurturInk
 * @updated 2026-01-23
 * 
 * This module provides centralized role checking functions to ensure
 * consistent permission enforcement across the application.
 * 
 * Role Structure:
 * - UserProfile entity stores orgRole ('owner', 'manager', 'member')
 * - User entity has legacy fields (appRole, isOrgOwner) for backward compatibility
 * - Frontend receives merged user+profile data from context
 */

import { base44 } from '@/api/base44Client';

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
  SALES_REP: 'sales_rep',
};

// =============================================================================
// USERPROFILE FETCH FUNCTIONS
// =============================================================================

/**
 * Fetch UserProfile for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} UserProfile or null
 */
export async function fetchUserProfile(userId) {
  try {
    const profiles = await base44.entities.UserProfile.filter({ userId });
    return profiles && profiles.length > 0 ? profiles[0] : null;
  } catch (error) {
    console.error('Error fetching UserProfile:', error);
    return null;
  }
}

/**
 * Fetch UserProfile for a user in a specific org
 * @param {string} userId - User ID
 * @param {string} orgId - Organization ID
 * @returns {Promise<Object|null>} UserProfile or null
 */
export async function fetchUserProfileForOrg(userId, orgId) {
  try {
    const profiles = await base44.entities.UserProfile.filter({ userId, orgId });
    return profiles && profiles.length > 0 ? profiles[0] : null;
  } catch (error) {
    console.error('Error fetching UserProfile for org:', error);
    return null;
  }
}

/**
 * Get orgRole from UserProfile or fall back to user object
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
  return null;
}

// =============================================================================
// ROLE CHECK FUNCTIONS
// =============================================================================

/**
 * Check if user is a super admin
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
  return role === ORG_ROLES.MANAGER;
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
  const displayNames = {
    [ORG_ROLES.OWNER]: 'Owner',
    [ORG_ROLES.MANAGER]: 'Manager',
    [ORG_ROLES.MEMBER]: 'Member',
  };
  return displayNames[orgRole] || orgRole || 'Member';
}

export function getUserRoleDisplayName(user, profile = null) {
  if (!user) return 'Unknown';
  if (isSuperAdmin(user)) return 'Super Admin';
  
  const role = getOrgRole(user, profile);
  if (role) return getOrgRoleDisplayName(role);
  
  // Legacy fallback
  if (user.isOrgOwner || user.appRole === APP_ROLES.ORGANIZATION_OWNER) return 'Owner';
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
    return [
      { value: ORG_ROLES.MEMBER, label: 'Member' },
      { value: ORG_ROLES.MANAGER, label: 'Manager' },
    ];
  }
  
  if (isOrgManager(inviter, profile)) {
    return [
      { value: ORG_ROLES.MEMBER, label: 'Member' },
    ];
  }
  
  return [];
}

export function getAssignableRoles(currentUser, targetUser, currentProfile = null) {
  if (!currentUser || !targetUser) return [];
  if (currentUser.id === targetUser.id) return [];
  
  if (isSuperAdmin(currentUser) || isOrgOwner(currentUser, currentProfile)) {
    return [
      { value: ORG_ROLES.MEMBER, label: 'Member' },
      { value: ORG_ROLES.MANAGER, label: 'Manager' },
    ];
  }
  
  return [];
}
