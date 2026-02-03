import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * approveScheduledSend.js
 * 
 * Purpose: Approve a send that's awaiting approval.
 * 
 * Input: { scheduledSendId: string } or { scheduledSendIds: string[] }
 * 
 * Logic:
 * 1. Verify send(s) are in 'awaiting_approval' status
 * 2. Update status to 'pending'
 * 3. Return count of approved sends
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
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
      notFound: [],
      notApprovable: []
    };

    for (const id of idsToApprove) {
      const sends = await base44.asServiceRole.entities.ScheduledSend.filter({ id });
      
      if (!sends || sends.length === 0) {
        results.notFound.push(id);
        continue;
      }

      const send = sends[0];

      if (send.status !== 'awaiting_approval') {
        results.notApprovable.push({
          id,
          currentStatus: send.status
        });
        continue;
      }

      await base44.asServiceRole.entities.ScheduledSend.update(id, {
        status: 'pending'
      });

      results.approved.push(id);
    }

    const success = results.approved.length > 0;
    const message = `Approved ${results.approved.length} send(s). Not found: ${results.notFound.length}. Not approvable: ${results.notApprovable.length}.`;

    console.log(`[approveScheduledSend] ${message}`);

    return Response.json({
      success,
      message,
      approvedCount: results.approved.length,
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