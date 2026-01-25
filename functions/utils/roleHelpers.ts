/**
 * Role helpers for NurturInk backend functions
 * @updated 2026-01-24
 * 
 * IMPORTANT: This file is for Deno backend functions.
 * It must NOT import base44 globally - async functions receive base44 as parameter.
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

// =============================================================================
// ROLE CHECK FUNCTIONS (Sync - no base44 needed)
// =============================================================================

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(user: any): boolean {
  if (!user) return false;
  return user.appRole === APP_ROLES.SUPER_ADMIN || user.role === 'admin';
}

/**
 * Check if user is an organization owner
 */
export function isOrgOwner(user: any): boolean {
  if (!user) return false;
  return user.isOrgOwner === true || user.appRole === APP_ROLES.ORGANIZATION_OWNER;
}

/**
 * Check if user is an organization manager
 */
export function isOrgManager(user: any): boolean {
  if (!user) return false;
  return user.appRole === APP_ROLES.ORGANIZATION_MANAGER;
}

/**
 * Check if user has organization admin privileges (owner OR manager)
 */
export function isOrgAdmin(user: any): boolean {
  if (!user) return false;
  return isOrgOwner(user) || isOrgManager(user);
}

/**
 * Map legacy appRole to new orgRole
 */
export function mapLegacyAppRoleToOrgRole(appRole: string, isOrgOwnerFlag?: boolean): string {
  if (isOrgOwnerFlag || appRole === APP_ROLES.ORGANIZATION_OWNER) {
    return ORG_ROLES.OWNER;
  }
  if (appRole === APP_ROLES.ORGANIZATION_MANAGER) {
    return ORG_ROLES.MANAGER;
  }
  return ORG_ROLES.MEMBER;
}

/**
 * Get display name for orgRole
 */
export function getOrgRoleDisplayName(orgRole: string): string {
  switch (orgRole) {
    case ORG_ROLES.OWNER: return 'Owner';
    case ORG_ROLES.MANAGER: return 'Manager';
    case ORG_ROLES.MEMBER: return 'Member';
    default: return orgRole || 'Member';
  }
}

// =============================================================================
// ASYNC FUNCTIONS (require base44 client as parameter)
// =============================================================================

/**
 * Get or create UserProfile for a user
 * @param base44 - The base44 client instance
 * @param userId - The user's ID
 * @param orgId - The organization ID
 * @param orgRole - Optional role to set if creating new profile
 */
export async function upsertUserProfile(
  base44: any,
  userId: string,
  orgId: string,
  orgRole?: string
): Promise<any> {
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

/**
 * Get UserProfile for a user
 * @param base44 - The base44 client instance
 * @param userId - The user's ID
 * @param orgId - The organization ID
 */
export async function getUserProfile(
  base44: any,
  userId: string,
  orgId: string
): Promise<any | null> {
  const profiles = await base44.asServiceRole.entities.UserProfile.filter({
    userId: userId,
    orgId: orgId
  });
  return profiles.length > 0 ? profiles[0] : null;
}

/**
 * Check if user can perform an action based on UserProfile
 * @param base44 - The base44 client instance
 * @param user - The user object
 * @param requiredRoles - Array of roles that can perform the action
 */
export async function checkUserPermission(
  base44: any,
  user: any,
  requiredRoles: string[]
): Promise<boolean> {
  if (!user || !user.orgId) return false;
  
  // Super admins can do everything
  if (isSuperAdmin(user)) return true;
  
  // Get user's profile
  const profile = await getUserProfile(base44, user.id, user.orgId);
  const orgRole = profile?.orgRole || mapLegacyAppRoleToOrgRole(user.appRole, user.isOrgOwner);
  
  return requiredRoles.includes(orgRole);
}
