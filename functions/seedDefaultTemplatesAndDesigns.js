/**
 * seedDefaultTemplatesAndDesigns.js
 * 
 * Seeds default templates, card designs, and note styles for automation.
 * This function is idempotent - it checks for existing defaults before creating.
 * 
 * Creates:
 * - 4 default templates (one for each trigger type) with casual tone
 * - References the "Thank you - Plain White" card design
 * - References an existing "casual" note style profile
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const DEFAULT_TEMPLATES = [
  {
    key: 'birthday_default',
    name: 'Birthday - Default',
    triggerKey: 'birthday',
    messageBody: `Hey! Just wanted to say happy birthday. Hope you have an amazing day!`,
    senderName: 'Your Name',
    senderTitle: 'Your Title',
    senderCompany: 'Your Company',
    senderPhone: 'Your Phone',
  },
  {
    key: 'new_client_welcome_default',
    name: 'New Client Welcome - Default',
    triggerKey: 'new_client_welcome',
    messageBody: `Thanks so much for becoming a client! Really looking forward to working with you.`,
    senderName: 'Your Name',
    senderTitle: 'Your Title',
    senderCompany: 'Your Company',
    senderPhone: 'Your Phone',
  },
  {
    key: 'renewal_reminder_default',
    name: 'Renewal Reminder - Default',
    triggerKey: 'renewal_reminder',
    messageBody: `Your renewal is coming up soon. Just wanted to reach out and see if you have any questions!`,
    senderName: 'Your Name',
    senderTitle: 'Your Title',
    senderCompany: 'Your Company',
    senderPhone: 'Your Phone',
  },
  {
    key: 'referral_request_default',
    name: 'Referral Request - Default',
    triggerKey: 'referral_request',
    messageBody: `We've loved working with you! If you know anyone who could use our services, we'd really appreciate the referral.`,
    senderName: 'Your Name',
    senderTitle: 'Your Title',
    senderCompany: 'Your Company',
    senderPhone: 'Your Phone',
  },
];

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();

    if (!currentUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: User not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[seedDefaultTemplatesAndDesigns] Starting seed process for user: ${currentUser.id}`);

    const cardDesigns = await base44.entities.CardDesign.filter({
      name: 'Thank you - Plain White',
    });

    if (!cardDesigns || cardDesigns.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Card design "Thank you - Plain White" not found. Please create it first.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const defaultCardDesignId = cardDesigns[0].id;
    console.log(`[seedDefaultTemplatesAndDesigns] Found card design: ${defaultCardDesignId}`);

    const noteStyles = await base44.entities.NoteStyleProfile.filter({
      name: 'casual',
    });

    if (!noteStyles || noteStyles.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Note style profile "casual" not found. Please create it first.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const defaultNoteStyleProfileId = noteStyles[0].id;
    console.log(`[seedDefaultTemplatesAndDesigns] Found note style profile: ${defaultNoteStyleProfileId}`);

    const createdTemplates = [];
    const skippedTemplates = [];
    const templateErrors = [];

    for (const templateData of DEFAULT_TEMPLATES) {
      try {
        console.log(`[seedDefaultTemplatesAndDesigns] Processing template: ${templateData.key}`);

        const existing = await base44.entities.Template.filter({
          key: templateData.key,
          created_by: currentUser.id,
        });

        if (existing && existing.length > 0) {
          console.log(`[seedDefaultTemplatesAndDesigns] Template "${templateData.key}" already exists, skipping`);
          skippedTemplates.push(templateData.key);
          continue;
        }

        const newTemplate = await base44.entities.Template.create({
          key: templateData.key,
          name: templateData.name,
          messageBody: templateData.messageBody,
          senderName: templateData.senderName,
          senderTitle: templateData.senderTitle,
          senderCompany: templateData.senderCompany,
          senderPhone: templateData.senderPhone,
          cardDesignId: defaultCardDesignId,
          noteStyleProfileId: defaultNoteStyleProfileId,
        });

        console.log(`[seedDefaultTemplatesAndDesigns] Created template: ${templateData.key} (ID: ${newTemplate.id})`);
        createdTemplates.push({
          key: templateData.key,
          id: newTemplate.id,
        });

      } catch (error) {
        console.error(`[seedDefaultTemplatesAndDesigns] Error creating template "${templateData.key}":`, error);
        templateErrors.push({
          key: templateData.key,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    console.log('[seedDefaultTemplatesAndDesigns] Seed process complete');
    console.log(`  - Created: ${createdTemplates.length} templates`);
    console.log(`  - Skipped: ${skippedTemplates.length} templates (already exist)`);
    console.log(`  - Errors: ${templateErrors.length} templates`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Default templates and designs seeded successfully',
        summary: {
          created: createdTemplates.length,
          skipped: skippedTemplates.length,
          errors: templateErrors.length,
        },
        details: {
          created: createdTemplates,
          skipped: skippedTemplates,
          errors: templateErrors,
          cardDesignId: defaultCardDesignId,
          noteStyleProfileId: defaultNoteStyleProfileId,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[seedDefaultTemplatesAndDesigns] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to seed templates and designs',
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
