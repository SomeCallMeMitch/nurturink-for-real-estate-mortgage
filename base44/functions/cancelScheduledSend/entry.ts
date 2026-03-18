import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * cancelScheduledSend.js
 * 
 * Purpose: Cancel a pending scheduled send.
 * 
 * Input: { scheduledSendId: string } or { scheduledSendIds: string[] }
 * 
 * Logic:
 * 1. Verify the send exists and is cancellable (pending or awaiting_approval)
 * 2. Update status to 'cancelled'
 * 3. Return success
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { scheduledSendId, scheduledSendIds } = await req.json();

    // Support single or bulk cancellation
    const idsToCancel = scheduledSendIds || (scheduledSendId ? [scheduledSendId] : []);

    if (idsToCancel.length === 0) {
      return Response.json({ 
        error: 'Either scheduledSendId or scheduledSendIds is required' 
      }, { status: 400 });
    }

    const cancellableStatuses = ['pending', 'awaiting_approval', 'insufficient_credits'];
    const results = {
      cancelled: [],
      notFound: [],
      notCancellable: []
    };

    for (const id of idsToCancel) {
      const sends = await base44.asServiceRole.entities.ScheduledSend.filter({ id });
      
      if (!sends || sends.length === 0) {
        results.notFound.push(id);
        continue;
      }

      const send = sends[0];

      if (!cancellableStatuses.includes(send.status)) {
        results.notCancellable.push({
          id,
          currentStatus: send.status
        });
        continue;
      }

      await base44.asServiceRole.entities.ScheduledSend.update(id, {
        status: 'cancelled'
      });

      results.cancelled.push(id);
    }

    const success = results.cancelled.length > 0;
    const message = `Cancelled ${results.cancelled.length} send(s). Not found: ${results.notFound.length}. Not cancellable: ${results.notCancellable.length}.`;

    console.log(`[cancelScheduledSend] ${message}`);

    // Send notifications for cancelled sends
    if (results.cancelled.length > 0) {
      try {
        if (results.cancelled.length > 1) {
          // Bulk cancellation - send summary email
          await base44.asServiceRole.functions.invoke('sendBulkApprovalNotification', {
            scheduledSendIds: results.cancelled,
            action: 'cancelled'
          });
        } else {
          // Single cancellation
          await base44.asServiceRole.functions.invoke('sendApprovalNotification', {
            scheduledSendId: results.cancelled[0],
            action: 'cancelled'
          });
        }
      } catch (notifError) {
        // Log but don't fail the main operation
        console.error('[cancelScheduledSend] Notification error:', notifError);
      }
    }

    return Response.json({
      success,
      message,
      results
    });

  } catch (error) {
    console.error('[cancelScheduledSend] Error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});