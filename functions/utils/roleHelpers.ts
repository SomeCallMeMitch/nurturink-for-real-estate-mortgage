/**
 * Role hierarchy and permission helpers for NurturInk (Backend)
 * 
 * This module provides centralized role checking functions to ensure
 * consistent permission enforcement across backend functions.
 * 
 * Role Structure:
 * - UserProfile.orgRole: The source of truth for organization-specific roles
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
} as const;

/**
 * Legacy appRole values (platform-managed, kept for backward compatibility)
 */
export const APP_ROLES = {
  SUPER_ADMIN: 'super_admin',
  WHITELABEL_PARTNER: 'whitelabel_partner',
  ORGANIZATION_OWNER: 'organization_owner',
  SALES_REP: 'sales_rep',
} as const;

// Type definitions
type OrgRole = typeof ORG_ROLES[keyof typeof ORG_ROLES];
type AppRole = typeof APP_ROLES[keyof typeof APP_ROLES];

interface User {
  id: string;
  orgId?: string;
  orgRole?: OrgRole;
  appRole?: AppRole | string;
  isOrgOwner?: boolean;
  [key: string]: any;
}

interface UserProfile {
  id?: string;
  userId: string;
  orgId: string;
  orgRole: OrgRole;
}

// =============================================================================
// DATABASE INTERACTION HELPERS
// =============================================================================

/**
 * Create or update a UserProfile record
 * Ensures 1:1 relationship between User and UserProfile for an org
 */
export async function upsertUserProfile(base44: any, userId: string, orgId: string, role: OrgRole): Promise<UserProfile> {
  // Check if profile exists
  const profiles = await base44.asServiceRole.entities.UserProfile.filter({
    userId: userId,
    orgId: orgId
  });
  
  if (profiles.length > 0) {
    // Update existing
    const profile = profiles[0];
    if (profile.orgRole !== role) {
      const updated = await base44.asServiceRole.entities.UserProfile.update(profile.id, {
        orgRole: role
      });
      return updated;
    }
    return profile;
  } else {
    // Create new
    const created = await base44.asServiceRole.entities.UserProfile.create({
      userId: userId,
      orgId: orgId,
      orgRole: role
    });
    return created;
  }
}

/**
 * Get UserProfile for a user in a specific organization
 */
export async function getUserProfileForOrg(base44: any, userId: string, orgId: string): Promise<UserProfile | null> {
  const profiles = await base44.asServiceRole.entities.UserProfile.filter({
    userId: userId,
    orgId: orgId
  });
  return profiles.length > 0 ? profiles[0] : null;
}

/**
 * Delete UserProfile for a user (e.g. when removing from org)
 */
export async function deleteUserProfile(base44: any, userId: string, orgId: string): Promise<boolean> {
  const profiles = await base44.asServiceRole.entities.UserProfile.filter({
    userId: userId,
    orgId: orgId
  });
  
  if (profiles.length > 0) {
    await base44.asServiceRole.entities.UserProfile.delete(profiles[0].id);
    return true;
  }
  return false;
}

/**
 * Async helper to get effective role including DB lookup
 * Returns the OrgRole
 */
export async function getEffectiveOrgRole(base44: any, user: User): Promise<OrgRole> {
  if (!user.orgId) return ORG_ROLES.MEMBER;
  
  // Try to fetch profile
  const profile = await getUserProfileForOrg(base44, user.id, user.orgId);
  if (profile) return profile.orgRole;
  
  // Fallback to legacy fields
  if (user.isOrgOwner || user.appRole === APP_ROLES.ORGANIZATION_OWNER) return ORG_ROLES.OWNER;
  if (user.appRole === 'organization_manager') return ORG_ROLES.MANAGER;
  
  return ORG_ROLES.MEMBER;
}

// =============================================================================
// ROLE CHECK FUNCTIONS (SYNC - Operate on User object mostly)
// Note: These now accept an optional 'profile' object if available
// =============================================================================

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.appRole === APP_ROLES.SUPER_ADMIN;
}

/**
 * Check if user is the actual organization owner
 */
export function isOrgOwner(user: User | null | undefined, profile?: UserProfile | null): boolean {
  if (!user) return false;
  
  // Check profile first
  if (profile && profile.orgRole === ORG_ROLES.OWNER) return true;
  
  // Legacy compatibility
  return user.isOrgOwner === true || user.appRole === APP_ROLES.ORGANIZATION_OWNER;
}

/**
 * Check if user is an organization manager
 */
export function isOrgManager(user: User | null | undefined, profile?: UserProfile | null): boolean {
  if (!user) return false;
  
  // Check profile first
  if (profile && profile.orgRole === ORG_ROLES.MANAGER) return true;
  
  return false; // Legacy managers handled via appRole usually, but strictly speaking only via profile now or specific appRole
}

