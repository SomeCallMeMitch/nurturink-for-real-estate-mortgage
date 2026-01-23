# NurturInk Role System Redesign

## Executive Summary

This document outlines a comprehensive redesign of the NurturInk role system to introduce a distinct **Organization Manager** role that sits between the Organization Owner and Sales Rep roles.

## Current State Analysis

### Current Role Structure

| Field | Values | Purpose |
|-------|--------|---------|
| `appRole` | `'sales_rep'`, `'organization_owner'`, `'whitelabel_partner'`, `'super_admin'` | Primary role identifier |
| `isOrgOwner` | `true` / `false` | Boolean flag, always synced with `appRole === 'organization_owner'` |

### Problem with Current Design

1. **No Manager Role**: There's no way to give someone admin-like permissions without making them a full organization owner.
2. **Redundant Fields**: `isOrgOwner` is always derived from `appRole`, making it redundant.
3. **Confusing Semantics**: "Organization Owner" is used both for the actual owner AND for admins.

---

## Proposed New Role Structure

### New `appRole` Values

| appRole Value | Description | Count per Org |
|---------------|-------------|---------------|
| `'organization_owner'` | The actual owner who created/owns the organization | Exactly 1 |
| `'organization_manager'` | Admin with most owner permissions | 0 or more |
| `'sales_rep'` | Regular team member | 0 or more |
| `'whitelabel_partner'` | White-label partner (unchanged) | N/A |
| `'super_admin'` | Platform super admin (unchanged) | N/A |

### Field Changes

| Field | Change | New Purpose |
|-------|--------|-------------|
| `appRole` | Add `'organization_manager'` to enum | Primary role identifier |
| `isOrgOwner` | **Keep but clarify** | `true` ONLY for the actual org owner (the one who created it) |

### Key Distinction

```
isOrgOwner = true  →  The person who created/owns the org (only ONE per org)
appRole = 'organization_owner'  →  Same as isOrgOwner (legacy, keep for compatibility)
appRole = 'organization_manager'  →  Can do admin tasks but isn't the owner
appRole = 'sales_rep'  →  Regular team member
```

---

## Permission Matrix

### Legend
- ✅ = Full access
- 🔶 = Partial/Conditional access
- ❌ = No access

| Permission | Super Admin | Org Owner | Org Manager | Sales Rep |
|------------|-------------|-----------|-------------|-----------|
| **Credits** |
| Purchase credits (company) | ✅ | ✅ | ✅ | ❌ |
| Purchase credits (personal) | ✅ | ✅ | ✅ | ✅ |
| Allocate credits to team | ✅ | ✅ | ✅ | ❌ |
| View company pool balance | ✅ | ✅ | ✅ | 🔶 (if pool access) |
| Transfer personal to pool | ✅ | ✅ | ✅ | ❌ |
| **Team Management** |
| View team members | ✅ | ✅ | ✅ | ❌ |
| Invite team members | ✅ | ✅ | ✅ | ❌ |
| Remove team members | ✅ | ✅ | 🔶 (not owner/other managers) | ❌ |
| Change member roles | ✅ | ✅ | 🔶 (only to/from sales_rep) | ❌ |
| Promote to manager | ✅ | ✅ | ❌ | ❌ |
| **Templates** |
| Create personal templates | ✅ | ✅ | ✅ | ✅ |
| Create org templates | ✅ | ✅ | ✅ | ❌ |
| Edit org templates | ✅ | ✅ | ✅ | ❌ |
| Delete org templates | ✅ | ✅ | ✅ | ❌ |
| **Organization Settings** |
| View org settings | ✅ | ✅ | ✅ | ❌ |
| Edit org settings | ✅ | ✅ | ✅ | ❌ |
| Edit writing style | ✅ | ✅ | ✅ | ❌ |
| Manage return addresses | ✅ | ✅ | ✅ | ❌ |
| **Billing** |
| View billing history | ✅ | ✅ | 🔶 (view only) | ❌ |
| Change subscription | ✅ | ✅ | ❌ | ❌ |
| **Danger Zone** |
| Delete organization | ✅ | ✅ | ❌ | ❌ |
| Transfer ownership | ✅ | ✅ | ❌ | ❌ |

---

## Files That Need Changes

### Backend Functions (15 files)

