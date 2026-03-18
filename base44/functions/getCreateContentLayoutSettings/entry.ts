import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Default settings if no record exists
const DEFAULT_SETTINGS = {
  leftColumnSpan: 5,
  centerColumnSpan: 3,
  rightColumnSpan: 4
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated and is super admin
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    
    if (user.appRole !== 'super_admin') {
      return Response.json({ error: 'Unauthorized: Super admin access required' }, { status: 403 });
    }
    
    // Query for existing settings (singleton pattern)
    const settings = await base44.asServiceRole.entities.CreateContentLayoutSettings.list();
    
    // If no settings exist, create with defaults
    if (settings.length === 0) {
      const newSettings = await base44.asServiceRole.entities.CreateContentLayoutSettings.create(DEFAULT_SETTINGS);
      return Response.json(newSettings);
    }
    
    // Return the single settings record
    return Response.json(settings[0]);
    
  } catch (error) {
    console.error('Error in getCreateContentLayoutSettings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});