import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Invite a new team member to the organization - INLINED VERSION (JavaScript)
 * All role helpers are inlined to avoid import sync issues
 * 
 * @version 2026-01-26-inlined-js
 */

// =============================================================================
// INLINED ROLE CONSTANTS
// =============================================================================

const ORG_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  MEMBER: 'member',
};

const APP_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORGANIZATION_OWNER: 'organization_owner',
  ORGANIZATION_MANAGER: 'organization_manager',
  SALES_REP: 'sales_rep',
};

// =============================================================================
// INLINED ROLE FUNCTIONS
// =============================================================================

function isSuperAdmin(user) {
  if (!user) return false;
  return user.appRole === APP_ROLES.SUPER_ADMIN || user.role === 'admin';
}

function isOrgOwner(user) {
  if (!user) return false;
  return user.isOrgOwner === true || user.appRole === APP_ROLES.ORGANIZATION_OWNER;
}

function isOrgManager(user) {
  if (!user) return false;
  return user.appRole === APP_ROLES.ORGANIZATION_MANAGER;
}

function isOrgAdmin(user) {
  if (!user) return false;
  return isOrgOwner(user) || isOrgManager(user);
}

function mapLegacyAppRoleToOrgRole(appRole, isOrgOwnerFlag) {
  if (isOrgOwnerFlag || appRole === APP_ROLES.ORGANIZATION_OWNER) {
    return ORG_ROLES.OWNER;
  }
  if (appRole === APP_ROLES.ORGANIZATION_MANAGER) {
    return ORG_ROLES.MANAGER;
  }
  return ORG_ROLES.MEMBER;
}

function mapOrgRoleToLegacyAppRole(orgRole) {
  switch (orgRole) {
    case ORG_ROLES.OWNER:
      return APP_ROLES.ORGANIZATION_OWNER;
    case ORG_ROLES.MANAGER:
      return APP_ROLES.ORGANIZATION_MANAGER;
    case ORG_ROLES.MEMBER:
    default:
      return APP_ROLES.SALES_REP;
  }
}

function getOrgRoleDisplayName(orgRole) {
  switch (orgRole) {
    case ORG_ROLES.OWNER: return 'Owner';
    case ORG_ROLES.MANAGER: return 'Manager';
    case ORG_ROLES.MEMBER: return 'Member';
    default: return orgRole || 'Member';
  }
}

function canAssignRole(user, targetRole) {
  if (!user) return false;
  
  // Super admins can assign any role
  if (isSuperAdmin(user)) return true;
  
  // Determine the user's orgRole
  let userOrgRole = user.orgProfile?.orgRole;
  if (!userOrgRole) {
    userOrgRole = mapLegacyAppRoleToOrgRole(user.appRole, user.isOrgOwner);
  }
  
  // Owners can assign manager and member
  if (userOrgRole === ORG_ROLES.OWNER) {
    return targetRole === ORG_ROLES.MANAGER || targetRole === ORG_ROLES.MEMBER;
  }
  
  // Managers can only assign member
  if (userOrgRole === ORG_ROLES.MANAGER) {
    return targetRole === ORG_ROLES.MEMBER;
  }
  
  // Members cannot assign any role
  return false;
}

