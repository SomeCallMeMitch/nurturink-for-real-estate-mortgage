import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { isOrgAdmin } from './utils/roleHelpers.ts';

/**
 * Transfer credits from user's personal balance to organization pool
 * 
 * Allows organization owners AND managers to move their personally purchased credits
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
    
    // Verify user is organization admin (owner or manager)
    if (!isOrgAdmin(user)) {
      return Response.json(
        { error: 'Only organization owners and managers can transfer credits to the pool' },
        { status: 403 }
      );
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
          error: 'Insufficient personal credits',
          available: currentPersonalCredits,
          requested: amount,
          deficit: amount - currentPersonalCredits
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
    
    // Calculate new balances
    const newPersonalCredits = currentPersonalCredits - amount;
    const newOrgBalance = currentOrgBalance + amount;
    
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
        previousPersonalBalance: currentPersonalCredits,
        previousOrgBalance: currentOrgBalance,
        creditType: 'personalPurchasedCredits'
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
        previousOrgBalance: currentOrgBalance,
        creditType: 'companyPool'
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
    console.error('Error in transferCreditsToPool:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to transfer credits to pool',
        details: error.stack
      },
      { status: 500 }
    );
  }
});
