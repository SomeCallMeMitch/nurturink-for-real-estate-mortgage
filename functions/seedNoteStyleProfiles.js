import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Seed Note Style Profiles
 * 
 * Creates 5 standard note style profiles for an organization.
 * Uses unified placeholder standard from lib/placeholders.ts:
 * - {{user.firstName}}, {{user.fullName}} for sender
 * - {{client.firstName}} for recipient
 * 
 * FIXED: Now handles idempotent creation - can be run multiple times safely
 */

const sampleProfiles = [
  {
    name: "Friendly",
    defaultGreeting: "Hi {{client.firstName}},",
    signatureText: "Thanks!\n{{user.firstName}}",
    includeSignatureByDefault: true,
    handwritingFont: "Caveat",
    isDefault: true,  // First one is default
    isOrgWide: true,  // Universal style, same for all orgs
    description: "Warm and approachable - great for most situations"
  },
  {
    name: "Casual",
    defaultGreeting: "Hey {{client.firstName}}!",
    signatureText: "Talk soon,\n{{user.firstName}}",
    includeSignatureByDefault: true,
    handwritingFont: "Caveat",
    isDefault: false,
    isOrgWide: true,
    description: "Relaxed and personable - best for established relationships"
  },
  {
    name: "Professional",
    defaultGreeting: "Hello {{client.firstName}},",
    signatureText: "Best,\n{{user.fullName}}",
    includeSignatureByDefault: true,
    handwritingFont: "Caveat",
    isDefault: false,
    isOrgWide: true,
    description: "Polished and respectful - ideal for first contact"
  },
  {
    name: "Grateful",
    defaultGreeting: "Hi {{client.firstName}},",
    signatureText: "Thank you,\n{{user.firstName}}",
    includeSignatureByDefault: true,
    handwritingFont: "Caveat",
    isDefault: false,
    isOrgWide: true,
    description: "Appreciative tone - perfect for thank you notes"
  },
  {
    name: "Direct",
    defaultGreeting: "{{client.firstName}},",
    signatureText: "— {{user.firstName}}",
    includeSignatureByDefault: true,
    handwritingFont: "Patrick Hand",
    isDefault: false,
    isOrgWide: true,
    description: "Minimal and efficient - good for quick notes"
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
    
    // FIXED: Instead of failing if profiles exist, we now:
    // 1. Check if we have the correct 5 profiles
    // 2. If we have all 5, return success (idempotent)
    // 3. If we have fewer than 5, create the missing ones
    
    if (existingProfiles.length >= 5) {
      // All profiles already exist - return success (idempotent)
      return Response.json({
        success: true,
        message: `Note style profiles already exist for this organization. Found ${existingProfiles.length} profiles.`,
        profileCount: existingProfiles.length,
        profiles: existingProfiles,
        action: "skipped"
      });
    }
    
    // Create missing profiles
    const createdProfiles = [];
    const existingNames = new Set(existingProfiles.map(p => p.name));
    
    for (const sampleProfile of sampleProfiles) {
      // Skip if this profile already exists
      if (existingNames.has(sampleProfile.name)) {
        console.log(`Profile "${sampleProfile.name}" already exists, skipping...`);
        continue;
      }
      
      try {
        const profile = await base44.entities.NoteStyleProfile.create({
          ...sampleProfile,
          userId: user.id,
          orgId: user.orgId
        });
        createdProfiles.push(profile);
        console.log(`Created profile: ${sampleProfile.name}`);
      } catch (createError) {
        console.error(`Failed to create profile "${sampleProfile.name}":`, createError);
        // Continue creating other profiles even if one fails
      }
    }
    
    const totalProfiles = existingProfiles.length + createdProfiles.length;
    
    return Response.json({
      success: true,
      message: `Successfully seeded note style profiles. Total: ${totalProfiles} profiles.`,
      profileCount: totalProfiles,
      newProfiles: createdProfiles.length,
      existingProfiles: existingProfiles.length,
      profiles: [...existingProfiles, ...createdProfiles],
      action: createdProfiles.length > 0 ? "created" : "skipped"
    });
    
  } catch (error) {
    console.error('Error in seedNoteStyleProfiles:', error);
    return Response.json(
      { 
        success: false,
        error: error.message || 'Failed to seed note style profiles',
        details: error.stack
      },
      { status: 500 }
    );
  }
});