| File | Current Check | New Check | Change Type |
|------|---------------|-----------|-------------|
| `allocateCredits.ts` | `organization_owner` | `organization_owner` OR `organization_manager` | Expand |
| `checkCreditAvailability.ts` | N/A | N/A | No change |
| `createCheckoutSession.ts` | `organization_owner` | `organization_owner` OR `organization_manager` | Expand |
| `getCompanyPoolStats.ts` | N/A | N/A | No change |
| `handleStripeWebhook.ts` | `organization_owner` | `organization_owner` OR `organization_manager` | Expand |
| `inviteTeamMember.ts` | `organization_owner` | `organization_owner` OR `organization_manager` | Expand + add manager option |
| `processInvitation.ts` | Role mapping | Add `organization_manager` mapping | Add |
| `removeTeamMember.ts` | `organization_owner` | `organization_owner` OR `organization_manager` (with restrictions) | Expand |
| `toggleCompanyPoolAccess.ts` | `organization_owner` | `organization_owner` OR `organization_manager` | Expand |
| `transferCreditsToPool.ts` | `organization_owner` | `organization_owner` OR `organization_manager` | Expand |
| `updateTeamMemberRole.ts` | `organization_owner` | `organization_owner` OR `organization_manager` (with restrictions) | Expand |
| `updateUserPoolAccess.ts` | `organization_owner` | `organization_owner` OR `organization_manager` | Expand |
| `updateUserRole.ts` | Valid roles array | Add `organization_manager` | Add |
| `setupAccount.ts` | Role setup | No change (new users start as sales_rep or owner) | No change |
| `sendTeamInvitationEmail.ts` | Role display | Add manager display | Add |

### Frontend Pages (8 files)

| File | Current Check | New Check | Change Type |
|------|---------------|-----------|-------------|
| `Credits.jsx` | `organization_owner` | `organization_owner` OR `organization_manager` | Expand |
| `Order.jsx` | `organization_owner` OR `organization_manager` | Already correct | Verify |
| `TeamManagement.jsx` | `organization_owner` | `organization_owner` OR `organization_manager` + add manager option | Expand |
| `SettingsOrganization.jsx` | `organization_owner` | `organization_owner` OR `organization_manager` | Expand |
| `SettingsAddresses.jsx` | `organization_owner` | `organization_owner` OR `organization_manager` | Expand |
| `SettingsProfile.jsx` | Display role | Add manager display | Add |
| `QuickSendTemplates.jsx` | `organization_owner` | `organization_owner` OR `organization_manager` | Expand |
| `PaymentSuccess.jsx` | `organization_owner` | `organization_owner` OR `organization_manager` | Expand |

### Frontend Components (6 files)

| File | Current Check | New Check | Change Type |
|------|---------------|-----------|-------------|
| `LeftSidebar.jsx` | Role arrays | Add `organization_manager` to arrays | Add |
| `TwoLevelSidebar.jsx` | Role arrays | Add `organization_manager` to arrays | Add |
| `SuperAdminLayout.jsx` | `organization_owner` | `organization_owner` OR `organization_manager` | Expand |
| `TemplateGrid.jsx` | `organization_owner` | `organization_owner` OR `organization_manager` | Expand |
| `creditHelpers.jsx` | `organization_owner` | `organization_owner` OR `organization_manager` | Expand |
| `QuickSendVisibilitySettings.jsx` | `organization_owner` | `organization_owner` OR `organization_manager` | Expand |
| `TeamInviteStep.jsx` | Role options | Add manager option | Add |

---

## Helper Function Proposal

To avoid duplicating role checks everywhere, I propose creating a centralized helper:

### New File: `src/utils/roleHelpers.js`

