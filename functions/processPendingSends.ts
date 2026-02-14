import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * processPendingSends.js — PHASE 4 REWRITE
 * 
 * Purpose: Runs periodically to process ScheduledSends that are ready.
 * Now routes through the existing processMailingBatch → submitBatchToScribe pipeline
 * instead of creating Notes/Mailings inline.
 *
 * KEY CHANGES from original:
 * 1. Groups pending sends by orgId + campaign ownerId (one MailingBatch per group)
 * 2. Creates MailingBatch records and calls processMailingBatch for credit deduction + Note/Mailing creation
 * 3. Calls submitBatchToScribe for Scribe API submission
 * 4. Uses send.returnAddressMode (from ScheduledSend) instead of re-fetching Campaign
 * 5. Sets mailingBatchId on ScheduledSend and scheduledSendId on MailingBatch for two-way linking
 * 6. Running balance counter to avoid re-querying org credits each iteration
 * 7. Concurrent execution guard to prevent overlapping runs
 *
 * WORKFLOW PER GROUP:
 * 1. Build MailingBatch payload from grouped ScheduledSends
 * 2. Create MailingBatch entity (status: draft)
 * 3. Call processMailingBatch → creates Notes/Mailings, deducts credits
 * 4. Call submitBatchToScribe → submits to Scribe API
 * 5. Update ScheduledSend statuses based on results
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let historyRecord = null;

  const stats = {
    sendsFound: 0,
    groupsCreated: 0,
    batchesProcessed: 0,
    batchesSubmitted: 0,
    sendsSent: 0,
    sendsFailed: 0,
    sendsInsufficientCredits: 0,
    errors: []
  };

  try {
    // ============================================================
    // CONCURRENT EXECUTION GUARD
    // Prevent overlapping runs of processPendingSends
    // ============================================================
    const runningJobs = await base44.asServiceRole.entities.AutomationHistory.filter({
      jobName: 'processPendingSends',
      status: 'running'
    });

    if (runningJobs && runningJobs.length > 0) {
      console.log(`[processPendingSends] GUARD: Found ${runningJobs.length} already-running job(s). Exiting to prevent overlap.`);
      return Response.json({
        success: false,
        error: 'Another processPendingSends job is already running',
        runningJobIds: runningJobs.map(j => j.id)
      }, { status: 409 });
    }

    // ============================================================
    // 1. CREATE AUTOMATION HISTORY
    // ============================================================
    historyRecord = await base44.asServiceRole.entities.AutomationHistory.create({
      jobName: 'processPendingSends',
      status: 'running',
      startedAt: new Date().toISOString(),
      details: { startedBy: 'system' }
    });

    console.log(`[processPendingSends] Started job, history ID: ${historyRecord.id}`);

    // ============================================================
    // 2. QUERY PENDING SENDS DUE TODAY OR EARLIER
    // ============================================================
    const today = new Date().toISOString().split('T')[0];

    const allPendingSends = await base44.asServiceRole.entities.ScheduledSend.filter({
      status: 'pending'
    });

    // Filter to only those with scheduledDate <= today
    const pendingSends = allPendingSends.filter(send => send.scheduledDate <= today);
    stats.sendsFound = pendingSends.length;

    console.log(`[processPendingSends] Found ${pendingSends.length} pending sends ready to process (of ${allPendingSends.length} total pending)`);

    if (pendingSends.length === 0) {
      await base44.asServiceRole.entities.AutomationHistory.update(historyRecord.id, {
        status: 'success',
        completedAt: new Date().toISOString(),
        recordsProcessed: 0,
        summary: 'No pending sends found for today.',
        details: stats
      });
      return Response.json({ success: true, status: 'success', summary: 'No pending sends to process.', stats });
    }

    // ============================================================
    // 3. MARK ALL AS 'processing' (race condition prevention)
    // ============================================================
    for (const send of pendingSends) {
      await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
        status: 'processing',
        processedAt: new Date().toISOString()
      });
    }
    console.log(`[processPendingSends] Marked ${pendingSends.length} sends as 'processing'`);

    // ============================================================
    // 4. GROUP SENDS BY orgId + campaignOwnerId
    // Each group becomes one MailingBatch
    // ============================================================
    const campaignIds = [...new Set(pendingSends.map(s => s.campaignId))];
    const campaignList = campaignIds.length
      ? await base44.asServiceRole.entities.Campaign.filter({ id: { $in: campaignIds } })
      : [];
    const campaignMap = Object.fromEntries(campaignList.map(c => [c.id, c]));

    // Group key: orgId|||ownerId
    const groups = new Map();

    for (const send of pendingSends) {
      const campaign = campaignMap[send.campaignId];
      if (!campaign) {
        console.error(`[processPendingSends] Campaign ${send.campaignId} not found for send ${send.id}`);
        await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
          status: 'failed',
          failureReason: `Campaign ${send.campaignId} not found`
        });
        stats.sendsFailed++;
        stats.errors.push({ sendId: send.id, error: `Campaign ${send.campaignId} not found` });
        continue;
      }

      const groupKey = `${send.orgId}|||${campaign.ownerId}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          orgId: send.orgId,
          ownerId: campaign.ownerId,
          sends: []
        });
      }
      groups.get(groupKey).sends.push(send);
    }

    stats.groupsCreated = groups.size;
    console.log(`[processPendingSends] Created ${groups.size} group(s) from ${pendingSends.length} sends`);

    // ============================================================
    // 5. PROCESS EACH GROUP → MailingBatch → processMailingBatch → submitBatchToScribe
    // ============================================================

    for (const [groupKey, group] of groups) {
      console.log(`\n=== PROCESSING GROUP: ${groupKey} (${group.sends.length} sends) ===`);

      try {
        // ---------------------------------------------------------
        // 5a. CREDIT PRE-CHECK with running balance
        // ---------------------------------------------------------
        const orgs = await base44.asServiceRole.entities.Organization.filter({ id: group.orgId });
        if (!orgs?.length) {
          throw new Error(`Organization ${group.orgId} not found`);
        }
        const org = orgs[0];
        let runningBalance = org.creditBalance || 0;

        console.log(`[processPendingSends] Org ${org.name} credit balance: ${runningBalance}, sends needed: ${group.sends.length}`);

        // Split sends into affordable vs insufficient
        const affordableSends = [];
        const insufficientSends = [];

        for (const send of group.sends) {
          if (runningBalance >= 1) {
            affordableSends.push(send);
            runningBalance -= 1; // Decrement running balance
          } else {
            insufficientSends.push(send);
          }
        }

        // Mark insufficient sends
        for (const send of insufficientSends) {
          await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
            status: 'insufficient_credits',
            failureReason: `Insufficient credits. Org balance: ${org.creditBalance}, already reserved: ${affordableSends.length}`
          });
          stats.sendsInsufficientCredits++;
          console.log(`[processPendingSends] Send ${send.id} → insufficient_credits`);
        }

        if (affordableSends.length === 0) {
          console.log(`[processPendingSends] No affordable sends in group ${groupKey}, skipping batch creation`);
          continue;
        }

        // ---------------------------------------------------------
        // 5b. LOAD DATA needed for MailingBatch construction
        // ---------------------------------------------------------
        const clientIds = [...new Set(affordableSends.map(s => s.clientId))];
        const clientList = await base44.asServiceRole.entities.Client.filter({ id: { $in: clientIds } });
        const clientMap = Object.fromEntries(clientList.map(c => [c.id, c]));

        // Load the campaign owner (User) — this is the "sender"
        const ownerUsers = await base44.asServiceRole.entities.User.filter({ id: group.ownerId });
        if (!ownerUsers?.length) {
          throw new Error(`Campaign owner user ${group.ownerId} not found`);
        }
        const ownerUser = ownerUsers[0];

        // Load templates for sends that reference one
        const templateIds = [...new Set(affordableSends.map(s => s.messageTemplateId).filter(Boolean))];
        const templateList = templateIds.length
          ? await base44.asServiceRole.entities.Template.filter({ id: { $in: templateIds } })
          : [];
        const templateMap = Object.fromEntries(templateList.map(t => [t.id, t]));

        // Get first send's cardDesignId as the global default
        // (if there are multiple designs, we use cardDesignOverrides)
        const designIds = [...new Set(affordableSends.map(s => s.cardDesignId))];
        const globalCardDesignId = designIds[0];

        // ---------------------------------------------------------
        // 5c. BUILD MAILING BATCH PAYLOAD
        // ---------------------------------------------------------

        // Build per-client content & overrides
        const contentOverrides = {};
        const cardDesignOverrides = {};
        const returnAddressModeOverrides = {};
        let globalReturnAddressMode = affordableSends[0].returnAddressMode || 'company';

        for (const send of affordableSends) {
          const client = clientMap[send.clientId];
          if (!client) {
            console.error(`[processPendingSends] Client ${send.clientId} not found, marking send ${send.id} failed`);
            await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
              status: 'failed',
              failureReason: `Client ${send.clientId} not found`
            });
            stats.sendsFailed++;
            stats.errors.push({ sendId: send.id, error: `Client ${send.clientId} not found` });
            continue;
          }

          // Resolve message content
          let message = send.customMessage || '';
          if (send.messageTemplateId && !message) {
            const template = templateMap[send.messageTemplateId];
            if (template) {
              message = template.content;
            }
          }
          if (message) {
            contentOverrides[send.clientId] = message;
          }

          // Card design override (if different from global)
          if (send.cardDesignId !== globalCardDesignId) {
            cardDesignOverrides[send.clientId] = send.cardDesignId;
          }

          // Return address mode override (if different from global)
          if (send.returnAddressMode && send.returnAddressMode !== globalReturnAddressMode) {
            returnAddressModeOverrides[send.clientId] = send.returnAddressMode;
          }
        }

        // Filter to only client IDs that passed validation
        const validClientIds = affordableSends
          .filter(s => clientMap[s.clientId])
          .map(s => s.clientId);

        if (validClientIds.length === 0) {
          console.log(`[processPendingSends] No valid clients in group ${groupKey} after validation`);
          continue;
        }

        // Determine the NoteStyleProfile to use
        // Use the owner's default personal style if available
        const ownerStyles = await base44.asServiceRole.entities.NoteStyleProfile.filter({
          userId: group.ownerId,
          isDefault: true,
          type: 'personal'
        });
        const defaultStyleId = ownerStyles?.[0]?.id || null;

        // ---------------------------------------------------------
        // 5d. CREATE MAILING BATCH
        // ---------------------------------------------------------
        const mailingBatch = await base44.asServiceRole.entities.MailingBatch.create({
          userId: group.ownerId,
          organizationId: group.orgId,
          status: 'draft',
          selectedClientIds: validClientIds,
          globalMessage: contentOverrides[validClientIds[0]] || '',
          contentOverrides: Object.keys(contentOverrides).length > 1 ? contentOverrides : null,
          selectedCardDesignId: globalCardDesignId,
          cardDesignOverrides: Object.keys(cardDesignOverrides).length > 0 ? cardDesignOverrides : null,
          selectedNoteStyleProfileId: defaultStyleId,
          includeGreeting: true,
          includeSignature: true,
          returnAddressModeGlobal: globalReturnAddressMode,
          returnAddressModeOverrides: Object.keys(returnAddressModeOverrides).length > 0 ? returnAddressModeOverrides : null,
          scheduledSendId: affordableSends[0].id // Link to first ScheduledSend (primary reference)
        });

        console.log(`[processPendingSends] Created MailingBatch ${mailingBatch.id} with ${validClientIds.length} clients`);
        stats.batchesProcessed++;

        // ---------------------------------------------------------
        // 5e. LINK ScheduledSends → MailingBatch (two-way FK)
        // ---------------------------------------------------------
        for (const send of affordableSends) {
          if (clientMap[send.clientId]) {
            await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
              mailingBatchId: mailingBatch.id
            });
          }
        }

        // ---------------------------------------------------------
        // 5f. CALL processMailingBatch (credit deduction + Note/Mailing creation)
        // ---------------------------------------------------------
        console.log(`[processPendingSends] Calling processMailingBatch for batch ${mailingBatch.id}...`);

        let pmbResult;
        try {
          const pmbResponse = await base44.asServiceRole.functions.invoke('processMailingBatch', {
            mailingBatchId: mailingBatch.id
          });
          pmbResult = pmbResponse.data || pmbResponse;
          console.log(`[processPendingSends] processMailingBatch result:`, JSON.stringify(pmbResult).substring(0, 300));
        } catch (pmbError) {
          console.error(`[processPendingSends] processMailingBatch FAILED:`, pmbError.message);
          // Mark all sends in this group as failed
          for (const send of affordableSends) {
            if (clientMap[send.clientId]) {
              await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
                status: 'failed',
                failureReason: `processMailingBatch failed: ${pmbError.message}`
              });
              stats.sendsFailed++;
            }
          }
          stats.errors.push({ groupKey, error: `processMailingBatch failed: ${pmbError.message}` });
          continue;
        }

        // Check PMB result
        if (!pmbResult.success && !pmbResult.processedCount) {
          console.error(`[processPendingSends] processMailingBatch returned failure:`, pmbResult.error);
          for (const send of affordableSends) {
            if (clientMap[send.clientId]) {
              await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
                status: 'failed',
                failureReason: `processMailingBatch error: ${pmbResult.error || 'Unknown error'}`
              });
              stats.sendsFailed++;
            }
          }
          stats.errors.push({ groupKey, error: pmbResult.error || 'processMailingBatch returned failure' });
          continue;
        }

        console.log(`[processPendingSends] processMailingBatch SUCCESS for batch ${mailingBatch.id}`);

        // ---------------------------------------------------------
        // 5g. CALL submitBatchToScribe (Scribe API submission)
        // ---------------------------------------------------------
        console.log(`[processPendingSends] Calling submitBatchToScribe for batch ${mailingBatch.id}...`);

        let scribeResult;
        try {
          const scribeResponse = await base44.asServiceRole.functions.invoke('submitBatchToScribe', {
            mailingBatchId: mailingBatch.id
          });
          scribeResult = scribeResponse.data || scribeResponse;
          console.log(`[processPendingSends] submitBatchToScribe result:`, JSON.stringify(scribeResult).substring(0, 300));
          stats.batchesSubmitted++;
        } catch (scribeError) {
          console.error(`[processPendingSends] submitBatchToScribe FAILED:`, scribeError.message);
          // Notes/Mailings already created by PMB — mark sends as failed at Scribe stage
          for (const send of affordableSends) {
            if (clientMap[send.clientId]) {
              await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
                status: 'failed',
                failureReason: `submitBatchToScribe failed: ${scribeError.message}`
              });
              stats.sendsFailed++;
            }
          }
          stats.errors.push({ groupKey, error: `submitBatchToScribe failed: ${scribeError.message}` });
          continue;
        }

        // ---------------------------------------------------------
        // 5h. UPDATE ScheduledSend STATUSES based on final result
        // ---------------------------------------------------------
        const finalBatchStatus = scribeResult.status || 'unknown';
        const now = new Date().toISOString();

        for (const send of affordableSends) {
          if (!clientMap[send.clientId]) continue;

          if (finalBatchStatus === 'completed' || finalBatchStatus === 'partial') {
            await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
              status: 'sent',
              sentAt: now,
              automationHistoryId: historyRecord.id
            });
            stats.sendsSent++;
          } else if (finalBatchStatus === 'failed') {
            await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
              status: 'failed',
              failureReason: `Scribe batch status: ${finalBatchStatus}`
            });
            stats.sendsFailed++;
          } else {
            // pending_credits or other — still mark as sent from our side
            await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
              status: 'sent',
              sentAt: now,
              automationHistoryId: historyRecord.id
            });
            stats.sendsSent++;
          }
        }

        // ---------------------------------------------------------
        // 5i. UPDATE CampaignEnrollments
        // ---------------------------------------------------------
        const stepIds = [...new Set(affordableSends.map(s => s.campaignStepId))];
        const stepList = stepIds.length
          ? await base44.asServiceRole.entities.CampaignStep.filter({ id: { $in: stepIds } })
          : [];
        const stepMap = Object.fromEntries(stepList.map(s => [s.id, s]));

        for (const send of affordableSends) {
          if (!clientMap[send.clientId]) continue;
          if (!send.enrollmentId) continue;

          const step = stepMap[send.campaignStepId];
          try {
            await base44.asServiceRole.entities.CampaignEnrollment.update(send.enrollmentId, {
              lastSentDate: send.scheduledDate,
              lastSentStep: step?.stepOrder || 1
            });
          } catch (enrollError) {
            console.error(`[processPendingSends] Failed to update enrollment ${send.enrollmentId}:`, enrollError.message);
          }
        }

        console.log(`=== GROUP ${groupKey} COMPLETE ===\n`);

      } catch (groupError) {
        console.error(`[processPendingSends] Error processing group ${groupKey}:`, groupError.message);

        // Mark all remaining 'processing' sends in this group as failed
        for (const send of group.sends) {
          try {
            // Re-check status in case some were already updated
            const current = await base44.asServiceRole.entities.ScheduledSend.filter({ id: send.id });
            if (current?.[0]?.status === 'processing') {
              await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
                status: 'failed',
                failureReason: `Group processing error: ${groupError.message}`
              });
              stats.sendsFailed++;
            }
          } catch (updateErr) {
            console.error(`[processPendingSends] Failed to update send ${send.id} after group error:`, updateErr.message);
          }
        }

        stats.errors.push({ groupKey, error: groupError.message });
      }
    }

    // ============================================================
    // 6. FINALIZE AUTOMATION HISTORY
    // ============================================================
    const finalStatus = stats.sendsFailed > 0
      ? (stats.sendsSent > 0 ? 'partial' : 'failed')
      : 'success';

    const summary = [
      `Found ${stats.sendsFound} pending sends.`,
      `Created ${stats.groupsCreated} group(s), ${stats.batchesProcessed} batch(es).`,
      `Submitted ${stats.batchesSubmitted} to Scribe.`,
      `Sent: ${stats.sendsSent}, Failed: ${stats.sendsFailed}, Insufficient credits: ${stats.sendsInsufficientCredits}.`
    ].join(' ');

    await base44.asServiceRole.entities.AutomationHistory.update(historyRecord.id, {
      status: finalStatus,
      completedAt: new Date().toISOString(),
      recordsProcessed: stats.sendsSent,
      recordsFailed: stats.sendsFailed,
      summary,
      details: stats
    });

    console.log(`[processPendingSends] COMPLETED: ${finalStatus}`);
    console.log(`[processPendingSends] ${summary}`);

    return Response.json({
      success: true,
      status: finalStatus,
      historyId: historyRecord.id,
      summary,
      stats
    });

  } catch (error) {
    console.error('[processPendingSends] Fatal error:', error);

    if (historyRecord) {
      try {
        await base44.asServiceRole.entities.AutomationHistory.update(historyRecord.id, {
          status: 'failed',
          completedAt: new Date().toISOString(),
          errorDetails: error.message,
          details: stats
        });
      } catch (historyErr) {
        console.error('[processPendingSends] Failed to update history record:', historyErr.message);
      }
    }

    return Response.json({
      success: false,
      error: error.message,
      stats
    }, { status: 500 });
  }
});