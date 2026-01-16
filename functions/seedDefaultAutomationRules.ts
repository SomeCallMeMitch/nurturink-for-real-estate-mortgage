/**
 * seedDefaultAutomationRules.ts
 * 
 * Seeds default automation rules for each user based on their trigger types.
 * This function is idempotent - it checks for existing rules before creating.
 * 
 * Creates one automation rule per trigger type for the authenticated user.
 * Uses the first available template, card design, and note style profile.
 */

import { base44 } from '@/api/base44Client';

interface AutomationRuleData {
  triggerTypeId: string;
  templateId: string | null;
  cardDesignId: string | null;
  noteStyleProfileId: string | null;
  daysBefore: number;
  daysAfter: number;
  frequencyCap: 'once' | 'annually' | 'unlimited';
  isActive: boolean;
}

Deno.serve(async (req: Request) => {
  try {
    // Verify this is a POST request
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Authenticate the request and get current user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const currentUser = await base44.auth.me();
    if (!currentUser) {
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[seedDefaultAutomationRules] Starting seed process for user: ${currentUser.id}`);

    // Fetch all trigger types
    const triggerTypes = await base44.entities.TriggerType.filter({
      isActive: true,
    });

    if (!triggerTypes || triggerTypes.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No active trigger types found. Please run seedDefaultTriggerTypes first.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[seedDefaultAutomationRules] Found ${triggerTypes.length} active trigger types`);

    // Fetch user's templates, card designs, and note style profiles
    const templates = await base44.entities.Template.filter({
      created_by: currentUser.id,
    });

    const cardDesigns = await base44.entities.CardDesign.filter({
      created_by: currentUser.id,
    });

    const noteStyleProfiles = await base44.entities.NoteStyleProfile.filter({
      created_by: currentUser.id,
    });

    console.log(`[seedDefaultAutomationRules] User has ${templates?.length || 0} templates, ${cardDesigns?.length || 0} card designs, ${noteStyleProfiles?.length || 0} note styles`);

    // Select defaults (first available of each type)
    const defaultTemplateId = templates && templates.length > 0 ? templates[0].id : null;
    const defaultCardDesignId = cardDesigns && cardDesigns.length > 0 ? cardDesigns[0].id : null;
    const defaultNoteStyleProfileId = noteStyleProfiles && noteStyleProfiles.length > 0 ? noteStyleProfiles[0].id : null;

    if (!defaultTemplateId || !defaultCardDesignId || !defaultNoteStyleProfileId) {
      console.warn('[seedDefaultAutomationRules] User is missing templates, card designs, or note styles. Rules will be created with null values.');
    }

    const created: string[] = [];
    const skipped: string[] = [];
    const errors: Array<{ triggerType: string; error: string }> = [];

    // Create automation rule for each trigger type
    for (const triggerType of triggerTypes) {
      try {
        console.log(`[seedDefaultAutomationRules] Processing trigger type: ${triggerType.name} (${triggerType.key})`);

        // Check if rule already exists for this user + trigger type (idempotency)
        const existing = await base44.entities.AutomationRule.filter({
          triggerTypeId: triggerType.id,
          created_by: currentUser.id,
        });

        if (existing && existing.length > 0) {
          console.log(`[seedDefaultAutomationRules] Rule for "${triggerType.name}" already exists, skipping`);
          skipped.push(triggerType.name);
          continue;
        }

        // Determine frequency cap based on trigger type
        let frequencyCap: 'once' | 'annually' | 'unlimited' = 'annually';
        if (triggerType.key === 'new_client_welcome') {
          frequencyCap = 'once'; // Only send once per client
        } else if (triggerType.key === 'birthday' || triggerType.key === 'renewal_reminder') {
          frequencyCap = 'annually'; // Send once per year
        }

        // Create the automation rule
        const ruleData: AutomationRuleData = {
          triggerTypeId: triggerType.id,
          templateId: defaultTemplateId,
          cardDesignId: defaultCardDesignId,
          noteStyleProfileId: defaultNoteStyleProfileId,
          daysBefore: triggerType.defaultDaysBefore,
          daysAfter: triggerType.defaultDaysAfter,
          frequencyCap,
          isActive: true,
        };

        const newRule = await base44.entities.AutomationRule.create(ruleData);
        console.log(`[seedDefaultAutomationRules] Created rule for "${triggerType.name}" (ID: ${newRule.id})`);
        created.push(triggerType.name);

      } catch (error) {
        console.error(`[seedDefaultAutomationRules] Error creating rule for "${triggerType.name}":`, error);
        errors.push({
          triggerType: triggerType.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Log summary
    console.log('[seedDefaultAutomationRules] Seed process complete');
    console.log(`  - Created: ${created.length} automation rules`);
    console.log(`  - Skipped: ${skipped.length} automation rules (already exist)`);
    console.log(`  - Errors: ${errors.length} automation rules`);

    // Return summary
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Default automation rules seeded successfully',
        summary: {
          created: created.length,
          skipped: skipped.length,
          errors: errors.length,
        },
        details: {
          created,
          skipped,
          errors,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[seedDefaultAutomationRules] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to seed automation rules',
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