/**
 * Check if user has organization admin privileges (Owner OR Manager)
 */
export function isOrgAdmin(user: User | null | undefined, profile?: UserProfile | null): boolean {
  if (!user) return false;
  return isOrgOwner(user, profile) || isOrgManager(user, profile);
}

/**
 * Check if user has any elevated privileges (super admin or org admin)
 */
export function hasAdminPrivileges(user: User | null | undefined, profile?: UserProfile | null): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user, profile);
}

/**
 * Check if user is a regular team member
 */
export function isTeamMember(user: User | null | undefined, profile?: UserProfile | null): boolean {
  if (!user) return false;
  
  if (profile && profile.orgRole === ORG_ROLES.MEMBER) return true;
  
  // Legacy compatibility
  return user.appRole === APP_ROLES.SALES_REP && !user.isOrgOwner;
}

// =============================================================================
// PERMISSION CHECK FUNCTIONS
// =============================================================================

export function canAllocateCredits(user: User | null | undefined, profile?: UserProfile | null): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user, profile);
}

export function canPurchaseCompanyCredits(user: User | null | undefined, profile?: UserProfile | null): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user, profile);
}

export function canManageTeam(user: User | null | undefined, profile?: UserProfile | null): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user, profile);
}

export function canPromoteToManager(user: User | null | undefined, profile?: UserProfile | null): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgOwner(user, profile);
}

export function canDeleteOrganization(user: User | null | undefined, profile?: UserProfile | null): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgOwner(user, profile);
}

/**
 * Check if currentUser can manage targetUser
 */
export function canManageUser(
  currentUser: User | null | undefined, 
  targetUser: User | null | undefined,
  currentUserProfile?: UserProfile | null,
  targetUserProfile?: UserProfile | null
): boolean {
  if (!currentUser || !targetUser) return false;
  
  // Super admins can manage anyone
  if (isSuperAdmin(currentUser)) return true;
  
  // Can't manage yourself
  if (currentUser.id === targetUser.id) return false;
  
  // Must be in the same organization
  if (currentUser.orgId !== targetUser.orgId) return false;
  
  // Org owners can manage anyone in their org
  if (isOrgOwner(currentUser, currentUserProfile)) return true;
  
  // Org managers can only manage regular members
  if (isOrgManager(currentUser, currentUserProfile)) {
    return isTeamMember(targetUser, targetUserProfile);
  }
  
  return false;
}

/**
 * Check if currentUser can change targetUser's role to newRole
 */
export function canChangeUserRole(
  currentUser: User | null | undefined, 
  targetUser: User | null | undefined, 
  newRole: string,
  currentUserProfile?: UserProfile | null
): boolean {
  if (!currentUser || !targetUser || !newRole) return false;
  
  // Super admins can change any role
  if (isSuperAdmin(currentUser)) return true;
  
  // Can't change your own role
  if (currentUser.id === targetUser.id) return false;
  
  // Must be in the same organization
  if (currentUser.orgId !== targetUser.orgId) return false;
  
  // Org owners can promote to manager or demote to member
  if (isOrgOwner(currentUser, currentUserProfile)) {
    return [ORG_ROLES.MANAGER, ORG_ROLES.MEMBER].includes(newRole as OrgRole);
  }
  
  // Org managers can only change between member roles (not promote to manager)
  // Actually managers typically can't change roles at all in this system, only invite
  // But if they could, they definitely can't promote to manager/owner
  if (isOrgManager(currentUser, currentUserProfile)) {
    return false; // Managers cannot change roles of existing users in this design
  }
  
  return false;
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

export function getOrgRoleDisplayName(orgRole: string | undefined): string {
  const displayNames: Record<string, string> = {
    [ORG_ROLES.OWNER]: 'Owner',
    [ORG_ROLES.MANAGER]: 'Manager',
    [ORG_ROLES.MEMBER]: 'Member',
  };
  return displayNames[orgRole || ''] || orgRole || 'Member';
}

export function mapLegacyRoleToOrgRole(legacyRole: string): OrgRole {
  if (legacyRole === 'organization_owner' || legacyRole === 'admin') {
    return ORG_ROLES.OWNER;
  }
  if (legacyRole === 'organization_manager' || legacyRole === 'manager') {
    return ORG_ROLES.MANAGER;
  }
  return ORG_ROLES.MEMBER;
}

export function mapOrgRoleToLegacyAppRole(orgRole: OrgRole): string {
  if (orgRole === ORG_ROLES.OWNER) {
    return APP_ROLES.ORGANIZATION_OWNER;
  }
  return APP_ROLES.SALES_REP;
}