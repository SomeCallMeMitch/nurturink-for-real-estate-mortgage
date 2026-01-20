import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get current user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request
    const { profileId, action } = await req.json();
    
    // Validate input
    if (!profileId) {
      return Response.json({ 
        success: false, 
        error: 'profileId is required' 
      }, { status: 400 });
    }
    
    if (!['add', 'remove'].includes(action)) {
      return Response.json({ 
        success: false, 
        error: 'action must be "add" or "remove"' 
      }, { status: 400 });
    }

    // Verify the style exists and user can access it
    const style = await base44.entities.NoteStyleProfile.filter({ id: profileId });
    if (!style || style.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Style not found' 
      }, { status: 404 });
    }
    
    const styleData = style[0];
    
    // Verify user can access this style
    const canAccess = 
      styleData.type === 'platform' ||
      (styleData.type === 'organization' && styleData.organizationId === user.orgId) ||
      (styleData.type === 'personal' && styleData.userId === user.id);
    
    if (!canAccess) {
      return Response.json({ 
        success: false, 
        error: 'You do not have access to this style' 
      }, { status: 403 });
    }

    // Get current favorites
    const currentFavorites = user.favoriteNoteStyleProfileIds || [];
    
    // Update favorites array
    let newFavorites;
    if (action === 'add') {
      // Add if not already present
      if (!currentFavorites.includes(profileId)) {
        newFavorites = [...currentFavorites, profileId];
      } else {
        newFavorites = currentFavorites;
      }
    } else {
      // Remove
      newFavorites = currentFavorites.filter(id => id !== profileId);
    }

    // Update user using auth.updateMe
    await base44.auth.updateMe({
      favoriteNoteStyleProfileIds: newFavorites
    });

    return Response.json({
      success: true,
      action,
      profileId,
      totalFavorites: newFavorites.length,
      message: action === 'add' 
        ? `Added "${styleData.name}" to favorites`
        : `Removed "${styleData.name}" from favorites`
    });

  } catch (error) {
    console.error('Error toggling favorite:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to toggle favorite' 
    }, { status: 500 });
  }
});