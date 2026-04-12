import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Get comprehensive team data for an organization.
 *
 * PERMISSION UPDATE (Phase 2 / Batch 3 / F-23 / M-18):
 * Previously: Triple-source permission check (profile.orgRole + user.appRole + user.isOrgOwner).
 *   Intent was correct but logic was redundant and inconsistent.
 * Now: Canonical assertOrgManagerOrOwner used — single, profile-first check.
 *   Policy is unchanged: org owners, managers, and super admins can access.
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

function mapLegacyAppRoleToOrgRole(appRole, isOrgOwnerFlag) {
  if (isOrgOwnerFlag || appRole === APP_ROLES.ORGANIZATION_OWNER) return ORG_ROLES.OWNER;
  if (appRole === APP_ROLES.ORGANIZATION_MANAGER) return ORG_ROLES.MANAGER;
  return ORG_ROLES.MEMBER;
}

async function assertOrgManagerOrOwner(base44, user, targetOrgId) {
  if (user.appRole === APP_ROLES.SUPER_ADMIN) return { orgRole: ORG_ROLES.OWNER, profile: null };
  if (!user.orgId || user.orgId !== targetOrgId) {
    throw Response.json({ error: 'Forbidden: You do not belong to this organization' }, { status: 403 });
  }
  const profile = await getUserOrgProfile(base44, user.id, targetOrgId);
  const orgRole = resolveOrgRole(user, profile);
  if (orgRole !== ORG_ROLES.OWNER && orgRole !== ORG_ROLES.MANAGER) {
    throw Response.json({ error: 'Forbidden: Only organization owners, managers, and super admins can view team data' }, { status: 403 });
  }
  return { orgRole, profile };
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

Deno.serve(async (req) => {
  console.log('=== getOrganizationTeamData START (Phase2-Batch3) ===');

  try {
    const base44 = createClientFromRequest(req);

    // H-01: Assert authenticated
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    console.log('Current user:', JSON.stringify({ id: user?.id, email: user?.email, appRole: user?.appRole, orgId: user?.orgId }));

    if (!user.orgId) {
      if (user.appRole === APP_ROLES.SUPER_ADMIN) {
        return Response.json({ error: 'Super admin must be assigned to an organization to view team data.' }, { status: 400 });
      }
      return Response.json({ error: 'No organization found' }, { status: 400 });
    }

    // H-04: Assert org manager or owner — canonical, single-source (fixes F-23 triple-source)
    const { orgRole: currentUserOrgRole, profile: currentUserProfile } = await assertOrgManagerOrOwner(base44, user, user.orgId);
    const currentUserProfileId = currentUserProfile?.id || null;

    console.log('Permission check passed. currentUserOrgRole:', currentUserOrgRole);

    const targetOrgId = user.orgId;

    // Fetch team members and all UserProfiles in parallel
    const [teamMembers, pendingInvitations, userProfiles] = await Promise.all([
      base44.asServiceRole.entities.User.filter({ orgId: targetOrgId }),
      base44.asServiceRole.entities.Invitation.filter({ orgId: targetOrgId, status: 'pending' }),
      base44.asServiceRole.entities.UserProfile.filter({ orgId: targetOrgId }).catch(err => {
        console.error('Error fetching UserProfiles:', err);
        return [];
      }),
    ]);

    console.log('Team members:', teamMembers.length, 'Pending invitations:', pendingInvitations.length);

    // Build profile lookup map
    const profileMap = new Map();
    userProfiles.forEach(profile => profileMap.set(profile.userId, profile));

    // Map team members with canonical orgRole
    const membersWithStats = teamMembers.map(member => {
      const nameParts = (member.full_name || member.email).split(' ');
      const initials = nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : (nameParts[0][0] || 'U').toUpperCase();

      const userProfile = profileMap.get(member.id);
      const orgRole = userProfile?.orgRole || mapLegacyAppRoleToOrgRole(member.appRole, member.isOrgOwner);

      console.log(`Member ${member.email}: profile=${userProfile?.id || 'none'}, orgRole=${orgRole}`);

      return {
        userId: member.id,
        name: member.full_name || member.email,
        email: member.email,
        initials,
        role: member.appRole || 'sales_rep',
        isOrgOwner: orgRole === ORG_ROLES.OWNER || member.appRole === APP_ROLES.ORGANIZATION_OWNER || member.isOrgOwner === true,
        orgProfile: { orgRole, profileId: userProfile?.id || null },
        status: 'Active',
        credits: (member.companyAllocatedCredits || 0) + (member.personalPurchasedCredits || 0),
        companyAllocatedCredits: member.companyAllocatedCredits || 0,
        personalPurchasedCredits: member.personalPurchasedCredits || 0,
        canAccessCompanyPool: member.canAccessCompanyPool || false,
        cardsSent: 0,
        cardsSentThisMonth: 0,
        lastActive: member.updated_date || member.created_date,
        createdAt: member.created_date
      };
    });

    // Map pending invitations
    const pendingMembers = pendingInvitations.map(invitation => ({
      invitationId: invitation.id,
      userId: null,
      name: invitation.email,
      email: invitation.email,
      initials: invitation.email[0].toUpperCase(),
      role: invitation.role,
      isOrgOwner: invitation.orgRole === ORG_ROLES.OWNER || invitation.role === APP_ROLES.ORGANIZATION_OWNER,
      orgProfile: {
        orgRole: invitation.orgRole || mapLegacyAppRoleToOrgRole(invitation.role, false),
        profileId: null
      },
      status: 'Pending',
      credits: 0,
      companyAllocatedCredits: 0,
      personalPurchasedCredits: 0,
      canAccessCompanyPool: false,
      cardsSent: 0,
      cardsSentThisMonth: 0,
      lastActive: invitation.createdAt,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt
    }));

    const allMembers = [...membersWithStats, ...pendingMembers];
    allMembers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const activeMembers = membersWithStats.filter(m => m.status === 'Active').length;
    const ownerCount = membersWithStats.filter(m => m.orgProfile.orgRole === ORG_ROLES.OWNER).length;
    const managerCount = membersWithStats.filter(m => m.orgProfile.orgRole === ORG_ROLES.MANAGER).length;
    const totalCardsSent = membersWithStats.reduce((sum, m) => sum + m.cardsSent, 0);

    const summaryStats = {
      totalMembers: allMembers.length,
      activeMembers,
      owners: ownerCount,
      managers: managerCount,
      admins: ownerCount + managerCount,
      cardsSent: totalCardsSent
    };

    const currentUserData = {
      id: user.id,
      orgId: user.orgId,
      appRole: user.appRole,
      orgProfile: { orgRole: currentUserOrgRole, profileId: currentUserProfileId }
    };

    console.log('=== getOrganizationTeamData SUCCESS (Phase2-Batch3) ===', JSON.stringify(summaryStats));
    return Response.json({ members: allMembers, summaryStats, currentUser: currentUserData });

  } catch (err) {
    if (err instanceof Response) return err;
    console.error('Error in getOrganizationTeamData:', err);
    return Response.json({ error: err.message || 'Failed to fetch team data' }, { status: 500 });
  }
});