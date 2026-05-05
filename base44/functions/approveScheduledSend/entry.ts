import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * approveScheduledSend.js
 * 
 * Purpose: Approve a send that's awaiting approval with real-time credit checking.
 * 
 * Input: { scheduledSendId: string } or { scheduledSendIds: string[] }
 * 
 * Logic:
 * 1. Verify send(s) are in 'awaiting_approval' status
 * 2. Check credit availability for the organization
 * 3. If credits available: Update status to 'pending'
 * 4. If credits insufficient: Update status to 'insufficient_credits'
 * 5. Return detailed results
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userOrgId = user.orgId;
    const isOwnerOrManager = ['organization_owner', 'organization_manager'].includes(user.role) || user.isOrgOwner === true;
    if (!userOrgId || !isOwnerOrManager) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { scheduledSendId, scheduledSendIds } = await req.json();

    // Support single or bulk approval
    const idsToApprove = scheduledSendIds || (scheduledSendId ? [scheduledSendId] : []);

    if (idsToApprove.length === 0) {
      return Response.json({ 
        error: 'Either scheduledSendId or scheduledSendIds is required' 
      }, { status: 400 });
    }

    const results = {
      approved: [],
      insufficientCredits: [],
      notFound: [],
      notApprovable: []
    };

    // Group sends by orgId for efficient credit checking
    const sendsByOrg = new Map();

    // First pass: collect all sends and group by org
    for (const id of idsToApprove) {
      const sends = await base44.asServiceRole.entities.ScheduledSend.filter({ id });
      
      if (!sends || sends.length === 0) {
        results.notFound.push(id);
        continue;
      }

      const send = sends[0];

      if (send.orgId !== userOrgId) {
        results.notFound.push(id);
        continue;
      }

      if (send.status !== 'awaiting_approval') {
        results.notApprovable.push({
          id,
          currentStatus: send.status
        });
        continue;
      }

      // Group by orgId
      if (!sendsByOrg.has(send.orgId)) {
        sendsByOrg.set(send.orgId, []);
      }
      sendsByOrg.get(send.orgId).push(send);
    }

    // Second pass: check credits per org and approve/reject accordingly
    for (const [orgId, sends] of sendsByOrg) {
      if (orgId !== userOrgId) {
        for (const send of sends) {
          results.notFound.push(send.id);
        }
        continue;
      }
      // Get organization's credit pool balance
      const orgs = await base44.asServiceRole.entities.Organization.filter({ id: orgId });
      if (!orgs || orgs.length === 0) {
        // Org not found - mark all sends as not approvable
        for (const send of sends) {
          results.notApprovable.push({
            id: send.id,
            reason: 'Organization not found'
          });
        }
        continue;
      }

      const org = orgs[0];
      const poolBalance = org.creditBalance || 0;

      // Get count of pending/processing ScheduledSends for this org (already reserved)
      const pendingSends = await base44.asServiceRole.entities.ScheduledSend.filter({ orgId });
      const reservedStatuses = ['pending', 'processing'];
      const reservedCredits = pendingSends.filter(s => reservedStatuses.includes(s.status)).length;
      
      // Calculate available credits
      let availableCredits = Math.max(0, poolBalance - reservedCredits);

      // Process each send for this org
      for (const send of sends) {
        if (availableCredits >= 1) {
          // Credits available - approve the send
          await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
            status: 'pending'
          });
          results.approved.push(send.id);
          // Decrement available credits for subsequent sends in this batch
          availableCredits--;
        } else {
          // Insufficient credits - mark accordingly
          await base44.asServiceRole.entities.ScheduledSend.update(send.id, {
            status: 'insufficient_credits',
            failureReason: `Insufficient credits. Pool balance: ${poolBalance}, Reserved: ${reservedCredits}`
          });
          results.insufficientCredits.push({
            id: send.id,
            orgId,
            availableCredits: Math.max(0, poolBalance - reservedCredits),
            poolBalance,
            reservedCredits
          });
        }
      }
    }

    const totalProcessed = results.approved.length + results.insufficientCredits.length;
    const success = results.approved.length > 0 || totalProcessed > 0;
    
    const message = `Processed ${totalProcessed} send(s). Approved: ${results.approved.length}. Insufficient credits: ${results.insufficientCredits.length}. Not found: ${results.notFound.length}. Not approvable: ${results.notApprovable.length}.`;

    console.log(`[approveScheduledSend] ${message}`);

    // Send notifications asynchronously (don't block the response)
    // For bulk approvals, send a single summary email
    if (results.approved.length > 0 || results.insufficientCredits.length > 0) {
      try {
        if (results.approved.length > 1) {
          // Bulk approval - send summary email
          await base44.asServiceRole.functions.invoke('sendBulkApprovalNotification', {
            scheduledSendIds: results.approved,
            action: 'approved'
          });
        } else if (results.approved.length === 1) {
          // Single approval
          await base44.asServiceRole.functions.invoke('sendApprovalNotification', {
            scheduledSendId: results.approved[0],
            action: 'approved'
          });
        }

        // Send notifications for insufficient credits
        for (const item of results.insufficientCredits) {
          await base44.asServiceRole.functions.invoke('sendApprovalNotification', {
            scheduledSendId: item.id,
            action: 'insufficient_credits'
          });
        }
      } catch (notifError) {
        // Log but don't fail the main operation
        console.error('[approveScheduledSend] Notification error:', notifError);
      }
    }

    return Response.json({
      success,
      message,
      approvedCount: results.approved.length,
      insufficientCreditsCount: results.insufficientCredits.length,
      results
    });

  } catch (error) {
    console.error('[approveScheduledSend] Error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});