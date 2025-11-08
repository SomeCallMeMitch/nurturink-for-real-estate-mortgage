import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

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
      
      // TODO: Send notification email to existing user
      console.log(`📧 [SIMULATED EMAIL] To: ${normalizedEmail}`);
      console.log(`Subject: You've been added to ${user.orgId}`);
      console.log(`Body: You have been added to an organization as ${role}.`);
      
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
    
    // Get app URL from request
    const url = new URL(req.url);
    const appBaseUrl = `${url.protocol}//${url.host}`;
    const acceptUrl = `${appBaseUrl}?page=AcceptInvitation&token=${token}`;
    
    // TODO: Send invitation email
    // For now, simulate email
    console.log('\n========================================');
    console.log('📧 [SIMULATED EMAIL]');
    console.log('========================================');
    console.log(`To: ${normalizedEmail}`);
    console.log(`From: ${user.full_name || user.email} (${user.email})`);
    console.log(`Subject: You're invited to join ${organization?.name || 'RoofScribe'}`);
    console.log('\nBody:');
    console.log(`Hi,`);
    console.log(``);
    console.log(`${user.full_name || user.email} has invited you to join ${organization?.name || 'their organization'} on RoofScribe.`);
    console.log(``);
    console.log(`Role: ${role === 'organization_owner' ? 'Organization Owner' : 'Sales Representative'}`);
    console.log(``);
    console.log(`Click the link below to accept this invitation:`);
    console.log(acceptUrl);
    console.log(``);
    console.log(`This invitation will expire on ${expiresAt.toLocaleDateString()}.`);
    console.log(``);
    console.log(`If you don't want to accept this invitation, you can safely ignore this email.`);
    console.log('========================================\n');
    
    return Response.json({
      success: true,
      message: 'Invitation sent successfully',
      invitationId: invitation.id,
      // Include for testing
      simulatedEmail: {
        to: normalizedEmail,
        acceptUrl: acceptUrl,
        expiresAt: expiresAt.toISOString()
      }
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