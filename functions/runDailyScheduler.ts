import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * runDailyScheduler.js
 * 
 * Purpose: Runs daily to find clients with upcoming trigger dates and creates
 * ScheduledSend records for them.
 * 
 * Logic Flow:
 * 1. Create AutomationHistory record with status 'running'
 * 2. Get all ACTIVE campaigns
 * 3. For each campaign:
 *    a. Get all ENROLLED enrollments for that campaign
 *    b. For each enrolled client:
 *       - Calculate their trigger date based on campaign type
 *       - For each campaign step:
 *         * Calculate send date = trigger_date + step.timingDays
 *         * If send date is within next 14 days AND no ScheduledSend exists:
 *           - Check credit availability for the org
 *           - Create ScheduledSend record with appropriate status
 * 4. Update AutomationHistory with results
 * 5. Return summary of scheduled sends created
 */

// ============================================
// DATE CALCULATION HELPERS
// ============================================

/**
 * Get the next occurrence of a date based on campaign type
 * - Birthday/Renewal: Find next occurrence (this year or next)
 * - Welcome: Use the actual date (one-time)
 */
function getNextOccurrence(dateStr, campaignType) {
  if (!dateStr) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (campaignType === 'welcome') {
    // Welcome is one-time, use the actual date
    return new Date(dateStr);
  }
  
  // For birthday and renewal, find next occurrence
  const date = new Date(dateStr);
  const thisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate());
  const nextYear = new Date(today.getFullYear() + 1, date.getMonth(), date.getDate());
  
  // If this year's date hasn't passed, use it; otherwise use next year
  return thisYear >= today ? thisYear : nextYear;
}

/**
 * Format a date to YYYY-MM-DD string
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Add days to a date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if a date is within the next N days from today
 */
function isWithinDays(date, days) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const futureLimit = addDays(today, days);
  futureLimit.setHours(23, 59, 59, 999);
  
  return date >= today && date <= futureLimit;
}

/**
 * Get the trigger field name based on campaign type
 */
function getTriggerField(campaignType) {
  switch (campaignType) {
    case 'birthday':
      return 'birthday';
    case 'renewal':
      return 'renewal_date';
    case 'welcome':
      return 'policy_start_date';
    default:
      return null;
  }
}

