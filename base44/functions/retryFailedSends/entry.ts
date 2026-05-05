import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * retryFailedSends.js
 * 
 * Purpose: Allow manual retry of failed sends.
 * 
 * Input: 
 *   - { scheduledSendId: string } - Retry a single failed send
 *   - { orgId: string } - Retry all failed sends for an organization
 * 
 * Logic:
 * 1. Get failed ScheduledSend record(s)
 * 2. Reset status to 'pending'
 * 3. Optionally update scheduledDate to today
 * 4. Return count of retried sends
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

    const { scheduledSendId, orgId: _ignoredOrgId, resetDateToToday = true } = await req.json();

    if (!scheduledSendId && !_ignoredOrgId) {
      return Response.json({ 
        error: 'Either scheduledSendId or orgId is required' 
      }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    let retriedCount = 0;
    const retriedIds = [];

    if (scheduledSendId) {
      // Retry a single send
      const sends = await base44.asServiceRole.entities.ScheduledSend.filter({ 
        id: scheduledSendId 
      });
      
      if (!sends || sends.length === 0) {
        return Response.json({ error: 'ScheduledSend not found' }, { status: 404 });
      }

      const send = sends[0];

      if (send.orgId !== userOrgId) {
        return Response.json({ error: 'ScheduledSend not found' }, { status: 404 });
      }
      
      // Only allow retry of failed or insufficient_credits sends
      if (!['failed', 'insufficient_credits'].includes(send.status)) {
        return Response.json({ 
          error: `Cannot retry send with status '${send.status}'. Only 'failed' or 'insufficient_credits' sends can be retried.` 
        }, { status: 400 });
      }

      const updateData = {
        status: 'pending',
        failureReason: null,
        processedAt: null
      };

      if (resetDateToToday) {
        updateData.scheduledDate = today;
      }

      await base44.asServiceRole.entities.ScheduledSend.update(send.id, updateData);
      retriedCount = 1;
      retriedIds.push(send.id);

    } else if (_ignoredOrgId) {
      // Retry all failed sends for an organization
      const failedSends = await base44.asServiceRole.entities.ScheduledSend.filter({
        orgId: userOrgId
      });

      // Filter to only failed or insufficient_credits
      const retryableSends = failedSends.filter(s => 
        ['failed', 'insufficient_credits'].includes(s.status)
      );

      for (const send of retryableSends) {
        const updateData = {
          status: 'pending',
          failureReason: null,
          processedAt: null
        };

        if (resetDateToToday) {
          updateData.scheduledDate = today;
        }

        await base44.asServiceRole.entities.ScheduledSend.update(send.id, updateData);
        retriedCount++;
        retriedIds.push(send.id);
      }
    }

    console.log(`[retryFailedSends] Retried ${retriedCount} sends`);

    return Response.json({
      success: true,
      retriedCount,
      retriedIds,
      message: `Successfully queued ${retriedCount} send(s) for retry`
    });

  } catch (error) {
    console.error('[retryFailedSends] Error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});