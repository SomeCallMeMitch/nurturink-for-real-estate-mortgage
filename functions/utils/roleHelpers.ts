/**
 * Role Helper Utilities for Backend Functions
 * 
 * These utilities provide consistent role checking across all backend functions.
 * Roles are stored in the UserProfile entity (1:1 with User).
 * 
 * Role Hierarchy:
 * - owner: Full control of organization (only one per org)
 * - manager: Admin capabilities without ownership
 * - member: Regular team member (sales rep)
 * 
 * IMPORTANT: Async functions require the base44 client to be passed as parameter.
 * The client must be created per-request using createClientFromRequest(req).
 */

// =============================================================================
// CONSTANTS
// =============================================================================

export const ORG_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  MEMBER: 'member',
} as const;

export const APP_ROLES = {
  SUPER_ADMIN: 'super_admin',
  WHITELABEL_PARTNER: 'whitelabel_partner',
  ORGANIZATION_OWNER: 'organization_owner',
  SALES_REP: 'sales_rep',
} as const;

// =============================================================================
// TYPES
// =============================================================================

export type OrgRole = typeof ORG_ROLES[keyof typeof ORG_ROLES];
type AppRole = typeof APP_ROLES[keyof typeof APP_ROLES];

export interface UserProfile {
  id: string;
  userId: string;
  orgId: string;
  orgRole: OrgRole;
  isOrgOwner?: boolean;
}

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  orgId?: string;
  appRole?: AppRole | string;
  isOrgOwner?: boolean;
  orgRole?: OrgRole;
  [key: string]: any;
}

export interface RoleCheckResult {
  isOwner: boolean;
  isManager: boolean;
  isMember: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  orgRole: OrgRole | null;
  userProfile: UserProfile | null;
}

// Base44 client type (any for flexibility)
type Base44Client = any;

// =============================================================================
// USERPROFILE CRUD FUNCTIONS (Require base44 client)
// =============================================================================

/**
 * Fetches the UserProfile for a given user ID
 */
export async function getUserProfile(base44: Base44Client, userId: string): Promise<UserProfile | null> {
  try {
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ userId });
    if (profiles && profiles.length > 0) {
      return profiles[0] as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching UserProfile:', error);
    return null;
  }
}

/**
 * Fetches the UserProfile for a given user ID and org ID
 */
export async function getUserProfileForOrg(base44: Base44Client, userId: string, orgId: string): Promise<UserProfile | null> {
  try {
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ userId, orgId });
    if (profiles && profiles.length > 0) {
      return profiles[0] as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching UserProfile for org:', error);
    return null;
  }
}

/**
 * Creates or updates a UserProfile record
 */
export async function upsertUserProfile(
  base44: Base44Client,
  userId: string, 
  orgId: string, 
  orgRole: OrgRole
): Promise<UserProfile | null> {
  try {
    const existingProfile = await getUserProfileForOrg(base44, userId, orgId);
    
    if (existingProfile) {
      const updated = await base44.asServiceRole.entities.UserProfile.update(
        existingProfile.id,
        { orgRole, isOrgOwner: orgRole === 'owner' }
      );
      return updated as UserProfile;
    } else {
      const created = await base44.asServiceRole.entities.UserProfile.create({
        userId,
        orgId,
        orgRole,
        isOrgOwner: orgRole === 'owner'
      });
      return created as UserProfile;
    }
  } catch (error) {
    console.error('Error upserting UserProfile:', error);
    return null;
  }
}

/**
 * Deletes a UserProfile record
 */
