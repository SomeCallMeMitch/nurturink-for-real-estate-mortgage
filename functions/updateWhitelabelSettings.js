import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Update whitelabel settings
 * Creates new record if none exists, otherwise updates existing
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is super admin
    if (user.appRole !== 'super_admin') {
      return Response.json(
        { error: 'Access denied. Only super admins can update whitelabel settings.' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { settings } = body;
    
    if (!settings) {
      return Response.json(
        { error: 'Settings object is required' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!settings.brandName || !settings.brandName.trim()) {
      return Response.json(
        { error: 'Brand name is required' },
        { status: 400 }
      );
    }
    
    // Validate color formats (basic HEX validation)
    const colorFields = [
      'primaryColor', 'accentColor', 'backgroundColor',
      'toastSuccessBg', 'toastSuccessText', 'toastSuccessBorder',
      'toastErrorBg', 'toastErrorText', 'toastErrorBorder',
      'toastWarningBg', 'toastWarningText', 'toastWarningBorder',
      'toastInfoBg', 'toastInfoText', 'toastInfoBorder'
    ];
    
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    
    for (const field of colorFields) {
      if (settings[field] && !hexColorRegex.test(settings[field])) {
        return Response.json(
          { error: `Invalid color format for ${field}. Must be HEX format (e.g., #4F46E5)` },
          { status: 400 }
        );
      }
    }
    
    // Validate toast duration
    if (settings.toastDuration && (settings.toastDuration < 1000 || settings.toastDuration > 30000)) {
      return Response.json(
        { error: 'Toast duration must be between 1000ms (1s) and 30000ms (30s)' },
        { status: 400 }
      );
    }
    
    // Validate toast placement
    const validPlacements = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
    if (settings.toastPlacement && !validPlacements.includes(settings.toastPlacement)) {
      return Response.json(
        { error: `Invalid toast placement. Must be one of: ${validPlacements.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Load existing settings
    const existingSettings = await base44.asServiceRole.entities.WhitelabelSettings.filter({}, '', 1);
    
    let savedSettings;
    
    if (existingSettings.length === 0) {
      // Create new settings record
      savedSettings = await base44.asServiceRole.entities.WhitelabelSettings.create(settings);
      
      return Response.json({
        success: true,
        message: 'Whitelabel settings created successfully',
        settings: savedSettings
      });
    } else {
      // Update existing settings
      savedSettings = await base44.asServiceRole.entities.WhitelabelSettings.update(
        existingSettings[0].id,
        settings
      );
      
      return Response.json({
        success: true,
        message: 'Whitelabel settings updated successfully',
        settings: savedSettings
      });
    }
    
  } catch (error) {
    console.error('Error in updateWhitelabelSettings:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to update whitelabel settings',
        details: error.stack
      },
      { status: 500 }
    );
  }
});