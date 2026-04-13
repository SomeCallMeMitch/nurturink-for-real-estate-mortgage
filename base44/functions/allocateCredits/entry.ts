import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Allocate credits from organization pool to team members.
 * Organization owners AND managers can perform this action.
 *
 * PERMISSION UPDATES (Phase 2 / Batch 2 / F-16, F-17, F-18 / M-13, M-14):
 * - F-16: Replaced inlined isOrgAdmin with canonical assertOrgManagerOrOwner (profile-first).
 * - F-17: Replaced triple-source isManager/isOwner check with profile-resolved orgRole.
 * - F-18: Owner notification lookup now also queries UserProfile (not just legacy fields).
 *
 * Canonical helpers inlined per Base44 constraint (no local imports).
 */

// =============================================================================
// INLINED CANONICAL PERMISSION HELPERS
// =============================================================================

const ORG_ROLES = { OWNER: 'owner', MANAGER: 'manager', MEMBER: 'member' };
const APP_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORGANIZATION_OWNER: 'organization_owner',
  ORGANIZATION_MANAGER: 'organization_manager',
  SALES_REP: 'sales_rep',
};

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
  if (user.isOrgOwner === true || user.appRole === APP_ROLES.ORGANIZATION_OWNER) return ORG_ROLES.OWNER;
  if (user.appRole === APP_ROLES.ORGANIZATION_MANAGER) return ORG_ROLES.MANAGER;
  return ORG_ROLES.MEMBER;
}

