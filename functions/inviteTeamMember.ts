import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
// BUILD: 2026-01-25-v5-fresh
import { 
  ORG_ROLES,
  isSuperAdmin,
  isOrgAdmin,
  canAssignRole,
  mapOrgRoleToLegacyAppRole,
  upsertUserProfile,
  getOrgRoleDisplayName
} from './utils/roleHelpers.ts';

/**
 * Invite a new team member to the organization
 * Handles both new users and existing users
 * 
 * Organization owners can invite: manager, member
 * Organization managers can invite: member only
 * Super admins can invite: owner, manager, member
 * 
 * @version 2026-01-25-v5-fresh - Complete rewrite to force fresh deployment
 */
Deno.serve(async (req) => {
  console.log('=== inviteTeamMember v5-fresh START ===');
  console.log('BUILD_ID: 2026-01-25-v5-fresh');
  
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
    
    // Load whitelabel settings for logo
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
    
    console.log('=== REQUEST BODY DEBUG v5-fresh ===');
    console.log('Raw body:', JSON.stringify(body));
    console.log('email:', email);
    console.log('role (legacy):', role);
    console.log('orgRole (new):', orgRole);
    console.log('ORG_ROLES constant:', JSON.stringify(ORG_ROLES));
    console.log('=== END REQUEST BODY DEBUG ===');
    
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
      console.log('Valid orgRoles:', validOrgRoles);
      console.log('orgRole included?:', validOrgRoles.includes(orgRole));
      
      if (!validOrgRoles.includes(orgRole)) {
        console.log('VALIDATION FAILED v5: Invalid orgRole. Valid roles:', validOrgRoles, 'Received:', orgRole);
        return Response.json(
          { error: `Invalid orgRole "${orgRole}". Must be "owner", "manager", or "member" (v5-fresh)` },
          { status: 400 }
        );
      }
    } 
    // Handle legacy role field (backwards compatibility)
    else if (role) {
      console.log('Processing legacy role:', role);
      if (!['sales_rep', 'organization_owner', 'organization_manager'].includes(role)) {
        console.log('VALIDATION FAILED v5: Invalid legacy role');
        return Response.json(
          { error: 'Invalid role. Must be "sales_rep", "organization_manager", or "organization_owner" (v5-fresh)' },
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
      console.log('Existing user:', JSON.stringify({ id: existingUser.id, orgId: existingUser.orgId }));
      
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
      console.log('Updating existing user with org assignment');
      await base44.asServiceRole.entities.User.update(existingUser.id, {
        orgId: user.orgId
      });
      
      // Create UserProfile for the existing user (source of truth for role)
      console.log('Creating UserProfile for existing user');
      await upsertUserProfile(base44, existingUser.id, user.orgId, finalOrgRole);
      
      // Send notification email to existing user
      try {
        const inviterFirstName = user.full_name?.split(' ')[0] || user.email;
        const roleDisplay = getOrgRoleDisplayName(finalOrgRole);
        
        await base44.functions.invoke('sendTeamInvitationEmail', {
          inviter_firstName: inviterFirstName,
          inviter_fullName: user.full_name || user.email,
          invitee_email: normalizedEmail,
          organization_name: organization?.name || 'your organization',
          role: 'member', // Not used in email template, kept for compatibility
          role_display: roleDisplay,
          invitation_token: '',
          invitation_expires: 'N/A',
          app_logo_url: logoUrl
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }
      
      console.log('=== inviteTeamMember SUCCESS (existing user) ===');
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
    
    console.log('Existing invitations found:', existingInvitations.length);
    
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
    
    // Create invitation with orgRole (role field deprecated)
    console.log('Creating invitation with:', JSON.stringify({ 
      orgId: user.orgId, 
      email: normalizedEmail, 
      orgRole: finalOrgRole 
    }));
    
    const invitation = await base44.asServiceRole.entities.Invitation.create({
      orgId: user.orgId,
      invitedByUserId: user.id,
      invitedByName: user.full_name || user.email,
      email: normalizedEmail,
      orgRole: finalOrgRole,
      token: token,
      status: 'pending',
      expiresAt: expiresAt.toISOString()
    });
    
    console.log('Invitation created:', invitation.id);
    
    // Send invitation email
    try {
      const inviterFirstName = user.full_name?.split(' ')[0] || user.email;
      const roleDisplay = getOrgRoleDisplayName(finalOrgRole);
      const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      await base44.functions.invoke('sendTeamInvitationEmail', {
        inviter_firstName: inviterFirstName,
        inviter_fullName: user.full_name || user.email,
        invitee_email: normalizedEmail,
        organization_name: organization?.name || 'your organization',
        role: 'member', // Not used in email template, kept for compatibility
        role_display: roleDisplay,
        invitation_token: token,
        invitation_expires: `${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`,
        app_logo_url: logoUrl
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
    }
    
    console.log('=== inviteTeamMember SUCCESS (new invitation) ===');
    return Response.json({
      success: true,
      message: 'Invitation sent successfully',
      invitationId: invitation.id
    });
    
  } catch (error) {
    console.error('=== inviteTeamMember ERROR v5-fresh ===');
    console.error('Error in inviteTeamMember:', error);
    console.error('Error stack:', error.stack);
    return Response.json(
      { 
        error: error.message || 'Failed to invite team member',
        details: error.stack
      },
      { status: 500 }
    );
  }
});