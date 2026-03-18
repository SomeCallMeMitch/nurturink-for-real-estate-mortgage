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
    
    if (!user.orgId) {
      console.log('⚠️ getTemplateCategories - No orgId on user, returning empty array');
      return Response.json([]);
    }

    // Fetch platform categories seeded for this org.
    // The seeder creates TemplateCategory records with orgId=user.orgId and type='platform'.
    // We must use service role to read records created by the seeder.
    const platformCategories = await base44.asServiceRole.entities.TemplateCategory.filter({
      orgId: user.orgId,
      type: 'platform',
    });
    
    console.log('🌐 getTemplateCategories - Platform categories found:', platformCategories.length);
    
    // Fetch org-specific categories created by the org itself (type='organization')
    const orgCategories = await base44.entities.TemplateCategory.filter({
      orgId: user.orgId,
      type: 'organization',
    });
    console.log('🏢 getTemplateCategories - Org-specific categories found:', orgCategories.length);
    
    // Combine and deduplicate by id
    const seen = new Set();
    const allCategories = [...platformCategories, ...orgCategories].filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
    
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