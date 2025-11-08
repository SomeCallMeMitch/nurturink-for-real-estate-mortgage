import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Remove a team member from the organization
 * Note: This doesn't delete the user account, just removes them from the org
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
        { error: 'Access denied. Only organization owners can remove team members.' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { userId } = body;
    
    // Validate input
    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    // Prevent user from removing themselves
    if (userId === user.id) {
      return Response.json(
        { error: 'You cannot remove yourself from the organization' },
        { status: 400 }
      );
    }
    
    // Load the target user
    const targetUsers = await base44.asServiceRole.entities.User.filter({
      id: userId
    });
    
    if (targetUsers.length === 0) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const targetUser = targetUsers[0];
    
    // Verify user belongs to the same organization
    if (targetUser.orgId !== user.orgId) {
      return Response.json(
        { error: 'This user does not belong to your organization' },
        { status: 403 }
      );
    }
    
    // Remove user from organization (set orgId to null, reset role)
    await base44.asServiceRole.entities.User.update(userId, {
      orgId: null,
      appRole: 'user',
      isOrgOwner: false
    });
    
    // TODO: Send notification email to the removed user
    console.log(`📧 [SIMULATED EMAIL] To: ${targetUser.email}`);
    console.log(`Subject: You have been removed from the organization`);
    console.log(`Body: You have been removed from the organization by ${user.full_name || user.email}.`);
    
    return Response.json({
      success: true,
      message: 'Team member removed successfully',
      userId: userId
    });
    
  } catch (error) {
    console.error('Error in removeTeamMember:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to remove team member',
        details: error.stack
      },
      { status: 500 }
    );
  }
});