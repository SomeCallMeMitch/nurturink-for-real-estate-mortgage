import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Cancel a pending invitation
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
        { error: 'Access denied. Only organization owners can cancel invitations.' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { invitationId } = body;
    
    // Validate input
    if (!invitationId) {
      return Response.json(
        { error: 'invitationId is required' },
        { status: 400 }
      );
    }
    
    // Load the invitation
    const invitations = await base44.asServiceRole.entities.Invitation.filter({
      id: invitationId
    });
    
    if (invitations.length === 0) {
      return Response.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    const invitation = invitations[0];
    
    // Verify invitation belongs to user's organization
    if (invitation.orgId !== user.orgId) {
      return Response.json(
        { error: 'This invitation does not belong to your organization' },
        { status: 403 }
      );
    }
    
    // Update invitation status to revoked
    await base44.asServiceRole.entities.Invitation.update(invitationId, {
      status: 'revoked'
    });
    
    return Response.json({
      success: true,
      message: 'Invitation cancelled successfully',
      invitationId: invitationId
    });
    
  } catch (error) {
    console.error('Error in cancelInvitation:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to cancel invitation',
        details: error.stack
      },
      { status: 500 }
    );
  }
});