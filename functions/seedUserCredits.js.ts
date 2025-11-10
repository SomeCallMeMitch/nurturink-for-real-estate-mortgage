import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

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
    
    // Get current credit balance
    const currentBalance = user.creditBalance || 0;
    const newBalance = currentBalance + creditAmount;
    
    // Update user's credit balance
    await base44.auth.updateMe({
      creditBalance: newBalance
    });
    
    // Create transaction record
    await base44.asServiceRole.entities.Transaction.create({
      orgId: user.orgId,
      userId: user.id,
      type: 'voucher',
      amount: creditAmount,
      balanceAfter: newBalance,
      balanceType: 'user',
      description: `Test credit seed: Added ${creditAmount} credits`,
      metadata: {
        source: 'test_seed',
        previousBalance: currentBalance
      }
    });
    
    return Response.json({
      success: true,
      message: `Successfully added ${creditAmount} credits!`,
      previousBalance: currentBalance,
      newBalance: newBalance,
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