import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Invite a new team member to the organization.
 *
 * PERMISSION FIX (Phase 2 / Batch 2 / F-19, F-20 / M-15):
 * Previously: isOrgAdmin(user) used user.isOrgOwner and user.appRole only —
 *   user.orgProfile was never set by auth.me(), so canAssignRole always fell
 *   through to legacy mapping. Also: no profile fetch before role assignment check.
 * Now: Profile is fetched and used as canonical role source. Legacy is fallback only.
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

// assertOrgManagerOrOwner: profile-fetching check for invite access
async function assertOrgManagerOrOwner(base44, user, targetOrgId) {
  if (user.appRole === APP_ROLES.SUPER_ADMIN) return { orgRole: ORG_ROLES.OWNER };
  if (!user.orgId || user.orgId !== targetOrgId) {
    throw Response.json({ error: 'Forbidden: You do not belong to this organization' }, { status: 403 });
  }
  const profile = await getUserOrgProfile(base44, user.id, targetOrgId);
  const orgRole = resolveOrgRole(user, profile);
  if (orgRole !== ORG_ROLES.OWNER && orgRole !== ORG_ROLES.MANAGER) {
    throw Response.json({ error: 'Forbidden: Only organization owners and managers can invite team members' }, { status: 403 });
  }
  return { orgRole };
}

// assertCanAssignRole: verify caller can assign the requested role
// callerOrgRole comes from assertOrgManagerOrOwner result
function assertCanAssignRole(callerOrgRole, targetOrgRole, isSuperAdmin) {
  if (isSuperAdmin) return; // super admin can assign any role

  if (targetOrgRole === ORG_ROLES.OWNER) {
    throw Response.json({ error: 'Forbidden: Only super admins can invite organization owners' }, { status: 403 });
  }
  if (targetOrgRole === ORG_ROLES.MANAGER && callerOrgRole !== ORG_ROLES.OWNER) {
    throw Response.json({ error: 'Forbidden: Only organization owners can invite managers' }, { status: 403 });
  }
  if (targetOrgRole === ORG_ROLES.MEMBER && callerOrgRole !== ORG_ROLES.OWNER && callerOrgRole !== ORG_ROLES.MANAGER) {
    throw Response.json({ error: 'Forbidden: You do not have permission to invite members' }, { status: 403 });
  }
}

function mapOrgRoleToLegacyAppRole(orgRole) {
  switch (orgRole) {
    case ORG_ROLES.OWNER: return APP_ROLES.ORGANIZATION_OWNER;
    case ORG_ROLES.MANAGER: return APP_ROLES.ORGANIZATION_MANAGER;
    default: return APP_ROLES.SALES_REP;
  }
}

function getOrgRoleDisplayName(orgRole) {
  switch (orgRole) {
    case ORG_ROLES.OWNER: return 'Owner';
    case ORG_ROLES.MANAGER: return 'Manager';
    default: return 'Member';
  }
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

Deno.serve(async (req) => {
  console.log('=== inviteTeamMember START (Phase2-Batch2) ===');

  try {
    const base44 = createClientFromRequest(req);

    // H-01: Assert authenticated
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    console.log('Current user:', JSON.stringify({ id: user?.id, email: user?.email, appRole: user?.appRole, orgId: user?.orgId, isOrgOwner: user?.isOrgOwner }));

    if (!user.orgId) {
      return Response.json({ error: 'You must belong to an organization to invite members' }, { status: 400 });
    }

    // H-04: Assert org manager or owner — NOW FETCHES PROFILE (fixes F-19/F-20)
    const { orgRole: callerOrgRole } = await assertOrgManagerOrOwner(base44, user, user.orgId);
    const isSuperAdmin = user.appRole === APP_ROLES.SUPER_ADMIN;

    console.log('Caller orgRole (from profile):', callerOrgRole);

    // Load organization for email template
    const organizations = await base44.asServiceRole.entities.Organization.filter({ id: user.orgId });
    const organization = organizations.length > 0 ? organizations[0] : null;

    // Parse request body
    const body = await req.json();
    const { email, role, orgRole } = body;
    console.log('Request body:', JSON.stringify({ email, role, orgRole }));

    if (!email || !email.trim()) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Resolve final orgRole — prefer new orgRole field, fall back to legacy role
    let finalOrgRole = orgRole;
    if (orgRole) {
      const validOrgRoles = [ORG_ROLES.OWNER, ORG_ROLES.MANAGER, ORG_ROLES.MEMBER];
      if (!validOrgRoles.includes(orgRole)) {
        return Response.json({ error: `Invalid orgRole "${orgRole}". Must be "owner", "manager", or "member"` }, { status: 400 });
      }
    } else if (role) {
      if (!['sales_rep', 'organization_owner', 'organization_manager'].includes(role)) {
        return Response.json({ error: 'Invalid role. Must be "sales_rep", "organization_manager", or "organization_owner"' }, { status: 400 });
      }
      if (role === 'organization_owner') finalOrgRole = ORG_ROLES.OWNER;
      else if (role === 'organization_manager') finalOrgRole = ORG_ROLES.MANAGER;
      else finalOrgRole = ORG_ROLES.MEMBER;
    } else {
      finalOrgRole = ORG_ROLES.MEMBER;
    }

    console.log('Final orgRole to assign:', finalOrgRole);

    // H-07: Assert caller can assign this role — USES PROFILE-RESOLVED callerOrgRole (fixes F-20)
    assertCanAssignRole(callerOrgRole, finalOrgRole, isSuperAdmin);

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email: normalizedEmail });
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.orgId === user.orgId) {
        return Response.json({ error: 'This user is already a member of your organization' }, { status: 400 });
      }
      if (existingUser.orgId && existingUser.orgId !== user.orgId) {
        return Response.json({ error: 'This user already belongs to another organization' }, { status: 400 });
      }
    }

    // Check for existing pending invitation
    const existingInvitations = await base44.asServiceRole.entities.Invitation.filter({
      email: normalizedEmail,
      orgId: user.orgId,
      status: 'pending'
    });
    if (existingInvitations.length > 0) {
      return Response.json({ error: 'An invitation has already been sent to this email address' }, { status: 400 });
    }

    const legacyAppRole = mapOrgRoleToLegacyAppRole(finalOrgRole);
    const token = crypto.randomUUID();

    const invitation = await base44.asServiceRole.entities.Invitation.create({
      email: normalizedEmail,
      orgId: user.orgId,
      orgRole: finalOrgRole,
      invitedBy: user.id,
      invitedByUserId: user.id,
      invitedByName: user.full_name || user.email,
      token,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    console.log('Invitation created:', invitation.id);

    try {
      const roleDisplay = getOrgRoleDisplayName(finalOrgRole);
      await base44.functions.invoke('sendTeamInvitationEmail', {
        inviter_firstName: user.full_name?.split(' ')[0] || user.email,
        inviter_fullName: user.full_name || user.email,
        invitee_email: normalizedEmail,
        organization_name: organization?.name || 'your organization',
        role: legacyAppRole,
        role_display: roleDisplay,
        invitation_token: token,
        invitation_expires: invitation.expiresAt
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Non-fatal — invitation is still created
    }

    console.log('=== inviteTeamMember SUCCESS (Phase2-Batch2) ===');
    return Response.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        orgRole: invitation.orgRole,
        status: invitation.status,
        expiresAt: invitation.expiresAt
      }
    });

  } catch (err) {
    if (err instanceof Response) return err;
    console.error('inviteTeamMember error:', err);
    return Response.json({ success: false, error: err.message || 'Failed to invite team member' }, { status: 500 });
  }
});