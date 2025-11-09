import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    const { clientId } = body;
    
    // Validate input
    if (!clientId) {
      return Response.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }
    
    // Verify client exists and belongs to user's organization
    const clients = await base44.entities.Client.filter({ 
      id: clientId,
      orgId: user.orgId
    });
    
    if (!clients || clients.length === 0) {
      return Response.json(
        { error: 'Client not found or does not belong to your organization' },
        { status: 404 }
      );
    }
    
    // Check if favorite already exists
    const existingFavorites = await base44.entities.FavoriteClient.filter({
      userId: user.id,
      clientId: clientId
    });
    
    let isFavorited = false;
    
    if (existingFavorites && existingFavorites.length > 0) {
      // Favorite exists - remove it (unfavorite)
      await base44.entities.FavoriteClient.delete(existingFavorites[0].id);
      isFavorited = false;
    } else {
      // Favorite doesn't exist - create it
      await base44.entities.FavoriteClient.create({
        userId: user.id,
        clientId: clientId,
        orgId: user.orgId
      });
      isFavorited = true;
    }
    
    return Response.json({
      success: true,
      isFavorited: isFavorited,
      clientId: clientId
    });
    
  } catch (error) {
    console.error('Error in toggleFavoriteClient:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to toggle favorite',
        details: error.stack
      },
      { status: 500 }
    );
  }
});