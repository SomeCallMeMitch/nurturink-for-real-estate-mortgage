// functions/acceptInvitation.js
// Auth-required endpoint - completes invitation acceptance
// Links the authenticated user to the organization

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
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
    
    // 2. Validate token input
    if (!token) {
      return Response.json({ 
        success: false, 
        error: 'invalid', 
        message: 'Invitation token is required.' 
      }, { status: 400 });
    }
    
    // 3. Find invitation by token
    const invitations = await base44.asServiceRole.entities.Invitation.filter({
      token: token
    });
    
    const invitation = invitations[0];
    
    // 4. Validate invitation exists
    if (!invitation) {
      return Response.json({ 
        success: false, 
        error: 'invalid', 
        message: 'Invalid invitation.' 
      }, { status: 404 });
    }
    
    // 5. Check if already accepted
    if (invitation.status === 'accepted') {
      return Response.json({ 
        success: false, 
        error: 'already_accepted', 
        message: 'This invitation has already been accepted.' 
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
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return Response.json({ 
        success: false, 
        error: 'email_mismatch', 
        message: `This invitation was sent to ${invitation.email}.` 
      }, { status: 403 });
    }
    
    // 8. Update user with organization membership
    // Using appRole as per Base44's standard User entity schema
    await base44.auth.updateMe({
      orgId: invitation.orgId,
      appRole: invitation.role
    });
    
    // 9. Mark invitation as accepted
    await base44.asServiceRole.entities.Invitation.update(invitation.id, {
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      acceptedByUserId: user.id
    });
    
    // 10. Get org name for confirmation message
    let organizationName = 'your organization';
    try {
      const orgs = await base44.asServiceRole.entities.Organization.filter({
        id: invitation.orgId
      });
      if (orgs && orgs.length > 0) {
        organizationName = orgs[0].name;
      }
    } catch (orgError) {
      console.error('Failed to fetch organization name:', orgError);
      // Continue with default name
    }
    
    return Response.json({
      success: true,
      organizationName: organizationName
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