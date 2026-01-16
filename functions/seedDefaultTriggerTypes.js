/**
 * seedDefaultTriggerTypes.js
 * 
 * Seeds default automation trigger types for the insurance industry.
 * This function is idempotent - it checks for existing trigger types before creating.
 * 
 * Trigger types define the automation events that can be configured:
 * - Birthday: Send card on client's birthday
 * - New Client Welcome: Send card after new client signs
 * - Renewal Reminder: Send card before policy renewal
 * - Referral Request: Send card to request referrals
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const DEFAULT_TRIGGER_TYPES = [
  {
    key: 'birthday',
    name: 'Birthday',
    description: 'Send a card on the client\'s birthday to show you care and stay top of mind.',
    dateField: 'birthday',
    defaultDaysBefore: 0,
    defaultDaysAfter: 0,
    icon: 'cake',
    isActive: true,
  },
  {
    key: 'new_client_welcome',
    name: 'New Client Welcome',
    description: 'Send a thank you card shortly after a new client signs to build rapport.',
    dateField: 'sign_date',
    defaultDaysBefore: 0,
    defaultDaysAfter: 1,
    icon: 'user-plus',
    isActive: true,
  },
  {
    key: 'renewal_reminder',
    name: 'Renewal Reminder',
    description: 'Send a reminder card 90 days before policy renewal to encourage retention.',
    dateField: 'renewal_date',
    defaultDaysBefore: 90,
    defaultDaysAfter: 0,
    icon: 'refresh-cw',
    isActive: true,
  },
  {
    key: 'referral_request',
    name: 'Referral Request',
    description: 'Send a card 90 days after signing to request referrals when relationship is established.',
    dateField: 'sign_date',
    defaultDaysBefore: 0,
    defaultDaysAfter: 90,
    icon: 'users',
    isActive: true,
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
    const user = await base44.auth.me();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: User not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[seedDefaultTriggerTypes] Starting seed process...');

    const created = [];
    const skipped = [];
    const errors = [];

    for (const triggerTypeData of DEFAULT_TRIGGER_TYPES) {
      try {
        console.log(`[seedDefaultTriggerTypes] Processing trigger type: ${triggerTypeData.key}`);

        const existing = await base44.entities.TriggerType.filter({
          key: triggerTypeData.key,
        });

        if (existing && existing.length > 0) {
          console.log(`[seedDefaultTriggerTypes] Trigger type "${triggerTypeData.key}" already exists, skipping`);
          skipped.push(triggerTypeData.key);
          continue;
        }

        const newTriggerType = await base44.entities.TriggerType.create(triggerTypeData);
        console.log(`[seedDefaultTriggerTypes] Created trigger type: ${triggerTypeData.key} (ID: ${newTriggerType.id})`);
        created.push(triggerTypeData.key);

      } catch (error) {
        console.error(`[seedDefaultTriggerTypes] Error creating trigger type "${triggerTypeData.key}":`, error);
        errors.push({
          key: triggerTypeData.key,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    console.log('[seedDefaultTriggerTypes] Seed process complete');
    console.log(`  - Created: ${created.length} trigger types`);
    console.log(`  - Skipped: ${skipped.length} trigger types (already exist)`);
    console.log(`  - Errors: ${errors.length} trigger types`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Default trigger types seeded successfully',
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
    console.error('[seedDefaultTriggerTypes] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to seed trigger types',
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
