import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Get company pool credit statistics for organization admins.
 *
 * PERMISSION FIX (Phase 2 / Batch 2 / F-27 / M-19):
 * Previously: NO role check — any authenticated org member could call this.
 * Now: Only org owners, managers, or super admins may access.
 *
 * Canonical helpers inlined per Base44 constraint (no local imports).
 */

// =============================================================================
// INLINED CANONICAL PERMISSION HELPERS (from permissionHelpers.js design)
// =============================================================================

const ORG_ROLES = { OWNER: 'owner', MANAGER: 'manager', MEMBER: 'member' };
const APP_ROLES = { SUPER_ADMIN: 'super_admin', ORGANIZATION_OWNER: 'organization_owner', ORGANIZATION_MANAGER: 'organization_manager' };

async function getUserOrgProfile(base44, userId, orgId) {
  try {
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ userId, orgId });
    if (profiles.length === 0) return null;
    if (profiles.length > 1) console.warn(`[permissionHelpers] Multiple UserProfiles for userId=${userId} orgId=${orgId}. Using first.`);
    return profiles[0];
  } catch (err) {
    console.error('[permissionHelpers] Error fetching UserProfile:', err);
    return null;
  }
}

function resolveOrgRole(user, profile) {
  if (profile?.orgRole) return profile.orgRole;
  // Legacy fallback — only when no profile exists
  if (user.isOrgOwner === true || user.appRole === APP_ROLES.ORGANIZATION_OWNER) return ORG_ROLES.OWNER;
  if (user.appRole === APP_ROLES.ORGANIZATION_MANAGER) return ORG_ROLES.MANAGER;
  return ORG_ROLES.MEMBER;
}

// assertOrgManagerOrOwner: returns { orgRole } or throws 403 Response
async function assertOrgManagerOrOwner(base44, user, targetOrgId) {
  // Super admin bypass — no profile lookup needed
  if (user.appRole === APP_ROLES.SUPER_ADMIN) {
    return { orgRole: ORG_ROLES.OWNER };
  }
  // Org scope check
  if (!user.orgId || user.orgId !== targetOrgId) {
    throw Response.json({ error: 'Forbidden: You do not belong to this organization' }, { status: 403 });
  }
  const profile = await getUserOrgProfile(base44, user.id, targetOrgId);
  const orgRole = resolveOrgRole(user, profile);
  if (orgRole !== ORG_ROLES.OWNER && orgRole !== ORG_ROLES.MANAGER) {
    throw Response.json({ error: 'Forbidden: Organization owner or manager access required' }, { status: 403 });
  }
  return { orgRole };
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // H-01: Assert authenticated
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify user has an organization
    if (!user.orgId) {
      return Response.json({ error: 'User does not belong to an organization' }, { status: 400 });
    }

    // H-04: Assert org owner or manager (was previously missing entirely — F-27)
    await assertOrgManagerOrOwner(base44, user, user.orgId);

    // Load organization
    const orgs = await base44.asServiceRole.entities.Organization.filter({ id: user.orgId });
    if (!orgs || orgs.length === 0) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }
    const organization = orgs[0];

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get all team members in organization
    const teamMembers = await base44.asServiceRole.entities.User.filter({ orgId: user.orgId });
    const teamSize = teamMembers.length;

    // Get credits used this month (deduction transactions)
    const monthlyTransactions = await base44.asServiceRole.entities.Transaction.filter({
      orgId: user.orgId,
      type: 'deduction',
      created_date: {
        $gte: startOfMonth.toISOString(),
        $lte: endOfMonth.toISOString()
      }
    });

    const creditsUsedThisMonth = monthlyTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const avgCreditsPerUser = teamSize > 0 ? Math.round(creditsUsedThisMonth / teamSize * 10) / 10 : 0;

    return Response.json({
      totalPoolCredits: organization.creditBalance || 0,
      teamSize,
      creditsUsedThisMonth,
      avgCreditsPerUser,
      monthStart: startOfMonth.toISOString(),
      monthEnd: endOfMonth.toISOString()
    });

  } catch (err) {
    // Re-throw Response objects (thrown by permission helpers)
    if (err instanceof Response) return err;
    console.error('Error in getCompanyPoolStats:', err);
    return Response.json({ error: err.message || 'Failed to get company pool stats' }, { status: 500 });
  }
});