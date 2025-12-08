import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Invite a new team member to the organization
 * Handles both new users and existing users
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is organization owner or super admin
    const isOrgOwner = user.appRole === 'organization_owner' || user.isOrgOwner === true;
    const isSuperAdmin = user.appRole === 'super_admin';
    
    if (!isOrgOwner && !isSuperAdmin) {
      return Response.json(
        { error: 'Access denied. Only organization owners can invite team members.' },
        { status: 403 }
      );
    }
    
    if (!user.orgId) {
      return Response.json(
        { error: 'You must belong to an organization to invite members' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { email, role } = body;
    
    // Validate inputs
    if (!email || !email.trim()) {
      return Response.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    if (!role || !['sales_rep', 'organization_owner'].includes(role)) {
      return Response.json(
        { error: 'Invalid role. Must be "sales_rep" or "organization_owner"' },
        { status: 400 }
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
        appRole: role,
        isOrgOwner: role === 'organization_owner'
      });
      
      // Send notification email to existing user
      try {
        const inviterFirstName = user.full_name?.split(' ')[0] || user.email;
        const roleDisplay = role === 'organization_owner' ? 'Organization Owner' : 'Sales Representative';
        
        await base44.functions.invoke('sendTeamInvitationEmail', {
          inviter_firstName: inviterFirstName,
          inviter_fullName: user.full_name || user.email,
          invitee_email: normalizedEmail,
          organization_name: organization?.name || 'your organization',
          role: role,
          role_display: roleDisplay,
          invitation_token: '', // Not applicable for existing users
          invitation_expires: 'N/A', // Not applicable
          app_logo_url: logoUrl // Pass the whitelabel logo
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Continue anyway - user was added successfully
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
      // Continue with default logo URL
    }
    
    // Generate unique token
    const token = crypto.randomUUID();
    
    // Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Create invitation
    const invitation = await base44.asServiceRole.entities.Invitation.create({
      orgId: user.orgId,
      invitedByUserId: user.id,
      invitedByName: user.full_name || user.email,
      email: normalizedEmail,
      role: role,
      token: token,
      status: 'pending',
      expiresAt: expiresAt.toISOString()
    });
    
    // Send invitation email
    try {
      const inviterFirstName = user.full_name?.split(' ')[0] || user.email;
      const roleDisplay = role === 'organization_owner' ? 'Organization Owner' : 'Sales Representative';
      const daysUntilExpiry = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24));
      
      await base44.functions.invoke('sendTeamInvitationEmail', {
        inviter_firstName: inviterFirstName,
        inviter_fullName: user.full_name || user.email,
        invitee_email: normalizedEmail,
        organization_name: organization?.name || 'your organization',
        role: role,
        role_display: roleDisplay,
        invitation_token: token,
        invitation_expires: `${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`,
        app_logo_url: logoUrl // Pass the whitelabel logo
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Continue anyway - invitation was created successfully
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