import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const defaultCategories = [
  {
    name: "Thank You",
    description: "Express gratitude to clients",
    sortOrder: 0,
    isActive: true,
    orgId: null, // Platform-wide
    createdByUserId: null
  },
  {
    name: "Follow-Up",
    description: "Check in with clients after service",
    sortOrder: 1,
    isActive: true,
    orgId: null,
    createdByUserId: null
  },
  {
    name: "Referral Request",
    description: "Ask for referrals",
    sortOrder: 2,
    isActive: true,
    orgId: null,
    createdByUserId: null
  },
  {
    name: "Review Request",
    description: "Request online reviews",
    sortOrder: 3,
    isActive: true,
    orgId: null,
    createdByUserId: null
  },
  {
    name: "Storm Response",
    description: "Messages related to storm damage",
    sortOrder: 4,
    isActive: true,
    orgId: null,
    createdByUserId: null
  },
  {
    name: "Lead Nurture",
    description: "Build relationships with prospects",
    sortOrder: 5,
    isActive: true,
    orgId: null,
    createdByUserId: null
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated and is super admin
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (user.appRole !== 'super_admin') {
      return Response.json({ error: 'Super admin access required' }, { status: 403 });
    }
    
    // Check if platform categories already exist
    const existingCategories = await base44.asServiceRole.entities.TemplateCategory.filter({
      orgId: null // Platform-wide categories
    });
    
    if (existingCategories.length > 0) {
      return Response.json({
        success: false,
        message: `Platform categories already exist. Found ${existingCategories.length} existing categories.`,
        categoryCount: existingCategories.length
      });
    }
    
    // Create all default categories
    const createdCategories = [];
    
    for (const category of defaultCategories) {
      const created = await base44.asServiceRole.entities.TemplateCategory.create(category);
      createdCategories.push(created);
    }
    
    return Response.json({
      success: true,
      message: `Successfully created ${createdCategories.length} template categories!`,
      categoryCount: createdCategories.length,
      categories: createdCategories
    });
    
  } catch (error) {
    console.error('Error in seedTemplateCategories:', error);
    return Response.json(
      { 
        success: false,
        error: error.message || 'Failed to seed template categories' 
      },
      { status: 500 }
    );
  }
});