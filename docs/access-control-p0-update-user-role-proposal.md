# Access Control P0 Proposal — updateUserRole Privilege Escalation

## Summary
The Access Control & Tenancy Enforcement audit identified a **P0 (critical)** privilege-escalation risk involving:
- `base44/functions/updateUserRole/entry.ts`
- `src/pages/UpdateUserRole.jsx`

The risk centers on a high-impact role mutation path that appears to be callable in ways that are not sufficiently constrained by authorization and tenancy boundaries.

## Current Behavior
Based on the audit findings:
- `updateUserRole` checks authentication but appears to allow role changes by email using service-role writes without sufficient authorization and tenant-scoping checks.
- `UpdateUserRole.jsx` auto-runs a role update on mount.
- The page appears to include hardcoded target email/role behavior.

## Risk
This creates a critical attack surface:
- Any authenticated user could potentially invoke the function directly.
- A caller may be able to escalate privileges or cross tenant boundaries.
- The auto-execution UI route increases risk because simply opening the route can trigger a privileged mutation.

## Proposed P0 Fix
Implement the smallest safe fix first, focused only on immediate privilege-escalation prevention.

1. **Backend gate**
   - `updateUserRole` must require `currentUser.appRole === 'super_admin'` or a stricter Base44-approved platform-admin check.
   - Return `Response.json({ error: 'Forbidden' }, { status: 403 })` for unauthorized callers.
   - Do not allow ordinary org owners/managers/members to set global `appRole`.
   - Do not trust caller-provided email/role without authorization.

2. **Route/UI hardening**
   - Remove auto-execution from `UpdateUserRole.jsx`.
   - Do not run role updates on page load.
   - Require explicit user action if this page remains.
   - Consider removing or disabling this route in production if it is internal/admin-only tooling.

3. **Scope control**
   - Do not touch TeamManagement normal role management unless required.
   - Do not change invitation logic in this P0 PR.
   - Do not implement P1 cleanup in this P0 PR.

## Files Likely Affected
- `base44/functions/updateUserRole/entry.ts`
- `src/pages/UpdateUserRole.jsx`
- `src/pages.config.js` only if route removal/disablement is recommended and approved

## Questions for Base44
1. Is `updateUserRole` intended to exist in production?
2. Should this endpoint be `super_admin`-only?
3. Is `currentUser.appRole === 'super_admin'` the correct authorization check?
4. Should the `UpdateUserRole` page be removed from routes entirely, disabled, or kept as explicit-action-only?
5. Are there Base44 platform conventions for internal-only admin utilities?
6. Should this function return canonical `Response.json({ error: 'Forbidden' }, { status: 403 })` for unauthorized callers?

## Recommended Implementation Plan
1. Get Base44 confirmation on intended admin model.
2. Implement backend authorization gate first.
3. Remove auto-execution from `UpdateUserRole.jsx`.
4. Optionally remove/disable route if Base44 confirms it is not needed in production.
5. Create a draft PR with a review summary.
6. Verify no normal TeamManagement role workflows were changed.

## Non-Goals
- Do not change `processInvitation` in this PR.
- Do not change `acceptInvitation` in this PR.
- Do not change `getOrganizationTeamData` in this PR.
- Do not refactor role helpers.
- Do not standardize all errors/logging yet.
