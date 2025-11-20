import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Check if user is super admin
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    if (user.appRole !== 'super_admin') {
      return Response.json({ 
        success: false, 
        error: 'Only super admins can seed platform styles' 
      }, { status: 403 });
    }

    // Check if platform styles already exist
    const existingPlatform = await base44.asServiceRole.entities.NoteStyleProfile.filter({
      type: 'platform'
    });
    
    if (existingPlatform.length > 0) {
      return Response.json({ 
        success: false, 
        message: 'Platform styles already exist',
        profileCount: existingPlatform.length
      });
    }

    // Create platform-wide default styles
    const platformStyles = [
      {
        type: 'platform',
        createdByUserId: user.id,
        userId: user.id,
        orgId: user.orgId,
        organizationId: null,
        name: 'Professional',
        handwritingFont: 'Caveat',
        defaultGreeting: 'Dear {{client.firstName}},',
        signatureText: 'Sincerely,\n{{me.fullName}}\n{{me.companyName}}\n{{me.phone}}',
        includeSignatureByDefault: true,
        isDefault: true,
        isOrgWide: false
      },
      {
        type: 'platform',
        createdByUserId: user.id,
        userId: user.id,
        orgId: user.orgId,
        organizationId: null,
        name: 'Casual & Friendly',
        handwritingFont: 'Patrick Hand',
        defaultGreeting: 'Hi {{client.firstName}}!',
        signatureText: 'Best,\n{{me.fullName}}',
        includeSignatureByDefault: true,
        isDefault: false,
        isOrgWide: false
      },
      {
        type: 'platform',
        createdByUserId: user.id,
        userId: user.id,
        orgId: user.orgId,
        organizationId: null,
        name: 'Formal & Brief',
        handwritingFont: 'Kalam',
        defaultGreeting: 'Dear {{client.lastName}},',
        signatureText: 'Regards,\n{{me.fullName}}\n{{me.companyName}}',
        includeSignatureByDefault: true,
        isDefault: false,
        isOrgWide: false
      }
    ];

    // Create all platform styles using service role
    const created = [];
    for (const styleData of platformStyles) {
      const profile = await base44.asServiceRole.entities.NoteStyleProfile.create(styleData);
      created.push(profile);
    }

    return Response.json({
      success: true,
      message: `Created ${created.length} platform-wide writing styles`,
      profileCount: created.length,
      profiles: created.map(p => ({ id: p.id, name: p.name }))
    });

  } catch (error) {
    console.error('Error seeding platform styles:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to seed platform styles' 
    }, { status: 500 });
  }
});