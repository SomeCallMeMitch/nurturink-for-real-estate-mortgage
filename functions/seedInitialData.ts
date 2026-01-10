import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// --- DATA TO SEED ---

const TEMPLATE_CATEGORIES = [
  { name: 'Follow Up', slug: 'follow-up', icon: 'MailCheck', description: 'For following up after meetings or calls.' },
  { name: 'Thank You', slug: 'thank-you', icon: 'Heart', description: 'Expressing gratitude to clients.' },
  { name: 'Prospecting', slug: 'prospecting', icon: 'Search', description: 'Reaching out to new potential clients.' },
  { name: 'Relationship Building', slug: 'relationship-building', icon: 'Users', description: 'Nurturing long-term client relationships.' },
  { name: 'Congratulations', slug: 'congratulations', icon: 'Trophy', description: 'Celebrating client milestones and achievements.' },
  { name: 'Birthday', slug: 'birthday', icon: 'Cake', description: 'Wishing clients a happy birthday.' },
  { name: 'Holiday', slug: 'holiday', icon: 'Calendar', description: 'Seasonal and holiday greetings.' },
  { name: 'Apology', slug: 'apology', icon: 'Wrench', description: 'For when things don\'t go as planned.' },
  { name: 'Referral Request', slug: 'referral-request', icon: 'Share2', description: 'Asking for referrals from happy clients.' },
  { name: 'Event Invitation', slug: 'event-invitation', icon: 'Ticket', description: 'Inviting clients to events.' },
  { name: 'Post-Purchase', slug: 'post-purchase', icon: 'ShoppingCart', description: 'After a client makes a purchase.' },
  { name: 'Welcome', slug: 'welcome', icon: 'Hand', description: 'Welcoming new clients.' },
  { name: 'Sympathy', slug: 'sympathy', icon: 'CloudDrizzle', description: 'Expressing condolences.' },
  { name: 'Just Because', slug: 'just-because', icon: 'Smile', description: 'Reaching out for no specific reason.' },
  { name: 'Lost Client', slug: 'lost-client', icon: 'RotateCcw', description: 'Attempting to win back a lost client.' },
];

const NOTE_STYLE_PROFILES = [
  { name: 'Friendly', defaultGreeting: 'Hi {{client.firstName}},', signatureText: 'Best,\n{{user.firstName}}', isDefault: true },
  { name: 'Casual', defaultGreeting: 'Hey {{client.firstName}},', signatureText: 'Cheers,\n{{user.firstName}}', isDefault: false },
  { name: 'Professional', defaultGreeting: 'Dear {{client.firstName}},', signatureText: 'Sincerely,\n{{user.fullName}}\n{{user.title}}', isDefault: false },
  { name: 'Grateful', defaultGreeting: 'Hi {{client.firstName}},', signatureText: 'With gratitude,\n{{user.firstName}}', isDefault: false },
  { name: 'Direct', defaultGreeting: '{{client.firstName}},', signatureText: 'Regards,\n{{user.firstName}}', isDefault: false },
];

const TAGS = {
  universal: [
    { name: 'Hot Lead', color: '#ef4444' },
    { name: 'Warm Lead', color: '#f97316' },
    { name: 'Cold Lead', color: '#3b82f6' },
    { name: 'VIP Client', color: '#a855f7' },
    { name: 'Past Client', color: '#6b7280' },
    { name: 'Follow Up Needed', color: '#eab308' },
    { name: 'New Client', color: '#22c55e' },
    { name: 'Contacted', color: '#14b8a6' },
  ],
  real_estate: [
    { name: 'Buyer', color: '#2563eb' },
    { name: 'Seller', color: '#db2777' },
    { name: 'Renter', color: '#9333ea' },
    { name: 'Investor', color: '#d97706' },
  ],
  insurance: [
    { name: 'Policy Renewal', color: '#059669' },
    { name: 'Claim Filed', color: '#dc2626' },
    { name: 'Life Insurance', color: '#4f46e5' },
    { name: 'Home & Auto', color: '#0284c7' },
  ],
  financial_services: [
    { name: 'High Net Worth', color: '#7c3aed' },
    { name: 'Retirement Planning', color: '#059669' },
    { name: 'Investment', color: '#0891b2' },
  ],
  roofing_solar: [
    { name: 'Storm Damage', color: '#ef4444' },
    { name: 'New Construction', color: '#3b82f6' },
    { name: 'Solar Interest', color: '#f59e0b' },
  ],
};

const QUICK_SEND_TEMPLATES = [
    { name: 'Simple Thank You', purpose: 'thank-you', templateSlug: 'simple-thank-you', cardDesignSlug: 'classic-white' },
    { name: 'Quick Follow Up', purpose: 'follow-up', templateSlug: 'quick-follow-up', cardDesignSlug: 'classic-white' },
    { name: 'Happy Birthday!', purpose: 'birthday', templateSlug: 'birthday-greeting', cardDesignSlug: 'balloons' },
    { name: 'Happy Holidays!', purpose: 'holiday', templateSlug: 'holiday-greeting', cardDesignSlug: 'snowy-pine' },
    { name: 'Just Checking In', purpose: 'just-because', templateSlug: 'checking-in', cardDesignSlug: 'classic-white' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { industry, userId, orgId } = await req.json();

    if (!userId || !orgId) {
      return Response.json({ error: 'Missing userId or orgId' }, { status: 400 });
    }

    // Use asServiceRole to perform seeding operations
    const adminBase44 = base44.asServiceRole;

    // 1. Seed Template Categories (Idempotent)
    const existingCategories = await adminBase44.entities.TemplateCategory.filter({ orgId });
    if (existingCategories.length === 0) {
      await adminBase44.entities.TemplateCategory.bulkCreate(TEMPLATE_CATEGORIES.map(c => ({ ...c, orgId, type: 'platform' })));
    }

    // 2. Seed Note Style Profiles (Idempotent)
    const existingStyles = await adminBase44.entities.NoteStyleProfile.filter({ orgId });
    if (existingStyles.length === 0) {
      await adminBase44.entities.NoteStyleProfile.bulkCreate(NOTE_STYLE_PROFILES.map(s => ({ 
        ...s, 
        orgId, 
        userId,
        createdByUserId: userId,
        type: 'platform', 
        handwritingFont: 'Caveat' 
      })));
    }

    // 3. Seed Tags (Universal + Industry-Specific) - Idempotent check
    const existingTags = await adminBase44.entities.Tag.filter({ orgId, isSystemDefault: true });
    if (existingTags.length === 0) {
      const tagsToCreate = [...TAGS.universal, ...(TAGS[industry] || [])];
      await adminBase44.entities.Tag.bulkCreate(tagsToCreate.map(t => ({ ...t, orgId, isSystemDefault: true })));
    }

    // 4. Seed QuickSend Templates (Idempotent)
    const existingQuickSends = await adminBase44.entities.QuickSendTemplate.filter({ orgId, type: 'platform' });
    if (existingQuickSends.length === 0) {
      // For now, we will just create them with placeholder IDs
      // In production, you would query to get the actual template and card design IDs
      await adminBase44.entities.QuickSendTemplate.bulkCreate(QUICK_SEND_TEMPLATES.map(qs => ({
        ...qs,
        orgId,
        type: 'platform',
        isActive: true,
        createdByUserId: userId,
        templateId: 'placeholder-template-id',
        cardDesignId: 'placeholder-design-id',
      })));
    }

    return Response.json({ success: true, message: 'Initial data seeded successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Seeding error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});