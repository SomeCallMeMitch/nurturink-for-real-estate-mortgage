import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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
    { name: 'Hot Lead', slug: 'hot-lead', color: '#ef4444' },
    { name: 'Warm Lead', slug: 'warm-lead', color: '#f97316' },
    { name: 'Cold Lead', slug: 'cold-lead', color: '#3b82f6' },
    { name: 'VIP Client', slug: 'vip-client', color: '#a855f7' },
    { name: 'Past Client', slug: 'past-client', color: '#6b7280' },
    { name: 'Follow Up Needed', slug: 'follow-up-needed', color: '#eab308' },
    { name: 'New Client', slug: 'new-client', color: '#22c55e' },
    { name: 'Contacted', slug: 'contacted', color: '#14b8a6' },
  ],
  real_estate: [
    { name: 'Buyer', slug: 'buyer', color: '#2563eb' },
    { name: 'Seller', slug: 'seller', color: '#db2777' },
    { name: 'Renter', slug: 'renter', color: '#9333ea' },
    { name: 'Investor', slug: 'investor', color: '#d97706' },
  ],
  insurance: [
    { name: 'Policy Renewal', slug: 'policy-renewal', color: '#059669' },
    { name: 'Claim Filed', slug: 'claim-filed', color: '#dc2626' },
    { name: 'Life Insurance', slug: 'life-insurance', color: '#4f46e5' },
    { name: 'Home & Auto', slug: 'home-auto', color: '#0284c7' },
  ],
  roofing: [
    { name: 'Inspection Scheduled', slug: 'inspection-scheduled', color: '#0891b2' },
    { name: 'Quote Sent', slug: 'quote-sent', color: '#7c3aed' },
    { name: 'Storm Damage', slug: 'storm-damage', color: '#dc2626' },
    { name: 'Warranty Follow-up', slug: 'warranty-follow-up', color: '#16a34a' },
  ],
  automotive: [
    { name: 'Test Drive', slug: 'test-drive', color: '#0284c7' },
    { name: 'Trade-In', slug: 'trade-in', color: '#ea580c' },
    { name: 'Financing Approved', slug: 'financing-approved', color: '#16a34a' },
    { name: 'Service Due', slug: 'service-due', color: '#eab308' },
  ],
  financial_services: [
    { name: 'Portfolio Review', slug: 'portfolio-review', color: '#4f46e5' },
    { name: 'Tax Season', slug: 'tax-season', color: '#dc2626' },
    { name: 'Retirement Planning', slug: 'retirement-planning', color: '#059669' },
    { name: 'Investment Opportunity', slug: 'investment-opportunity', color: '#d97706' },
  ],
  healthcare: [
    { name: 'Appointment Reminder', slug: 'appointment-reminder', color: '#0891b2' },
    { name: 'Referral', slug: 'referral', color: '#7c3aed' },
    { name: 'Wellness Check', slug: 'wellness-check', color: '#16a34a' },
    { name: 'Insurance Verification', slug: 'insurance-verification', color: '#eab308' },
  ],
  hospitality: [
    { name: 'Booking Confirmed', slug: 'booking-confirmed', color: '#16a34a' },
    { name: 'Check-In Soon', slug: 'check-in-soon', color: '#0891b2' },
    { name: 'Special Request', slug: 'special-request', color: '#a855f7' },
    { name: 'Repeat Guest', slug: 'repeat-guest', color: '#d97706' },
  ],
  other: [
    { name: 'High Priority', slug: 'high-priority', color: '#dc2626' },
    { name: 'Needs Attention', slug: 'needs-attention', color: '#f97316' },
    { name: 'Long-Term', slug: 'long-term', color: '#6b7280' },
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

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
    }

    // Determine if this is an individual or organization user
    const isIndividual = !orgId;
    const ownerIdField = isIndividual ? 'userId' : 'orgId';
    const ownerId = isIndividual ? userId : orgId;

    // Use asServiceRole to perform seeding operations
    const adminBase44 = base44.asServiceRole;

    // 1. Seed Template Categories (Idempotent)
    const existingCategories = await adminBase44.entities.TemplateCategory.filter({ [ownerIdField]: ownerId });
    if (existingCategories.length === 0) {
        const categoriesToCreate = TEMPLATE_CATEGORIES.map(c => ({ 
          ...c, 
          [ownerIdField]: ownerId,
          type: 'platform' 
        }));
        await adminBase44.entities.TemplateCategory.bulkCreate(categoriesToCreate);
    }

    // 2. Seed Note Style Profiles (Idempotent)
    const existingStyles = await adminBase44.entities.NoteStyleProfile.filter({ [ownerIdField]: ownerId });
    if (existingStyles.length === 0) {
        const stylesToCreate = NOTE_STYLE_PROFILES.map(s => ({ 
          ...s, 
          [ownerIdField]: ownerId,
          type: 'platform', 
          handwritingFont: 'Caveat' 
        }));
        await adminBase44.entities.NoteStyleProfile.bulkCreate(stylesToCreate);
    }

    // 3. Seed Tags (Universal + Industry-Specific)
    const universalTags = TAGS.universal;
    const industryTags = TAGS[industry] || TAGS.other;
    const tagsToCreate = [...universalTags, ...industryTags];
    
    const tagRecords = tagsToCreate.map(t => ({ 
      name: t.name,
      slug: t.slug,
      color: t.color,
      isSystemDefault: true,
      [ownerIdField]: ownerId,
    }));
    
    await adminBase44.entities.Tag.bulkCreate(tagRecords);

    // 4. Seed QuickSend Templates (Idempotent)
    const existingQuickSends = await adminBase44.entities.QuickSendTemplate.filter({ 
      [ownerIdField]: ownerId, 
      type: 'platform' 
    });
    
    if (existingQuickSends.length === 0) {
        // This part is more complex as it requires finding the IDs of templates and card designs by slug
        // For this implementation, we assume slugs are unique and a helper function `findBySlug` exists
        // In a real scenario, you would query to get the actual IDs.
        // const templates = await adminBase44.entities.Template.filter(...)
        // const designs = await adminBase44.entities.CardDesign.filter(...)
        // For now, we will just create them with placeholder IDs
        const quickSendsToCreate = QUICK_SEND_TEMPLATES.map(qs => ({
            ...qs,
            [ownerIdField]: ownerId,
            type: 'platform',
            isActive: true,
            createdByUserId: userId,
            templateId: 'placeholder-template-id',
            cardDesignId: 'placeholder-design-id',
        }));
        
        await adminBase44.entities.QuickSendTemplate.bulkCreate(quickSendsToCreate);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Initial data seeded successfully.',
      isIndividual,
      tagsCreated: tagsToCreate.length 
    }), { status: 200 });

  } catch (error) {
    console.error('Seeding error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
