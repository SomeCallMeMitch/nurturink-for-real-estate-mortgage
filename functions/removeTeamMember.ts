import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { 
  isOrgAdmin, 
  isOrgOwner, 
  isOrgManager,
  isSuperAdmin,
  canManageUser,
  deleteUserProfile,
  getUserProfileForOrg
} from './utils/roleHelpers.ts';

/**
 * Remove a team member from the organization
 * 
 * Permission rules:
 * - Super admins can remove anyone
 * - Org owners can remove managers and members
 * - Org managers can only remove members
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get currentUser's profile
    const currentUserProfile = user.orgId ? await getUserProfileForOrg(base44, user.id, user.orgId) : null;
    
    // Verify user can manage team
    if (!isOrgAdmin(user, currentUserProfile) && !isSuperAdmin(user)) {
      return Response.json(
        { error: 'Access denied. Only organization owners and managers can remove team members.' },
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
    
    // Get target user's profile
    const targetUserProfile = await getUserProfileForOrg(base44, targetUser.id, targetUser.orgId);
    
    // Check if current user can manage the target user
    if (!canManageUser(user, targetUser, currentUserProfile, targetUserProfile)) {
      if (isOrgManager(user, currentUserProfile) && (isOrgOwner(targetUser, targetUserProfile) || isOrgManager(targetUser, targetUserProfile))) {
        return Response.json(
          { error: 'Managers cannot remove other managers or the organization owner' },
          { status: 403 }
        );
      }
      return Response.json(
        { error: 'You do not have permission to remove this user' },
        { status: 403 }
      );
    }
    
    // 1. Remove user from organization (legacy fields)
    await base44.asServiceRole.entities.User.update(userId, {
      orgId: null,
      appRole: 'user',
      isOrgOwner: false
    });
    
    // 2. Delete UserProfile
    await deleteUserProfile(base44, userId, user.orgId);
    
    // Send notification email
    try {
      await base44.functions.invoke('sendRemovedFromOrgEmail', {
        user_email: targetUser.email,
        user_name: targetUser.full_name || targetUser.email,
        removed_by_name: user.full_name || user.email
      });
    } catch (emailError) {
      console.error('Failed to send removal notification email:', emailError);
    }
    
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