async function assertOrgManagerOrOwner(base44, user, targetOrgId) {
  if (user.appRole === APP_ROLES.SUPER_ADMIN) return { orgRole: ORG_ROLES.OWNER };
  if (!user.orgId || user.orgId !== targetOrgId) {
    throw Response.json({ error: 'Forbidden: You do not belong to this organization' }, { status: 403 });
  }
  const profile = await getUserOrgProfile(base44, user.id, targetOrgId);
  const orgRole = resolveOrgRole(user, profile);
  if (orgRole !== ORG_ROLES.OWNER && orgRole !== ORG_ROLES.MANAGER) {
    throw Response.json({ error: 'Only organization owners and managers can allocate credits' }, { status: 403 });
  }
  return { orgRole };
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

Deno.serve(async (req) => {
  console.log('=== allocateCredits START (Phase2-Batch2) ===');

  try {
    const base44 = createClientFromRequest(req);

    // H-01: Assert authenticated
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    console.log('Current user:', JSON.stringify({ id: user.id, email: user.email, appRole: user.appRole, isOrgOwner: user.isOrgOwner, orgId: user.orgId }));

    if (!user.orgId) {
      return Response.json({ error: 'User does not belong to an organization' }, { status: 400 });
    }

    // H-04: Assert org manager or owner — canonical, profile-first (fixes F-16)
    const { orgRole: callerOrgRole } = await assertOrgManagerOrOwner(base44, user, user.orgId);
    console.log('Caller orgRole (from profile):', callerOrgRole);

    const body = await req.json();
    const { allocations } = body;

    if (!allocations || typeof allocations !== 'object') {
      return Response.json({ error: 'allocations must be an object with userId: amount pairs' }, { status: 400 });
    }

    const totalToAllocate = Object.values(allocations).reduce((sum, amount) => sum + (typeof amount === 'number' ? amount : 0), 0);
    if (totalToAllocate <= 0) {
      return Response.json({ error: 'Total allocation must be greater than 0' }, { status: 400 });
    }

    // Load organization
    const orgs = await base44.asServiceRole.entities.Organization.filter({ id: user.orgId });
    if (!orgs || orgs.length === 0) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }
    const organization = orgs[0];
    const currentOrgBalance = organization.creditBalance || 0;

    if (currentOrgBalance < totalToAllocate) {
      return Response.json({
        error: 'Insufficient credits in organization pool',
        available: currentOrgBalance,
        requested: totalToAllocate,
        deficit: totalToAllocate - currentOrgBalance
      }, { status: 400 });
    }

    // Process allocations
    const allocationResults = [];
    for (const [userId, amount] of Object.entries(allocations)) {
      if (typeof amount !== 'number' || amount <= 0) continue;

      const users = await base44.asServiceRole.entities.User.filter({ id: userId });
      if (!users || users.length === 0) {
        allocationResults.push({ userId, success: false, error: 'User not found' });
        continue;
      }

      const teamMember = users[0];

      // H-05: Assert target is in same org
      if (teamMember.orgId !== user.orgId) {
        allocationResults.push({ userId, success: false, error: 'User does not belong to your organization' });
        continue;
      }

      const newCompanyAllocated = (teamMember.companyAllocatedCredits || 0) + amount;
      await base44.asServiceRole.entities.User.update(userId, { companyAllocatedCredits: newCompanyAllocated });

      await base44.asServiceRole.entities.Transaction.create({
        orgId: user.orgId,
        userId,
        type: 'allocation_in',
        amount,
        balanceAfter: newCompanyAllocated,
        balanceType: 'user',
        description: `Credit allocation from organization pool by ${user.full_name || user.email}`,
        fromAccountId: organization.id,
        fromAccountType: 'company',
        toAccountId: userId,
        toAccountType: 'user',
        metadata: {
          allocatedBy: user.id,
          allocatedByName: user.full_name || user.email,
          creditType: 'companyAllocatedCredits'
        }
      });

      allocationResults.push({
        userId,
        userName: teamMember.full_name || teamMember.email,
        success: true,
        amount,
        newBalance: newCompanyAllocated,
        updatedUser: { id: userId, companyAllocatedCredits: newCompanyAllocated }
      });
    }

    // BATCH2-FIX: Compute actual allocated total from SUCCESSFUL results only.
    // Previously used pre-calculated totalToAllocate which caused credit leaks when
    // individual user allocations failed (user not found, wrong org, etc.).
    const actualAllocated = allocationResults
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.amount, 0);

    const newOrgBalance = currentOrgBalance - actualAllocated;

    // Only deduct org balance and create org-level transaction if something was actually allocated
    if (actualAllocated > 0) {
      await base44.asServiceRole.entities.Organization.update(organization.id, { creditBalance: newOrgBalance });

      await base44.asServiceRole.entities.Transaction.create({
        orgId: user.orgId,
        userId: user.id,
        type: 'allocation_out',
        amount: -actualAllocated,
        balanceAfter: newOrgBalance,
        balanceType: 'organization',
        description: `Allocated ${actualAllocated} credits to team members`,
        fromAccountId: organization.id,
        fromAccountType: 'company',
        toAccountId: user.id,
        toAccountType: 'user',
        metadata: { allocationCount: allocationResults.filter(r => r.success).length, allocations }
      });
    } else {
      console.warn('[allocateCredits] No credits actually allocated — org balance unchanged');
    }

    // Notify owners if the caller is a manager (not owner) — F-17/F-18 fix
    // callerOrgRole is now profile-resolved (fixes F-17)
    const callerIsManager = callerOrgRole === ORG_ROLES.MANAGER;

    if (callerIsManager) {
      console.log('Manager allocated credits — notifying owner(s)...');
      try {
        // F-18 fix: query owners via both legacy fields AND UserProfile (canonical)
        const [legacyOwnersByFlag, legacyOwnersByRole, profileOwners] = await Promise.all([
          base44.asServiceRole.entities.User.filter({ orgId: user.orgId, isOrgOwner: true }),
          base44.asServiceRole.entities.User.filter({ orgId: user.orgId, appRole: APP_ROLES.ORGANIZATION_OWNER }),
          base44.asServiceRole.entities.UserProfile.filter({ orgId: user.orgId, orgRole: ORG_ROLES.OWNER }),
        ]);

        // Collect all owner user IDs from profile records
        const ownerUserIdsFromProfiles = new Set(profileOwners.map(p => p.userId));

        // Load user records for profile-based owners not already in legacy results
        const allOwnersByLegacy = [...legacyOwnersByFlag, ...legacyOwnersByRole];
        const legacyOwnerIds = new Set(allOwnersByLegacy.map(u => u.id));

        const additionalOwnerIds = [...ownerUserIdsFromProfiles].filter(id => !legacyOwnerIds.has(id));
        const additionalOwners = additionalOwnerIds.length > 0
          ? await base44.asServiceRole.entities.User.filter({ orgId: user.orgId })
              .then(all => all.filter(u => additionalOwnerIds.includes(u.id)))
          : [];

        const ownerEmails = new Set();
        [...allOwnersByLegacy, ...additionalOwners].forEach(owner => {
          if (owner.email && owner.id !== user.id) ownerEmails.add(owner.email);
        });

        const successfulAllocations = allocationResults.filter(r => r.success);
        const allocationSummary = successfulAllocations.map(a => `• ${a.userName}: ${a.amount} credits`).join('\n');

        for (const ownerEmail of ownerEmails) {
          try {
            await base44.integrations.Core.SendEmail({
              to: ownerEmail,
              subject: `Credit Allocation by ${user.full_name || user.email}`,
              body: `Hello,\n\nA manager in your organization has allocated credits from the company pool.\n\nAllocated by: ${user.full_name || user.email}\nTotal credits allocated: ${actualAllocated}\nNew organization pool balance: ${newOrgBalance}\n\nAllocation details:\n${allocationSummary}\n\nBest regards,\nNurturInk Team`,
              from_name: 'NurturInk'
            });
          } catch (emailError) {
            console.error('Failed to send owner notification to', ownerEmail, ':', emailError);
          }
        }
      } catch (notifyError) {
        console.error('Error sending owner notifications:', notifyError);
      }
    }

    console.log('=== allocateCredits SUCCESS (Phase2-Batch2) ===', { actualAllocated, newOrgBalance });
    return Response.json({
      success: true,
      totalAllocated: actualAllocated,
      organizationBalanceAfter: newOrgBalance,
      allocations: allocationResults
    });

  } catch (err) {
    if (err instanceof Response) return err;
    console.error('Error in allocateCredits:', err);
    return Response.json({ error: err.message || 'Failed to allocate credits' }, { status: 500 });
  }
});