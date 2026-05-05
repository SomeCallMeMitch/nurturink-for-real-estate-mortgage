// functions/acceptInvitation.js
// Auth-required endpoint - completes invitation acceptance
// Links the authenticated user to the organization
// @version 2026-01-26-manual-deploy

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  console.log('=== acceptInvitation START (2026-01-26-manual) ===');

  const base44 = createClientFromRequest(req);

  try {
    const { token } = await req.json();

    // 1. Get current logged-in user
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({
        success: false,
        error: 'not_authenticated',
        message: 'Please log in to accept this invitation.'
      }, { status: 401 });
    }

    console.log('Current user:', JSON.stringify({ id: user.id, email: user.email }));

    // 2. Validate token input
    if (typeof token !== 'string' || !token.trim()) {
      return Response.json({
        success: false,
        error: 'invalid',
        message: 'Invitation token is required.'
      }, { status: 400 });
    }
    const normalizedToken = token.trim();

    // 3. Find invitation by token
    const invitations = await base44.asServiceRole.entities.Invitation.filter({
      token: normalizedToken
    });

    if (invitations.length > 1) {
      console.error('Duplicate invitation token detected:', normalizedToken, 'count:', invitations.length);
      return Response.json({
        success: false,
        error: 'invalid',
        message: 'Invalid invitation.'
      }, { status: 400 });
    }

    const invitation = invitations[0];

    // 4. Validate invitation exists
    if (!invitation) {
      return Response.json({
        success: false,
        error: 'invalid',
        message: 'Invalid invitation.'
      }, { status: 404 });
    }

    console.log('Found invitation:', JSON.stringify({
      id: invitation.id,
      orgRole: invitation.orgRole,
      role: invitation.role,
      email: invitation.email
    }));

    if (invitation.status === 'accepted') {
      return Response.json({
        success: false,
        error: 'already_accepted',
        message: 'This invitation has already been accepted.'
      }, { status: 400 });
    }

    // 5. Invitation must be pending
    if (invitation.status !== 'pending') {
      return Response.json({
        success: false,
        error: 'invalid_state',
        message: 'This invitation is no longer valid.'
      }, { status: 400 });
    }

    // 6. Check if expired
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      return Response.json({
        success: false,
        error: 'expired',
        message: 'This invitation has expired.'
      }, { status: 400 });
    }

    // 7. CRITICAL: Verify email match (case-insensitive)
    if (!user.email || !invitation.email) {
      return Response.json({
        success: false,
        error: 'invalid',
        message: 'Invitation email validation failed.'
      }, { status: 400 });
    }

    if (String(user.email).toLowerCase() !== String(invitation.email).toLowerCase()) {
      return Response.json({
        success: false,
        error: 'email_mismatch',
        message: `This invitation was sent to ${invitation.email}.`
      }, { status: 403 });
    }

    // 8. Update user with organization membership
    // Map orgRole to appRole for backwards compatibility
    const orgRoleToAppRole = {
      'owner': 'organization_owner',
      'manager': 'organization_manager',
      'member': 'sales_rep'
    };

    // Use orgRole (new system) or fall back to role (legacy)
    const orgRole = invitation.orgRole || invitation.role;
    const allowedRoles = new Set(['owner', 'manager', 'member']);
    if (!orgRole || !allowedRoles.has(orgRole)) {
      console.error('Invalid invitation role value:', JSON.stringify({
        invitationId: invitation.id,
        orgRole: invitation.orgRole,
        role: invitation.role
      }));
      return Response.json({
        success: false,
        error: 'invalid_role',
        message: 'Invalid invitation role.'
      }, { status: 400 });
    }
    const appRole = orgRoleToAppRole[orgRole];

    // 8a. Validate organization exists before any membership write
    const orgs = await base44.asServiceRole.entities.Organization.filter({
      id: invitation.orgId
    });
    if (!orgs || orgs.length === 0) {
      return Response.json({
        success: false,
        error: 'invalid',
        message: 'Organization not found.'
      }, { status: 404 });
    }

    console.log('Assigning role - orgRole:', orgRole, 'appRole:', appRole);

    await base44.auth.updateMe({
      orgId: invitation.orgId,
      appRole: appRole,
      isOrgOwner: orgRole === 'owner'
    });

    // 8b. Create/update UserProfile for the new role system
    try {
      const existingProfiles = await base44.asServiceRole.entities.UserProfile.filter({
        userId: user.id,
        orgId: invitation.orgId
      });

      if (existingProfiles.length > 0) {
        console.log('Updating existing UserProfile:', existingProfiles[0].id);
        await base44.asServiceRole.entities.UserProfile.update(existingProfiles[0].id, {
          orgRole: orgRole,
          updatedAt: new Date().toISOString()
        });
      } else {
        console.log('Creating new UserProfile for user:', user.id);
        await base44.asServiceRole.entities.UserProfile.create({
          userId: user.id,
          orgId: invitation.orgId,
          orgRole: orgRole,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (profileError) {
      console.error('Failed to create/update UserProfile:', profileError);
      // Continue - the user is still added to the org
    }

    // 9. Mark invitation as accepted
    await base44.asServiceRole.entities.Invitation.update(invitation.id, {
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      acceptedByUserId: user.id
    });

    // 10. Get org name for confirmation message
    let organizationName = 'your organization';
    try {
      if (orgs && orgs.length > 0) {
        organizationName = orgs[0].name;
      }
    } catch (orgError) {
      console.error('Failed to fetch organization name:', orgError);
      // Continue with default name
    }

    console.log('=== acceptInvitation SUCCESS ===');
    console.log(`User ${user.email} joined ${organizationName} as ${orgRole}`);

    return Response.json({
      success: true,
      organizationName: organizationName,
      assignedRole: orgRole
    });

  } catch (error) {
    console.error('acceptInvitation error:', error);
    return Response.json({
      success: false,
      error: 'error',
      message: 'Failed to accept invitation. Please try again.'
    }, { status: 500 });
  }
});