async function upsertUserProfile(base44, userId, orgId, orgRole) {
  // Try to find existing profile
  const existingProfiles = await base44.asServiceRole.entities.UserProfile.filter({
    userId: userId,
    orgId: orgId
  });
  
  if (existingProfiles.length > 0) {
    const profile = existingProfiles[0];
    // Update role if provided and different
    if (orgRole && profile.orgRole !== orgRole) {
      return await base44.asServiceRole.entities.UserProfile.update(profile.id, {
        orgRole: orgRole
      });
    }
    return profile;
  }
  
  // Create new profile
  return await base44.asServiceRole.entities.UserProfile.create({
    userId: userId,
    orgId: orgId,
    orgRole: orgRole || ORG_ROLES.MEMBER
  });
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

Deno.serve(async (req) => {
  console.log('=== inviteTeamMember START (2026-01-26-inlined-js) ===');
  
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    console.log('Current user:', JSON.stringify({ 
      id: user?.id, 
      email: user?.email, 
      appRole: user?.appRole, 
      orgId: user?.orgId, 
      isOrgOwner: user?.isOrgOwner 
    }));
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user can manage team (org owner, org manager, or super admin)
    const canManage = isOrgAdmin(user) || isSuperAdmin(user);
    console.log('Permission check - isOrgAdmin:', isOrgAdmin(user), 'isSuperAdmin:', isSuperAdmin(user), 'canManage:', canManage);
    
    if (!canManage) {
      return Response.json(
        { error: 'Access denied. Only organization owners and managers can invite team members.' },
        { status: 403 }
      );
    }
    
    if (!user.orgId) {
      return Response.json(
        { error: 'You must belong to an organization to invite members' },
        { status: 400 }
      );
    }
    
    // Load organization for email template
    const organizations = await base44.asServiceRole.entities.Organization.filter({
      id: user.orgId
    });
    const organization = organizations.length > 0 ? organizations[0] : null;
    
    // Parse request body
    const body = await req.json();
    const { email, role, orgRole } = body;
    
    console.log('Request body:', JSON.stringify({ email, role, orgRole }));
    
    // Validate inputs
    if (!email || !email.trim()) {
      return Response.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Determine the role to use (prefer new orgRole, fall back to legacy role)
    let finalOrgRole = orgRole;
    
    // Handle new orgRole field
    if (orgRole) {
      console.log('Processing orgRole:', orgRole);
      const validOrgRoles = [ORG_ROLES.OWNER, ORG_ROLES.MANAGER, ORG_ROLES.MEMBER];
      
      if (!validOrgRoles.includes(orgRole)) {
        console.log('VALIDATION FAILED: Invalid orgRole');
        return Response.json(
          { error: `Invalid orgRole "${orgRole}". Must be "owner", "manager", or "member"` },
          { status: 400 }
        );
      }
    } 
    // Handle legacy role field (backwards compatibility)
    else if (role) {
      console.log('Processing legacy role:', role);
      if (!['sales_rep', 'organization_owner', 'organization_manager'].includes(role)) {
        return Response.json(
          { error: 'Invalid role. Must be "sales_rep", "organization_manager", or "organization_owner"' },
          { status: 400 }
        );
      }
      // Map legacy role to new orgRole
      if (role === 'organization_owner') {
        finalOrgRole = ORG_ROLES.OWNER;
      } else if (role === 'organization_manager') {
        finalOrgRole = ORG_ROLES.MANAGER;
      } else {
        finalOrgRole = ORG_ROLES.MEMBER;
      }
    } else {
      console.log('No role provided, defaulting to MEMBER');
      finalOrgRole = ORG_ROLES.MEMBER;
    }
    
    console.log('Final orgRole:', finalOrgRole);
    
    // Check if user can assign this role
    if (!canAssignRole(user, finalOrgRole)) {
      console.log('PERMISSION DENIED: User cannot assign role:', finalOrgRole);
      
      let errorMessage = 'You do not have permission to invite users with this role.';
      if (finalOrgRole === ORG_ROLES.OWNER) {
        errorMessage = 'Only super admins can invite organization owners.';
      } else if (finalOrgRole === ORG_ROLES.MANAGER) {
        errorMessage = 'Only organization owners can invite managers.';
      }
      
      return Response.json(
        { error: errorMessage },
        { status: 403 }
      );
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    console.log('Normalized email:', normalizedEmail);
    
    // Check if user already exists in the system
    const existingUsers = await base44.asServiceRole.entities.User.filter({
      email: normalizedEmail
    });
    
    console.log('Existing users found:', existingUsers.length);
    
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      
      // Check if user is already in this organization
      if (existingUser.orgId === user.orgId) {
        return Response.json(
          { error: 'This user is already a member of your organization' },
          { status: 400 }
        );
      }
      
      // Check if user belongs to another organization
      if (existingUser.orgId && existingUser.orgId !== user.orgId) {
        return Response.json(
          { error: 'This user already belongs to another organization' },
          { status: 400 }
        );
      }
    }
    
    // Check for existing pending invitation
    const existingInvitations = await base44.asServiceRole.entities.Invitation.filter({
      email: normalizedEmail,
      orgId: user.orgId,
      status: 'pending'
    });
    
    if (existingInvitations.length > 0) {
      return Response.json(
        { error: 'An invitation has already been sent to this email address' },
        { status: 400 }
      );
    }
    
    // Map orgRole to legacy appRole for backward compatibility
    const legacyAppRole = mapOrgRoleToLegacyAppRole(finalOrgRole);
    
    // Generate a unique token for the invitation
    const token = crypto.randomUUID();
    
    // Create invitation with all required fields
    const invitation = await base44.asServiceRole.entities.Invitation.create({
      email: normalizedEmail,
      orgId: user.orgId,
      orgRole: finalOrgRole,
      invitedBy: user.id,
      invitedByUserId: user.id,
      invitedByName: user.full_name || user.email,
      token: token,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    console.log('Invitation created:', invitation.id);
    
    // Send invitation email
    try {
      const inviterFirstName = user.full_name?.split(' ')[0] || user.email;
      const roleDisplay = getOrgRoleDisplayName(finalOrgRole);
      
      await base44.functions.invoke('sendTeamInvitationEmail', {
        inviter_firstName: inviterFirstName,
        inviter_fullName: user.full_name || user.email,
        invitee_email: normalizedEmail,
        organization_name: organization?.name || 'your organization',
        role: legacyAppRole,
        role_display: roleDisplay,
        invitation_token: token,
        invitation_expires: invitation.expiresAt
      });
      
      console.log('Invitation email sent');
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Don't fail the invitation if email fails
    }
    
    console.log('=== inviteTeamMember SUCCESS ===');
    
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
    
  } catch (error) {
    console.error('inviteTeamMember error:', error);
    return Response.json({
      success: false,
      error: 'error',
      message: error.message || 'Failed to invite team member'
    }, { status: 500 });
  }
});
