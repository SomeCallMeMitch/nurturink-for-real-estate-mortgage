import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const sampleProfiles = [
  {
    name: "Professional",
    defaultGreeting: "Dear {{client.firstName}},",
    signatureText: "Sincerely,\n{{me.fullName}}\n{{me.companyName}}\n{{me.phone}}",
    includeSignatureByDefault: true,
    handwritingFont: "Caveat",
    isDefault: true,  // First one is default
    isOrgWide: false
  },
  {
    name: "Casual & Friendly",
    defaultGreeting: "Hi {{client.firstName}}!",
    signatureText: "Best,\n{{me.fullName}}\n{{me.companyName}}",
    includeSignatureByDefault: true,
    handwritingFont: "Caveat",
    isDefault: false,
    isOrgWide: false
  },
  {
    name: "Follow-up Thank You",
    defaultGreeting: "Hello {{client.firstName}},",
    signatureText: "Thank you,\n{{me.fullName}}\n{{me.companyName}}",
    includeSignatureByDefault: true,
    handwritingFont: "Caveat",
    isDefault: false,
    isOrgWide: false
  },
  {
    name: "Simple & Direct",
    defaultGreeting: "{{client.firstName}},",
    signatureText: "Regards,\n{{me.fullName}}",
    includeSignatureByDefault: true,
    handwritingFont: "Caveat",
    isDefault: false,
    isOrgWide: false
  },
  {
    name: "Warm Personal Touch",
    defaultGreeting: "Hey {{client.firstName}},",
    signatureText: "All the best,\n{{me.fullName}}\n{{me.phone}}",
    includeSignatureByDefault: true,
    handwritingFont: "Patrick Hand",
    isDefault: false,
    isOrgWide: false
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!user.orgId) {
      return Response.json({ error: 'User must belong to an organization' }, { status: 400 });
    }
    
    // Check if any profiles already exist for this organization
    const existingProfiles = await base44.entities.NoteStyleProfile.filter({
      orgId: user.orgId
    });
    
    if (existingProfiles.length > 0) {
      return Response.json({
        success: false,
        message: `NoteStyleProfiles already exist. Found ${existingProfiles.length} existing profiles.`,
        profileCount: existingProfiles.length
      });
    }
    
    // Create all sample profiles
    const createdProfiles = [];
    
    for (const sampleProfile of sampleProfiles) {
      const profile = await base44.entities.NoteStyleProfile.create({
        ...sampleProfile,
        userId: user.id,
        orgId: user.orgId
      });
      createdProfiles.push(profile);
    }
    
    return Response.json({
      success: true,
      message: `Successfully created ${createdProfiles.length} note style profiles!`,
      profileCount: createdProfiles.length,
      profiles: createdProfiles
    });
    
  } catch (error) {
    console.error('Error in seedNoteStyleProfiles:', error);
    return Response.json(
      { 
        success: false,
        error: error.message || 'Failed to seed note style profiles' 
      },
      { status: 500 }
    );
  }
});