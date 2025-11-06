import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Sample pricing tiers based on provided screenshots
const defaultPricingTiers = [
  {
    name: "Starter Pack",
    creditAmount: 5,
    priceInCents: 1997, // $19.97
    sortOrder: 0,
    isMostPopular: false,
    highlights: [
      "AI Assisted BallPoint Pen \"Handwritten\" Note Cards",
      "Customized Templates",
      "\"Hand\" Addressed and Individually Stamped Envelopes",
      "Roofing Specific Templates"
    ],
    isActive: true
  },
  {
    name: "Professional",
    creditAmount: 20,
    priceInCents: 5997, // $59.97
    sortOrder: 1,
    isMostPopular: false,
    highlights: [
      "AI Assisted BallPoint Pen \"Handwritten\" Note Cards",
      "Customized Templates",
      "\"Hand\" Addressed and Individually Stamped Envelopes",
      "Roofing Specific Templates"
    ],
    isActive: true
  },
  {
    name: "Growth Pack",
    creditAmount: 50,
    priceInCents: 13497, // $134.97
    sortOrder: 2,
    isMostPopular: true, // Most popular
    highlights: [
      "AI Assisted BallPoint Pen \"Handwritten\" Note Cards",
      "Customized Templates",
      "\"Hand\" Addressed and Individually Stamped Envelopes",
      "Roofing Specific Templates",
      "Free Custom Card Design with QR Code"
    ],
    isActive: true
  },
  {
    name: "Enterprise",
    creditAmount: 100,
    priceInCents: 24997, // $249.97
    sortOrder: 3,
    isMostPopular: false,
    highlights: [
      "AI Assisted BallPoint Pen \"Handwritten\" Note Cards",
      "Customized Templates \"Hand\" Addressed and Individually Stamped Envelopes",
      "Roofing Specific Templates",
      "Free Custom Card Design with QR Code"
    ],
    isActive: true
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    
    // Check if user is super_admin OR organization_owner
    const isSuperAdmin = user.appRole === 'super_admin';
    const isOrgOwner = user.appRole === 'organization_owner';
    
    if (!isSuperAdmin && !isOrgOwner) {
      return Response.json({ 
        error: 'Unauthorized: Super admin or organization owner access required' 
      }, { status: 403 });
    }
    
    // Parse request body for optional orgId
    let requestedOrgId = null;
    try {
      const body = await req.json();
      requestedOrgId = body.orgId;
    } catch {
      // If no body or invalid JSON, proceed with default (null for super_admin, user's orgId for org_owner)
    }
    
    // Determine target orgId for seeding
    let targetOrgId = null;
    
    if (isSuperAdmin) {
      // Super admin can seed platform-wide (null) or for a specific org
      targetOrgId = requestedOrgId !== undefined ? requestedOrgId : null;
    } else if (isOrgOwner) {
      // Organization owner can only seed for their own organization
      if (!user.orgId) {
        return Response.json({ 
          error: 'Organization owner must belong to an organization' 
        }, { status: 400 });
      }
      
      // Ignore requestedOrgId if provided - always use their own orgId
      targetOrgId = user.orgId;
    }
    
    // Check if pricing tiers already exist for this scope
    const existingTiers = await base44.asServiceRole.entities.PricingTier.filter({
      orgId: targetOrgId
    });
    
    if (existingTiers.length > 0) {
      return Response.json({
        success: false,
        message: `Pricing tiers already exist for this ${targetOrgId ? 'organization' : 'platform'}. Found ${existingTiers.length} existing tiers.`,
        tierCount: existingTiers.length,
        scope: targetOrgId ? 'organization' : 'platform'
      });
    }
    
    // Create all pricing tiers
    const createdTiers = [];
    
    for (const tierData of defaultPricingTiers) {
      const tier = await base44.asServiceRole.entities.PricingTier.create({
        ...tierData,
        orgId: targetOrgId
      });
      createdTiers.push(tier);
    }
    
    return Response.json({
      success: true,
      message: `Successfully created ${createdTiers.length} pricing tiers for ${targetOrgId ? 'organization' : 'platform'}!`,
      tierCount: createdTiers.length,
      scope: targetOrgId ? 'organization' : 'platform',
      orgId: targetOrgId,
      tiers: createdTiers
    });
    
  } catch (error) {
    console.error('Error in seedPricingTiers:', error);
    return Response.json(
      { 
        success: false,
        error: error.message || 'Failed to seed pricing tiers',
        details: error.stack
      },
      { status: 500 }
    );
  }
});