import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
// Import the JSON data directly. Deno will bundle this with the function.
import categoriesData from '../seed-data/categories.json' assert { type: "json" };
import templatesData from '../seed-data/templates.json' assert { type: "json" };

// Helper to get unique categories for the given industry
const getUniqueCategories = (industry) => {
    const industryCategories = categoriesData.filter((c: any) => c.industry === industry);
    const universalCategories = categoriesData.filter((c: any) => c.industry === 'universal');
    const all = [...industryCategories, ...universalCategories];
    // Use a Map to ensure uniqueness based on the 'slug'
    return [...new Map(all.map((item: any) => [item.slug, item])).values()];
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { industry, userId, orgId } = await req.json();

    if (!userId || !orgId || !industry) {
      return Response.json({ error: 'Missing userId, orgId, or industry' }, { status: 400 });
    }

    console.log(`[Seeder] Starting content seed for org ${orgId}, industry: ${industry}`);

    // --- IDEMPOTENT CATEGORY SEEDING ---
    const existingCategories = await base44.asServiceRole.entities.TemplateCategory.filter({ orgId, type: 'platform' });
    const existingCategorySlugs = new Set(existingCategories.map(c => c.slug));
    console.log(`[Seeder] Found ${existingCategorySlugs.size} existing platform categories for this org.`);

    const categoriesToCreate = getUniqueCategories(industry).filter(c => !existingCategorySlugs.has(c.slug));

    if (categoriesToCreate.length > 0) {
        const categoryRecords = categoriesToCreate.map(c => ({
            ...c,
            orgId: orgId,
            type: 'platform',
            createdByUserId: userId
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

    const templatesToFilter = templatesData.filter((t: any) => t.industry === 'universal' || t.industry === industry);
    const templatesToCreate = templatesToFilter.filter((t: any) => !existingTemplateNames.has(t.name));

    if (templatesToCreate.length > 0) {
        const templateRecords = templatesToCreate.map((t: any) => ({
            name: t.name,
            content: t.content,
            industry: t.industry,
            orgId: orgId,
            createdByUserId: userId,
            type: 'platform',
            status: 'approved',
            templateCategoryIds: t.categorySlugs.map((slug: string) => categorySlugToIdMap.get(slug)).filter(Boolean)
        }));
        await base44.asServiceRole.entities.Template.bulkCreate(templateRecords);
        console.log(`[Seeder] Created ${templateRecords.length} new templates.`);
    } else {
        console.log('[Seeder] No new templates to create.');
    }

    // Note: Designs are not implemented yet, but logic would follow the same pattern.

    return Response.json({ success: true, message: "Seeding process completed." });

  } catch (error: any) {
    console.error('[Seeder] Error in seedInitialContent:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});