import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Transfer credits from owner's personal balance to organization pool
 * 
 * Allows organization owners to move their personally purchased credits
 * (User.personalPurchasedCredits) into the shared organization pool
 * (Organization.creditBalance) for team use.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify user is authenticated
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is organization owner (check both appRole and isOrgOwner flag)
    const isOrgOwner = user.appRole === 'organization_owner' || user.isOrgOwner === true;

    if (!isOrgOwner) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify user has organization
    if (!user.orgId) {
      return Response.json(
        { error: 'User does not belong to an organization' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { amount } = body;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return Response.json(
        { error: 'amount must be a positive number' },
        { status: 400 }
      );
    }

    // Check if amount is a whole number
    if (!Number.isInteger(amount)) {
      return Response.json(
        { error: 'amount must be a whole number' },
        { status: 400 }
      );
    }

    // Get user's current personal credit balance
    const currentPersonalCredits = user.personalPurchasedCredits || 0;

    // Verify user has enough personal credits
    if (currentPersonalCredits < amount) {
      return Response.json(
        {
          error: 'Insufficient personal credits'
        },
        { status: 400 }
      );
    }

    // Load organization
    const orgs = await base44.asServiceRole.entities.Organization.filter({
      id: user.orgId
    });

    if (!orgs || orgs.length === 0) {
      return Response.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    const organization = orgs[0];
    const currentOrgBalance = organization.creditBalance || 0;

    // BATCH3-C: Fresh-read both user and org balances immediately before writing.
    // This closes the window between the initial balance check (above) and the actual writes.
    // For a transfer, BOTH sides must be valid — unlike allocateCredits, we do NOT cap and proceed;
    // instead we REJECT with 409 if fresh balance is insufficient, to prevent overdraft.
    const [freshTransferUsers, freshTransferOrgs] = await Promise.all([
      base44.asServiceRole.entities.User.filter({ id: user.id }),
      base44.asServiceRole.entities.Organization.filter({ id: organization.id })
    ]);

    const freshPersonalBalance = freshTransferUsers?.[0]?.personalPurchasedCredits ?? currentPersonalCredits;
    const freshOrgPoolBalance = freshTransferOrgs?.[0]?.creditBalance ?? currentOrgBalance;

    if (freshPersonalBalance < amount) {
      // Fresh balance is insufficient — reject rather than overdraft.
      // Log the race-window event for audit.
      console.warn('[BATCH3][transferCreditsToPool] Balance conflict during transfer', {
        userId: user.id,
        orgId: user.orgId,
        requested: amount,
        freshBalance: freshPersonalBalance
      });

      await base44.asServiceRole.entities.CreditReconciliationLog.create({
        functionName: 'transferCreditsToPool',
        mailingBatchId: null, // not applicable for this function
        userId: user.id,
        orgId: user.orgId,
        expectedDeduction: amount,
        freshBalance: freshPersonalBalance,
        shortfallAmount: amount - freshPersonalBalance,
        resolvedAmount: 0,
        action: 'rejected_insufficient_fresh',
        notes: 'Transfer rejected after fresh balance check to prevent overdraft.',
        timestamp: new Date().toISOString(),
        resolved: false
      }).catch(logErr => console.error('[BATCH3][transferCreditsToPool] Reconciliation log write failed', { message: logErr?.message }));

      return Response.json({
        error: 'Transfer could not be completed due to a recent balance change'
      }, { status: 409 });
    }

    // Calculate new balances from FRESH values
    const newPersonalCredits = freshPersonalBalance - amount;
    const newOrgBalance = freshOrgPoolBalance + amount;

    // Update user's personal credit balance
    await base44.asServiceRole.entities.User.update(user.id, {
      personalPurchasedCredits: newPersonalCredits
    });

    // Update organization's credit balance
    await base44.asServiceRole.entities.Organization.update(organization.id, {
      creditBalance: newOrgBalance
    });

    // Create transaction record for user (allocation out)
    await base44.asServiceRole.entities.Transaction.create({
      fromAccountId: user.id,
      fromAccountType: 'user',
      toAccountId: organization.id,
      toAccountType: 'company',
      orgId: user.orgId,
      userId: user.id,
      type: 'allocation_out',
      amount: -amount,
      balanceAfter: newPersonalCredits,
      balanceType: 'user',
      description: `Transferred ${amount} credits from personal balance to organization pool`,
      metadata: {
        transferType: 'personal_to_pool',
        previousPersonalBalance: freshPersonalBalance,
        previousOrgBalance: freshOrgPoolBalance,
        creditType: 'personalPurchasedCredits',
        freshRead: true
      }
    });

    // Create transaction record for organization (allocation in)
    await base44.asServiceRole.entities.Transaction.create({
      fromAccountId: user.id,
      fromAccountType: 'user',
      toAccountId: organization.id,
      toAccountType: 'company',
      orgId: user.orgId,
      userId: user.id,
      type: 'allocation_in',
      amount: amount,
      balanceAfter: newOrgBalance,
      balanceType: 'organization',
      description: `Received ${amount} credits from ${user.full_name}'s personal balance`,
      metadata: {
        transferType: 'personal_to_pool',
        transferredBy: user.id,
        transferredByName: user.full_name,
        previousOrgBalance: freshOrgPoolBalance,
        creditType: 'companyPool',
        freshRead: true
      }
    });

    return Response.json({
      success: true,
      message: `Successfully transferred ${amount} credits to organization pool`,
      transferred: amount,
      personalCreditsAfter: newPersonalCredits,
      organizationPoolAfter: newOrgBalance
    });

  } catch (error) {
    console.error('[transferCreditsToPool] Unexpected error', { message: error?.message });
    return Response.json(
      {
        error: 'Failed to transfer credits to pool'
      },
      { status: 500 }
    );
  }
});
