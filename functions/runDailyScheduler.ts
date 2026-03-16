import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * runDailyScheduler.ts (Sprint 3 — Data-Driven)
 *
 * Runs daily to find clients with upcoming trigger dates and creates
 * ScheduledSend records for them.
 *
 * Key Sprint 3 change: Instead of a hardcoded getTriggerField() switch,
 * the scheduler reads the campaign's dateField (populated from TriggerType)
 * and uses a data-driven getNextOccurrence that checks defaultDaysBefore
 * vs defaultDaysAfter to determine if the date is recurring or one-time.
 */

// ============================================
// DATE CALCULATION HELPERS
// ============================================

function getNextOccurrence(dateStr: string, isOneTime: boolean): Date | null {
  if (!dateStr) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isOneTime) {
    // One-time trigger (e.g., welcome): use the actual date with a 14-day staleness guard
    const welcomeDate = new Date(dateStr);
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - 14);
    if (welcomeDate < cutoff) return null;
    return welcomeDate;
  }

  // Recurring (birthday, renewal, anniversary, etc.): find next annual occurrence
  const date = new Date(dateStr);
  const thisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate());
  const nextYear = new Date(today.getFullYear() + 1, date.getMonth(), date.getDate());
  return thisYear >= today ? thisYear : nextYear;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isWithinDays(date: Date, days: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureLimit = addDays(today, days);
  futureLimit.setHours(23, 59, 59, 999);
  return date >= today && date <= futureLimit;
}

// ============================================
// MAIN SCHEDULER
// ============================================

