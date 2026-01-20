import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const isOrgOwner = user.appRole === 'organization_owner' || user.isOrgOwner === true;
    
    if (!isOrgOwner) {
      return Response.json(
        { error: 'Only organization owners can update user settings' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { userId, canAccessCompanyPool } = body;

    if (!userId || typeof canAccessCompanyPool === 'undefined') {
        return Response.json(
            { error: 'userId and canAccessCompanyPool status are required' },
            { status: 400 }
        );
    }

    const users = await base44.asServiceRole.entities.User.filter({ id: userId });
    if (!users || users.length === 0 || users[0].orgId !== user.orgId) {
        return Response.json(
            { error: 'User not found or does not belong to your organization' },
            { status: 404 }
        );
    }

    const targetUser = users[0];

    const updatedUser = await base44.asServiceRole.entities.User.update(userId, {
        canAccessCompanyPool: canAccessCompanyPool
    });

    return Response.json({
        success: true,
        message: `User ${targetUser.full_name || targetUser.email}'s company pool access updated.`,
        user: updatedUser
    });

  } catch (error) {
    console.error('Error in updateUserPoolAccess:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to update user pool access',
        details: error.stack
      },
      { status: 500 }
    );
  }
});