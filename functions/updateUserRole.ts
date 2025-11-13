import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin authentication
    const currentUser = await base44.auth.me();
    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const { email, appRole } = await req.json();
    
    if (!email || !appRole) {
      return Response.json({ 
        error: 'Email and appRole are required' 
      }, { status: 400 });
    }
    
    // Validate appRole
    const validRoles = ['sales_rep', 'organization_owner', 'super_admin'];
    if (!validRoles.includes(appRole)) {
      return Response.json({ 
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      }, { status: 400 });
    }
    
    // Find user by email using service role
    const users = await base44.asServiceRole.entities.User.filter({ email });
    
    if (!users || users.length === 0) {
      return Response.json({ 
        error: `User with email ${email} not found` 
      }, { status: 404 });
    }
    
    const targetUser = users[0];
    
    // Update the user's appRole
    await base44.asServiceRole.entities.User.update(targetUser.id, {
      appRole: appRole,
      isOrgOwner: appRole === 'organization_owner' // Update the flag as well
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
      error: error.message || 'Failed to update user role' 
    }, { status: 500 });
  }
});