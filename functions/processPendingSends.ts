import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * processPendingSends.js
 * 
 * Purpose: Runs periodically to process ScheduledSends that are ready to go.
 * 
 * Logic Flow:
 * 1. Create AutomationHistory record with status 'running'
 * 2. Query ScheduledSend where status = 'pending' AND scheduledDate <= today
 * 3. For each send:
 *    a. FIRST: Update status to 'processing' (prevents race conditions)
 *    b. Verify credits are still available
 *    c. Get client details
 *    d. Get card design details
 *    e. Get message (from template or custom)
 *    f. Create Note record (similar to QuickSend flow)
 *    g. On success: Update status to 'sent', deduct credit
 *    h. On failure: Update status to 'failed' with error message
 * 4. Update AutomationHistory with results
 * 5. Return summary of processed sends
 */

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let historyRecord = null;

  const stats = {
    sendsProcessed: 0,
    sendsSent: 0,
    sendsFailed: 0,
    sendsInsufficientCredits: 0,
    errors: []
  };

  try {
    // 1. Create AutomationHistory record with status 'running'
    historyRecord = await base44.asServiceRole.entities.AutomationHistory.create({
      jobName: 'processPendingSends',
      status: 'running',
      startedAt: new Date().toISOString(),
      details: { startedBy: 'system' }
    });

    console.log(`[processPendingSends] Started job, history ID: ${historyRecord.id}`);

    // 2. Query ScheduledSend where status = 'pending' AND scheduledDate <= today
    const today = new Date().toISOString().split('T')[0];
    
    const allPendingSends = await base44.asServiceRole.entities.ScheduledSend.filter({
      status: 'pending'
    });

    // Filter to only those with scheduledDate <= today
    const pendingSends = allPendingSends.filter(send => send.scheduledDate <= today);
    
    console.log(`[processPendingSends] Found ${pendingSends.length} pending sends ready to process`);

    // 3. Process each send
    for (const send of pendingSends) {
      stats.sendsProcessed++;

      try {
        // 3a. FIRST: Update status to 'processing' (CRITICAL for race condition prevention)
        await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
          status: 'processing',
          processedAt: new Date().toISOString()
        });
        console.log(`[processPendingSends] Processing send ${send.id}`);

        // 3b. Verify credits are still available
        const creditCheck = await checkOrgCredits(base44, send.orgId);
        if (!creditCheck.hasCredits) {
          await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
            status: 'insufficient_credits',
            failureReason: `Insufficient credits. Available: ${creditCheck.availableCredits}, Pool: ${creditCheck.poolBalance}`
          });
          stats.sendsInsufficientCredits++;
          console.log(`[processPendingSends] Send ${send.id} failed - insufficient credits`);
          continue;
        }

        // 3c. Get client details
        const clients = await base44.asServiceRole.entities.Client.filter({ id: send.clientId });
        if (!clients || clients.length === 0) {
          throw new Error(`Client ${send.clientId} not found`);
        }
        const client = clients[0];

        // 3d. Get card design details
        const designs = await base44.asServiceRole.entities.CardDesign.filter({ id: send.cardDesignId });
        if (!designs || designs.length === 0) {
          throw new Error(`Card design ${send.cardDesignId} not found`);
        }
        const cardDesign = designs[0];

        // 3e. Get message (from template or custom)
        let messageContent = send.customMessage || '';
        if (send.messageTemplateId && !messageContent) {
          const templates = await base44.asServiceRole.entities.Template.filter({ id: send.messageTemplateId });
          if (templates && templates.length > 0) {
            messageContent = templates[0].content;
          }
        }

        // Get campaign for return address mode
        const campaigns = await base44.asServiceRole.entities.Campaign.filter({ id: send.campaignId });
        const campaign = campaigns?.[0];
        const returnAddressMode = campaign?.returnAddressMode || 'company';

        // Get organization for company return address
        const orgs = await base44.asServiceRole.entities.Organization.filter({ id: send.orgId });
        const org = orgs?.[0];

        // Resolve placeholders in message
        const resolvedMessage = resolvePlaceholders(messageContent, client, org);

        // 3f. Create Note record (the actual card send)
        const note = await base44.asServiceRole.entities.Note.create({
          orgId: send.orgId,
          userId: campaign?.createdBy || 'system',
          clientId: client.id,
          cardDesignId: cardDesign.id,
          templateId: send.messageTemplateId || null,
          message: resolvedMessage,
          messageTemplate: messageContent,
          recipientName: client.fullName || `${client.firstName} ${client.lastName}`,
          senderUserId: campaign?.createdBy || 'system',
          senderName: org?.name || 'NurturInk',
          status: 'queued_for_sending',
          returnAddressMode: returnAddressMode,
          creditCost: 1
        });

        console.log(`[processPendingSends] Created Note ${note.id} for send ${send.id}`);

        // 3g. Deduct credit from organization
        await base44.asServiceRole.entities.Organization.update(send.orgId, {
          creditBalance: Math.max(0, (org.creditBalance || 0) - 1)
        });

        // Update ScheduledSend to 'sent'
        await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
          status: 'sent',
          sentAt: new Date().toISOString(),
          noteId: note.id,
          automationHistoryId: historyRecord.id
        });

        // Update CampaignEnrollment with last sent info
        if (send.enrollmentId) {
          // Get step to know stepOrder
          const steps = await base44.asServiceRole.entities.CampaignStep.filter({ id: send.campaignStepId });
          const step = steps?.[0];
          
          await base44.asServiceRole.entities.CampaignEnrollment.update(send.enrollmentId, {
            lastSentDate: send.scheduledDate,
            lastSentStep: step?.stepOrder || 1
          });
        }

        stats.sendsSent++;
        console.log(`[processPendingSends] Successfully processed send ${send.id}`);

      } catch (sendError) {
        // 3h. On failure: Update status to 'failed' with error message
        console.error(`[processPendingSends] Error processing send ${send.id}:`, sendError);
        
        await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
          status: 'failed',
          failureReason: sendError.message
        });

        stats.sendsFailed++;
        stats.errors.push({
          sendId: send.id,
          error: sendError.message
        });
      }
    }

    // 4. Update AutomationHistory with results
    const finalStatus = stats.sendsFailed > 0 ? 'partial' : 'success';
    const summary = `Processed ${stats.sendsProcessed} sends. Sent: ${stats.sendsSent}, Failed: ${stats.sendsFailed}, Insufficient credits: ${stats.sendsInsufficientCredits}`;

    await base44.asServiceRole.entities.AutomationHistory.update(historyRecord.id, {
      status: finalStatus,
      completedAt: new Date().toISOString(),
      recordsProcessed: stats.sendsSent,
      recordsFailed: stats.sendsFailed,
      summary: summary,
      details: stats
    });

    console.log(`[processPendingSends] Completed with status: ${finalStatus}`);
    console.log(`[processPendingSends] ${summary}`);

    // 5. Return summary
    return Response.json({
      success: true,
      status: finalStatus,
      historyId: historyRecord.id,
      summary: summary,
      stats: stats
    });

  } catch (error) {
    console.error('[processPendingSends] Fatal error:', error);

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
 * Check credit availability for an org
 */
async function checkOrgCredits(base44, orgId) {
  try {
    const orgs = await base44.asServiceRole.entities.Organization.filter({ id: orgId });
    if (!orgs || orgs.length === 0) {
      return { hasCredits: false, availableCredits: 0, poolBalance: 0 };
    }

    const org = orgs[0];
    const poolBalance = org.creditBalance || 0;

    // Get count of processing ScheduledSends (excluding current one being processed)
    const processingSends = await base44.asServiceRole.entities.ScheduledSend.filter({
      orgId: orgId,
      status: 'processing'
    });

    // Subtract 1 because current send is already in 'processing' status
    const reservedCredits = Math.max(0, processingSends.length - 1);
    const availableCredits = Math.max(0, poolBalance - reservedCredits);

    return {
      hasCredits: availableCredits >= 1,
      availableCredits,
      poolBalance,
      reservedCredits
    };
  } catch (error) {
    console.error('[checkOrgCredits] Error:', error);
    return { hasCredits: false, availableCredits: 0, poolBalance: 0 };
  }
}

/**
 * Resolve placeholders in message template
 */
function resolvePlaceholders(message, client, org) {
  if (!message) return '';
  
  let resolved = message;
  
  // Client placeholders
  resolved = resolved.replace(/\{\{client\.firstName\}\}/gi, client.firstName || '');
  resolved = resolved.replace(/\{\{client\.lastName\}\}/gi, client.lastName || '');
  resolved = resolved.replace(/\{\{client\.fullName\}\}/gi, client.fullName || `${client.firstName} ${client.lastName}`);
  resolved = resolved.replace(/\{\{client\.company\}\}/gi, client.company || '');
  
  // Organization placeholders
  resolved = resolved.replace(/\{\{org\.name\}\}/gi, org?.name || '');
  resolved = resolved.replace(/\{\{organization\.name\}\}/gi, org?.name || '');
  
  // Also handle Scribe-style placeholders
  resolved = resolved.replace(/\{FIRST_NAME\}/gi, client.firstName || '');
  resolved = resolved.replace(/\{LAST_NAME\}/gi, client.lastName || '');
  resolved = resolved.replace(/\{FULL_NAME\}/gi, client.fullName || `${client.firstName} ${client.lastName}`);
  
  return resolved.trim();
}