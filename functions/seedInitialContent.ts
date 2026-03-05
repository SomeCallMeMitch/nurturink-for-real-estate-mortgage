import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Base URL for the seed-data directory in Supabase storage.
// b44: After uploading the per-industry JSON files, update this base URL
// to match the storage path they are uploaded to.
const SEED_DATA_BASE_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696020df49a02437cf7a3031/seed-data";

// Fetch a single industry data file. Returns { categories: [], templates: [] }.
// If the file does not exist (404), returns empty arrays so the seeder degrades
// gracefully for industries that don't have content files yet.
const fetchIndustryData = async (industry: string): Promise<{ categories: any[]; templates: any[] }> => {
  const url = `${SEED_DATA_BASE_URL}/${industry}.json`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) {
      console.log(`[Seeder] No seed file found for industry '${industry}' — skipping industry-specific content.`);
      return { categories: [], templates: [] };
    }
    throw new Error(`Failed to fetch seed data for '${industry}': HTTP ${res.status}`);
  }
  return res.json();
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { industry, userId, orgId } = await req.json();

    if (!userId || !orgId || !industry) {
      return Response.json({ error: 'Missing userId, orgId, or industry' }, { status: 400 });
    }

    console.log(`[Seeder] Starting content seed for org ${orgId}, industry: ${industry}`);

    // Always load universal content. Load industry-specific content in parallel.
    // If the industry file doesn't exist yet, fetchIndustryData returns empty arrays.
    const [universalData, industryData] = await Promise.all([
      fetchIndustryData('universal'),
      industry !== 'universal' ? fetchIndustryData(industry) : Promise.resolve({ categories: [], templates: [] })
    ]);

    // Merge: universal first, then industry-specific. Dedup categories by slug.
    const allCategories = [
      ...universalData.categories,
      ...industryData.categories
    ];
    const uniqueCategories = [...new Map(allCategories.map(c => [c.slug, c])).values()];

    const allTemplates = [
      ...universalData.templates,
      ...industryData.templates
    ];

    console.log(`[Seeder] Loaded ${uniqueCategories.length} categories and ${allTemplates.length} templates to consider.`);

    // --- IDEMPOTENT CATEGORY SEEDING ---
    const existingCategories = await base44.asServiceRole.entities.TemplateCategory.filter({ orgId, type: 'platform' });
    const existingCategorySlugs = new Set(existingCategories.map((c: any) => c.slug));
    console.log(`[Seeder] Found ${existingCategorySlugs.size} existing platform categories for this org.`);

    const categoriesToCreate = uniqueCategories.filter(c => !existingCategorySlugs.has(c.slug));

    if (categoriesToCreate.length > 0) {
      const categoryRecords = categoriesToCreate.map(c => ({
        name: c.name,
        slug: c.slug,
        description: c.description || null,
        subcategory: c.subcategory || null,
        sortOrder: c.sortOrder ?? 99,
        orgId,
        type: 'platform',
        createdByUserId: userId,
        isActive: true
      }));
      await base44.asServiceRole.entities.TemplateCategory.bulkCreate(categoryRecords);
      console.log(`[Seeder] Created ${categoryRecords.length} new categories.`);
    } else {
      console.log('[Seeder] No new categories to create.');
    }

    // --- IDEMPOTENT TEMPLATE SEEDING ---
    // Re-fetch all org categories (including any just created) to build the slug→id map.
    // Small delay to allow the database to index the newly created records.
    await new Promise(resolve => setTimeout(resolve, 500));

    const allOrgCategories = await base44.asServiceRole.entities.TemplateCategory.filter({ orgId });
    const categorySlugToIdMap = new Map(allOrgCategories.map((c: any) => [c.slug, c.id]));

    const existingTemplates = await base44.asServiceRole.entities.Template.filter({ orgId, type: 'platform' });
    const existingTemplateNames = new Set(existingTemplates.map((t: any) => t.name));
    console.log(`[Seeder] Found ${existingTemplateNames.size} existing platform templates for this org.`);

    const templatesToCreate = allTemplates.filter(t => !existingTemplateNames.has(t.name));

    if (templatesToCreate.length > 0) {
      const templateRecords = templatesToCreate.map(t => ({
        name: t.name,
        content: t.content,
        orgId,
        createdByUserId: userId,
        type: 'platform',
        status: 'approved',
        templateCategoryIds: (t.categorySlugs || [])
          .map((slug: string) => categorySlugToIdMap.get(slug))
          .filter(Boolean)
      }));
      await base44.asServiceRole.entities.Template.bulkCreate(templateRecords);
      console.log(`[Seeder] Created ${templateRecords.length} new templates.`);
    } else {
      console.log('[Seeder] No new templates to create.');
    }

    return Response.json({
      success: true,
      message: `Seeding complete. Categories: ${categoriesToCreate.length} created. Templates: ${templatesToCreate.length} created.`
    });

  } catch (error: any) {
    console.error('[Seeder] Error in seedInitialContent:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});