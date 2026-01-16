/**
 * seedDefaultTriggerTypes.ts
 * 
 * Seeds the default trigger types for the insurance industry.
 * This function is idempotent - it checks for existing records before creating.
 * 
 * Trigger Types:
 * 1. Birthday - Sends card on client's birthday
 * 2. New Client Welcome - Sends card 1 day after client signs
 * 3. Renewal Reminder - Sends card 90 days before renewal date
 * 4. Referral Request - Sends card 90 days after client signs
 */

import { base44 } from '@/api/base44Client';

interface TriggerTypeData {
  key: string;
  name: string;
  description: string;
  dateField: string;
  defaultDaysBefore: number;
  defaultDaysAfter: number;
  icon: string;
  isActive: boolean;
}

const DEFAULT_TRIGGER_TYPES: TriggerTypeData[] = [
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

Deno.serve(async (req: Request) => {
  try {
    // Verify this is a POST request
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Authenticate the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[seedDefaultTriggerTypes] Starting seed process...');

    const created: string[] = [];
    const skipped: string[] = [];
    const errors: Array<{ key: string; error: string }> = [];

    // Process each trigger type
    for (const triggerType of DEFAULT_TRIGGER_TYPES) {
      try {
        console.log(`[seedDefaultTriggerTypes] Processing trigger type: ${triggerType.key}`);

        // Check if trigger type already exists (idempotency)
        const existing = await base44.entities.TriggerType.filter({
          key: triggerType.key,
        });

        if (existing && existing.length > 0) {
          console.log(`[seedDefaultTriggerTypes] Trigger type "${triggerType.key}" already exists, skipping`);
          skipped.push(triggerType.key);
          continue;
        }

        // Create the trigger type
        const newTriggerType = await base44.entities.TriggerType.create(triggerType);
        console.log(`[seedDefaultTriggerTypes] Created trigger type: ${triggerType.key} (ID: ${newTriggerType.id})`);
        created.push(triggerType.key);

      } catch (error) {
        console.error(`[seedDefaultTriggerTypes] Error creating trigger type "${triggerType.key}":`, error);
        errors.push({
          key: triggerType.key,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Log summary
    console.log('[seedDefaultTriggerTypes] Seed process complete');
    console.log(`  - Created: ${created.length} trigger types`);
    console.log(`  - Skipped: ${skipped.length} trigger types (already exist)`);
    console.log(`  - Errors: ${errors.length} trigger types`);

    // Return summary
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
