import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { 
  isOrgAdmin, 
  isOrgOwner, 
  isSuperAdmin, 
  canPromoteToManager,
  ORG_ROLES,
  mapOrgRoleToLegacyAppRole,
  upsertUserProfile
} from './utils/roleHelpers.ts';

/**
 * Invite a new team member to the organization
 * Handles both new users and existing users
 * 
 * Organization owners can invite: owner, manager, member
 * Organization managers can invite: member only
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user can manage team (org owner, org manager, or super admin)
    if (!isOrgAdmin(user) && !isSuperAdmin(user)) {
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
    
    // Load organization for email template (early load - needed for email sending)
    const organizations = await base44.asServiceRole.entities.Organization.filter({
      id: user.orgId
    });
    const organization = organizations.length > 0 ? organizations[0] : null;
    
    // Load whitelabel settings for logo (early load - needed for email sending)
    let logoUrl = `${Deno.env.get("APP_URL")}/logo.png`;
    try {
      const whitelabelSettings = await base44.asServiceRole.entities.WhitelabelSettings.filter({}, '', 1);
      if (whitelabelSettings.length > 0 && whitelabelSettings[0].logoUrl) {
        logoUrl = whitelabelSettings[0].logoUrl;
      }
    } catch (error) {
      console.error('Failed to load whitelabel settings for logo:', error);
    }
    
    // Parse request body
    const body = await req.json();
    const { email, role, orgRole } = body;
    
    // Validate inputs
    if (!email || !email.trim()) {
      return Response.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Determine the role to use (prefer new orgRole, fall back to legacy role)
    let finalOrgRole = orgRole;
    let finalLegacyRole = role;
    
    // Handle new orgRole field
    if (orgRole) {
      if (![ORG_ROLES.OWNER, ORG_ROLES.MANAGER, ORG_ROLES.MEMBER].includes(orgRole)) {
        return Response.json(
          { error: 'Invalid orgRole. Must be "owner", "manager", or "member"' },
          { status: 400 }
        );
      }
      finalLegacyRole = mapOrgRoleToLegacyAppRole(orgRole);
    } 
    // Handle legacy role field
    else if (role) {
      if (!['sales_rep', 'organization_owner', 'organization_manager'].includes(role)) {
        return Response.json(
          { error: 'Invalid role. Must be "sales_rep", "organization_manager", or "organization_owner"' },
          { status: 400 }
        );
      }
      if (role === 'organization_owner') {
        finalOrgRole = ORG_ROLES.OWNER;
      } else if (role === 'organization_manager') {
        finalOrgRole = ORG_ROLES.MANAGER;
      } else {
        finalOrgRole = ORG_ROLES.MEMBER;
      }
      finalLegacyRole = role === 'organization_manager' ? 'sales_rep' : role;
    } else {
      finalOrgRole = ORG_ROLES.MEMBER;
      finalLegacyRole = 'sales_rep';
    }
    
    // Check if user can assign this role
    if ((finalOrgRole === ORG_ROLES.MANAGER || finalOrgRole === ORG_ROLES.OWNER) && !canPromoteToManager(user)) {
      return Response.json(
        { error: 'Only organization owners can invite managers or owners' },
        { status: 403 }
      );
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if user already exists in the system
    const existingUsers = await base44.asServiceRole.entities.User.filter({
      email: normalizedEmail
    });
    
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
      
      // User exists but has no org - directly assign them
      await base44.asServiceRole.entities.User.update(existingUser.id, {
        orgId: user.orgId,
        appRole: finalLegacyRole,
        isOrgOwner: finalOrgRole === ORG_ROLES.OWNER
      });
      
      // Create UserProfile for the existing user
      await upsertUserProfile(existingUser.id, user.orgId, finalOrgRole);
      
      // Send notification email to existing user
      try {
        const inviterFirstName = user.full_name?.split(' ')[0] || user.email;
        const roleDisplay = getRoleDisplayName(finalOrgRole);
        
        await base44.functions.invoke('sendTeamInvitationEmail', {
          inviter_firstName: inviterFirstName,
          inviter_fullName: user.full_name || user.email,
          invitee_email: normalizedEmail,
          organization_name: organization?.name || 'your organization',
          role: finalLegacyRole,
          role_display: roleDisplay,
          invitation_token: '',
          invitation_expires: 'N/A',
          app_logo_url: logoUrl
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }
      
      return Response.json({
        success: true,
        message: 'Existing user added to organization',
        userAdded: true,
        userId: existingUser.id
      });
    }
    
    // Check if invitation already exists for this email
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
    
    // Generate unique token
    const token = crypto.randomUUID();
    
    // Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Create invitation with both legacy role and new orgRole
    const invitation = await base44.asServiceRole.entities.Invitation.create({
      orgId: user.orgId,
      invitedByUserId: user.id,
      invitedByName: user.full_name || user.email,
      email: normalizedEmail,
      role: finalLegacyRole,
      orgRole: finalOrgRole,
      token: token,
      status: 'pending',
      expiresAt: expiresAt.toISOString()
    });
    
    // Send invitation email
    try {
      const inviterFirstName = user.full_name?.split(' ')[0] || user.email;
      const roleDisplay = getRoleDisplayName(finalOrgRole);
      const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      await base44.functions.invoke('sendTeamInvitationEmail', {
        inviter_firstName: inviterFirstName,
        inviter_fullName: user.full_name || user.email,
        invitee_email: normalizedEmail,
        organization_name: organization?.name || 'your organization',
        role: finalLegacyRole,
        role_display: roleDisplay,
        invitation_token: token,
        invitation_expires: `${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`,
        app_logo_url: logoUrl
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
    }
    
    return Response.json({
      success: true,
      message: 'Invitation sent successfully',
      invitationId: invitation.id
    });
    
  } catch (error) {
    console.error('Error in inviteTeamMember:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to invite team member',
        details: error.stack
      },
      { status: 500 }
    );
  }
});

/**
 * Get display name for an orgRole
 */
function getRoleDisplayName(orgRole: string): string {
  const displayNames: Record<string, string> = {
    'owner': 'Organization Owner',
    'manager': 'Organization Manager',
    'member': 'Team Member',
  };
  return displayNames[orgRole] || 'Team Member';
}
