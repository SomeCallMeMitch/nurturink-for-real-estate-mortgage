# Base44 Evaluation Prompt - Role System Implementation

**Purpose:** Review the role system implementation for correctness, platform compatibility, and best practices.

---

## Summary of Changes

I've implemented a role system redesign that adds a custom `orgRole` field to support three distinct organizational roles: **Owner**, **Manager**, and **Member**.

### Files Created (2)
1. `src/utils/roleHelpers.js` - Frontend role checking utilities
2. `functions/utils/roleHelpers.ts` - Backend role checking utilities

### Files Modified (13)

**Entity:**
- `entities/Invitation.json` - Added `orgRole` field

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

## Verification Checklist

Please verify the following:

### 1. Syntax Validation
- [ ] All JSX files have matching opening/closing tags
- [ ] Proper JavaScript/TypeScript syntax
- [ ] No unclosed brackets or parentheses
- [ ] No duplicate function/variable declarations

### 2. Import Verification
For each modified file, confirm:
- [ ] All imported components exist
- [ ] All imported hooks are available
- [ ] Icon imports from lucide-react are valid (`ShieldCheck` is used - please verify)
- [ ] Path aliases (@/) resolve correctly
- [ ] No circular dependencies between files

### 3. Entity/Schema Check
- [ ] `Invitation.json` schema is valid
- [ ] `orgRole` field enum values are correct: `['owner', 'manager', 'member']`
- [ ] Field types match expected values

### 4. Function Invocation Check
- [ ] All `base44.functions.invoke()` calls use correct function names
- [ ] Parameter structures match function expectations

### 5. Variable Consistency
- [ ] Props passed to child components match their prop definitions
- [ ] State variables and setters are consistently named
- [ ] Callback functions receive expected parameters
- [ ] async/await is used correctly (no missing await on async calls)

### 6. Error Handling Check
- [ ] try/catch blocks exist around async operations
- [ ] Error messages are user-friendly

### 7. File Locations
- [ ] `src/utils/roleHelpers.js` is in correct location
- [ ] `functions/utils/roleHelpers.ts` is in correct location

### 8. Line Count Check
- [ ] Each file is under 800 lines

---

## Specific Questions for Base44

1. **User Entity:** The implementation assumes we can add a custom `orgRole` field to User records via `base44.asServiceRole.entities.User.update()`. Is this correct, or do we need to define this field in an entity schema first?

2. **ShieldCheck Icon:** I used `ShieldCheck` from lucide-react for the Manager badge. Does this icon exist in your version of lucide-react?

3. **Role Helper Import:** The backend functions import from `'./utils/roleHelpers.ts'`. Is this relative import path correct for Base44 functions?

4. **Invitation Entity:** I added `orgRole` to the Invitation entity schema. Will this automatically be available, or does it require a migration?

---

## Report Format

Please provide your evaluation in this format:

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

### Issues Found & Resolved:
- [any issues and how they were fixed]

### Answers to Questions:
1. [answer]
2. [answer]
3. [answer]
4. [answer]

### Ready for Testing:
[Yes/No + any caveats]
```

---

## Test Scenarios

After approval, please test:

1. **As Org Owner:**
   - Go to Team Management
   - Invite a new member with "Manager" role
   - Verify the manager can allocate credits
   - Verify the manager CANNOT promote others to manager

2. **As Org Manager:**
   - Go to Team Management
   - Verify you can invite members (but not managers)
   - Verify you can remove members (but not other managers)
   - Go to Credits and verify you can allocate credits

3. **As Member:**
   - Verify you CANNOT access Team Management admin functions
   - Verify you can still send cards with allocated credits
