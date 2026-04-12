import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Update a team member's role within the organization.
 *
 * PERMISSION FIX (Phase 2 / Batch 2 / F-21 / M-16):
 * Previously: canAssignRole used user.orgProfile?.orgRole which is never set by
 *   auth.me() — always fell through to legacy appRole mapping.
 * Now: Profile is fetched explicitly. Canonical resolveOrgRole is used.
 *   Org scope is verified before the role assignment check.
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
    throw Response.json({ error: 'Forbidden: Only organization owners and managers can update team member roles' }, { status: 403 });
  }
  return { orgRole };
}

function assertCanAssignRole(callerOrgRole, targetOrgRole, isSuperAdmin) {
  if (isSuperAdmin) return;
  if (targetOrgRole === ORG_ROLES.OWNER) {
    throw Response.json({ error: 'Forbidden: Only super admins can assign the owner role' }, { status: 403 });
  }
  if (targetOrgRole === ORG_ROLES.MANAGER && callerOrgRole !== ORG_ROLES.OWNER) {
    throw Response.json({ error: 'Forbidden: Only organization owners can assign the manager role' }, { status: 403 });
  }
  if (targetOrgRole === ORG_ROLES.MEMBER && callerOrgRole !== ORG_ROLES.OWNER && callerOrgRole !== ORG_ROLES.MANAGER) {
    throw Response.json({ error: 'Forbidden: You do not have permission to assign this role' }, { status: 403 });
  }
}

function mapOrgRoleToLegacyAppRole(orgRole) {
  switch (orgRole) {
    case ORG_ROLES.OWNER: return APP_ROLES.ORGANIZATION_OWNER;
    case ORG_ROLES.MANAGER: return APP_ROLES.ORGANIZATION_MANAGER;
    default: return APP_ROLES.SALES_REP;
  }
}

async function upsertUserProfile(base44, userId, orgId, orgRole) {
  const existing = await base44.asServiceRole.entities.UserProfile.filter({ userId, orgId });
  if (existing.length > 0) {
    const profile = existing[0];
    if (orgRole && profile.orgRole !== orgRole) {
      return await base44.asServiceRole.entities.UserProfile.update(profile.id, { orgRole });
    }
    return profile;
  }
  return await base44.asServiceRole.entities.UserProfile.create({ userId, orgId, orgRole: orgRole || ORG_ROLES.MEMBER });
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

Deno.serve(async (req) => {
  console.log('=== updateTeamMemberRole START (Phase2-Batch2) ===');

  try {
    const base44 = createClientFromRequest(req);

    // H-01: Assert authenticated
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    console.log('Current user:', JSON.stringify({ id: user?.id, email: user?.email, appRole: user?.appRole, orgId: user?.orgId, isOrgOwner: user?.isOrgOwner }));

    if (!user.orgId) {
      return Response.json({ error: 'You must belong to an organization to manage team members' }, { status: 400 });
    }

    // H-04: Assert org manager or owner — NOW FETCHES PROFILE (fixes F-21)
    const { orgRole: callerOrgRole } = await assertOrgManagerOrOwner(base44, user, user.orgId);
    const isSuperAdmin = user.appRole === APP_ROLES.SUPER_ADMIN;

    console.log('Caller orgRole (from profile):', callerOrgRole);

    const body = await req.json();
    const { userId, role, orgRole } = body;
    console.log('Request body:', JSON.stringify({ userId, role, orgRole }));

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Resolve final orgRole
    let finalOrgRole = orgRole;
    if (orgRole) {
      const validOrgRoles = [ORG_ROLES.OWNER, ORG_ROLES.MANAGER, ORG_ROLES.MEMBER];
      if (!validOrgRoles.includes(orgRole)) {
        return Response.json({ error: `Invalid orgRole "${orgRole}". Must be "owner", "manager", or "member"` }, { status: 400 });
      }
    } else if (role) {
      if (!['sales_rep', 'organization_owner', 'organization_manager'].includes(role)) {
        return Response.json({ error: 'Invalid role' }, { status: 400 });
      }
      if (role === 'organization_owner') finalOrgRole = ORG_ROLES.OWNER;
      else if (role === 'organization_manager') finalOrgRole = ORG_ROLES.MANAGER;
      else finalOrgRole = ORG_ROLES.MEMBER;
    } else {
      return Response.json({ error: 'Role is required (orgRole or role)' }, { status: 400 });
    }

    console.log('Final orgRole to assign:', finalOrgRole);

    // H-07: Assert caller can assign this role — USES PROFILE-RESOLVED callerOrgRole (fixes F-21)
    assertCanAssignRole(callerOrgRole, finalOrgRole, isSuperAdmin);

    // Load target user
    const targetUsers = await base44.asServiceRole.entities.User.filter({ id: userId });
    if (targetUsers.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    const targetUser = targetUsers[0];

    console.log('Target user:', JSON.stringify({ id: targetUser.id, email: targetUser.email, orgId: targetUser.orgId }));

    // H-05: Assert target is in same org
    if (targetUser.orgId !== user.orgId) {
      return Response.json({ error: 'You can only update roles for members of your organization' }, { status: 403 });
    }

    // Prevent self-role changes (except super admin)
    if (targetUser.id === user.id && !isSuperAdmin) {
      return Response.json({ error: 'You cannot change your own role' }, { status: 403 });
    }

    const legacyAppRole = mapOrgRoleToLegacyAppRole(finalOrgRole);
    const isOwner = finalOrgRole === ORG_ROLES.OWNER;

    // Update legacy fields for backward compatibility
    await base44.asServiceRole.entities.User.update(userId, {
      appRole: legacyAppRole,
      isOrgOwner: isOwner
    });
    console.log('Updated User entity with appRole:', legacyAppRole, 'isOrgOwner:', isOwner);

    // Update UserProfile (canonical source of truth for role)
    try {
      await upsertUserProfile(base44, userId, targetUser.orgId, finalOrgRole);
      console.log('UserProfile updated with orgRole:', finalOrgRole);
    } catch (profileError) {
      console.error('Failed to update UserProfile:', profileError);
      // Continue — legacy role is still updated
    }

    console.log('=== updateTeamMemberRole SUCCESS (Phase2-Batch2) ===');
    return Response.json({
      success: true,
      message: 'Team member role updated successfully',
      userId,
      orgRole: finalOrgRole,
      newRole: legacyAppRole
    });

  } catch (err) {
    if (err instanceof Response) return err;
    console.error('Error in updateTeamMemberRole:', err);
    return Response.json({ success: false, error: err.message || 'Failed to update team member role' }, { status: 500 });
  }
});