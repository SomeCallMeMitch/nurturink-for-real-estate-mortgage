# UserProfile Entity Implementation - Base44 Evaluation Request

## Overview

This implementation adds a new `UserProfile` entity to store organization-specific role information, following Base44's recommended pattern for extending the built-in User entity.

## Files to Review

### New Files (2)

1. **`entities/UserProfile.json`** - New entity schema
   - Fields: `userId`, `orgId`, `orgRole`
   - Represents a 1:1 relationship between User and their role in an Organization

2. **`functions/migrateUsersToUserProfile.ts`** - Migration function
   - Creates UserProfile records for existing users based on legacy role fields
   - Only runnable by super admins
   - Supports dry-run mode for testing

### Modified Files (6)

3. **`functions/utils/roleHelpers.ts`** - Backend role utilities
   - Added `upsertUserProfile()` function to create/update UserProfile
   - Added `getUserProfileForOrg()` function to fetch UserProfile
   - Added `deleteUserProfile()` function
   - Added `checkUserRoleAsync()` for async role checking

4. **`functions/inviteTeamMember.ts`**
   - Now creates UserProfile when adding existing users to an org
   - Uses `upsertUserProfile()` from roleHelpers

5. **`functions/updateTeamMemberRole.ts`**
   - Now updates UserProfile when changing roles
   - Uses `upsertUserProfile()` from roleHelpers

6. **`functions/removeTeamMember.ts`**
   - Now deletes UserProfile when removing user from org
   - Uses `deleteUserProfile()` from roleHelpers

7. **`functions/getOrganizationTeamData.ts`**
   - Now fetches UserProfile data for all team members
   - Returns `orgRole` field from UserProfile
   - Falls back to legacy fields if no UserProfile exists

8. **`src/utils/roleHelpers.js`** - Frontend role utilities
   - Added `fetchUserProfile()` and `fetchUserProfileForOrg()` functions
   - Added `getOrgRole()` helper that checks UserProfile first, then legacy fields
   - Updated all role check functions to accept optional `profile` parameter

## Specific Verification Checkpoints

### Entity Schema (`entities/UserProfile.json`)
- [ ] Verify JSON schema is valid
- [ ] Verify field types are correct (all strings)
- [ ] Verify `orgRole` enum values are correct: `['owner', 'manager', 'member']`
- [ ] Confirm entity will be created on deployment

### Backend roleHelpers (`functions/utils/roleHelpers.ts`)
- [ ] Verify `base44.asServiceRole.entities.UserProfile` is correctly accessed
- [ ] Verify `upsertUserProfile()` correctly handles create vs update
- [ ] Verify `deleteUserProfile()` correctly finds and deletes the profile

### Migration Function (`functions/migrateUsersToUserProfile.ts`)
- [ ] Verify it correctly maps legacy roles to new orgRole values
- [ ] Verify dry-run mode works correctly
- [ ] Verify it's idempotent (safe to run multiple times)

### Frontend roleHelpers (`src/utils/roleHelpers.js`)
- [ ] Verify import `{ base44 } from '@/api/base44Client'` is correct
- [ ] Verify `base44.entities.UserProfile.filter()` is correctly called
- [ ] Verify role check functions correctly handle the optional `profile` parameter

## Questions for Base44

1. **Entity Creation**: Will the `UserProfile` entity be automatically created when the `entities/UserProfile.json` file is deployed?

2. **Service Role Access**: Is `base44.asServiceRole.entities.UserProfile` the correct way to access the UserProfile entity from backend functions?

3. **Frontend Entity Access**: Is `base44.entities.UserProfile.filter()` the correct way to access UserProfile from the frontend?

4. **Migration Approach**: Is there a better way to run the migration (e.g., a platform-level migration tool) instead of a function?

## Post-Implementation Verification Checklist

**Report Format:**
```
## Implementation Summary

### Files Created/Modified:
- [filename] - [location] - [status: Created/Modified] - [line count]

### Entity Updates:
- [status and details]

### Verification Results:
| Check | Status | Notes |
|-------|--------|-------|
| Syntax | ✅/❌ | |
| Imports | ✅/❌ | |
| Entities | ✅/❌ | |
| Function Invocations | ✅/❌ | |
| Variables | ✅/❌ | |
| Error Handling | ✅/❌ | |
| File Locations | ✅/❌ | |
| Line Count (<800) | ✅/❌ | |

Use a red X when there's anything that you could not execute and explain why

### Answers to Questions:
1. [answer]
2. [answer]
3. [answer]
4. [answer]

### Issues Found & Resolved:
- [any issues and how they were fixed]

### Ready for Testing:
[Yes/No + any caveats]
```

## Post-Deployment Testing Steps

After Base44 approves and the code is deployed:

1. **Run Migration (Dry Run)**:
   ```javascript
   await base44.functions.invoke('migrateUsersToUserProfile', { dryRun: true });
   ```

2. **Run Migration (Actual)**:
   ```javascript
   await base44.functions.invoke('migrateUsersToUserProfile', { dryRun: false });
   ```

3. **Verify Team Management Page**:
   - Check that team members display with correct roles
   - Verify role badges show correctly

4. **Test Role Changes**:
   - Promote a member to manager
   - Verify UserProfile is updated
   - Demote back to member
   - Verify UserProfile is updated

5. **Test Invitation Flow**:
   - Invite a new user as manager
   - Accept invitation
   - Verify UserProfile is created with correct role
