import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Get current whitelabel settings
 * Returns default values if no settings exist yet
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Allow all authenticated users to read settings
    // Writing/updating is still protected by separate function (updateWhitelabelSettings)
    
    // Load whitelabel settings (should only be one record)
    const settings = await base44.asServiceRole.entities.WhitelabelSettings.filter({}, '', 1);
    
    // If no settings exist yet, return default values
    if (settings.length === 0) {
      return Response.json({
        success: true,
        settings: {
          brandName: 'NurturInk',
          logoUrl: null,
          faviconUrl: null,
          primaryColor: '#4F46E5',
          accentColor: '#7C3AED',
          backgroundColor: '#F9FAFB',
          fontHeadings: 'Inter',
          fontBody: 'Inter',
          toastDuration: 3000,
          toastPlacement: 'top-right',
          toastSuccessBg: '#F0FDF4',
          toastSuccessText: '#166534',
          toastSuccessBorder: '#86EFAC',
          toastErrorBg: '#FEF2F2',
          toastErrorText: '#991B1B',
          toastErrorBorder: '#FCA5A5',
          toastWarningBg: '#FFFBEB',
          toastWarningText: '#92400E',
          toastWarningBorder: '#FDE68A',
          toastInfoBg: '#EFF6FF',
          toastInfoText: '#1E40AF',
          toastInfoBorder: '#93C5FD',
          isNew: true
        }
      });
    }
    
    return Response.json({
      success: true,
      settings: settings[0]
    });
    
  } catch (error) {
    console.error('Error in getWhitelabelSettings:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to load whitelabel settings',
        details: error.stack
      },
      { status: 500 }
    );
  }
});