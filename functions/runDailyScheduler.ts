import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * runDailyScheduler.ts (Sprint 3 — Data-Driven)
 *
 * Runs daily to find clients with upcoming trigger dates and creates
 * ScheduledSend records for them.
 */

// ============================================
// DATE CALCULATION HELPERS
// ============================================

/**
 * Fix 04 — Removed 14-day staleness guard for one-time triggers (welcome).
 * Past-date welcome clients are now handled via the processedWelcome flag
 * on CampaignEnrollment, allowing welcome cards for clients with any
 * policy_start_date (even months in the past).
 */
function getNextOccurrence(dateStr, isOneTime) {
  if (!dateStr) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isOneTime) {
    // One-time trigger (e.g., welcome): always return the actual date.
    // Idempotency is handled by processedWelcome flag, not a date cutoff.
    return new Date(dateStr);
  }

  // Recurring (birthday, renewal, etc.): find next annual occurrence
  const date = new Date(dateStr);
  const thisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate());
  const nextYear = new Date(today.getFullYear() + 1, date.getMonth(), date.getDate());
  return thisYear >= today ? thisYear : nextYear;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isWithinDays(date, days) {
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
  // FIX #3: historyRecord and stats declared INSIDE the handler.
  // Module-level variables persist between Deno invocations, causing
  // stats to accumulate across runs.
  let historyRecord = null;
  const stats = {
    campaignsProcessed: 0,
    enrollmentsProcessed: 0,
    sendsCreated: 0,
    sendsSkippedDuplicate: 0,
    sendsSkippedMissingDate: 0,
    sendsInsufficientCredits: 0,
    errors: []
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

    // Sprint 3: Pre-load all CampaignType records into a lookup map (keyed by both id and slug)
    const allCampaignTypes = await base44.asServiceRole.entities.CampaignType.filter({ isActive: true });
    const campaignTypeMap = new Map();
    for (const ct of allCampaignTypes) {
      campaignTypeMap.set(ct.slug, ct);
      campaignTypeMap.set(ct.id, ct);
    }

    // 3. Process each campaign
    for (const campaign of campaigns) {
      try {
        stats.campaignsProcessed++;

        // Sprint 3: Resolve CampaignType from the new entity
        let triggerField = campaign.dateField;
        let campaignType = null;

        if (campaign.triggerTypeId) {
          campaignType = campaignTypeMap.get(campaign.triggerTypeId);
        }
        if (!campaignType && campaign.type) {
          campaignType = campaignTypeMap.get(campaign.type);
        }
        if (!triggerField && campaignType) {
          triggerField = campaignType.triggerField;
        }

        // Fallback for legacy campaigns created before Sprint 3
        if (!triggerField) {
          const legacyMap = {
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

        // Sprint 3: Determine one-time vs recurring from CampaignType record
        const isOneTime = campaignType
          ? (campaignType.triggerMode === 'one_time')
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

        // Fix 03B — Date-filtered existingSends to avoid loading historical records
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const windowStart = formatDate(addDays(today, -7));
        const windowEnd = formatDate(addDays(today, 30));
        const existingSends = await base44.asServiceRole.entities.ScheduledSend.filter({
          campaignId: campaign.id,
          scheduledDate: { $gte: windowStart, $lte: windowEnd }
        });
        const existingSendKeys = new Set(
          existingSends.map((s) => `${s.enrollmentId}-${s.campaignStepId}-${s.scheduledDate}`)
        );

        // Fix 03A — Batch-load all enrolled clients in a single query
        const clientIds = [...new Set(enrollments.map((e) => e.clientId))];
        const clientMap = new Map();

        if (clientIds.length > 0) {
          const clientList = await base44.asServiceRole.entities.Client.filter({
            id: { $in: clientIds }
          });
          for (const client of clientList) {
            clientMap.set(client.id, client);
          }
        }

        // Check credit availability once per campaign
        const creditCheck = await checkOrgCredits(base44, campaign.orgId);

        // Process each enrolled client
        for (const enrollment of enrollments) {
          try {
            stats.enrollmentsProcessed++;

            // Fix 04 — Skip one-time enrollments already processed (idempotency guard)
            if (isOneTime && enrollment.processedWelcome) {
              stats.sendsSkippedDuplicate++;
              continue;
            }

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
              let sendDateStr = formatDate(sendDate);

              if (!isWithinDays(sendDate, 14)) {
                // Fix 04 (cont.) — Special case for one-time (welcome) campaigns:
                // If the trigger date is in the past but this enrollment was created
                // recently (within 7 days), schedule the send for today instead.
                if (isOneTime && !enrollment.processedWelcome) {
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                  sevenDaysAgo.setHours(0, 0, 0, 0);
                  const enrolledAt = enrollment.enrolledAt ? new Date(enrollment.enrolledAt) : null;
                  const isRecentEnrollment = enrolledAt && enrolledAt >= sevenDaysAgo;

                  if (!isRecentEnrollment) {
                    continue; // Old enrollment with past trigger date — skip
                  }

                  // Recent enrollment with past trigger date — schedule for today
                  const todayStr = formatDate(new Date());
                  const sendKey = `${enrollment.id}-${step.id}-${todayStr}`;
                  if (existingSendKeys.has(sendKey)) {
                    stats.sendsSkippedDuplicate++;
                    continue;
                  }

                  // Override sendDateStr to today for the ScheduledSend creation below
                  sendDateStr = todayStr;
                } else {
                  continue; // Not within window and not a recent one-time enrollment
                }
              }

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

            // Fix 04 — Mark one-time enrollment as processed to prevent duplicate sends
            if (isOneTime && stats.sendsCreated > 0) {
              await base44.asServiceRole.entities.CampaignEnrollment.update(enrollment.id, {
                processedWelcome: true
              });
            }
          } catch (enrollmentError) {
            console.error(`[runDailyScheduler] Error processing enrollment ${enrollment.id}:`, enrollmentError);
            stats.errors.push({ type: 'enrollment', id: enrollment.id, error: enrollmentError.message });
          }
        }
      } catch (campaignError) {
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

  } catch (error) {
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
 */
async function checkOrgCredits(base44, orgId) {
  try {
    const orgs = await base44.asServiceRole.entities.Organization.filter({ id: orgId });
    if (!orgs || orgs.length === 0) return { hasCredits: false, availableCredits: 0 };

    const org = orgs[0];
    const poolBalance = org.creditBalance || 0;

    const pendingSends = await base44.asServiceRole.entities.ScheduledSend.filter({ orgId });
    const reservedStatuses = ['pending', 'awaiting_approval', 'processing'];
    const reservedCredits = pendingSends.filter((s) => reservedStatuses.includes(s.status)).length;
    const availableCredits = Math.max(0, poolBalance - reservedCredits);

    return { hasCredits: availableCredits >= 1, availableCredits, poolBalance, reservedCredits };
  } catch (error) {
    console.error('[checkOrgCredits] Error:', error);
    return { hasCredits: false, availableCredits: 0 };
  }
}