// ============================================
// MAIN HANDLER
// ============================================

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
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
    // 1. Create AutomationHistory record with status 'running'
    historyRecord = await base44.asServiceRole.entities.AutomationHistory.create({
      jobName: 'runDailyScheduler',
      status: 'running',
      startedAt: new Date().toISOString(),
      details: { startedBy: 'system' }
    });

    console.log(`[runDailyScheduler] Started job, history ID: ${historyRecord.id}`);

    // 2. Get all ACTIVE campaigns
    const campaigns = await base44.asServiceRole.entities.Campaign.filter({ status: 'active' });
    console.log(`[runDailyScheduler] Found ${campaigns.length} active campaigns`);

    // 3. Process each campaign
    for (const campaign of campaigns) {
      try {
        stats.campaignsProcessed++;
        console.log(`[runDailyScheduler] Processing campaign: ${campaign.name} (${campaign.id})`);

        // 3a. Get all ENROLLED enrollments for this campaign
        const enrollments = await base44.asServiceRole.entities.CampaignEnrollment.filter({
          campaignId: campaign.id,
          status: 'enrolled'
        });
        console.log(`[runDailyScheduler] Found ${enrollments.length} enrollments for campaign ${campaign.name}`);

        // Get all campaign steps for this campaign
        const steps = await base44.asServiceRole.entities.CampaignStep.filter({
          campaignId: campaign.id,
          isEnabled: true
        });
        console.log(`[runDailyScheduler] Found ${steps.length} steps for campaign ${campaign.name}`);

        if (steps.length === 0) {
          console.log(`[runDailyScheduler] No enabled steps for campaign ${campaign.name}, skipping`);
          continue;
        }

        // Get existing ScheduledSends for this campaign to check for duplicates
        const existingSends = await base44.asServiceRole.entities.ScheduledSend.filter({
          campaignId: campaign.id
        });
        
        // Create a Set of existing send keys for quick duplicate checking
        const existingSendKeys = new Set(
          existingSends.map(s => `${s.enrollmentId}-${s.campaignStepId}-${s.scheduledDate}`)
        );

        // 3b. Process each enrolled client
        for (const enrollment of enrollments) {
          try {
            stats.enrollmentsProcessed++;

            // Get client details
            const clients = await base44.asServiceRole.entities.Client.filter({ id: enrollment.clientId });
            if (!clients || clients.length === 0) {
              console.log(`[runDailyScheduler] Client ${enrollment.clientId} not found, skipping`);
              continue;
            }
            const client = clients[0];

            // PHASE 2: Verify client belongs to the campaign owner
            // This prevents duplicate sends if a client was somehow enrolled in wrong campaign
            if (campaign.ownerId && client.ownerId !== campaign.ownerId) {
              console.log(`[runDailyScheduler] Client ${client.id} ownerId (${client.ownerId}) doesn't match campaign ownerId (${campaign.ownerId}), skipping`);
              continue;
            }

            // Get trigger date field based on campaign type
            const triggerField = getTriggerField(campaign.type);
            const triggerDateStr = client[triggerField];

            if (!triggerDateStr) {
              stats.sendsSkippedMissingDate++;
              console.log(`[runDailyScheduler] Client ${client.id} missing ${triggerField}, skipping`);
              continue;
            }

            // Calculate the next occurrence of the trigger date
            const triggerDate = getNextOccurrence(triggerDateStr, campaign.type);
            if (!triggerDate) {
              stats.sendsSkippedMissingDate++;
              continue;
            }

            // For each campaign step, calculate send date and check if it should be scheduled
            for (const step of steps) {
              // Calculate send date based on timing
              // timingDays can be negative (before trigger) or positive (after trigger)
              const sendDate = addDays(triggerDate, step.timingDays);
              const sendDateStr = formatDate(sendDate);

              // Check if send date is within next 14 days
              if (!isWithinDays(sendDate, 14)) {
                continue; // Not within scheduling window
              }

              // Check for duplicate (idempotency)
              const sendKey = `${enrollment.id}-${step.id}-${sendDateStr}`;
              if (existingSendKeys.has(sendKey)) {
                stats.sendsSkippedDuplicate++;
                continue;
              }

              // Check credit availability for the org
              const creditCheck = await checkOrgCredits(base44, campaign.orgId);
              
              // Determine status based on credit availability and approval settings
              let status = 'pending';
              if (!creditCheck.hasCredits) {
                status = 'insufficient_credits';
                stats.sendsInsufficientCredits++;
              } else if (campaign.requiresApproval) {
                status = 'awaiting_approval';
              }

              // Create ScheduledSend record
              const scheduledSend = await base44.asServiceRole.entities.ScheduledSend.create({
                campaignId: campaign.id,
                campaignStepId: step.id,
                enrollmentId: enrollment.id,
                clientId: client.id,
                orgId: campaign.orgId,
                scheduledDate: sendDateStr,
                status: status,
                cardDesignId: step.cardDesignId,
                messageTemplateId: step.templateId || null,
                 customMessage: step.messageText || null,
                returnAddressMode: campaign.returnAddressMode || 'company'
              });

              stats.sendsCreated++;
              existingSendKeys.add(sendKey); // Add to set to prevent duplicates within this run
              
              console.log(`[runDailyScheduler] Created ScheduledSend ${scheduledSend.id} for client ${client.id}, date ${sendDateStr}, status ${status}`);
            }

          } catch (enrollmentError) {
            console.error(`[runDailyScheduler] Error processing enrollment ${enrollment.id}:`, enrollmentError);
            stats.errors.push({
              type: 'enrollment',
              id: enrollment.id,
              error: enrollmentError.message
            });
          }
        }

      } catch (campaignError) {
        console.error(`[runDailyScheduler] Error processing campaign ${campaign.id}:`, campaignError);
        stats.errors.push({
          type: 'campaign',
          id: campaign.id,
          error: campaignError.message
        });
      }
    }

    // 4. Update AutomationHistory with results
    const finalStatus = stats.errors.length > 0 ? 'partial' : 'success';
    const summary = `Processed ${stats.campaignsProcessed} campaigns, ${stats.enrollmentsProcessed} enrollments. Created ${stats.sendsCreated} sends. Skipped ${stats.sendsSkippedDuplicate} duplicates, ${stats.sendsSkippedMissingDate} missing dates. ${stats.sendsInsufficientCredits} insufficient credits.`;

    await base44.asServiceRole.entities.AutomationHistory.update(historyRecord.id, {
      status: finalStatus,
      completedAt: new Date().toISOString(),
      recordsProcessed: stats.sendsCreated,
      recordsFailed: stats.errors.length,
      summary: summary,
      details: stats
    });

    console.log(`[runDailyScheduler] Completed with status: ${finalStatus}`);
    console.log(`[runDailyScheduler] ${summary}`);

    // 5. Return summary
    return Response.json({
      success: true,
      status: finalStatus,
      historyId: historyRecord.id,
      summary: summary,
      stats: stats
    });

  } catch (error) {
    console.error('[runDailyScheduler] Fatal error:', error);

    // Update history record if it exists
    if (historyRecord) {
      await base44.asServiceRole.entities.AutomationHistory.update(historyRecord.id, {
        status: 'failed',
        completedAt: new Date().toISOString(),
        errorDetails: error.message,
        details: stats
      });
    }

    return Response.json({
      success: false,
      error: error.message,
      stats: stats
    }, { status: 500 });
  }
});

/**
 * Helper function to check credit availability for an org
 * Returns { hasCredits, availableCredits }
 */
async function checkOrgCredits(base44, orgId) {
  try {
    // Get organization's credit pool balance
    const orgs = await base44.asServiceRole.entities.Organization.filter({ id: orgId });
    if (!orgs || orgs.length === 0) {
      return { hasCredits: false, availableCredits: 0 };
    }

    const org = orgs[0];
    const poolBalance = org.creditBalance || 0;

    // Get count of pending/awaiting_approval/processing ScheduledSends for this org
    const pendingSends = await base44.asServiceRole.entities.ScheduledSend.filter({
      orgId: orgId
    });

    // Filter to only count statuses that reserve credits
    const reservedStatuses = ['pending', 'awaiting_approval', 'processing'];
    const reservedCredits = pendingSends.filter(send => reservedStatuses.includes(send.status)).length;

    const availableCredits = Math.max(0, poolBalance - reservedCredits);
    
    return {
      hasCredits: availableCredits >= 1,
      availableCredits,
      poolBalance,
      reservedCredits
    };
  } catch (error) {
    console.error('[checkOrgCredits] Error:', error);
    return { hasCredits: false, availableCredits: 0 };
  }
}