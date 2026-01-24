// components/utils/roleHelpers.js
// Frontend role checking utilities

import { base44 } from '@/api/base44Client';

// Constants
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
// DATA FETCHING HELPERS
// =============================================================================

/**
 * Fetch UserProfile for a user
 */
export async function fetchUserProfile(userId, orgId) {
  try {
    const profiles = await base44.entities.UserProfile.filter({
      userId: userId,
      orgId: orgId
    });
    return profiles.length > 0 ? profiles[0] : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Get effective org role from profile or user object
 */
export function getOrgRole(user, profile = null) {
  if (!user) return null;
  
  // Prefer profile source of truth
  if (profile && profile.orgRole) {
    return profile.orgRole;
  }
  
  // Fallback to user object (which might have orgRole from API join)
  if (user.orgRole) {
    return user.orgRole;
  }
  
  // Fallback to legacy fields
  if (user.isOrgOwner || user.appRole === APP_ROLES.ORGANIZATION_OWNER) {
    return ORG_ROLES.OWNER;
  }
  
  // Default
  return ORG_ROLES.MEMBER;
}

// =============================================================================
// PERMISSION CHECKS
// =============================================================================

export function isSuperAdmin(user) {
  return user?.appRole === APP_ROLES.SUPER_ADMIN;
}

export function isOrgOwner(user, profile = null) {
  const role = getOrgRole(user, profile);
  return role === ORG_ROLES.OWNER || isSuperAdmin(user);
}

export function isOrgManager(user, profile = null) {
  const role = getOrgRole(user, profile);
  return role === ORG_ROLES.MANAGER;
}

export function isOrgAdmin(user, profile = null) {
  const role = getOrgRole(user, profile);
  return role === ORG_ROLES.OWNER || role === ORG_ROLES.MANAGER || isSuperAdmin(user);
}

export function isTeamMember(user, profile = null) {
  const role = getOrgRole(user, profile);
  return role === ORG_ROLES.MEMBER;
}

// =============================================================================
// CAPABILITY CHECKS
// =============================================================================

export function canAllocateCredits(user, profile = null) {
  return isOrgAdmin(user, profile);
}

export function canManageTeam(user, profile = null) {
  return isOrgAdmin(user, profile);
}

export function canPromoteToManager(user, profile = null) {
  return isOrgOwner(user, profile);
}

export function canDeleteOrganization(user, profile = null) {
  return isOrgOwner(user, profile);
}

export function getRoleDisplayName(role) {
  const names = {
    [ORG_ROLES.OWNER]: 'Owner',
    [ORG_ROLES.MANAGER]: 'Manager',
    [ORG_ROLES.MEMBER]: 'Member',
  };
  return names[role] || role || 'Member';
}