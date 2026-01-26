import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Change a team member's role within the organization
 * NEW FUNCTION - changeTeamRole - bypasses caching from updateTeamMemberRole
 * 
 * @version 2026-01-26-fresh
 */

Deno.serve(async (req) => {
  console.log('=== changeTeamRole v2026-01-26-fresh START ===');
  
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Current user:', JSON.stringify({
      id: user.id,
      email: user.email,
      appRole: user.appRole,
      orgId: user.orgId
    }));
    
    // Get user's UserProfile to check orgRole
    let userOrgRole = null;
    try {
      const userProfiles = await base44.asServiceRole.entities.UserProfile.filter({
        userId: user.id,
        orgId: user.orgId
      });
      if (userProfiles.length > 0) {
        userOrgRole = userProfiles[0].orgRole;
      }
    } catch (e) {
      console.error('Failed to fetch user profile:', e);
    }
    
    console.log('User orgRole from profile:', userOrgRole);
    
    // Check permissions - owner, manager, or super admin can change roles
    const isOrgOwner = userOrgRole === 'owner' || user.appRole === 'organization_owner' || user.isOrgOwner === true;
    const isOrgManager = userOrgRole === 'manager' || user.appRole === 'organization_manager';
    const isSuperAdmin = user.appRole === 'super_admin';
    
    console.log('Permission check:', { isOrgOwner, isOrgManager, isSuperAdmin });
    
    if (!isOrgOwner && !isOrgManager && !isSuperAdmin) {
      return Response.json(
        { error: 'Access denied. Only organization owners and managers can change team member roles.' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { userId, orgRole } = body;
    
    console.log('Request body:', JSON.stringify(body));
    
    // Validate inputs
    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    // Validate orgRole
    const validRoles = ['owner', 'manager', 'member'];
    if (!orgRole || !validRoles.includes(orgRole)) {
      console.log('VALIDATION: Invalid orgRole:', orgRole, 'Valid roles:', validRoles);
      return Response.json(
        { error: `Invalid role "${orgRole}". Must be "owner", "manager", or "member"` },
        { status: 400 }
      );
    }
    
    console.log('Validated orgRole:', orgRole);
    
    // Permission checks for role assignment
    // Managers can only assign 'member' role
    if (isOrgManager && !isOrgOwner && !isSuperAdmin) {
      if (orgRole !== 'member') {
        return Response.json(
          { error: 'Managers can only assign member role' },
          { status: 403 }
        );
      }
    }
    
    // Only owners and super admins can assign owner role
    if (orgRole === 'owner' && !isOrgOwner && !isSuperAdmin) {
      return Response.json(
        { error: 'Only organization owners can assign owner role' },
        { status: 403 }
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
    console.log('Target user:', JSON.stringify({ id: targetUser.id, orgId: targetUser.orgId }));
    
    // For super admins, skip org check (they can manage any org)
    if (!isSuperAdmin && targetUser.orgId !== user.orgId) {
      return Response.json(
        { error: 'This user does not belong to your organization' },
        { status: 403 }
      );
    }
    
    // Prevent user from demoting themselves if they're the only owner
    if (userId === user.id && orgRole !== 'owner') {
      const orgProfiles = await base44.asServiceRole.entities.UserProfile.filter({
        orgId: targetUser.orgId,
        orgRole: 'owner'
      });
      
      const orgUsers = await base44.asServiceRole.entities.User.filter({
        orgId: targetUser.orgId
      });
      const legacyOwnerCount = orgUsers.filter(u => 
        u.appRole === 'organization_owner' || u.isOrgOwner === true
      ).length;
      
      const totalOwners = Math.max(orgProfiles.length, legacyOwnerCount);
      
      if (totalOwners <= 1) {
        return Response.json(
          { error: 'Cannot demote yourself. You are the only organization owner. Promote another member first.' },
          { status: 400 }
        );
      }
    }
    
    // Map orgRole to appRole for legacy compatibility
    const orgRoleToAppRole = {
      'owner': 'organization_owner',
      'manager': 'organization_manager',
      'member': 'sales_rep'
    };
    const appRole = orgRoleToAppRole[orgRole];
    
    console.log('Updating user with appRole:', appRole);
    
    // Update the user's legacy role fields
    await base44.asServiceRole.entities.User.update(userId, {
      appRole: appRole,
      isOrgOwner: orgRole === 'owner'
    });
    
    console.log('User updated successfully');
    
    // Update or create UserProfile with new orgRole
    try {
      const existingProfiles = await base44.asServiceRole.entities.UserProfile.filter({
        userId: userId,
        orgId: targetUser.orgId
      });
      
      if (existingProfiles.length > 0) {
        console.log('Updating existing UserProfile:', existingProfiles[0].id);
        await base44.asServiceRole.entities.UserProfile.update(existingProfiles[0].id, {
          orgRole: orgRole,
          updatedAt: new Date().toISOString()
        });
      } else {
        console.log('Creating new UserProfile');
        await base44.asServiceRole.entities.UserProfile.create({
          userId: userId,
          orgId: targetUser.orgId,
          orgRole: orgRole,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      console.log('UserProfile updated/created successfully');
    } catch (profileError) {
      console.error('Failed to update UserProfile:', profileError);
      // Continue - the legacy role is still updated
    }
    
    const roleDisplayNames = {
      'owner': 'Owner',
      'manager': 'Manager',
      'member': 'Member'
    };
    
    console.log('=== changeTeamRole SUCCESS ===');
    
    return Response.json({
      success: true,
      message: 'Team member role updated successfully',
      userId: userId,
      orgRole: orgRole,
      newRole: appRole
    });
    
  } catch (error) {
    console.error('=== changeTeamRole ERROR ===');
    console.error('Error:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to update team member role',
        details: error.stack
      },
      { status: 500 }
    );
  }
});