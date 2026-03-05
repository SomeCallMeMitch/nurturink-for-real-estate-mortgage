import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const categoriesData = [
  {
    "name": "Thank You",
    "slug": "thank-you",
    "description": "General thank you notes",
    "sortOrder": 1,
    "industry": "universal"
  },
  {
    "name": "Referral Request",
    "slug": "referral-request",
    "description": "Asking for referrals",
    "sortOrder": 2,
    "industry": "universal"
  },
  {
    "name": "Policy Renewal",
    "slug": "policy-renewal",
    "description": "Insurance policy renewals",
    "sortOrder": 3,
    "industry": "insurance"
  },
  {
    "name": "Post-Inspection",
    "slug": "post-inspection",
    "description": "After an inspection",
    "sortOrder": 4,
    "industry": "roofing"
  }
];

const templatesData = [
  {
    "name": "Standard Thank You",
    "content": "Thank you for your business. We appreciate your trust in us.",
    "categorySlugs": ["thank-you"],
    "industry": "universal"
  },
  {
    "name": "Referral Request (General)",
    "content": "If you know anyone who could benefit from our services, please let us know.",
    "categorySlugs": ["referral-request"],
    "industry": "universal"
  },
  {
    "name": "Insurance Renewal Reminder",
    "content": "It's time to renew your policy. We are here to help.",
    "categorySlugs": ["policy-renewal"],
    "industry": "insurance"
  },
  {
    "name": "Roofing Post-Inspection Thanks",
    "content": "Thanks for letting us inspect your roof. Here are the next steps.",
    "categorySlugs": ["post-inspection", "thank-you"],
    "industry": "roofing"
  }
];

// Helper to get unique categories for the given industry
const getUniqueCategories = (industry) => {
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

    const templatesToFilter = templatesData.filter((t) => t.industry === 'universal' || t.industry === industry);
    const templatesToCreate = templatesToFilter.filter((t) => !existingTemplateNames.has(t.name));

    if (templatesToCreate.length > 0) {
        const templateRecords = templatesToCreate.map((t) => ({
            name: t.name,
            content: t.content,
            industry: t.industry,
            orgId: orgId,
            createdByUserId: userId,
            type: 'platform',
            status: 'approved',
            templateCategoryIds: t.categorySlugs.map((slug) => categorySlugToIdMap.get(slug)).filter(Boolean)
        }));
        await base44.asServiceRole.entities.Template.bulkCreate(templateRecords);
        console.log(`[Seeder] Created ${templateRecords.length} new templates.`);
    } else {
        console.log('[Seeder] No new templates to create.');
    }

    // Note: Designs are not implemented yet, but logic would follow the same pattern.

    return Response.json({ success: true, message: "Seeding process completed." });

  } catch (error) {
    console.error('[Seeder] Error in seedInitialContent:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});