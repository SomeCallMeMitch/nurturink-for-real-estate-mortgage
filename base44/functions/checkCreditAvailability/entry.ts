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
    const user = await base44.auth.me();
    const payload = await req.json();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestedOrgId = payload?.orgId;
    const userOrgId = user?.orgId;
    const isSuperAdmin = user?.appRole === 'super_admin';

    if (!isSuperAdmin && requestedOrgId && requestedOrgId !== userOrgId) {
      console.warn('[CreditCheck] Forbidden orgId override attempt', {
        userId: user?.id,
        requestedOrgId,
        userOrgId
      });
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const orgId = isSuperAdmin ? (requestedOrgId || userOrgId) : userOrgId;
    const requiredCredits = payload.requiredCredits || payload.creditsNeeded || 1;

    if (!orgId) {
      return Response.json({ error: 'Organization context not found' }, { status: 400 });
    }

    // Get organization's credit pool balance
    const orgs = await base44.asServiceRole.entities.Organization.filter({ id: orgId });

    if (!orgs || orgs.length === 0) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    const org = orgs[0];
    const poolBalance = org.creditBalance || 0;

    // Also check user-level credits
    const companyAllocatedCredits = user?.companyAllocatedCredits || 0;
    const personalPurchasedCredits = user?.personalPurchasedCredits || 0;
    const canAccessCompanyPool = user?.canAccessCompanyPool !== false;

    // Get count of pending/awaiting_approval/processing ScheduledSends for this org
    const pendingSends = await base44.asServiceRole.entities.ScheduledSend.filter({
      orgId: orgId
    });

    // Filter to only count statuses that reserve credits
    const reservedStatuses = ['pending', 'awaiting_approval', 'processing'];
    const reservedSends = pendingSends.filter(send => reservedStatuses.includes(send.status));
    const reservedCredits = reservedSends.length;

    // Calculate available credits across all tiers
    const companyPoolAvailable = canAccessCompanyPool ? Math.max(0, poolBalance - reservedCredits) : 0;
    const totalAvailable = companyAllocatedCredits + companyPoolAvailable + personalPurchasedCredits;
    const hasCredits = totalAvailable >= requiredCredits;

    return Response.json({
      success: true,
      available: hasCredits,
      hasCredits,
      totalAvailable,
      companyAllocatedCredits,
      companyPoolCredits: companyPoolAvailable,
      personalCredits: personalPurchasedCredits,
      poolBalance,
      reservedCredits,
      requiredCredits
    });

  } catch (error) {
    console.error('[CreditCheck] Error', { message: error?.message });
    return Response.json({ 
      success: false,
      error: 'Failed to check credit availability'
    }, { status: 500 });
  }
});
