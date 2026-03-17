import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * seedCampaignTypes
 *
 * Seeds the three default platform CampaignType records (birthday, welcome, renewal).
 * Idempotent — checks for existing records before creating.
 * Run once after creating the CampaignType entity.
 */

const PLATFORM_CAMPAIGN_TYPES = [
  {
    name: 'Birthday',
    slug: 'birthday',
    triggerField: 'birthday',
    triggerMode: 'recurring',
    timingDirection: 'before',
    defaultTimingDays: 10,
    maxSteps: 1,
    icon: 'Cake',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    selectedColor: 'bg-pink-50 border-pink-500 ring-2 ring-pink-500',
    isActive: true,
    scope: 'platform',
    orgId: null,
    timingLabel: 'days before their birthday',
    description: "Send a card automatically before each client's birthday",
    sortOrder: 1
  },
  {
    name: 'Welcome',
    slug: 'welcome',
    triggerField: 'policy_start_date',
    triggerMode: 'one_time',
    timingDirection: 'after',
    defaultTimingDays: 0,
    maxSteps: 2,
    icon: 'Gift',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    selectedColor: 'bg-blue-50 border-blue-500 ring-2 ring-blue-500',
    isActive: true,
    scope: 'platform',
    orgId: null,
    timingLabel: 'days after policy start date',
    description: 'Send a welcome sequence when clients join (1-2 cards)',
    sortOrder: 2
  },
  {
    name: 'Renewal',
    slug: 'renewal',
    triggerField: 'renewal_date',
    triggerMode: 'recurring',
    timingDirection: 'before',
    defaultTimingDays: 30,
    maxSteps: 2,
    icon: 'RefreshCw',
    color: 'bg-green-100 text-green-700 border-green-200',
    selectedColor: 'bg-green-50 border-green-500 ring-2 ring-green-500',
    isActive: true,
    scope: 'platform',
    orgId: null,
    timingLabel: 'days before their renewal date',
    description: 'Send reminders before policy renewal dates',
    sortOrder: 3
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const created = [];
    const skipped = [];
    const errors = [];

    for (const typeData of PLATFORM_CAMPAIGN_TYPES) {
      try {
        const existing = await base44.asServiceRole.entities.CampaignType.filter({
          slug: typeData.slug
        });

        if (existing && existing.length > 0) {
          console.log(`[seedCampaignTypes] Slug "${typeData.slug}" already exists, skipping`);
          skipped.push(typeData.slug);
          continue;
        }

        await base44.asServiceRole.entities.CampaignType.create(typeData);
        console.log(`[seedCampaignTypes] Created CampaignType: ${typeData.slug}`);
        created.push(typeData.slug);

      } catch (err) {
        console.error(`[seedCampaignTypes] Error creating "${typeData.slug}":`, err.message);
        errors.push({ slug: typeData.slug, error: err.message });
      }
    }

    return Response.json({
      success: true,
      summary: { created: created.length, skipped: skipped.length, errors: errors.length },
      details: { created, skipped, errors }
    });

  } catch (error) {
    console.error('[seedCampaignTypes] Fatal error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});