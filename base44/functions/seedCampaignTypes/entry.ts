import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * seedCampaignTypes
 *
 * Seeds the default CampaignType records for the RE + Mortgage clone.
 * Idempotent — checks for existing slugs before creating.
 * Run once from the Base44 dashboard after creating the CampaignType entity.
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
    name: 'Home Anniversary',
    slug: 'home_anniversary',
    triggerField: 'home_anniversary_date',
    triggerMode: 'recurring',
    timingDirection: 'before',
    defaultTimingDays: 7,
    maxSteps: 1,
    icon: 'Home',
    color: 'bg-green-100 text-green-700 border-green-200',
    selectedColor: 'bg-green-50 border-green-500 ring-2 ring-green-500',
    isActive: true,
    scope: 'platform',
    orgId: null,
    timingLabel: 'days before their home anniversary',
    description: "Celebrate the anniversary of each client's home purchase",
    sortOrder: 2
  },
  {
    name: 'Post Close',
    slug: 'post_close',
    triggerField: 'close_date',
    triggerMode: 'one_time',
    timingDirection: 'after',
    defaultTimingDays: 3,
    maxSteps: 2,
    icon: 'Award',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    selectedColor: 'bg-amber-50 border-amber-500 ring-2 ring-amber-500',
    isActive: true,
    scope: 'platform',
    orgId: null,
    timingLabel: 'days after close date',
    description: 'Send a congratulations card shortly after a deal closes',
    sortOrder: 3
  },
  {
    name: 'Loan Anniversary',
    slug: 'loan_anniversary',
    triggerField: 'loan_anniversary_date',
    triggerMode: 'recurring',
    timingDirection: 'before',
    defaultTimingDays: 7,
    maxSteps: 1,
    icon: 'Key',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    selectedColor: 'bg-teal-50 border-teal-500 ring-2 ring-teal-500',
    isActive: true,
    scope: 'platform',
    orgId: null,
    timingLabel: 'days before their loan anniversary',
    description: 'Recognize the anniversary of a mortgage closing',
    sortOrder: 4
  },
  {
    name: 'SOI Quarterly',
    slug: 'soi_quarterly',
    triggerField: null,
    triggerMode: 'manual',
    timingDirection: 'after',
    defaultTimingDays: 0,
    maxSteps: 1,
    icon: 'Users',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    selectedColor: 'bg-purple-50 border-purple-500 ring-2 ring-purple-500',
    isActive: true,
    scope: 'platform',
    orgId: null,
    timingLabel: 'manual send',
    description: 'Keep your sphere of influence warm with quarterly touchpoints',
    sortOrder: 5
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