import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get current user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request
    const { sourceProfileId, newName } = await req.json();
    
    // Validate input
    if (!sourceProfileId) {
      return Response.json({ 
        success: false, 
        error: 'sourceProfileId is required' 
      }, { status: 400 });
    }

    // Fetch source style
    const sourceStyles = await base44.entities.NoteStyleProfile.filter({ 
      id: sourceProfileId 
    });
    
    if (!sourceStyles || sourceStyles.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Source style not found' 
      }, { status: 404 });
    }
    
    const sourceStyle = sourceStyles[0];
    
    // Verify source is org or platform type (can't copy other users' personal styles)
    if (sourceStyle.type === 'personal' && sourceStyle.userId !== user.id) {
      return Response.json({ 
        success: false, 
        error: 'Cannot copy another user\'s personal style' 
      }, { status: 403 });
    }
    
    // Verify user can access source style
    const canAccess = 
      sourceStyle.type === 'platform' ||
      (sourceStyle.type === 'organization' && sourceStyle.organizationId === user.orgId) ||
      (sourceStyle.type === 'personal' && sourceStyle.userId === user.id);
    
    if (!canAccess) {
      return Response.json({ 
        success: false, 
        error: 'You do not have access to this style' 
      }, { status: 403 });
    }

    // Create personal copy
    const personalCopy = {
      type: 'personal',
      userId: user.id,
      orgId: user.orgId,
      organizationId: null,
      createdByUserId: user.id,
      originalNoteStyleProfileId: sourceProfileId,
      
      // Use custom name or append "Copy" to original
      name: newName || `${sourceStyle.name} (My Copy)`,
      
      // Copy all style settings
      handwritingFont: sourceStyle.handwritingFont,
      defaultGreeting: sourceStyle.defaultGreeting,
      signatureText: sourceStyle.signatureText,
      includeSignatureByDefault: sourceStyle.includeSignatureByDefault,
      preferredPhoneId: sourceStyle.preferredPhoneId,
      preferredUrlId: sourceStyle.preferredUrlId,
      
      // Reset these for personal copy
      isDefault: false,
      isOrgWide: false
    };

    const newProfile = await base44.entities.NoteStyleProfile.create(personalCopy);

    return Response.json({
      success: true,
      message: `Created personal copy: "${newProfile.name}"`,
      profile: {
        id: newProfile.id,
        name: newProfile.name,
        type: newProfile.type,
        copiedFrom: sourceStyle.name
      }
    });

  } catch (error) {
    console.error('Error creating personal copy:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to create personal copy' 
    }, { status: 500 });
  }
});