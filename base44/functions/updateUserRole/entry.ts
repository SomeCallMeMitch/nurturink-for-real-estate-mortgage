import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const currentUser = await base44.auth.me();
    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.appRole !== 'super_admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, appRole } = await req.json();

    if (!email || !appRole) {
      return Response.json({
        error: 'Email and appRole are required'
      }, { status: 400 });
    }

    const validRoles = ['sales_rep', 'organization_owner', 'super_admin'];
    if (!validRoles.includes(appRole)) {
      return Response.json({
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      }, { status: 400 });
    }

    const users = await base44.asServiceRole.entities.User.filter({ email });

    if (!users || users.length === 0) {
      return Response.json({
        error: `User with email ${email} not found`
      }, { status: 404 });
    }

    const targetUser = users[0];

    await base44.asServiceRole.entities.User.update(targetUser.id, {
      appRole,
      isOrgOwner: appRole === 'organization_owner'
    });

    return Response.json({
      success: true,
      message: `Successfully updated ${email} to role: ${appRole}`,
      userId: targetUser.id,
      newRole: appRole
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return Response.json({
      error: 'Failed to update user role'
    }, { status: 500 });
  }
});