Deno.serve(async (req) => {
  // FIX #3: historyRecord and stats are declared INSIDE the handler, not at module
  // scope. Module-level variables in Deno persist between invocations if the process
  // stays alive, causing stats to accumulate across runs and history records to bleed.
  let historyRecord: any = null;
  const stats = {
    campaignsProcessed: 0,
    enrollmentsProcessed: 0,
    sendsCreated: 0,
    sendsSkippedDuplicate: 0,
    sendsSkippedMissingDate: 0,
    sendsInsufficientCredits: 0,
    errors: [] as any[]
  };

  try {
    const base44 = createClientFromRequest(req);

    // 1. Create AutomationHistory record
    historyRecord = await base44.asServiceRole.entities.AutomationHistory.create({
      type: 'daily_scheduler',
      status: 'running',
      startedAt: new Date().toISOString()
    });

    // 2. Get all ACTIVE campaigns
    const campaigns = await base44.asServiceRole.entities.Campaign.filter({ status: 'active' });
    console.log(`[runDailyScheduler] Found ${campaigns.length} active campaigns`);

    // Pre-load all TriggerType records into a lookup map (keyed by both id and key)
    const allTriggerTypes = await base44.asServiceRole.entities.TriggerType.filter({ isActive: true });
    const triggerTypeMap = new Map<string, any>();
    for (const tt of allTriggerTypes) {
      triggerTypeMap.set(tt.key, tt);
      triggerTypeMap.set(tt.id, tt);
    }

    // 3. Process each campaign
    for (const campaign of campaigns) {
      try {
        stats.campaignsProcessed++;

        // Resolve the trigger field from the campaign record or TriggerType entity
        let triggerField = campaign.dateField;
        let triggerType: any = null;

        if (campaign.triggerTypeId) {
          triggerType = triggerTypeMap.get(campaign.triggerTypeId);
        }
        if (!triggerType && campaign.type) {
          triggerType = triggerTypeMap.get(campaign.type);
        }
        if (!triggerField && triggerType) {
          triggerField = triggerType.dateField;
        }

        // Fallback for legacy campaigns created before Sprint 3
        if (!triggerField) {
          const legacyMap: Record<string, string> = {
            birthday: 'birthday',
            welcome: 'policy_start_date',
            renewal: 'renewal_date'
          };
          triggerField = legacyMap[campaign.type];
        }

        if (!triggerField) {
          console.log(`[runDailyScheduler] Campaign ${campaign.id} (${campaign.type}) has no dateField, skipping`);
          continue;
        }

        // Determine if this is a one-time trigger (like welcome) or recurring (like birthday)
        const isOneTime = triggerType
          ? ((triggerType.defaultDaysAfter || 0) > 0 && (triggerType.defaultDaysBefore || 0) === 0)
          : (campaign.type === 'welcome');

        // Get enrollments for this campaign
        const enrollments = await base44.asServiceRole.entities.CampaignEnrollment.filter({
          campaignId: campaign.id
        });
        console.log(`[runDailyScheduler] Found ${enrollments.length} enrollments for campaign ${campaign.name}`);

        // Get campaign steps
        const steps = await base44.asServiceRole.entities.CampaignStep.filter({
          campaignId: campaign.id,
          isEnabled: true
        });
        if (steps.length === 0) {
          console.log(`[runDailyScheduler] No enabled steps for campaign ${campaign.name}, skipping`);
          continue;
        }

        // Get existing ScheduledSends for duplicate checking
        const existingSends = await base44.asServiceRole.entities.ScheduledSend.filter({
          campaignId: campaign.id
        });
        const existingSendKeys = new Set<string>(
          existingSends.map((s: any) => `${s.enrollmentId}-${s.campaignStepId}-${s.scheduledDate}`)
        );

        // FIX #5: Load only the clients that are actually enrolled in this campaign,
        // not all clients in the org. The original code fetched all org clients (potentially
        // hundreds) when only a subset are enrolled, wasting API calls and memory.
        const clientIds = [...new Set(enrollments.map((e: any) => e.clientId))];
        const clientMap = new Map<string, any>();

        if (clientIds.length > 0) {
          // Load enrolled clients individually and build the map.
          // This avoids loading the entire org client list.
          const clientFetches = await Promise.all(
            clientIds.map((id: string) =>
              base44.asServiceRole.entities.Client.filter({ id })
                .then((results: any[]) => results[0] || null)
                .catch(() => null)
            )
          );
          for (const client of clientFetches) {
            if (client) clientMap.set(client.id, client);
          }
        }

        // Check credit availability once per campaign
        const creditCheck = await checkOrgCredits(base44, campaign.orgId);

        // Process each enrolled client
        for (const enrollment of enrollments) {
          try {
            stats.enrollmentsProcessed++;

            const client = clientMap.get(enrollment.clientId);
            if (!client) continue;

            if (campaign.ownerId && client.ownerId !== campaign.ownerId) continue;

            const triggerDateStr = client[triggerField];
            if (!triggerDateStr) {
              stats.sendsSkippedMissingDate++;
              continue;
            }

            const triggerDate = getNextOccurrence(triggerDateStr, isOneTime);
            if (!triggerDate) {
              stats.sendsSkippedMissingDate++;
              continue;
            }

            for (const step of steps) {
              const sendDate = addDays(triggerDate, step.timingDays);
              const sendDateStr = formatDate(sendDate);

              if (!isWithinDays(sendDate, 14)) continue;

              const sendKey = `${enrollment.id}-${step.id}-${sendDateStr}`;
              if (existingSendKeys.has(sendKey)) {
                stats.sendsSkippedDuplicate++;
                continue;
              }

              let status = 'pending';
              if (!creditCheck.hasCredits) {
                status = 'insufficient_credits';
                stats.sendsInsufficientCredits++;
              } else if (campaign.requiresApproval) {
                status = 'awaiting_approval';
              }

              const scheduledSend = await base44.asServiceRole.entities.ScheduledSend.create({
                campaignId: campaign.id,
                campaignStepId: step.id,
                enrollmentId: enrollment.id,
                clientId: client.id,
                orgId: campaign.orgId,
                scheduledDate: sendDateStr,
                status,
                cardDesignId: step.cardDesignId,
                messageTemplateId: step.templateId || null,
                customMessage: step.messageText || null,
                returnAddressMode: campaign.returnAddressMode || 'company'
              });

              stats.sendsCreated++;
              existingSendKeys.add(sendKey);
              console.log(`[runDailyScheduler] Created ScheduledSend ${scheduledSend.id} for client ${client.id}, date ${sendDateStr}, status ${status}`);
            }
          } catch (enrollmentError: any) {
            console.error(`[runDailyScheduler] Error processing enrollment ${enrollment.id}:`, enrollmentError);
            stats.errors.push({ type: 'enrollment', id: enrollment.id, error: enrollmentError.message });
          }
        }
      } catch (campaignError: any) {
        console.error(`[runDailyScheduler] Error processing campaign ${campaign.id}:`, campaignError);
        stats.errors.push({ type: 'campaign', id: campaign.id, error: campaignError.message });
      }
    }

    // 4. Update AutomationHistory
    const finalStatus = stats.errors.length > 0 ? 'partial' : 'success';
    const summary = `Processed ${stats.campaignsProcessed} campaigns, ${stats.enrollmentsProcessed} enrollments. Created ${stats.sendsCreated} sends. Skipped ${stats.sendsSkippedDuplicate} duplicates, ${stats.sendsSkippedMissingDate} missing dates. ${stats.sendsInsufficientCredits} insufficient credits.`;

    await base44.asServiceRole.entities.AutomationHistory.update(historyRecord.id, {
      status: finalStatus,
      completedAt: new Date().toISOString(),
      recordsProcessed: stats.sendsCreated,
      recordsFailed: stats.errors.length,
      summary,
      details: stats
    });

    console.log(`[runDailyScheduler] Completed: ${summary}`);

    return Response.json({
      success: true,
      status: finalStatus,
      historyId: historyRecord.id,
      summary,
      stats
    });

  } catch (error: any) {
    console.error('[runDailyScheduler] Fatal error:', error);
    if (historyRecord) {
      try {
        const base44 = createClientFromRequest(req);
        await base44.asServiceRole.entities.AutomationHistory.update(historyRecord.id, {
          status: 'failed',
          completedAt: new Date().toISOString(),
          errorDetails: error.message,
          details: stats
        });
      } catch (updateErr) {
        console.error('[runDailyScheduler] Failed to update history record after fatal error:', updateErr);
      }
    }
    return Response.json({ success: false, error: error.message, stats }, { status: 500 });
  }
});

/**
 * Check credit availability for an org.
 * Reads creditBalance from the Organization record and subtracts
 * already-reserved sends (pending / awaiting_approval / processing).
 */
async function checkOrgCredits(base44: any, orgId: string) {
  try {
    const orgs = await base44.asServiceRole.entities.Organization.filter({ id: orgId });
    if (!orgs || orgs.length === 0) return { hasCredits: false, availableCredits: 0 };

    const org = orgs[0];
    const poolBalance = org.creditBalance || 0;

    const pendingSends = await base44.asServiceRole.entities.ScheduledSend.filter({ orgId });
    const reservedStatuses = ['pending', 'awaiting_approval', 'processing'];
    const reservedCredits = pendingSends.filter((s: any) => reservedStatuses.includes(s.status)).length;
    const availableCredits = Math.max(0, poolBalance - reservedCredits);

    return { hasCredits: availableCredits >= 1, availableCredits, poolBalance, reservedCredits };
  } catch (error) {
    console.error('[checkOrgCredits] Error:', error);
    return { hasCredits: false, availableCredits: 0 };
  }
}
