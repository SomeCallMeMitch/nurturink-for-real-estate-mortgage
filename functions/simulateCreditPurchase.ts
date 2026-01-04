import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Simulate a credit purchase for testing purposes
 * Adds personal credits directly to the current user's personalPurchasedCredits
 * 
 * FOR DEVELOPMENT/TESTING ONLY
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('\n========================================');
    console.log('🎭 SIMULATE CREDIT PURCHASE (Personal)');
    console.log('========================================');
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      console.error('❌ Unauthorized: No authenticated user');
      return Response.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    
    console.log('👤 Authenticated user:', user.email);
    console.log('🔑 User ID:', user.id);
    console.log('🏢 User orgId:', user.orgId);
    
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    
    // Default to 20 credits if not specified
    const creditAmount = body.creditAmount || 20;
    const description = body.description || `Test credits: ${creditAmount} personal credits added`;
    
    console.log('📦 Adding credits:', creditAmount);
    
    // Validate credit amount
    if (creditAmount <= 0) {
      console.error('❌ Invalid credit amount:', creditAmount);
      return Response.json(
        { error: 'creditAmount must be a positive number' },
        { status: 400 }
      );
    }
    
    // Get current personal balance
    const currentBalance = user.personalPurchasedCredits || 0;
    const newBalance = currentBalance + creditAmount;
    
    console.log(`💳 Personal balance: ${currentBalance} → ${newBalance}`);
    
    // Update user's personalPurchasedCredits
    await base44.asServiceRole.entities.User.update(user.id, {
      personalPurchasedCredits: newBalance
    });
    
    console.log('✅ User balance updated');
    
    // Create transaction record with ALL required fields
    const transactionRecord = await base44.asServiceRole.entities.Transaction.create({
      // Required fields
      fromAccountType: 'platform',
      toAccountId: user.id,
      toAccountType: 'user',
      orgId: user.orgId || 'no-org',
      userId: user.id,
      type: 'voucher',
      amount: creditAmount,
      balanceAfter: newBalance,
      balanceType: 'user',
      description: description,
      // Optional metadata
      metadata: {
        source: 'simulated_dev_tool',
        simulatedBy: user.email,
        simulatedAt: new Date().toISOString(),
        previousBalance: currentBalance
      }
    });
    
    console.log('✅ Transaction record created:', transactionRecord.id);
    console.log('========================================');
    console.log('✅ SIMULATION COMPLETE');
    console.log('========================================\n');
    
    return Response.json({
      success: true,
      message: `Successfully added ${creditAmount} personal credits!`,
      creditsAdded: creditAmount,
      previousBalance: currentBalance,
      newBalance: newBalance,
      targetEmail: user.email,
      transactionId: transactionRecord.id
    });
    
  } catch (error) {
    console.error('========================================');
    console.error('❌ ERROR IN SIMULATED PURCHASE');
    console.error('========================================');
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================================\n');
    
    return Response.json(
      { 
        success: false,
        error: error.message || 'Failed to simulate credit purchase',
        details: error.stack
      },
      { status: 500 }
    );
  }
});