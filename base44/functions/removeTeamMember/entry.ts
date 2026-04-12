import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Remove a team member from the organization.
 *
 * PERMISSION UPDATE (Phase 2 / Batch 3 / F-22 / M-17):
 * Previously: Inlined helpers with correct intent but duplicated logic.
 * Now: Consolidated with canonical assertCanRemoveMember pattern.
 *   Logic is unchanged — this is a consolidation, not a policy change.
 *
 * Role hierarchy (unchanged):
 *   super_admin > owner > manager > member
 *   Owners cannot remove other owners.
 *   Managers cannot remove owners or other managers.
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

// H-06: assertCanRemoveMember — canonical hierarchy check
async function assertCanRemoveMember(base44, callerUser, targetUser) {
  const isSuperAdmin = callerUser.appRole === APP_ROLES.SUPER_ADMIN;
  if (isSuperAdmin) return { callerOrgRole: ORG_ROLES.OWNER, targetOrgRole: ORG_ROLES.MEMBER };

  const [callerProfile, targetProfile] = await Promise.all([
    getUserOrgProfile(base44, callerUser.id, callerUser.orgId),
    getUserOrgProfile(base44, targetUser.id, targetUser.orgId),
  ]);

  const callerOrgRole = resolveOrgRole(callerUser, callerProfile);
  const targetOrgRole = resolveOrgRole(targetUser, targetProfile);

  if (callerOrgRole === ORG_ROLES.MEMBER) {
    throw Response.json({ error: 'Forbidden: Only organization owners and managers can remove team members' }, { status: 403 });
  }
  if (callerOrgRole === ORG_ROLES.OWNER && targetOrgRole === ORG_ROLES.OWNER) {
    throw Response.json({ error: 'Forbidden: Owners cannot remove other owners. Contact a super admin.' }, { status: 403 });
  }
  if (callerOrgRole === ORG_ROLES.MANAGER && targetOrgRole === ORG_ROLES.OWNER) {
    throw Response.json({ error: 'Forbidden: Managers cannot remove organization owners' }, { status: 403 });
  }
  if (callerOrgRole === ORG_ROLES.MANAGER && targetOrgRole === ORG_ROLES.MANAGER) {
    throw Response.json({ error: 'Forbidden: Managers cannot remove other managers. Contact an organization owner.' }, { status: 403 });
  }

  return { callerOrgRole, targetOrgRole };
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

Deno.serve(async (req) => {
  console.log('=== removeTeamMember START (Phase2-Batch3) ===');

  try {
    const base44 = createClientFromRequest(req);

    // H-01: Assert authenticated
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    console.log('Current user:', JSON.stringify({ id: user.id, email: user.email, appRole: user.appRole, isOrgOwner: user.isOrgOwner, orgId: user.orgId }));

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    // Prevent self-removal
    if (userId === user.id) {
      return Response.json({ error: 'You cannot remove yourself from the organization' }, { status: 400 });
    }

    // Load target user
    const targetUsers = await base44.asServiceRole.entities.User.filter({ id: userId });
    if (targetUsers.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    const targetUser = targetUsers[0];

    console.log('Target user:', JSON.stringify({ id: targetUser.id, email: targetUser.email, appRole: targetUser.appRole, orgId: targetUser.orgId }));

    // H-05: Assert same org
    if (targetUser.orgId !== user.orgId) {
      return Response.json({ error: 'This user does not belong to your organization' }, { status: 403 });
    }

    // H-06: Assert caller has rank authority — canonical (consolidates F-22)
    const { callerOrgRole, targetOrgRole } = await assertCanRemoveMember(base44, user, targetUser);
    console.log('Permission check passed. callerOrgRole:', callerOrgRole, 'targetOrgRole:', targetOrgRole);

    // Remove user from organization
    await base44.asServiceRole.entities.User.update(userId, {
      orgId: null,
      appRole: 'user',
      isOrgOwner: false
    });

    // Delete UserProfile record
    try {
      const targetProfiles = await base44.asServiceRole.entities.UserProfile.filter({ userId, orgId: user.orgId });
      if (targetProfiles.length > 0) {
        await base44.asServiceRole.entities.UserProfile.delete(targetProfiles[0].id);
        console.log('Deleted UserProfile:', targetProfiles[0].id);
      }
    } catch (profileError) {
      console.error('Error removing UserProfile:', profileError);
    }

    // Notify removed user
    try {
      await base44.integrations.Core.SendEmail({
        to: targetUser.email,
        subject: 'You have been removed from the organization',
        body: `Hello,\n\nYou have been removed from the organization by ${user.full_name || user.email}.\n\nIf you believe this was done in error, please contact your organization administrator.\n\nBest regards,\nNurturInk Team`,
        from_name: 'NurturInk'
      });
    } catch (emailError) {
      console.error('Failed to send removal notification email:', emailError);
    }

    console.log('=== removeTeamMember SUCCESS (Phase2-Batch3) ===');
    return Response.json({ success: true, message: 'Team member removed successfully', userId });

  } catch (err) {
    if (err instanceof Response) return err;
    console.error('Error in removeTeamMember:', err);
    return Response.json({ error: err.message || 'Failed to remove team member' }, { status: 500 });
  }
});