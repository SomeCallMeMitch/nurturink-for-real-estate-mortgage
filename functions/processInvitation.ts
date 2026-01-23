// functions/processInvitation.js
// Public endpoint - validates invitation token and returns invitation details
// No authentication required (new users won't be logged in)

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getOrgRoleDisplayName, ORG_ROLES } from './utils/roleHelpers.ts';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const { token } = await req.json();
    
    // 1. Validate input
    if (!token) {
      return Response.json({ 
        isValid: false, 
        errorType: 'invalid', 
        errorMessage: 'Invitation token is required.' 
      });
    }

    // 2. Find invitation by token
    const invitations = await base44.asServiceRole.entities.Invitation.filter({
      token: token
    });
    
    const invitation = invitations[0];
    
    // 3. Check if invitation exists
    if (!invitation) {
      return Response.json({ 
        isValid: false, 
        errorType: 'invalid', 
        errorMessage: 'This invitation link is not valid.' 
      });
    }
    
    // 4. Check if already accepted
    if (invitation.status === 'accepted') {
      return Response.json({ 
        isValid: false, 
        errorType: 'already_accepted', 
        errorMessage: 'This invitation has already been accepted.' 
      });
    }
    
    // 5. Check if expired
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      return Response.json({ 
        isValid: false, 
        errorType: 'expired', 
        errorMessage: 'This invitation has expired. Please ask your admin to send a new one.' 
      });
    }
    
    // 6. Get organization details
    let organizationName = 'Your Organization';
    try {
      const orgs = await base44.asServiceRole.entities.Organization.filter({
        id: invitation.orgId
      });
      if (orgs && orgs.length > 0) {
        organizationName = orgs[0].name;
      }
    } catch (orgError) {
      console.error('Failed to fetch organization:', orgError);
      // Continue with default name
    }
    
    // 7. Determine role display name
    // Prefer new orgRole field, fall back to legacy role
    let roleName = 'Team Member';
    const orgRole = invitation.orgRole || mapLegacyRoleToOrgRole(invitation.role);
    roleName = getOrgRoleDisplayName(orgRole);
    
    // 8. Return success response
    return Response.json({
      isValid: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role, // Legacy field for backward compatibility
        orgRole: orgRole, // New field
        roleName: roleName,
        organizationId: invitation.orgId,
        organizationName: organizationName,
        invitedByName: invitation.invitedByName || 'Your team admin'
      }
    });
    
  } catch (error) {
    console.error('processInvitation error:', error);
    return Response.json({ 
      isValid: false, 
      errorType: 'error', 
      errorMessage: 'Unable to process invitation. Please try again.' 
    }, { status: 500 });
  }
});

/**
 * Map legacy role to new orgRole
 */
function mapLegacyRoleToOrgRole(legacyRole: string): string {
  if (legacyRole === 'organization_owner') {
    return ORG_ROLES.OWNER;
  }
  if (legacyRole === 'organization_manager') {
    return ORG_ROLES.MANAGER;
  }
  return ORG_ROLES.MEMBER;
}
