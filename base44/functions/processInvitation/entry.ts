// functions/processInvitation.js
// Public endpoint - validates invitation token and returns minimal public-safe invitation details.
// No authentication required (new users won't be logged in)

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const INVALID_INVITATION_RESPONSE = {
  isValid: false,
  errorMessage: 'Invalid or expired invitation link'
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const { token } = await req.json();

    // 1. Validate input
    if (!token) {
      return Response.json(INVALID_INVITATION_RESPONSE, { status: 200 });
    }

    // 2. Find invitation by token
    const invitations = await base44.asServiceRole.entities.Invitation.filter({
      token
    });

    const invitation = invitations[0];

    // 3. Generic invalid response for non-public token states
    if (!invitation || invitation.status === 'accepted') {
      return Response.json(INVALID_INVITATION_RESPONSE, { status: 200 });
    }

    // 4. Check if expired
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      return Response.json(INVALID_INVITATION_RESPONSE, { status: 200 });
    }

    // 5. Get display-safe organization name
    let organizationName = 'Your Organization';
    try {
      const orgs = await base44.asServiceRole.entities.Organization.filter({
        id: invitation.orgId
      });
      if (orgs?.[0]?.name) {
        organizationName = orgs[0].name;
      }
    } catch {
      // Continue with default name; avoid logging internal records publicly.
    }

    // 6. Map role to display name
    const roleNames = {
      sales_rep: 'Sales Rep',
      organization_owner: 'Organization Admin'
    };
    const roleName = roleNames[invitation.role] || 'Team Member';

    // 7. Return minimal public-safe response
    return Response.json({
      isValid: true,
      organizationName,
      roleName
    });
  } catch {
    return Response.json(INVALID_INVITATION_RESPONSE, { status: 200 });
  }
});
