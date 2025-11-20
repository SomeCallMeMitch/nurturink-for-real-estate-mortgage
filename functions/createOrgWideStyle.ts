import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get current user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check permissions - only admins, org owners, and super admins can create org-wide styles
    const allowedRoles = ['organization_owner', 'super_admin'];
    if (!allowedRoles.includes(user.appRole)) {
      return Response.json({ 
        success: false, 
        error: 'Only organization owners and super admins can create organization-wide styles' 
      }, { status: 403 });
    }
    
    // Parse request
    const styleData = await req.json();
    
    // Validate input
    if (!styleData.name) {
      return Response.json({ 
        success: false, 
        error: 'Style name is required' 
      }, { status: 400 });
    }

    // Create organization-wide style
    const orgStyle = {
      type: 'organization',
      userId: user.id,
      orgId: user.orgId,
      organizationId: user.orgId,
      createdByUserId: user.id,
      originalNoteStyleProfileId: null,
      
      // Style settings from request
      name: styleData.name,
      handwritingFont: styleData.handwritingFont || 'Caveat',
      defaultGreeting: styleData.defaultGreeting || null,
      signatureText: styleData.signatureText || null,
      includeSignatureByDefault: styleData.includeSignatureByDefault ?? true,
      preferredPhoneId: styleData.preferredPhoneId || null,
      preferredUrlId: styleData.preferredUrlId || null,
      
      isDefault: false,
      isOrgWide: true
    };

    const newProfile = await base44.entities.NoteStyleProfile.create(orgStyle);

    return Response.json({
      success: true,
      message: `Created organization-wide style: "${newProfile.name}"`,
      profile: {
        id: newProfile.id,
        name: newProfile.name,
        type: newProfile.type,
        organizationId: newProfile.organizationId
      }
    });

  } catch (error) {
    console.error('Error creating org-wide style:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to create organization-wide style' 
    }, { status: 500 });
  }
});