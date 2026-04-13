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
    
    console.log('========================================');
    console.log('transferCreditsToPool FUNCTION CALLED');
    console.log('========================================');
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    
    console.log('=== USER DATA FROM auth.me() ===');
    console.log('User object:', JSON.stringify(user, null, 2));
    console.log('User ID:', user?.id);
    console.log('User email:', user?.email);
    console.log('User appRole:', user?.appRole);
    console.log('User isOrgOwner:', user?.isOrgOwner);
    console.log('User orgId:', user?.orgId);
    console.log('personalPurchasedCredits:', user?.personalPurchasedCredits);
    console.log('companyAllocatedCredits:', user?.companyAllocatedCredits);
    console.log('creditBalance (legacy):', user?.creditBalance);
    console.log('All user keys:', user ? Object.keys(user) : 'user is null');
    console.log('=== END USER DATA ===');
    
    if (!user) {
      console.log('ERROR: User not authenticated');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is organization owner (check both appRole and isOrgOwner flag)
    const isOrgOwner = user.appRole === 'organization_owner' || user.isOrgOwner === true;
    console.log('isOrgOwner check result:', isOrgOwner);
    
    if (!isOrgOwner) {
      console.log('ERROR: User is not org owner');
      return Response.json(
        { error: 'Only organization owners can transfer credits to the pool' },
        { status: 403 }
      );
    }
    
    // Verify user has organization
    if (!user.orgId) {
      console.log('ERROR: User has no orgId');
      return Response.json(
        { error: 'User does not belong to an organization' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { amount } = body;
    
    console.log('=== REQUEST BODY ===');
    console.log('Body:', JSON.stringify(body, null, 2));
    console.log('Amount requested:', amount);
    console.log('Amount type:', typeof amount);
    console.log('=== END REQUEST BODY ===');
    
    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.log('ERROR: Invalid amount - not a positive number');
      return Response.json(
        { error: 'amount must be a positive number' },
        { status: 400 }
      );
    }
    
    // Check if amount is a whole number
    if (!Number.isInteger(amount)) {
      console.log('ERROR: Amount is not a whole number');
      return Response.json(
        { error: 'amount must be a whole number' },
        { status: 400 }
      );
    }
    
    // Get user's current personal credit balance
    const currentPersonalCredits = user.personalPurchasedCredits || 0;
    
    console.log('=== CREDIT CHECK ===');
    console.log('currentPersonalCredits:', currentPersonalCredits);
    console.log('amount requested:', amount);
    console.log('Has enough?:', currentPersonalCredits >= amount);
    console.log('=== END CREDIT CHECK ===');
    
    // Verify user has enough personal credits
    if (currentPersonalCredits < amount) {
      console.log('ERROR: Insufficient credits');
      console.log('Available:', currentPersonalCredits);
      console.log('Requested:', amount);
      return Response.json(
        { 
          error: 'Insufficient personal credits',
          available: currentPersonalCredits,
          requested: amount,
          deficit: amount - currentPersonalCredits,
          debug: {
            userPersonalPurchasedCredits: user.personalPurchasedCredits,
            userCompanyAllocatedCredits: user.companyAllocatedCredits,
            userCreditBalance: user.creditBalance,
            allUserFields: Object.keys(user)
          }
        },
        { status: 400 }
      );
    }
    
    // Load organization
    const orgs = await base44.asServiceRole.entities.Organization.filter({ 
      id: user.orgId 
    });
    
    if (!orgs || orgs.length === 0) {
      console.log('ERROR: Organization not found');
      return Response.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    const organization = orgs[0];
    const currentOrgBalance = organization.creditBalance || 0;
    
    console.log('=== ORGANIZATION DATA ===');
    console.log('Organization:', JSON.stringify(organization, null, 2));
    console.log('currentOrgBalance:', currentOrgBalance);
    console.log('=== END ORGANIZATION DATA ===');
    
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
      console.warn(`[BATCH3][transferCreditsToPool] CONFLICT: stale=${currentPersonalCredits}, fresh=${freshPersonalBalance}, requested=${amount}`);
      await base44.asServiceRole.entities.CreditReconciliationLog.create({
        functionName: 'transferCreditsToPool',
        userId: user.id,
        orgId: user.orgId,
        expectedDeduction: amount,
        freshBalance: freshPersonalBalance,
        shortfallAmount: amount - freshPersonalBalance,
        resolvedAmount: 0,
        action: 'rejected_insufficient_fresh',
        notes: `Transfer rejected: stale balance check showed ${currentPersonalCredits} available but fresh read shows ${freshPersonalBalance}. Request for ${amount} credits denied to prevent overdraft.`,
        timestamp: new Date().toISOString()
      }).catch(logErr => console.error('[BATCH3][transferCreditsToPool] CreditReconciliationLog write failed:', logErr.message));

      return Response.json({
        error: 'Insufficient personal credits (balance changed before transfer could complete)',
        available: freshPersonalBalance,
        requested: amount,
        deficit: amount - freshPersonalBalance
      }, { status: 409 });
    }

    // Calculate new balances from FRESH values
    const newPersonalCredits = freshPersonalBalance - amount;
    const newOrgBalance = freshOrgPoolBalance + amount;

    console.log('=== BALANCE CALCULATIONS (BATCH3-C fresh-read) ===');
    console.log('freshPersonalBalance:', freshPersonalBalance, '->', newPersonalCredits);
    console.log('freshOrgPoolBalance:', freshOrgPoolBalance, '->', newOrgBalance);
    console.log('=== END CALCULATIONS ===');

    // Update user's personal credit balance
    console.log('Updating user personalPurchasedCredits to:', newPersonalCredits);
    await base44.asServiceRole.entities.User.update(user.id, {
      personalPurchasedCredits: newPersonalCredits
    });

    // Update organization's credit balance
    console.log('Updating organization creditBalance to:', newOrgBalance);
    await base44.asServiceRole.entities.Organization.update(organization.id, {
      creditBalance: newOrgBalance
    });

    // Create transaction record for user (allocation out)
    console.log('Creating user transaction record...');
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
    console.log('Creating organization transaction record...');
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

    console.log('========================================');
    console.log('TRANSFER SUCCESSFUL');
    console.log('========================================');

    return Response.json({
      success: true,
      message: `Successfully transferred ${amount} credits to organization pool`,
      transferred: amount,
      personalCreditsAfter: newPersonalCredits,
      organizationPoolAfter: newOrgBalance
    });
    
  } catch (error) {
    console.error('========================================');
    console.error('ERROR in transferCreditsToPool:', error);
    console.error('Error stack:', error.stack);
    console.error('========================================');
    return Response.json(
      { 
        error: error.message || 'Failed to transfer credits to pool',
        details: error.stack
      },
      { status: 500 }
    );
  }
});