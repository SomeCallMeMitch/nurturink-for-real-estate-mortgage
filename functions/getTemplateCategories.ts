import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('🔐 getTemplateCategories - User authenticated:', user.email);
    console.log('🏢 getTemplateCategories - User orgId:', user.orgId);
    
    // Fetch platform-wide categories (orgId: null) using service role
    const platformCategories = await base44.asServiceRole.entities.TemplateCategory.filter({
      orgId: null
    });
    
    console.log('🌐 getTemplateCategories - Platform categories found:', platformCategories.length);
    
    // Fetch org-specific categories (if user has an org)
    let orgCategories = [];
    if (user.orgId) {
      orgCategories = await base44.entities.TemplateCategory.filter({
        orgId: user.orgId
      });
      console.log('🏢 getTemplateCategories - Org categories found:', orgCategories.length);
    }
    
    // Combine and return all categories
    const allCategories = [...platformCategories, ...orgCategories];
    
    console.log('✅ getTemplateCategories - Total categories returning:', allCategories.length);
    
    return Response.json(allCategories);
    
  } catch (error) {
    console.error('❌ getTemplateCategories - Error:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch template categories' },
      { status: 500 }
    );
  }
});