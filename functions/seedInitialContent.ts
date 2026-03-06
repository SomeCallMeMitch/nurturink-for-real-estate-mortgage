import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// --- INLINE SEED DATA ---
const UNIVERSAL_CATEGORIES = [
  { name: 'Follow Up', slug: 'follow-up', description: 'For following up after meetings or calls.' },
  { name: 'Thank You', slug: 'thank-you', description: 'Expressing gratitude to clients.' },
  { name: 'Lead Nurture', slug: 'lead-nurture', description: 'Build relationships with prospects' },
  { name: 'Referral Request', slug: 'referral-request', description: 'Asking for referrals from happy clients.' },
  { name: 'Review Request', slug: 'review-request', description: 'Request online reviews' },
  { name: 'Holiday', slug: 'holiday', description: 'Seasonal and holiday greetings.' },
  { name: 'Birthday', slug: 'birthday', description: 'Wishing clients a happy birthday.' }
];

const UNIVERSAL_TEMPLATES = [
  {
    name: "Job Complete – Simple & Sincere",
    content: "Just wanted to say thanks for trusting us. It was a pleasure working with you, and I hope everything holds up strong for years to come. Let me know if you ever need anything — I'm always here.",
    categorySlugs: ["thank-you"]
  },
  {
    name: "Genuine Referral Ask – Warm & Personal",
    content: "I've been thinking about you since we finished our work. If you know someone who needs our services, I'd be so grateful if you mentioned us. A simple 'They did great work for me' means the world.",
    categorySlugs: ["referral-request", "follow-up"]
  },
  {
    name: "Review Request – Simple & Direct",
    content: "We just wrapped up your project and I wanted to ask — if you've got a minute, would you consider leaving a quick review? It helps us keep doing good work for families like yours. Either way, thank you for the opportunity.",
    categorySlugs: ["review-request"]
  },
  {
    name: "Personal Follow-Up – Not Pushy",
    content: "I know you've got a lot on your plate. I've been thinking about your project and just wanted to follow up personally. No pressure — just wanted you to know we're here if you need us.",
    categorySlugs: ["follow-up"]
  },
  {
    name: "The 'Just Met You' Follow-Up",
    content: "It was great meeting you today. I really appreciated you taking the time to chat.\n\nI'll be in touch soon with the information we discussed. In the meantime, don't hesitate to call if anything comes to mind.",
    categorySlugs: ["lead-nurture"]
  }
];

const INDUSTRY_DATA = {
  roofing: {
    categories: [
      { name: 'Storm Response', slug: 'storm-response', description: 'Messages related to storm damage' }
    ],
    templates: [
      {
        name: "After the Storm – High Impact",
        content: "Thanks for letting us help with your roof after the storm. I know how stressful this process can be, and I'm glad we could make it a little easier. If you know anyone else going through the same thing, I'd be grateful if you mentioned us.",
        categorySlugs: ["thank-you", "storm-response"]
      },
      {
        name: "After the Storm - High Impact (Lead)",
        content: "Following up on the recent storm in your area. Many of your neighbors are getting their roofs checked for damage. A quick, free inspection could save you thousands down the road.\n\nWould you be open to a 15-minute look? No strings attached.",
        categorySlugs: ["storm-response", "lead-nurture"]
      }
    ]
  },
  insurance: {
    categories: [
      { name: 'Policy Renewal', slug: 'policy-renewal', description: 'Policy renewal reminders' },
      { name: 'Claim Follow-up', slug: 'claim-follow-up', description: 'Checking in after a claim' }
    ],
    templates: [
      {
        name: "Policy Renewal Reminder",
        content: "Just a friendly reminder that your policy is coming up for renewal soon. I'd love to review your coverage to make sure it still fits your needs. Give me a call when you have a moment.",
        categorySlugs: ["policy-renewal", "follow-up"]
      },
      {
        name: "Checking in after Claim",
        content: "I know dealing with a claim can be stressful. I just wanted to check in and see how everything is going. Please let me know if there's anything I can do to help speed up the process.",
        categorySlugs: ["claim-follow-up"]
      }
    ]
  },
  real_estate: {
    categories: [
      { name: 'Closing', slug: 'closing', description: 'Congratulations on closing' },
      { name: 'Open House', slug: 'open-house', description: 'Open house follow ups' }
    ],
    templates: [
      {
        name: "Happy Home Anniversary",
        content: "Happy Home Anniversary! I can't believe it's been another year since you closed on your home. I hope you are making wonderful memories there. Let me know if you need any vendor recommendations or a home value update!",
        categorySlugs: ["follow-up"]
      },
      {
        name: "Thanks for Attending Open House",
        content: "It was great meeting you at the open house this weekend. I'd love to learn more about what you're looking for in your next home. Let's grab coffee sometime this week.",
        categorySlugs: ["lead-nurture", "open-house"]
      }
    ]
  },
  solar: {
    categories: [
      { name: 'Installation Complete', slug: 'installation', description: 'Post-installation' },
      { name: 'Savings Check-in', slug: 'savings', description: 'Checking on energy savings' }
    ],
    templates: [
      {
        name: "Congrats on Going Solar",
        content: "Congratulations on your new solar system! It was a pleasure helping you make the switch. If you have any questions about your system or your new energy bill, I'm always here.",
        categorySlugs: ["thank-you", "installation"]
      },
      {
        name: "First Bill Check-in",
        content: "It's been a month since your solar was turned on, which means your first new energy bill should be arriving soon. Let's connect so we can go over it together and make sure everything looks right.",
        categorySlugs: ["follow-up", "savings"]
      }
    ]
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { industry, userId, orgId } = await req.json();

    if (!userId || !orgId || !industry) {
      return Response.json({ error: 'Missing userId, orgId, or industry' }, { status: 400 });
    }

    console.log(`[Seeder] Starting content seed for org ${orgId}, industry: ${industry}`);

    const indData = INDUSTRY_DATA[industry] || { categories: [], templates: [] };

    // Merge: universal first, then industry-specific. Dedup categories by slug.
    const allCategories = [
      ...UNIVERSAL_CATEGORIES,
      ...indData.categories
    ];
    const uniqueCategories = [...new Map(allCategories.map(c => [c.slug, c])).values()];

    const allTemplates = [
      ...UNIVERSAL_TEMPLATES,
      ...indData.templates
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
        templateCategoryIds: (t.categorySlugs || []).reduce((ids: string[], slug: string) => {
          const id = categorySlugToIdMap.get(slug);
          if (id) {
            ids.push(id);
          } else {
            console.warn(`[Seeder] WARNING: Template "${t.name}" references unknown category slug "${slug}" — skipping.`);
          }
          return ids;
        }, [])
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