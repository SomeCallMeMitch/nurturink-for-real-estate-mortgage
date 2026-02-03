import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * checkCreditAvailability.js
 * 
 * Purpose: Verify organization has enough credits before scheduling sends.
 * Accounts for pending/awaiting_approval/processing sends as reserved credits.
 * 
 * Input: { orgId: string, requiredCredits: number }
 * Output: { hasCredits, availableCredits, poolBalance, reservedCredits }
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { orgId, requiredCredits = 1 } = await req.json();

    if (!orgId) {
      return Response.json({ error: 'orgId is required' }, { status: 400 });
    }

    // Get organization's credit pool balance
    const orgs = await base44.asServiceRole.entities.Organization.filter({ id: orgId });
    if (!orgs || orgs.length === 0) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    const org = orgs[0];
    const poolBalance = org.creditBalance || 0;

    // Get count of pending/awaiting_approval/processing ScheduledSends for this org
    // These statuses represent "reserved" credits that haven't been spent yet
    const pendingSends = await base44.asServiceRole.entities.ScheduledSend.filter({
      orgId: orgId
    });

    // Filter to only count statuses that reserve credits
    const reservedStatuses = ['pending', 'awaiting_approval', 'processing'];
    const reservedSends = pendingSends.filter(send => reservedStatuses.includes(send.status));
    const reservedCredits = reservedSends.length;

    // Calculate available credits
    const availableCredits = Math.max(0, poolBalance - reservedCredits);
    const hasCredits = availableCredits >= requiredCredits;

    return Response.json({
      success: true,
      hasCredits,
      availableCredits,
      poolBalance,
      reservedCredits,
      requiredCredits
    });

  } catch (error) {
    console.error('Error checking credit availability:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});