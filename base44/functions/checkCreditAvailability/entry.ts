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
  console.log('=== CHECK CREDIT AVAILABILITY ===');
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const payload = await req.json();
    
    console.log('[CreditCheck] Payload received:', JSON.stringify(payload));
    console.log('[CreditCheck] Authenticated user:', user?.id, user?.email, 'orgId:', user?.orgId);
    
    // Allow orgId from payload, or fall back to authenticated user's orgId
    const orgId = payload.orgId || user?.orgId;
    const requiredCredits = payload.requiredCredits || payload.creditsNeeded || 1;
    
    console.log('[CreditCheck] Resolved orgId:', orgId, 'requiredCredits:', requiredCredits);

    if (!orgId) {
      console.error('[CreditCheck] No orgId found in payload or user');
      return Response.json({ error: 'orgId is required (not found in payload or user profile)' }, { status: 400 });
    }

    // Get organization's credit pool balance
    const orgs = await base44.asServiceRole.entities.Organization.filter({ id: orgId });
    console.log('[CreditCheck] Organization lookup result: found', orgs?.length || 0, 'org(s)');
    
    if (!orgs || orgs.length === 0) {
      console.error('[CreditCheck] Organization not found for id:', orgId);
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    const org = orgs[0];
    const poolBalance = org.creditBalance || 0;
    console.log('[CreditCheck] Org creditBalance:', poolBalance);

    // Also check user-level credits
    const companyAllocatedCredits = user?.companyAllocatedCredits || 0;
    const personalPurchasedCredits = user?.personalPurchasedCredits || 0;
    const canAccessCompanyPool = user?.canAccessCompanyPool !== false;
    
    console.log('[CreditCheck] User credits - companyAllocated:', companyAllocatedCredits, 
      'personal:', personalPurchasedCredits, 'canAccessPool:', canAccessCompanyPool);

    // Get count of pending/awaiting_approval/processing ScheduledSends for this org
    const pendingSends = await base44.asServiceRole.entities.ScheduledSend.filter({
      orgId: orgId
    });

    // Filter to only count statuses that reserve credits
    const reservedStatuses = ['pending', 'awaiting_approval', 'processing'];
    const reservedSends = pendingSends.filter(send => reservedStatuses.includes(send.status));
    const reservedCredits = reservedSends.length;
    
    console.log('[CreditCheck] Reserved credits (pending ScheduledSends):', reservedCredits);

    // Calculate available credits across all tiers
    const companyPoolAvailable = canAccessCompanyPool ? Math.max(0, poolBalance - reservedCredits) : 0;
    const totalAvailable = companyAllocatedCredits + companyPoolAvailable + personalPurchasedCredits;
    const hasCredits = totalAvailable >= requiredCredits;
    
    console.log('[CreditCheck] RESULT - totalAvailable:', totalAvailable, 'hasCredits:', hasCredits,
      '(allocated:', companyAllocatedCredits, '+ pool:', companyPoolAvailable, '+ personal:', personalPurchasedCredits, ')');

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
    console.error('[CreditCheck] ERROR:', error.message);
    console.error('[CreditCheck] Stack:', error.stack);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});