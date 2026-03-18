import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Simulate a credit purchase for testing purposes
 * mimic logic of handleStripeWebhook for 'purchase_completed'
 * 
 * Supports:
 * - purchaseType: 'personal' -> Updates User.personalPurchasedCredits
 * - purchaseType: 'company' -> Updates Organization.creditBalance
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('\n========================================');
    console.log('🎭 SIMULATE CREDIT PURCHASE');
    console.log('========================================');
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    
    const creditAmount = body.creditAmount || 20;
    const purchaseType = body.purchaseType || 'personal'; // 'personal' or 'company'
    
    console.log(`📦 Type: ${purchaseType}, Amount: ${creditAmount}`);

    if (creditAmount <= 0) {
      return Response.json({ error: 'creditAmount must be positive' }, { status: 400 });
    }

    let newBalance = 0;
    let transactionRecord = null;
    let successMessage = '';

    if (purchaseType === 'company') {
        // --- COMPANY PURCHASE ---
        if (!user.orgId) {
            return Response.json({ error: 'User does not belong to an organization' }, { status: 400 });
        }

        const orgs = await base44.asServiceRole.entities.Organization.filter({ id: user.orgId });
        if (orgs.length === 0) return Response.json({ error: 'Organization not found' }, { status: 404 });
        const org = orgs[0];

        const currentBalance = org.creditBalance || 0;
        newBalance = currentBalance + creditAmount;

        // Update Org Balance
        await base44.asServiceRole.entities.Organization.update(org.id, {
            creditBalance: newBalance
        });

        // Create Transaction
        transactionRecord = await base44.asServiceRole.entities.Transaction.create({
            fromAccountId: null, // External source (Stripe)
            fromAccountType: 'platform', 
            toAccountId: org.id,
            toAccountType: 'company',
            orgId: org.id,
            userId: user.id,
            type: 'purchase_org', // Matching real webhook type
            amount: creditAmount,
            balanceAfter: newBalance,
            balanceType: 'organization',
            description: `Simulated Purchase: ${creditAmount} credits for Company Pool`,
            metadata: {
                source: 'simulation',
                simulatedBy: user.email
            }
        });
        
        successMessage = `Successfully purchased ${creditAmount} credits for Company Pool!`;

    } else {
        // --- PERSONAL PURCHASE ---
        const currentBalance = user.personalPurchasedCredits || 0;
        newBalance = currentBalance + creditAmount;

        // Update User Balance
        await base44.asServiceRole.entities.User.update(user.id, {
            personalPurchasedCredits: newBalance
        });

        // Create Transaction
        transactionRecord = await base44.asServiceRole.entities.Transaction.create({
            fromAccountId: null,
            fromAccountType: 'platform',
            toAccountId: user.id,
            toAccountType: 'user',
            orgId: user.orgId || 'no-org',
            userId: user.id,
            type: 'purchase_user', // Matching real webhook type
            amount: creditAmount,
            balanceAfter: newBalance,
            balanceType: 'user',
            description: `Simulated Purchase: ${creditAmount} personal credits`,
            metadata: {
                source: 'simulation',
                simulatedBy: user.email
            }
        });

        successMessage = `Successfully purchased ${creditAmount} personal credits!`;
    }

    console.log('✅ Balance updated');
    console.log('✅ Transaction created:', transactionRecord.id);

    return Response.json({
      success: true,
      message: successMessage,
      creditsAdded: creditAmount,
      newBalance: newBalance,
      purchaseType: purchaseType
    });
    
  } catch (error) {
    console.error('❌ ERROR IN SIMULATED PURCHASE:', error);
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