import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  // Uses custom appRole field — built-in role field is never used in this codebase
  const user = await base44.auth.me();
  if (!user || user.appRole !== 'super_admin') {
    return new Response(
      JSON.stringify({ error: 'Unauthorized — super_admin only' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ── Constants ──────────────────────────────────────────────────────────────
  const FRIENDLY_PROFILE_ID = '69d2ee3d04105bd690347317'; // Friendly (default)

  // ── Preset definitions ─────────────────────────────────────────────────────
  // Card design IDs from live DB (all type: 'platform')
  // Thank You - Pen             69d2ecbed5fd3b449c313d84
  // Thank You - Plain White     69d2ecbed5fd3b449c313d8c
  // Thank You for Trusting Us   69d2ecbed5fd3b449c313d8b
  // Thank You - Green Classic   69d2ecbed5fd3b449c313d85
  // Happy Birthday Balloons     69d2ecbed5fd3b449c313d89
  // Welcome - Mod               69d2ecbed5fd3b449c313d7c
  // Welcome - Colorful          69d2ecbed5fd3b449c313d7d
  // Welcome - Papercut          69d2ecbed5fd3b449c313d7b
  // Anniversary Deco            69d2ecbed5fd3b449c313d87
  // Open Me - Bow               69d2ecbed5fd3b449c313d86
  // Open Me Flowers             69d2ecbed5fd3b449c313d8a
  // Thinking of You - Blue Classic  69d2ecbed5fd3b449c313d7e

  const PRESETS = [

    // ── GENERIC (vertical: 'generic') ────────────────────────────────────────
    {
      name: 'Referral Thank You',
      vertical: 'generic',
      purpose: 'thank_you',
      cardDesignId: '69d2ecbed5fd3b449c313d84',
      templateKey: 'qs_generic_referral_thank_you',
      content: "Just wanted to take a quick second to say thank you for thinking of me. Referrals mean the world and I don't take them for granted. I'll make sure to take great care of them. Really appreciate you.",
      sortOrder: 1,
    },
    {
      name: 'Birthday',
      vertical: 'generic',
      purpose: 'birthday',
      cardDesignId: '69d2ecbed5fd3b449c313d89',
      templateKey: 'qs_generic_birthday',
      content: "Hope your birthday is a great one. Wishing you a fantastic day and an even better year ahead. Cheers to you!",
      sortOrder: 2,
    },
    {
      name: 'New Client Welcome',
      vertical: 'generic',
      purpose: 'thank_you',
      cardDesignId: '69d2ecbed5fd3b449c313d7d',
      templateKey: 'qs_generic_new_client_welcome',
      content: "So glad to have you on board. I'm really looking forward to working together and I'm going to do everything I can to make this a great experience for you. Don't hesitate to reach out anytime.",
      sortOrder: 3,
    },
    {
      name: 'Thank You for the Meeting',
      vertical: 'generic',
      purpose: 'thank_you',
      cardDesignId: '69d2ecbed5fd3b449c313d8c',
      templateKey: 'qs_generic_thank_you_meeting',
      content: "Really enjoyed getting to connect today. I appreciated you taking the time and I feel like we covered a lot of good ground. Looking forward to what's ahead.",
      sortOrder: 4,
    },
    {
      name: 'Thank You for Your Business',
      vertical: 'generic',
      purpose: 'thank_you',
      cardDesignId: '69d2ecbed5fd3b449c313d8b',
      templateKey: 'qs_generic_thank_you_business',
      content: "Just wanted to say a genuine thank you for trusting me with your business. It means more than you know and I don't take it lightly. Looking forward to continuing to work together.",
      sortOrder: 5,
    },
    {
      name: 'Holiday Greetings',
      vertical: 'generic',
      purpose: 'holiday',
      cardDesignId: '69d2ecbed5fd3b449c313d8a',
      templateKey: 'qs_generic_holiday',
      content: "Wishing you and your family a wonderful holiday season. Hope you get some good rest and quality time with the people that matter most. Here's to a great new year ahead.",
      sortOrder: 6,
    },
    {
      name: 'Congratulations',
      vertical: 'generic',
      purpose: 'just_because',
      cardDesignId: '69d2ecbed5fd3b449c313d86',
      templateKey: 'qs_generic_congratulations',
      content: "Huge congratulations to you! This is such exciting news and you absolutely deserve it. Really happy for you and can't wait to see what comes next.",
      sortOrder: 7,
    },
    {
      name: 'Client Anniversary',
      vertical: 'generic',
      purpose: 'anniversary',
      cardDesignId: '69d2ecbed5fd3b449c313d87',
      templateKey: 'qs_generic_client_anniversary',
      content: "Can you believe it's already been another year? Time flies when you're working with great people. Just wanted to say thank you for sticking with me and for your continued trust. Here's to many more.",
      sortOrder: 8,
    },
    {
      name: 'Follow-Up After Event',
      vertical: 'generic',
      purpose: 'thank_you',
      cardDesignId: '69d2ecbed5fd3b449c313d85',
      templateKey: 'qs_generic_event_followup',
      content: "Really glad we had a chance to connect at the event. I enjoyed our conversation and I'm looking forward to staying in touch. Hope we get to cross paths again soon.",
      sortOrder: 9,
    },
    {
      name: 'Thinking of You',
      vertical: 'generic',
      purpose: 'just_because',
      cardDesignId: '69d2ecbed5fd3b449c313d7e',
      templateKey: 'qs_generic_thinking_of_you',
      content: "Just wanted to drop a quick note and let you know I was thinking about you. Hope things are going well and life is treating you good. Don't be a stranger!",
      sortOrder: 10,
    },

    // ── REAL ESTATE (vertical: 're') ─────────────────────────────────────────
    {
      name: 'Post-Closing Thank You',
      vertical: 're',
      purpose: 'thank_you',
      cardDesignId: '69d2ecbed5fd3b449c313d8c',
      templateKey: 'qs_re_post_closing_thank_you',
      content: "Congratulations again on closing day! It was truly a pleasure working with you through this whole process. You were a joy to work with and I hope you love every single day in your new home. Please don't hesitate to reach out for anything at all.",
      sortOrder: 1,
    },
    {
      name: 'Congratulations on Your New Home',
      vertical: 're',
      purpose: 'just_because',
      cardDesignId: '69d2ecbed5fd3b449c313d7c',
      templateKey: 'qs_re_new_home_congrats',
      content: "This is such an exciting milestone and I'm so happy for you! Owning your own home is something special and you worked hard to get here. Wishing you years of wonderful memories in your new place.",
      sortOrder: 2,
    },
    {
      name: 'Home Anniversary',
      vertical: 're',
      purpose: 'anniversary',
      cardDesignId: '69d2ecbed5fd3b449c313d87',
      templateKey: 'qs_re_home_anniversary',
      content: "Happy one year in your home! It's hard to believe it's already been a full year since closing day. I hope the house has been everything you hoped for and then some. Thinking of you and hope you're loving it.",
      sortOrder: 3,
    },
    {
      name: 'Offer Accepted',
      vertical: 're',
      purpose: 'just_because',
      cardDesignId: '69d2ecbed5fd3b449c313d86',
      templateKey: 'qs_re_offer_accepted',
      content: "Your offer got accepted and that is worth celebrating! This is a big deal and you should feel great right now. The hard work paid off and we're on our way. So excited for you!",
      sortOrder: 4,
    },
    {
      name: 'Welcome to the Market',
      vertical: 're',
      purpose: 'just_because',
      cardDesignId: '69d2ecbed5fd3b449c313d7b',
      templateKey: 'qs_re_welcome_to_market',
      content: "We're officially live and I couldn't be more excited to get this going for you. You've put in the work to get here and now it's time to let buyers fall in love with your home. Let's make it happen.",
      sortOrder: 5,
    },
    {
      name: 'Home Warranty Reminder',
      vertical: 're',
      purpose: 'just_because',
      cardDesignId: '69d2ecbed5fd3b449c313d7e',
      templateKey: 'qs_re_home_warranty_reminder',
      content: "Just a quick heads up that your home warranty is coming up on its one year mark soon. Wanted to make sure you knew before it slipped by. It's worth a quick look to see if renewal makes sense for you. I'm always happy to help point you in the right direction if you have questions.",
      sortOrder: 6,
    },
    {
      name: 'Open House Follow-Up',
      vertical: 're',
      purpose: 'thank_you',
      cardDesignId: '69d2ecbed5fd3b449c313d85',
      templateKey: 'qs_re_open_house_followup',
      content: "It was great seeing you at the open house. I hope you got a good feel for the place and I'm happy to answer any questions you might have. No pressure at all. Just wanted to say it was nice to meet you and I'm here whenever you're ready.",
      sortOrder: 7,
    },
    {
      name: 'Inspection Complete',
      vertical: 're',
      purpose: 'just_because',
      cardDesignId: '69d2ecbed5fd3b449c313d8a',
      templateKey: 'qs_re_inspection_complete',
      content: "Great news getting through the inspection! That's a big step in the right direction and you should feel good about where things stand. Getting closer every day and really excited to see this through with you.",
      sortOrder: 8,
    },
    {
      name: 'Just Listed Neighbor Outreach',
      vertical: 're',
      purpose: 'just_because',
      cardDesignId: '69d2ecbed5fd3b449c313d7d',
      templateKey: 'qs_re_just_listed_neighbor',
      content: "Wanted to let you know I just listed a home right in your neighborhood. If you know anyone who's been looking to get into the area, I'd love a chance to help them out. Always appreciate a good word from the neighbors!",
      sortOrder: 9,
    },
    {
      name: 'Moving Day / Welcome Home',
      vertical: 're',
      purpose: 'just_because',
      cardDesignId: '69d2ecbed5fd3b449c313d7c',
      templateKey: 'qs_re_moving_day',
      content: "Today's the day! Welcome home! I hope the move goes smoothly and that you're settled in and comfortable before you know it. This is such an exciting chapter and I'm so glad I got to be a part of it. Enjoy every second of it.",
      sortOrder: 10,
    },

    // ── MORTGAGE (vertical: 'mortgage') ──────────────────────────────────────
    {
      name: 'Loan Closed Thank You',
      vertical: 'mortgage',
      purpose: 'thank_you',
      cardDesignId: '69d2ecbed5fd3b449c313d8b',
      templateKey: 'qs_mort_loan_closed',
      content: "Congratulations on funding day! It was a genuine pleasure working with you through this process and I'm so glad we got to the finish line together. Enjoy your new home and please think of me if you ever need anything down the road.",
      sortOrder: 1,
    },
    {
      name: 'Loan Anniversary',
      vertical: 'mortgage',
      purpose: 'anniversary',
      cardDesignId: '69d2ecbed5fd3b449c313d87',
      templateKey: 'qs_mort_loan_anniversary',
      content: "Can't believe it's already been a year since we closed your loan! Just wanted to check in and say I hope things have been going great. If you ever have questions about your mortgage or want to talk through any options, I'm always happy to connect.",
      sortOrder: 2,
    },
    {
      name: "You're Clear to Close",
      vertical: 'mortgage',
      purpose: 'just_because',
      cardDesignId: '69d2ecbed5fd3b449c313d86',
      templateKey: 'qs_mort_clear_to_close',
      content: "You did it. Clear to close! This is the moment you've been working toward and it's well deserved. The finish line is right there and I'm so excited to get you across it. Really been a pleasure going through this journey with you.",
      sortOrder: 3,
    },
    {
      name: 'Pre-Approval Congratulations',
      vertical: 'mortgage',
      purpose: 'just_because',
      cardDesignId: '69d2ecbed5fd3b449c313d8a',
      templateKey: 'qs_mort_pre_approval',
      content: "Congratulations on your pre-approval! This is the first big step and it's an exciting one. You're officially in the game and ready to make offers. Looking forward to helping you find the right home and getting this done for you.",
      sortOrder: 4,
    },
    {
      name: 'Refi Closed Thank You',
      vertical: 'mortgage',
      purpose: 'thank_you',
      cardDesignId: '69d2ecbed5fd3b449c313d84',
      templateKey: 'qs_mort_refi_closed',
      content: "Just wanted to say a genuine thank you for trusting me with your refinance. I know the process takes some patience and I appreciate you sticking with it. Hope the new rate brings you some real relief and don't hesitate to reach out if there's ever anything I can do.",
      sortOrder: 5,
    },
    {
      name: 'Underwriting Approved',
      vertical: 'mortgage',
      purpose: 'just_because',
      cardDesignId: '69d2ecbed5fd3b449c313d8a',
      templateKey: 'qs_mort_underwriting_approved',
      content: "Great news on the underwriting approval! You're one step closer and things are really moving now. I know it can feel like a long road but you're almost there. Really glad to be working through this with you.",
      sortOrder: 6,
    },
    {
      name: 'Thinking of You Check-In',
      vertical: 'mortgage',
      purpose: 'just_because',
      cardDesignId: '69d2ecbed5fd3b449c313d7e',
      templateKey: 'qs_mort_thinking_of_you',
      content: "Just wanted to drop a quick note to say hi and let you know I'm thinking about you. Hope things are going well and that life in your home is everything you hoped for. If you ever want to catch up or have questions about anything, I'm always a call away.",
      sortOrder: 7,
    },
  ];

  // ── Load existing data to avoid duplicates ─────────────────────────────────
  const [existingQS, existingTemplates] = await Promise.all([
    base44.asServiceRole.entities.QuickSendTemplate.list({ limit: 500 }),
    base44.asServiceRole.entities.Template.filter({ type: 'platform' }, { limit: 500 }),
  ]);

  const existingQSNames = new Set(existingQS.map(t => t.name));
  const existingTemplatesByKey = {};
  existingTemplates.forEach(t => { if (t.key) existingTemplatesByKey[t.key] = t; });

  // ── Seed ───────────────────────────────────────────────────────────────────
  const results = { created: 0, skipped: 0, errors: [] };

  for (const preset of PRESETS) {
    if (existingQSNames.has(preset.name)) {
      results.skipped++;
      continue;
    }

    try {
      // Create the Template record if it doesn't exist yet
      let templateId = existingTemplatesByKey[preset.templateKey]?.id;
      if (!templateId) {
        const newTemplate = await base44.asServiceRole.entities.Template.create({
          name: preset.name,
          key: preset.templateKey,
          content: preset.content,
          purpose: preset.purpose,
          type: 'platform',
          status: 'approved',
          orgId: null,
          noteStyle: 'casual',
          tone: 'casual',
          isDefault: false,
          isActive: true,
          sortOrder: preset.sortOrder,
          createdByUserId: user.id, // required field — use seeding admin's ID
        });
        templateId = newTemplate.id;
      }

      // Create the QuickSendTemplate record with vertical field
      await base44.asServiceRole.entities.QuickSendTemplate.create({
        name: preset.name,
        purpose: preset.purpose,
        vertical: preset.vertical,
        templateId,
        noteStyleProfileId: FRIENDLY_PROFILE_ID,
        cardDesignId: preset.cardDesignId,
        returnAddressMode: 'company',
        includeGreeting: true,
        includeSignature: true,
        type: 'platform',
        isDefault: false,
        isActive: true,
        sortOrder: preset.sortOrder,
        previewSnippet: preset.content.substring(0, 100),
        createdByUserId: null,
        orgId: null,
      });

      results.created++;
    } catch (err) {
      results.errors.push({ name: preset.name, error: err.message });
    }
  }

  return new Response(
    JSON.stringify({ ...results, total: PRESETS.length }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});