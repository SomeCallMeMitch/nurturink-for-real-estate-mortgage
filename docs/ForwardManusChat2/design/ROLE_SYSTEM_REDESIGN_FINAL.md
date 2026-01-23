# NurturInk Role System Redesign - Final Implementation

**Date:** January 23, 2026  
**Status:** Implemented  
**Author:** Manus AI

---

## Executive Summary

This document describes the final implementation of the role system redesign for NurturInk. The key change is the introduction of a custom `orgRole` field on the User entity to support three distinct organizational roles: **Owner**, **Manager**, and **Member**.

---

## The Problem

The original system only had two effective roles:
- `organization_owner` - Full admin access
- `sales_rep` - Regular team member

There was no way to have a "manager" who could:
- Allocate credits to team members
- Create organization templates
- Manage team settings
- But NOT be the actual owner of the organization

---

## The Solution

### New Field: `orgRole`

Since Base44's `appRole` field is platform-managed and cannot be extended, we added a custom `orgRole` field:

| Field | Type | Values | Purpose |
|-------|------|--------|---------|
| `orgRole` | string (enum) | `'owner'`, `'manager'`, `'member'` | Custom org-level role |
| `isOrgOwner` | boolean | `true`/`false` | Legacy flag, kept for backward compatibility |
| `appRole` | string | Platform values | Platform-managed, not modified |

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                     SUPER ADMIN                              │
│              (Platform-level, can do anything)               │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   ORGANIZATION OWNER                         │
│    - Full control over organization                          │
│    - Can promote/demote managers                             │
│    - Can delete organization                                 │
│    - Can transfer ownership                                  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  ORGANIZATION MANAGER                        │
│    - Can allocate credits                                    │
│    - Can create org templates                                │
│    - Can invite members (not managers)                       │
│    - Can remove members (not managers/owner)                 │
│    - CANNOT promote to manager                               │
│    - CANNOT delete organization                              │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                       MEMBER                                 │
│    - Can send cards                                          │
│    - Can use allocated credits                               │
│    - Can purchase personal credits                           │
│    - Can create personal templates                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Permission Matrix

| Action | Owner | Manager | Member |
|--------|-------|---------|--------|
| **Credits** |
| Purchase credits (company) | ✅ | ✅ | ❌ |
| Purchase credits (personal) | ✅ | ✅ | ✅ |
| Allocate credits to members | ✅ | ✅ | ❌ |
| Toggle pool access | ✅ | ✅ | ❌ |
| Transfer personal to pool | ✅ | ✅ | ❌ |
| **Team Management** |
| Invite members | ✅ | ✅ | ❌ |
| Invite managers | ✅ | ❌ | ❌ |
| Remove members | ✅ | ✅ | ❌ |
| Remove managers | ✅ | ❌ | ❌ |
| Promote to manager | ✅ | ❌ | ❌ |
| Demote manager | ✅ | ❌ | ❌ |
| **Templates** |
| Create personal templates | ✅ | ✅ | ✅ |
| Create org templates | ✅ | ✅ | ❌ |
| Edit org templates | ✅ | ✅ | ❌ |
| **Settings** |
| Edit org settings | ✅ | ✅ | ❌ |
| Edit writing style | ✅ | ✅ | ❌ |
| Delete organization | ✅ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ |

---

## Implementation Details

### Files Created

| File | Purpose |
|------|---------|
| `src/utils/roleHelpers.js` | Frontend role checking utilities |
| `functions/utils/roleHelpers.ts` | Backend role checking utilities |

### Files Modified

**Entities:**
- `entities/Invitation.json` - Added `orgRole` field with enum values

**Backend Functions:**
- `functions/allocateCredits.ts`
- `functions/toggleCompanyPoolAccess.ts`
- `functions/transferCreditsToPool.ts`
- `functions/inviteTeamMember.ts`
- `functions/processInvitation.ts`
- `functions/removeTeamMember.ts`
- `functions/updateTeamMemberRole.ts`

**Frontend Pages:**
- `src/pages/TeamManagement.jsx`
- `src/pages/Credits.jsx`
- `src/pages/Order.jsx`
- `src/pages/SettingsOrganization.jsx`
- `src/pages/QuickSendTemplates.jsx`

---

## Role Helper Functions

### Frontend (`src/utils/roleHelpers.js`)

```javascript
// Constants
ORG_ROLES = { OWNER: 'owner', MANAGER: 'manager', MEMBER: 'member' }

// Role checks
isOrgOwner(user)      // Is user an org owner?
isOrgManager(user)    // Is user an org manager?
isOrgAdmin(user)      // Is user an owner OR manager?
isSuperAdmin(user)    // Is user a super admin?

// Permission checks
canAllocateCredits(user)
canManageTeam(user)
canPromoteToManager(user)
canManageUser(currentUser, targetUser)
canChangeUserRole(currentUser, targetUser, newRole)

// Display helpers
getUserRoleDisplayName(user)
getOrgRoleDisplayName(orgRole)
getInvitableRoles(user)
getAssignableRoles(user)
```

### Backend (`functions/utils/roleHelpers.ts`)

Same functions as frontend, plus:
- `mapOrgRoleToLegacyAppRole(orgRole)` - For backward compatibility
- `mapLegacyAppRoleToOrgRole(appRole)` - For migration

---

## Migration Notes

### Existing Users

Existing users will continue to work because:
1. The `isOrgOwner` flag is still checked as a fallback
2. The `appRole` field is still checked as a fallback
3. New `orgRole` field is additive, not replacing

### New Users

New users invited through the updated system will have:
- `orgRole` set to their assigned role
- `isOrgOwner` set to `true` only if `orgRole === 'owner'`
- `appRole` set to legacy value for backward compatibility

---

## Testing Checklist

- [ ] Org owner can invite a manager
- [ ] Org owner can invite a member
- [ ] Org manager can invite a member
- [ ] Org manager CANNOT invite a manager
- [ ] Org owner can promote member to manager
- [ ] Org manager CANNOT promote member to manager
- [ ] Org owner can remove a manager
- [ ] Org manager CANNOT remove a manager
- [ ] Org manager can remove a member
- [ ] Org manager can allocate credits
- [ ] Org manager can create org templates
- [ ] Org manager can edit org settings
- [ ] Member CANNOT access team management
- [ ] Member CANNOT allocate credits

---

## Future Considerations

1. **Granular Permissions:** Consider adding a `permissions` array field for even finer control
2. **Role Expiration:** Add ability to set temporary manager roles
3. **Audit Log:** Track role changes for compliance
4. **Multiple Owners:** Currently only one owner per org; may need to support co-owners

---

## Revision History

| Date | Change |
|------|--------|
| 2026-01-23 | Initial implementation with custom `orgRole` field |
