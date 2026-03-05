import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const CATEGORIES_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696020df49a02437cf7a3031/23c06b837_categories.json";
const TEMPLATES_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696020df49a02437cf7a3031/24e09f52a_templates.json";

// Helper to get unique categories for the given industry
const getUniqueCategories = (categoriesData, industry) => {
    const industryCategories = categoriesData.filter((c) => c.industry === industry);
    const universalCategories = categoriesData.filter((c) => c.industry === 'universal');
    const all = [...industryCategories, ...universalCategories];
    // Use a Map to ensure uniqueness based on the 'slug'
    return [...new Map(all.map((item) => [item.slug, item])).values()];
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { industry, userId, orgId } = await req.json();

    if (!userId || !orgId || !industry) {
      return Response.json({ error: 'Missing userId, orgId, or industry' }, { status: 400 });
    }

    console.log(`[Seeder] Starting content seed for org ${orgId}, industry: ${industry}`);

    // Fetch data directly from the JSON files provided
    const [categoriesRes, templatesRes] = await Promise.all([
        fetch(CATEGORIES_URL),
        fetch(TEMPLATES_URL)
    ]);

    if (!categoriesRes.ok || !templatesRes.ok) {
        throw new Error(`Failed to fetch seed data. Categories: ${categoriesRes.status}, Templates: ${templatesRes.status}`);
    }

    const categoriesData = await categoriesRes.json();
    const templatesData = await templatesRes.json();

    // --- IDEMPOTENT CATEGORY SEEDING ---
    const existingCategories = await base44.asServiceRole.entities.TemplateCategory.filter({ orgId, type: 'platform' });
    const existingCategorySlugs = new Set(existingCategories.map(c => c.slug));
    console.log(`[Seeder] Found ${existingCategorySlugs.size} existing platform categories for this org.`);

    const categoriesToCreate = getUniqueCategories(categoriesData, industry).filter(c => !existingCategorySlugs.has(c.slug));

    if (categoriesToCreate.length > 0) {
        const categoryRecords = categoriesToCreate.map(c => ({
            name: c.name,
            slug: c.slug,
            description: c.description || null,
            industry: c.industry || 'universal',
            orgId: orgId,
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
    const allOrgCategories = await base44.asServiceRole.entities.TemplateCategory.filter({ orgId });
    const categorySlugToIdMap = new Map(allOrgCategories.map(c => [c.slug, c.id]));

    const existingTemplates = await base44.asServiceRole.entities.Template.filter({ orgId, type: 'platform' });
    const existingTemplateNames = new Set(existingTemplates.map(t => t.name));
    console.log(`[Seeder] Found ${existingTemplateNames.size} existing platform templates for this org.`);

    const templatesToFilter = templatesData.filter((t) => t.industry === 'universal' || t.industry === industry);
    const templatesToCreate = templatesToFilter.filter((t) => !existingTemplateNames.has(t.name));

    if (templatesToCreate.length > 0) {
        const templateRecords = templatesToCreate.map((t) => ({
            name: t.name,
            content: t.content,
            industry: t.industry || 'universal',
            orgId: orgId,
            createdByUserId: userId,
            type: 'platform',
            status: 'approved',
            templateCategoryIds: (t.categorySlugs || []).map((slug) => categorySlugToIdMap.get(slug)).filter(Boolean)
        }));
        await base44.asServiceRole.entities.Template.bulkCreate(templateRecords);
        console.log(`[Seeder] Created ${templateRecords.length} new templates.`);
    } else {
        console.log('[Seeder] No new templates to create.');
    }

    return Response.json({ success: true, message: "Seeding process completed." });

  } catch (error) {
    console.error('[Seeder] Error in seedInitialContent:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});