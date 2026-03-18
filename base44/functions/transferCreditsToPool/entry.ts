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
    
    // Calculate new balances
    const newPersonalCredits = currentPersonalCredits - amount;
    const newOrgBalance = currentOrgBalance + amount;
    
    console.log('=== BALANCE CALCULATIONS ===');
    console.log('newPersonalCredits:', newPersonalCredits);
    console.log('newOrgBalance:', newOrgBalance);
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
    
    // Create transaction record for user (allocation out - using existing schema type)
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
        previousPersonalBalance: currentPersonalCredits,
        previousOrgBalance: currentOrgBalance,
        creditType: 'personalPurchasedCredits'
      }
    });
    
    // Create transaction record for organization (allocation in - using existing schema type)
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
        previousOrgBalance: currentOrgBalance,
        creditType: 'companyPool'
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