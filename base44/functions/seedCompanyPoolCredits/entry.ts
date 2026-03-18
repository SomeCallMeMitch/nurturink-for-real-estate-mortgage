import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Seed test credits for the company pool (development/testing)
 * Adds credits directly to Organization.creditBalance
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    
    // Verify user belongs to an organization
    if (!user.orgId) {
      return Response.json({ error: 'User does not belong to an organization' }, { status: 400 });
    }
    
    // Parse request body for credit amount (default to 200)
    let creditAmount = 200;
    try {
      const body = await req.json();
      creditAmount = body.creditAmount || 200;
    } catch {
      // If no body, use default
    }
    
    // Get the organization
    const orgs = await base44.asServiceRole.entities.Organization.filter({ id: user.orgId });
    if (!orgs || orgs.length === 0) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    const organization = orgs[0];
    const currentBalance = organization.creditBalance || 0;
    const newBalance = currentBalance + creditAmount;
    
    // Update organization's credit balance
    await base44.asServiceRole.entities.Organization.update(organization.id, {
      creditBalance: newBalance
    });
    
    // Create transaction record with all required fields
    await base44.asServiceRole.entities.Transaction.create({
      fromAccountId: null,
      fromAccountType: 'platform',
      toAccountId: organization.id,
      toAccountType: 'company',
      orgId: user.orgId,
      userId: user.id,
      type: 'voucher',
      amount: creditAmount,
      balanceAfter: newBalance,
      balanceType: 'organization',
      description: `Test credit seed: Added ${creditAmount} credits to company pool`,
      metadata: {
        source: 'test_seed',
        previousBalance: currentBalance,
        creditType: 'companyPool'
      }
    });
    
    return Response.json({
      success: true,
      message: `Successfully added ${creditAmount} credits to company pool!`,
      previousBalance: currentBalance,
      newBalance: newBalance,
      creditsAdded: creditAmount
    });
    
  } catch (error) {
    console.error('Error in seedCompanyPoolCredits:', error);
    return Response.json(
      { 
        success: false,
        error: error.message || 'Failed to seed company pool credits',
        details: error.stack
      },
      { status: 500 }
    );
  }
});