```javascript
/**
 * Role hierarchy and permission helpers for NurturInk
 */

// Role constants
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  WHITELABEL_PARTNER: 'whitelabel_partner',
  ORGANIZATION_OWNER: 'organization_owner',
  ORGANIZATION_MANAGER: 'organization_manager',
  SALES_REP: 'sales_rep',
};

// Roles that have admin-level access within an organization
export const ORG_ADMIN_ROLES = [
  ROLES.ORGANIZATION_OWNER,
  ROLES.ORGANIZATION_MANAGER,
];

// Roles that can manage team members
export const TEAM_MANAGEMENT_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ORGANIZATION_OWNER,
  ROLES.ORGANIZATION_MANAGER,
];

/**
 * Check if user has organization admin privileges
 * (can allocate credits, manage templates, edit org settings)
 */
export function isOrgAdmin(user) {
  if (!user) return false;
  return (
    user.appRole === ROLES.ORGANIZATION_OWNER ||
    user.appRole === ROLES.ORGANIZATION_MANAGER ||
    user.isOrgOwner === true
  );
}

/**
 * Check if user is the actual organization owner
 * (can delete org, transfer ownership, promote to manager)
 */
export function isActualOrgOwner(user) {
  if (!user) return false;
  return user.isOrgOwner === true || user.appRole === ROLES.ORGANIZATION_OWNER;
}

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(user) {
  if (!user) return false;
  return user.appRole === ROLES.SUPER_ADMIN;
}

/**
 * Check if user can manage another user
 * - Super admins can manage anyone
 * - Org owners can manage managers and reps
 * - Org managers can only manage reps
 */
export function canManageUser(currentUser, targetUser) {
  if (!currentUser || !targetUser) return false;
  if (isSuperAdmin(currentUser)) return true;
  
  // Can't manage yourself
  if (currentUser.id === targetUser.id) return false;
  
  // Org owners can manage anyone in their org
  if (isActualOrgOwner(currentUser)) {
    return currentUser.orgId === targetUser.orgId;
  }
  
  // Org managers can only manage sales reps
  if (currentUser.appRole === ROLES.ORGANIZATION_MANAGER) {
    return (
      currentUser.orgId === targetUser.orgId &&
      targetUser.appRole === ROLES.SALES_REP
    );
  }
  
  return false;
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role) {
  const displayNames = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.WHITELABEL_PARTNER]: 'White-Label Partner',
    [ROLES.ORGANIZATION_OWNER]: 'Organization Owner',
    [ROLES.ORGANIZATION_MANAGER]: 'Organization Manager',
    [ROLES.SALES_REP]: 'Sales Representative',
  };
  return displayNames[role] || role;
}

/**
 * Get available roles for team invitations based on inviter's role
 */
export function getInvitableRoles(inviterRole) {
  if (inviterRole === ROLES.SUPER_ADMIN) {
    return [ROLES.SALES_REP, ROLES.ORGANIZATION_MANAGER, ROLES.ORGANIZATION_OWNER];
  }
  if (inviterRole === ROLES.ORGANIZATION_OWNER) {
    return [ROLES.SALES_REP, ROLES.ORGANIZATION_MANAGER];
  }
  if (inviterRole === ROLES.ORGANIZATION_MANAGER) {
    return [ROLES.SALES_REP]; // Managers can only invite reps
  }
  return [];
}
```

### Backend Equivalent: `functions/utils/roleHelpers.ts`

Similar helper functions for backend use.

---

## Implementation Plan

### Phase 1: Foundation (Do First)
1. Create `roleHelpers.js` utility file
2. Create `roleHelpers.ts` for backend
3. Update User entity schema to add `organization_manager` to appRole enum (if needed)

### Phase 2: Backend Functions
1. Update all 15 backend functions to use new role checks
2. Add `organization_manager` as a valid role option in invite/update functions

### Phase 3: Frontend Components
1. Update sidebar navigation to include managers
2. Update all permission checks in components

### Phase 4: Frontend Pages
1. Update TeamManagement.jsx with manager invite/role change options
2. Update all other pages with expanded role checks

### Phase 5: Testing
1. Test as organization owner
2. Test as organization manager
3. Test as sales rep
4. Verify permission boundaries

---

## Questions for Base44

1. **User Entity Schema**: Is the User entity schema managed by Base44, or can we add `organization_manager` to the `appRole` enum ourselves?

2. **Migration**: Do we need to migrate any existing data, or is this purely additive?

3. **Invitation Entity**: Does the Invitation entity's `role` field also need to be updated to include `organization_manager`?

4. **Best Practice**: Should we create a separate `permissions` field on the User entity instead of deriving everything from `appRole`? This would allow more granular control.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing org owner permissions | Low | High | Thorough testing, keep `isOrgOwner` check |
| Missing a permission check somewhere | Medium | Medium | Comprehensive code search, use helper functions |
| UI confusion between owner and manager | Low | Low | Clear labeling in UI |
| Managers promoting themselves to owner | Low | High | Backend validation prevents this |

---

## Summary

This redesign introduces a clean three-tier role system within organizations:

1. **Organization Owner** - Full control, can do everything
2. **Organization Manager** - Admin access, can't delete org or promote to manager
3. **Sales Rep** - Basic access, can send cards and manage their own contacts

The implementation uses centralized helper functions to ensure consistency and reduce the risk of missing permission checks.