export async function deleteUserProfile(base44: Base44Client, userId: string, orgId: string): Promise<boolean> {
  try {
    const profile = await getUserProfileForOrg(base44, userId, orgId);
    if (profile) {
      await base44.asServiceRole.entities.UserProfile.delete(profile.id);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting UserProfile:', error);
    return false;
  }
}

// =============================================================================
// ROLE CHECK FUNCTIONS (Async - require base44 client)
// =============================================================================

/**
 * Comprehensive role check for a user (async - fetches from UserProfile)
 */
export async function checkUserRoleAsync(base44: Base44Client, userId: string, orgId?: string): Promise<RoleCheckResult> {
  let userProfile: UserProfile | null = null;
  
  if (orgId) {
    userProfile = await getUserProfileForOrg(base44, userId, orgId);
  } else {
    userProfile = await getUserProfile(base44, userId);
  }
  
  const orgRole = userProfile?.orgRole || null;
  
  return {
    isOwner: orgRole === 'owner',
    isManager: orgRole === 'manager',
    isMember: orgRole === 'member' || orgRole === null,
    isAdmin: orgRole === 'owner' || orgRole === 'manager',
    isSuperAdmin: false,
    orgRole,
    userProfile
  };
}

/**
 * Check if user is an organization owner (async)
 */
export async function isOrgOwnerAsync(base44: Base44Client, userId: string, orgId?: string): Promise<boolean> {
  const result = await checkUserRoleAsync(base44, userId, orgId);
  return result.isOwner;
}

/**
 * Check if user is an organization manager (async)
 */
export async function isOrgManagerAsync(base44: Base44Client, userId: string, orgId?: string): Promise<boolean> {
  const result = await checkUserRoleAsync(base44, userId, orgId);
  return result.isManager;
}

/**
 * Check if user is an organization admin (owner OR manager) (async)
 */
export async function isOrgAdminAsync(base44: Base44Client, userId: string, orgId?: string): Promise<boolean> {
  const result = await checkUserRoleAsync(base44, userId, orgId);
  return result.isAdmin;
}

// =============================================================================
// ROLE CHECK FUNCTIONS (Sync - use User object, no base44 client needed)
// =============================================================================

/**
 * Check if user is a super admin (sync - uses User object)
 */
export function isSuperAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.appRole === APP_ROLES.SUPER_ADMIN;
}

/**
 * Check if user is org owner (sync - uses User object with legacy fields)
 */
export function isOrgOwner(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.orgRole === ORG_ROLES.OWNER) return true;
  return user.isOrgOwner === true || user.appRole === APP_ROLES.ORGANIZATION_OWNER;
}

/**
 * Check if user is org manager (sync - uses User object)
 */
export function isOrgManager(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.orgRole === ORG_ROLES.MANAGER;
}

/**
 * Check if user is org admin (sync - uses User object)
 */
export function isOrgAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return isOrgOwner(user) || isOrgManager(user);
}

/**
 * Check if user has any admin privileges
 */
export function hasAdminPrivileges(user: User | null | undefined): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

/**
 * Check if user is a regular team member
 */
export function isTeamMember(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.orgRole === ORG_ROLES.MEMBER) return true;
  return user.appRole === APP_ROLES.SALES_REP && !user.isOrgOwner;
}

// =============================================================================
// PERMISSION CHECK FUNCTIONS (Async - require base44 client)
// =============================================================================

/**
 * Check if user can allocate credits (async)
 */
export async function canAllocateCreditsAsync(base44: Base44Client, userId: string, orgId?: string): Promise<boolean> {
  return await isOrgAdminAsync(base44, userId, orgId);
}

/**
 * Check if user can manage team (async)
 */
export async function canManageTeamAsync(base44: Base44Client, userId: string, orgId?: string): Promise<boolean> {
  return await isOrgAdminAsync(base44, userId, orgId);
}

/**
 * Check if user can invite a specific role (async)
 */
export async function canInviteRoleAsync(
  base44: Base44Client,
  inviterUserId: string, 
  targetRole: OrgRole, 
  orgId?: string
): Promise<boolean> {
  const inviterRole = await checkUserRoleAsync(base44, inviterUserId, orgId);
  
  if (inviterRole.isOwner) return true;
  if (inviterRole.isManager && targetRole === 'member') return true;
  
  return false;
}

