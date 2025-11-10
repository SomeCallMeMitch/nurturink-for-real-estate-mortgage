import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Seed test credits for development/testing
 * Adds credits to companyAllocatedCredits (simulating company allocation)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    
    // Parse request body for credit amount (default to 20)
    let creditAmount = 20;
    try {
      const body = await req.json();
      creditAmount = body.creditAmount || 20;
    } catch {
      // If no body, use default
    }
    
    // Get current balances
    const currentCompanyAllocated = user.companyAllocatedCredits || 0;
    const newCompanyAllocated = currentCompanyAllocated + creditAmount;
    
    // Update user's company-allocated credit balance
    await base44.auth.updateMe({
      companyAllocatedCredits: newCompanyAllocated
    });
    
    // Create transaction record
    await base44.asServiceRole.entities.Transaction.create({
      orgId: user.orgId,
      userId: user.id,
      type: 'voucher',
      amount: creditAmount,
      balanceAfter: newCompanyAllocated,
      balanceType: 'user',
      description: `Test credit seed: Added ${creditAmount} company-allocated credits`,
      metadata: {
        source: 'test_seed',
        previousBalance: currentCompanyAllocated,
        creditType: 'companyAllocatedCredits'
      }
    });
    
    return Response.json({
      success: true,
      message: `Successfully added ${creditAmount} company-allocated credits!`,
      previousBalance: currentCompanyAllocated,
      newBalance: newCompanyAllocated,
      creditsAdded: creditAmount
    });
    
  } catch (error) {
    console.error('Error in seedUserCredits:', error);
    return Response.json(
      { 
        success: false,
        error: error.message || 'Failed to seed credits',
        details: error.stack
      },
      { status: 500 }
    );
  }
});