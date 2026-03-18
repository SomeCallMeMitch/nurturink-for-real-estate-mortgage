import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Toggle company pool access for a team member
 * 
 * Organization owners can enable/disable whether a team member
 * can draw from the organization's credit pool when their
 * allocated and personal credits are exhausted.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is organization owner
    const isOrgOwner = user.appRole === 'organization_owner' || user.isOrgOwner === true;
    if (!isOrgOwner) {
      return Response.json(
        { error: 'Only organization owners can manage company pool access' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { userId, canAccessCompanyPool } = body;
    
    // Validate input
    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    if (typeof canAccessCompanyPool !== 'boolean') {
      return Response.json(
        { error: 'canAccessCompanyPool must be a boolean' },
        { status: 400 }
      );
    }
    
    // Load target user
    const targetUsers = await base44.asServiceRole.entities.User.filter({ 
      id: userId 
    });
    
    if (!targetUsers || targetUsers.length === 0) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const targetUser = targetUsers[0];
    
    // Verify target user belongs to same organization
    if (targetUser.orgId !== user.orgId) {
      return Response.json(
        { error: 'User does not belong to your organization' },
        { status: 403 }
      );
    }
    
    // Prevent org owner from modifying their own access
    if (targetUser.id === user.id) {
      return Response.json(
        { error: 'Cannot modify your own company pool access' },
        { status: 400 }
      );
    }
    
    // Update user's company pool access
    await base44.asServiceRole.entities.User.update(userId, {
      canAccessCompanyPool: canAccessCompanyPool
    });
    
    return Response.json({
      success: true,
      userId: userId,
      userName: targetUser.full_name,
      canAccessCompanyPool: canAccessCompanyPool,
      message: canAccessCompanyPool 
        ? `${targetUser.full_name} can now access the company pool`
        : `${targetUser.full_name} can no longer access the company pool`
    });
    
  } catch (error) {
    console.error('Error in toggleCompanyPoolAccess:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to toggle company pool access',
        details: error.stack
      },
      { status: 500 }
    );
  }
});