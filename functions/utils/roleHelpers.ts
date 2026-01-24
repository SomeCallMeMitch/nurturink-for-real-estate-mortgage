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
 */

import { base44 } from '../base44.config';

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
  // Legacy fields
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

// =============================================================================
// USERPROFILE CRUD FUNCTIONS
// =============================================================================

/**
 * Fetches the UserProfile for a given user ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const profiles = await base44.entities.UserProfile.filter({ userId });
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
export async function getUserProfileForOrg(userId: string, orgId: string): Promise<UserProfile | null> {
  try {
    const profiles = await base44.entities.UserProfile.filter({ userId, orgId });
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
  userId: string, 
  orgId: string, 
  orgRole: OrgRole
): Promise<UserProfile | null> {
  try {
    const existingProfile = await getUserProfileForOrg(userId, orgId);
    
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
export async function deleteUserProfile(userId: string, orgId: string): Promise<boolean> {
  try {
    const profile = await getUserProfileForOrg(userId, orgId);
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
// ROLE CHECK FUNCTIONS (Async - use UserProfile)
// =============================================================================

/**
 * Comprehensive role check for a user (async - fetches from UserProfile)
 */
export async function checkUserRoleAsync(userId: string, orgId?: string): Promise<RoleCheckResult> {
  let userProfile: UserProfile | null = null;
  
  if (orgId) {
    userProfile = await getUserProfileForOrg(userId, orgId);
  } else {
    userProfile = await getUserProfile(userId);
  }
  
  const orgRole = userProfile?.orgRole || null;
  
  return {
    isOwner: orgRole === 'owner',
    isManager: orgRole === 'manager',
    isMember: orgRole === 'member' || orgRole === null,
    isAdmin: orgRole === 'owner' || orgRole === 'manager',
    isSuperAdmin: false, // Would need to check User.appRole separately
    orgRole,
    userProfile
  };
}

/**
 * Check if user is an organization owner (async)
 */
export async function isOrgOwnerAsync(userId: string, orgId?: string): Promise<boolean> {
  const result = await checkUserRoleAsync(userId, orgId);
  return result.isOwner;
}

/**
 * Check if user is an organization manager (async)
 */
export async function isOrgManagerAsync(userId: string, orgId?: string): Promise<boolean> {
  const result = await checkUserRoleAsync(userId, orgId);
  return result.isManager;
}

/**
 * Check if user is an organization admin (owner OR manager) (async)
 */
export async function isOrgAdminAsync(userId: string, orgId?: string): Promise<boolean> {
  const result = await checkUserRoleAsync(userId, orgId);
  return result.isAdmin;
}

// =============================================================================
// ROLE CHECK FUNCTIONS (Sync - use User object with legacy fields)
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
 * For new code, prefer isOrgOwnerAsync
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
// PERMISSION CHECK FUNCTIONS (Async)
// =============================================================================

/**
 * Check if user can allocate credits (async)
 */
export async function canAllocateCreditsAsync(userId: string, orgId?: string): Promise<boolean> {
  return await isOrgAdminAsync(userId, orgId);
}

/**
 * Check if user can manage team (async)
 */
export async function canManageTeamAsync(userId: string, orgId?: string): Promise<boolean> {
  return await isOrgAdminAsync(userId, orgId);
}

/**
 * Check if user can invite a specific role (async)
 */
export async function canInviteRoleAsync(
  inviterUserId: string, 
  targetRole: OrgRole, 
  orgId?: string
): Promise<boolean> {
  const inviterRole = await checkUserRoleAsync(inviterUserId, orgId);
  
  if (inviterRole.isOwner) return true;
  if (inviterRole.isManager && targetRole === 'member') return true;
  
  return false;
}

/**
 * Check if user can remove a team member (async)
 */
export async function canRemoveTeamMemberAsync(
  removerUserId: string,
  targetUserId: string,
  orgId?: string
): Promise<boolean> {
  if (removerUserId === targetUserId) return false;
  
  const removerRole = await checkUserRoleAsync(removerUserId, orgId);
  const targetRole = await checkUserRoleAsync(targetUserId, orgId);
  
  if (removerRole.isOwner) return true;
  if (removerRole.isManager && targetRole.isMember) return true;
  
  return false;
}

/**
 * Check if user can change roles (async)
 */
export async function canChangeRoleAsync(userId: string, orgId?: string): Promise<boolean> {
  return await isOrgOwnerAsync(userId, orgId);
}

// =============================================================================
// PERMISSION CHECK FUNCTIONS (Sync - for backward compatibility)
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
    [ORG_ROLES.OWNER]: 'Owner',
    [ORG_ROLES.MANAGER]: 'Manager',
    [ORG_ROLES.MEMBER]: 'Member',
  };
  return displayNames[orgRole || ''] || orgRole || 'Member';
}

export function getUserRoleDisplayName(user: User | null | undefined): string {
  if (!user) return 'Unknown';
  if (isSuperAdmin(user)) return 'Super Admin';
  if (user.orgRole) return getOrgRoleDisplayName(user.orgRole);
  if (user.isOrgOwner || user.appRole === APP_ROLES.ORGANIZATION_OWNER) return 'Owner';
  if (user.appRole === APP_ROLES.SALES_REP) return 'Member';
  return 'Member';
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
