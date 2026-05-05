import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const BASE_URL = Deno.env.get('SEED_DATA_BASE_URL') ??
  'https://raw.githubusercontent.com/SomeCallMeMitch/messages/main';

async function fetchIndustryData(industry: string) {
  const url = `${BASE_URL}/${industry}.json`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) {
      console.log(`[Seeder] No seed data found for industry '${industry}' (${url}). Skipping.`);
      return null;
    }
    throw new Error(`Failed to fetch seed data for '${industry}': ${res.status} ${res.statusText}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { industry, userId: payloadUserId, orgId: payloadOrgId } = await req.json();

    const hasPassedSeedContext = Boolean(payloadUserId && payloadOrgId);
    let userId = payloadUserId;
    let orgId = payloadOrgId;

    if (!hasPassedSeedContext) {
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
      orgId = user.orgId;
    }

    if (!userId || !orgId || !industry) {
      return Response.json({ error: 'Missing userId, orgId, or industry' }, { status: 400 });
    }

    console.log(`[Seeder] Starting content seed for org ${orgId}, industry: ${industry}`);

    // Always load universal data
    const universalData = await fetchIndustryData('universal');
    if (!universalData) {
      throw new Error('Universal seed data is required but could not be fetched.');
    }

    // Load industry-specific data — graceful fallback to universal-only if not found
    const industryData = await fetchIndustryData(industry);

    // Merge categories and templates
    const allCategories = [
      ...universalData.categories,
      ...(industryData?.categories ?? []),
    ];
    // Deduplicate categories by slug (universal takes precedence)
    const uniqueCategories = [...new Map(allCategories.map((c: any) => [c.slug, c])).values()];

    const allTemplates = [
      ...universalData.templates,
      ...(industryData?.templates ?? []),
    ];

    console.log(`[Seeder] Loaded ${uniqueCategories.length} categories and ${allTemplates.length} templates to consider.`);

    // --- IDEMPOTENT CATEGORY SEEDING ---
    const existingCategories = await base44.asServiceRole.entities.TemplateCategory.filter({ orgId, type: 'platform' });
    const existingCategorySlugs = new Set(existingCategories.map((c: any) => c.slug));
    console.log(`[Seeder] Found ${existingCategorySlugs.size} existing platform categories for this org.`);

    const categoriesToCreate = uniqueCategories.filter((c: any) => !existingCategorySlugs.has(c.slug));

    if (categoriesToCreate.length > 0) {
      const categoryRecords = categoriesToCreate.map((c: any) => ({
        name: c.name,
        slug: c.slug,
        description: c.description || null,
        subcategory: c.subcategory || null,
        sortOrder: c.sortOrder ?? 99,
        orgId,
        type: 'platform',
        createdByUserId: userId,
        isActive: true,
      }));
      await base44.asServiceRole.entities.TemplateCategory.bulkCreate(categoryRecords);
      console.log(`[Seeder] Created ${categoryRecords.length} new categories.`);
    } else {
      console.log('[Seeder] No new categories to create.');
    }

    // --- IDEMPOTENT TEMPLATE SEEDING ---
    // Small delay to allow the database to index newly created category records
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Re-fetch all org categories (including any just created) to build the slug→id map
    const allOrgCategories = await base44.asServiceRole.entities.TemplateCategory.filter({ orgId });
    const categorySlugToIdMap = new Map(allOrgCategories.map((c: any) => [c.slug, c.id]));

    const existingTemplates = await base44.asServiceRole.entities.Template.filter({ orgId, type: 'platform' });
    const existingTemplateNames = new Set(existingTemplates.map((t: any) => t.name));
    console.log(`[Seeder] Found ${existingTemplateNames.size} existing platform templates for this org.`);

    const templatesToCreate = allTemplates.filter((t: any) => !existingTemplateNames.has(t.name));

    if (templatesToCreate.length > 0) {
      const templateRecords = templatesToCreate.map((t: any) => ({
        name: t.name,
        content: t.content,
        orgId,
        createdByUserId: userId,
        type: 'platform',
        status: 'approved',
        templateCategoryIds: (t.categorySlugs || []).reduce((ids: string[], slug: string) => {
          const id = categorySlugToIdMap.get(slug);
          if (id) {
            ids.push(id);
          } else {
            console.warn(`[Seeder] WARNING: Template "${t.name}" references unknown category slug "${slug}" — skipping that link.`);
          }
          return ids;
        }, []),
      }));
      await base44.asServiceRole.entities.Template.bulkCreate(templateRecords);
      console.log(`[Seeder] Created ${templateRecords.length} new templates.`);
    } else {
      console.log('[Seeder] No new templates to create.');
    }

    return Response.json({
      success: true,
      message: `Seeding complete. Categories: ${categoriesToCreate.length} created. Templates: ${templatesToCreate.length} created.`,
    });

  } catch (error: any) {
    console.error('[Seeder] Error in seedInitialContent:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});
