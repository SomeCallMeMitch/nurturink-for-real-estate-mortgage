/**
 * permissionHelpers — canonical permission logic reference
 *
 * IMPORTANT: Base44 does NOT support local imports between function files.
 * This file CANNOT be imported by other functions.
 *
 * PURPOSE: This file documents the canonical helper contracts designed in Phase 1.
 * Each helper below is meant to be copy-inlined verbatim into each consuming function.
 * The actual enforcement lives in each backend function directly.
 *
 * This stub serves as:
 *   1. The single source-of-truth documentation for all permission logic
 *   2. A reference for auditors and future developers
 *   3. A placeholder so the design is version-controlled
 *
 * HELPER INVENTORY (all inlined per-function):
 *   getUserOrgProfile(base44, userId, orgId)         → profile | null
 *   resolveOrgRole(user, profile)                    → orgRole string
 *   assertAuthenticated(base44)                      → user | throws 401
 *   assertSuperAdmin(user)                           → void | throws 403
 *   assertOrgManagerOrOwner(base44, user, orgId)     → { orgRole } | throws 403
 *   assertOrgOwner(base44, user, orgId)              → { orgRole } | throws 403
 *   assertSameOrg(user, targetOrgId)                 → void | throws 403
 *   assertCanRemoveMember(callerOrgRole, targetOrgRole, isSuperAdmin) → void | throws 403
 *   assertCanAssignRole(callerOrgRole, targetOrgRole, isSuperAdmin)   → void | throws 403
 *
 * PROFILE LOOKUP RULES (from Phase 1):
 *   - Use targetOrgId from the resource, not user.orgId (unless they're the same).
 *   - No profile found → DENY for security checks.
 *   - Multiple profiles → use first, log warning.
 *   - Super admin bypass runs BEFORE any profile lookup.
 *   - Legacy fallback (isOrgOwner, appRole) only when profile === null.
 */

Deno.serve(() =>
  Response.json({
    module: 'permissionHelpers',
    status: 'documentation stub — not a callable endpoint',
    note: 'Base44 does not support local imports. Helpers are inlined per backend function.'
  })
);