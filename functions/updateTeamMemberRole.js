import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Update a team member's role within the organization
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
        { error: 'Access denied. Only organization owners can change team member roles.' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { userId, newRole } = body;
    
    // Validate inputs
    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    if (!newRole || !['sales_rep', 'organization_owner'].includes(newRole)) {
      return Response.json(
        { error: 'Invalid role. Must be "sales_rep" or "organization_owner"' },
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
    
    // Prevent user from demoting themselves if they're the only admin
    if (userId === user.id && newRole !== 'organization_owner') {
      // Check if there are other org owners
      const orgOwners = await base44.asServiceRole.entities.User.filter({
        orgId: user.orgId
      });
      
      const ownerCount = orgOwners.filter(u => 
        u.appRole === 'organization_owner' || u.isOrgOwner === true
      ).length;
      
      if (ownerCount <= 1) {
        return Response.json(
          { error: 'Cannot demote yourself. You are the only organization owner. Promote another member first.' },
          { status: 400 }
        );
      }
    }
    
    // Update the user's role
    await base44.asServiceRole.entities.User.update(userId, {
      appRole: newRole,
      isOrgOwner: newRole === 'organization_owner'
    });
    
    // TODO: Send notification email to the user about role change
    console.log(`📧 [SIMULATED EMAIL] To: ${targetUser.email}`);
    console.log(`Subject: Your role has been updated`);
    console.log(`Body: Your role has been changed to ${newRole === 'organization_owner' ? 'Organization Owner' : 'Sales Representative'}.`);
    
    return Response.json({
      success: true,
      message: 'Team member role updated successfully',
      userId: userId,
      newRole: newRole
    });
    
  } catch (error) {
    console.error('Error in updateTeamMemberRole:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to update team member role',
        details: error.stack
      },
      { status: 500 }
    );
  }
});