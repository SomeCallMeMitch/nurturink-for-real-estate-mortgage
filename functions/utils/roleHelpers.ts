/**
 * Role hierarchy and permission helpers for NurturInk (Backend)
 * 
 * This module provides centralized role checking functions to ensure
 * consistent permission enforcement across backend functions.
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

// =============================================================================
// ROLE CHECK FUNCTIONS
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
 * This is the person who created/owns the organization.
 * Only ONE person per organization should have this.
 */
export function isOrgOwner(user: User | null | undefined): boolean {
  if (!user) return false;
  // Check new orgRole field first, then fall back to legacy checks
  if (user.orgRole === ORG_ROLES.OWNER) return true;
  // Legacy compatibility
  return user.isOrgOwner === true || user.appRole === APP_ROLES.ORGANIZATION_OWNER;
}

/**
 * Check if user is an organization manager
 * Managers have admin-like permissions but cannot delete org or promote to manager.
 */
export function isOrgManager(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.orgRole === ORG_ROLES.MANAGER;
}

/**
 * Check if user has organization admin privileges
 * This includes both owners AND managers.
 * Use this for most admin permission checks (allocate credits, manage templates, etc.)
 */
export function isOrgAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return isOrgOwner(user) || isOrgManager(user);
}

/**
 * Check if user has any elevated privileges (super admin or org admin)
 */
export function hasAdminPrivileges(user: User | null | undefined): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

/**
 * Check if user is a regular team member (sales rep)
 */
export function isTeamMember(user: User | null | undefined): boolean {
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
 */
export function canAllocateCredits(user: User | null | undefined): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

/**
 * Check if user can purchase credits for the company pool
 * Requires: org owner, org manager, or super admin
 */
export function canPurchaseCompanyCredits(user: User | null | undefined): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

/**
 * Check if user can manage team members (invite, remove, change roles)
 * Requires: org owner, org manager, or super admin
 */
export function canManageTeam(user: User | null | undefined): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgAdmin(user);
}

/**
 * Check if user can promote someone to manager
 * Requires: org owner or super admin (managers cannot promote)
 */
export function canPromoteToManager(user: User | null | undefined): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgOwner(user);
}

/**
 * Check if user can delete the organization
 * Requires: org owner or super admin (managers cannot delete)
 */
export function canDeleteOrganization(user: User | null | undefined): boolean {
  if (!user) return false;
  return isSuperAdmin(user) || isOrgOwner(user);
}

/**
 * Check if currentUser can manage targetUser
 * - Super admins can manage anyone
 * - Org owners can manage managers and members in their org
 * - Org managers can only manage members in their org
 */
export function canManageUser(currentUser: User | null | undefined, targetUser: User | null | undefined): boolean {
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
 */
export function canChangeUserRole(
  currentUser: User | null | undefined, 
  targetUser: User | null | undefined, 
  newRole: string
): boolean {
  if (!currentUser || !targetUser || !newRole) return false;
  
  // Super admins can change any role
  if (isSuperAdmin(currentUser)) return true;
  
  // Can't change your own role
  if (currentUser.id === targetUser.id) return false;
  
  // Must be in the same organization
  if (currentUser.orgId !== targetUser.orgId) return false;
  
  // Org owners can promote to manager or demote to member
  if (isOrgOwner(currentUser)) {
    return [ORG_ROLES.MANAGER, ORG_ROLES.MEMBER].includes(newRole as OrgRole);
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
 */
export function getOrgRoleDisplayName(orgRole: string | undefined): string {
  const displayNames: Record<string, string> = {
    [ORG_ROLES.OWNER]: 'Owner',
    [ORG_ROLES.MANAGER]: 'Manager',
    [ORG_ROLES.MEMBER]: 'Member',
  };
  return displayNames[orgRole || ''] || orgRole || 'Member';
}

/**
 * Get display name for a user's role (handles legacy appRole too)
 */
export function getUserRoleDisplayName(user: User | null | undefined): string {
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
 * Map legacy role to new orgRole
 * Used during migration and invitation processing
 */
export function mapLegacyRoleToOrgRole(legacyRole: string): OrgRole {
  if (legacyRole === 'organization_owner' || legacyRole === 'admin') {
    return ORG_ROLES.OWNER;
  }
  if (legacyRole === 'organization_manager' || legacyRole === 'manager') {
    return ORG_ROLES.MANAGER;
  }
  return ORG_ROLES.MEMBER;
}

/**
 * Map new orgRole to legacy appRole (for backward compatibility)
 */
export function mapOrgRoleToLegacyAppRole(orgRole: OrgRole): string {
  if (orgRole === ORG_ROLES.OWNER) {
    return APP_ROLES.ORGANIZATION_OWNER;
  }
  return APP_ROLES.SALES_REP;
}
