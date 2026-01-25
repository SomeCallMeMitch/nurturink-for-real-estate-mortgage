/**
 * Role helpers for NurturInk backend functions
 * 
 * IMPORTANT: This file must NOT import base44 globally.
 * All async functions that need database access must receive the base44 client as a parameter.
 * This is required for Deno compatibility in Base44 backend functions.
 */

// Organization role constants (new system using UserProfile entity)
export const ORG_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  MEMBER: 'member'
} as const;

// Legacy app role constants (for backward compatibility)
export const APP_ROLES = {
  SUPER_ADMIN: 'super_admin',
  WHITELABEL_PARTNER: 'whitelabel_partner',
  ORGANIZATION_OWNER: 'organization_owner',
  ORGANIZATION_MANAGER: 'organization_manager',
  SALES_REP: 'sales_rep'
} as const;

// Role display names
export const ROLE_LABELS: Record<string, string> = {
  [ORG_ROLES.OWNER]: 'Owner',
  [ORG_ROLES.MANAGER]: 'Manager',
  [ORG_ROLES.MEMBER]: 'Member'
};

/**
 * Get display name for an org role
 */
export function getOrgRoleDisplayName(orgRole: string): string {
  return ROLE_LABELS[orgRole] || orgRole;
}

/**
 * Map new orgRole to legacy appRole for backward compatibility
 */
export function mapOrgRoleToLegacyAppRole(orgRole: string): string {
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

/**
 * Map legacy appRole to new orgRole
 */
export function mapLegacyAppRoleToOrgRole(appRole: string, isOrgOwner?: boolean): string {
  if (isOrgOwner === true || appRole === APP_ROLES.ORGANIZATION_OWNER) {
    return ORG_ROLES.OWNER;
  }
  if (appRole === APP_ROLES.ORGANIZATION_MANAGER) {
    return ORG_ROLES.MANAGER;
  }
  return ORG_ROLES.MEMBER;
}

/**
 * Check if user is a super admin (platform level)
 * This is a sync function - no database access needed
 */
export function isSuperAdmin(user: any): boolean {
  if (!user) return false;
  return user.appRole === APP_ROLES.SUPER_ADMIN || user.role === 'admin';
}

/**
 * Check if user is the organization owner
 * Uses both legacy fields and new UserProfile if available
 */
export function isOrgOwner(user: any): boolean {
  if (!user) return false;
  // Check new orgRole first (from UserProfile)
  if (user.orgRole === ORG_ROLES.OWNER) return true;
  // Fall back to legacy fields
  return user.isOrgOwner === true || user.appRole === APP_ROLES.ORGANIZATION_OWNER;
}

/**
 * Check if user is an organization manager
 */
export function isOrgManager(user: any): boolean {
  if (!user) return false;
  // Check new orgRole first
  if (user.orgRole === ORG_ROLES.MANAGER) return true;
  // Fall back to legacy field
  return user.appRole === APP_ROLES.ORGANIZATION_MANAGER;
}

/**
 * Check if user has org admin privileges (owner OR manager)
 * Can allocate credits, manage templates, edit org settings
 */
export function isOrgAdmin(user: any): boolean {
  if (!user) return false;
  return isOrgOwner(user) || isOrgManager(user);
}

/**
 * Check if user can manage team members
 * Super admins, owners, and managers can manage team
 */
export function canManageTeam(user: any): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

/**
 * Check if user can promote others to manager role
 * Only owners and super admins can do this
 */
export function canPromoteToManager(user: any): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgOwner(user);
}

/**
 * Check if user can promote others to owner role
 * Only super admins can do this
 */
export function canPromoteToOwner(user: any): boolean {
  if (!user) return false;
  return isSuperAdmin(user);
}

/**
 * Get the list of roles that a user can invite/assign
 */
export function getInvitableRoles(user: any): string[] {
  if (!user) return [];
  
  if (isSuperAdmin(user)) {
    // Super admins can invite all roles
    return [ORG_ROLES.OWNER, ORG_ROLES.MANAGER, ORG_ROLES.MEMBER];
  }
  
  if (isOrgOwner(user)) {
    // Owners can invite managers and members (not other owners)
    return [ORG_ROLES.MANAGER, ORG_ROLES.MEMBER];
  }
  
  if (isOrgManager(user)) {
    // Managers can only invite members
    return [ORG_ROLES.MEMBER];
  }
  
  return [];
}

/**
 * Check if a user can assign a specific role
 */
export function canAssignRole(currentUser: any, targetRole: string): boolean {
  const invitableRoles = getInvitableRoles(currentUser);
  return invitableRoles.includes(targetRole);
}

/**
 * Get or create UserProfile for a user (async - requires base44 client)
 * @param base44 - The base44 client from createClientFromRequest
 * @param userId - The user's ID
 * @param orgId - The organization ID
 * @param orgRole - The role to assign (defaults to 'member')
 */
export async function upsertUserProfile(
  base44: any,
  userId: string,
  orgId: string,
  orgRole: string = ORG_ROLES.MEMBER
): Promise<any> {
  // Check if profile already exists
  const existingProfiles = await base44.asServiceRole.entities.UserProfile.filter({
    userId: userId,
    orgId: orgId
  });
  
  if (existingProfiles && existingProfiles.length > 0) {
    // Update existing profile
    const profile = existingProfiles[0];
    if (profile.orgRole !== orgRole) {
      await base44.asServiceRole.entities.UserProfile.update(profile.id, {
        orgRole: orgRole
      });
      return { ...profile, orgRole };
    }
    return profile;
  }
  
  // Create new profile
  const newProfile = await base44.asServiceRole.entities.UserProfile.create({
    userId: userId,
    orgId: orgId,
    orgRole: orgRole
  });
  
  return newProfile;
}

/**
 * Get a user's UserProfile for an organization (async - requires base44 client)
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
  
  return profiles && profiles.length > 0 ? profiles[0] : null;
}

/**
 * Get a user's orgRole, checking UserProfile first then falling back to legacy fields
 */
export async function getUserOrgRole(
  base44: any,
  user: any
): Promise<string> {
  if (!user || !user.orgId) {
    return ORG_ROLES.MEMBER;
  }
  
  // Try to get from UserProfile first
  const profile = await getUserProfile(base44, user.id, user.orgId);
  if (profile) {
    return profile.orgRole;
  }
  
  // Fall back to legacy fields
  return mapLegacyAppRoleToOrgRole(user.appRole, user.isOrgOwner);
}
