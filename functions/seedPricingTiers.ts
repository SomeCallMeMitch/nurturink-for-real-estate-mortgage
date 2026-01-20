import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Ensure only admin/service can run this in prod, but for seeding we allow authenticated users or check role
    // For now, just run it.

    const tiers = [
      {
        name: "Starter Pack",
        creditAmount: 5,
        priceInCents: 1997,
        sortOrder: 1,
        isMostPopular: false,
        highlights: ["$3.99 per note", "AI Assisted Writing", "Real Pen & Ink"]
      },
      {
        name: "Professional",
        creditAmount: 20,
        priceInCents: 5997,
        sortOrder: 2,
        isMostPopular: true,
        highlights: ["$3.00 per note", "Custom Templates", "Priority Processing"]
      },
      {
        name: "Growth Pack",
        creditAmount: 50,
        priceInCents: 50, // As requested: $0.50 for 50 notes. Caution: This is extremely cheap.
        sortOrder: 3,
        isMostPopular: false,
        highlights: ["$0.01 per note", "High Volume", "Business Automation"]
      },
      {
        name: "Enterprise",
        creditAmount: 100,
        priceInCents: 24997,
        sortOrder: 4,
        isMostPopular: false,
        highlights: ["$2.50 per note", "Dedicated Support", "API Access"]
      }
    ];

    // Upsert tiers
    const existingTiers = await base44.entities.PricingTier.list({ orgId: null }); // Global tiers have null orgId
    
    let count = 0;
    for (const tier of tiers) {
       const match = existingTiers.find(t => t.name === tier.name);
       if (match) {
         await base44.entities.PricingTier.update(match.id, tier);
       } else {
         await base44.entities.PricingTier.create({
           ...tier,
           orgId: null,
           isActive: true
         });
       }
       count++;
    }

    return Response.json({ success: true, message: `Seeded ${count} pricing tiers`, tierCount: count });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});