/**
 * Check if user can remove a team member (async)
 */
export async function canRemoveTeamMemberAsync(
  base44: Base44Client,
  removerUserId: string,
  targetUserId: string,
  orgId?: string
): Promise<boolean> {
  if (removerUserId === targetUserId) return false;
  
  const removerRole = await checkUserRoleAsync(base44, removerUserId, orgId);
  const targetRole = await checkUserRoleAsync(base44, targetUserId, orgId);
  
  if (removerRole.isOwner) return true;
  if (removerRole.isManager && targetRole.isMember) return true;
  
  return false;
}

/**
 * Check if user can change roles (async)
 */
export async function canChangeRoleAsync(base44: Base44Client, userId: string, orgId?: string): Promise<boolean> {
  return await isOrgOwnerAsync(base44, userId, orgId);
}

// =============================================================================
// PERMISSION CHECK FUNCTIONS (Sync - no base44 client needed)
// =============================================================================

export function canAllocateCredits(user: User | null | undefined): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

export function canPurchaseCompanyCredits(user: User | null | undefined): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

export function canManageTeam(user: User | null | undefined): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

export function canPromoteToManager(user: User | null | undefined): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgOwner(user);
}

export function canDeleteOrganization(user: User | null | undefined): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgOwner(user);
}

export function canManageUser(currentUser: User | null | undefined, targetUser: User | null | undefined): boolean {
  if (!currentUser || !targetUser) return false;
  if (isSuperAdmin(currentUser)) return true;
  if (currentUser.id === targetUser.id) return false;
  if (currentUser.orgId !== targetUser.orgId) return false;
  if (isOrgOwner(currentUser)) return true;
  if (isOrgManager(currentUser)) return isTeamMember(targetUser);
  return false;
}

export function canChangeUserRole(
  currentUser: User | null | undefined, 
  targetUser: User | null | undefined, 
  newRole: string
): boolean {
  if (!currentUser || !targetUser || !newRole) return false;
  if (isSuperAdmin(currentUser)) return true;
  if (currentUser.id === targetUser.id) return false;
  if (currentUser.orgId !== targetUser.orgId) return false;
  if (isOrgOwner(currentUser)) {
    return [ORG_ROLES.MANAGER, ORG_ROLES.MEMBER].includes(newRole as OrgRole);
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

export function getOrgRoleDisplayName(orgRole: string | undefined): string {
  const displayNames: Record<string, string> = {
    [ORG_ROLES.OWNER]: 'Organization Owner',
    [ORG_ROLES.MANAGER]: 'Organization Manager',
    [ORG_ROLES.MEMBER]: 'Team Member',
  };
  return displayNames[orgRole || ''] || orgRole || 'Team Member';
}

export function getUserRoleDisplayName(user: User | null | undefined): string {
  if (!user) return 'Unknown';
  if (isSuperAdmin(user)) return 'Super Admin';
  if (user.orgRole) return getOrgRoleDisplayName(user.orgRole);
  if (user.isOrgOwner || user.appRole === APP_ROLES.ORGANIZATION_OWNER) return 'Organization Owner';
  if (user.appRole === APP_ROLES.SALES_REP) return 'Team Member';
  return 'Team Member';
}

export function mapLegacyRoleToOrgRole(legacyRole: string): OrgRole {
  if (legacyRole === 'organization_owner' || legacyRole === 'admin') return ORG_ROLES.OWNER;
  if (legacyRole === 'organization_manager' || legacyRole === 'manager') return ORG_ROLES.MANAGER;
  return ORG_ROLES.MEMBER;
}

export function mapOrgRoleToLegacyAppRole(orgRole: OrgRole): string {
  if (orgRole === ORG_ROLES.OWNER) return APP_ROLES.ORGANIZATION_OWNER;
  return APP_ROLES.SALES_REP;
}

export function isValidRole(role: string): role is OrgRole {
  return ['owner', 'manager', 'member'].includes(role);
}
