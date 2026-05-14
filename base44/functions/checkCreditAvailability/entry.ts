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

    // Interactive credit checks have an authenticated user session. Prefer
    // user-scoped reads so RLS and platform access match the frontend/context
    // path. In this app, service-role entity reads have returned empty rows for
    // some protected entities even when user-scoped reads succeed.
    const orgs = await base44.entities.Organization.filter({ id: orgId });

    if (!orgs || orgs.length === 0) {
      console.warn('[CreditCheck] Organization not found with user-scoped read', {
        userId: user.id,
        orgId,
        requestedOrgId,
        userOrgId
      });
      return Response.json({
        error: 'Organization not found',
        orgId,
        lookupMode: 'userScoped'
      }, { status: 404 });
    }

    const org = orgs[0];
    const poolBalance = org.creditBalance || 0;

    // Also check user-level credits
    const companyAllocatedCredits = user?.companyAllocatedCredits || 0;
    const personalPurchasedCredits = user?.personalPurchasedCredits || 0;
    const canAccessCompanyPool = user?.canAccessCompanyPool !== false;

    // Get count of pending/awaiting_approval/processing ScheduledSends for this org
    let pendingSends = [];
    try {
      pendingSends = await base44.entities.ScheduledSend.filter({ orgId });
    } catch (scheduledSendError) {
      console.warn('[CreditCheck] ScheduledSend reservation lookup failed', {
        message: scheduledSendError?.message,
        orgId
      });
    }

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
