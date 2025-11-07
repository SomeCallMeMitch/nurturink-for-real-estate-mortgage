import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Simulate a credit purchase for testing purposes
 * Bypasses Stripe and directly adds credits to user or organization
 * 
 * FOR DEVELOPMENT/TESTING ONLY
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
      console.error('❌ Unauthorized: No authenticated user');
      return Response.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    
    console.log('👤 Authenticated user:', user.email);
    console.log('🔑 User role:', user.appRole);
    console.log('🏢 User orgId:', user.orgId);
    console.log('👑 Is org owner:', user.isOrgOwner);
    
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    
    const { 
      creditAmount, 
      purchaseType, 
      targetUserId, 
      targetOrgId,
      description 
    } = body;
    
    console.log('📦 Request parameters:');
    console.log('  - creditAmount:', creditAmount);
    console.log('  - purchaseType:', purchaseType);
    console.log('  - targetUserId:', targetUserId);
    console.log('  - targetOrgId:', targetOrgId);
    console.log('  - description:', description);
    
    // Validate required inputs
    if (!creditAmount || creditAmount <= 0) {
      console.error('❌ Invalid credit amount:', creditAmount);
      return Response.json(
        { error: 'creditAmount must be a positive number' },
        { status: 400 }
      );
    }
    
    if (!purchaseType || !['user', 'organization'].includes(purchaseType)) {
      console.error('❌ Invalid purchase type:', purchaseType);
      return Response.json(
        { error: 'purchaseType must be "user" or "organization"' },
        { status: 400 }
      );
    }
    
    // Determine target based on purchase type
    let targetUser = user;
    let targetOrg = null;
    
    if (purchaseType === 'user') {
      // User purchase - can target self or (if admin) another user
      if (targetUserId && targetUserId !== user.id) {
        // Check if user has permission to add credits to other users
        if (user.appRole !== 'super_admin') {
          console.error('❌ Permission denied: Only super_admin can add credits to other users');
          return Response.json(
            { error: 'Only super admins can add credits to other users' },
            { status: 403 }
          );
        }
        
        // Load target user
        console.log('🔍 Loading target user:', targetUserId);
        const users = await base44.asServiceRole.entities.User.filter({ id: targetUserId });
        if (!users || users.length === 0) {
          console.error('❌ Target user not found:', targetUserId);
          return Response.json(
            { error: 'Target user not found' },
            { status: 404 }
          );
        }
        targetUser = users[0];
        console.log('✅ Target user loaded:', targetUser.email);
      }
      
    } else if (purchaseType === 'organization') {
      // Organization purchase - must be org owner
      const isOrgOwner = user.appRole === 'organization_owner' || user.isOrgOwner === true;
      
      console.log('🔍 Checking org owner permission:', isOrgOwner);
      
      if (!isOrgOwner && user.appRole !== 'super_admin') {
        console.error('❌ Permission denied: User is not an organization owner or super admin');
        return Response.json(
          { error: 'Only organization owners or super admins can add organization credits' },
          { status: 403 }
        );
      }
      
      // Determine which organization to credit
      const orgIdToCredit = targetOrgId || user.orgId;
      
      if (!orgIdToCredit) {
        console.error('❌ No organization ID provided or associated with user');
        return Response.json(
          { error: 'No organization specified and user is not part of an organization' },
          { status: 400 }
        );
      }
      
      // Load organization
      console.log('🔍 Loading organization:', orgIdToCredit);
      const orgs = await base44.asServiceRole.entities.Organization.filter({ 
        id: orgIdToCredit 
      });
      
      if (!orgs || orgs.length === 0) {
        console.error('❌ Organization not found:', orgIdToCredit);
        return Response.json(
          { error: 'Organization not found' },
          { status: 404 }
        );
      }
      
      targetOrg = orgs[0];
      console.log('✅ Organization loaded:', targetOrg.name);
      
      // Additional permission check: if targeting different org, must be super_admin
      if (targetOrgId && targetOrgId !== user.orgId && user.appRole !== 'super_admin') {
        console.error('❌ Permission denied: Only super_admin can add credits to other organizations');
        return Response.json(
          { error: 'Only super admins can add credits to other organizations' },
          { status: 403 }
        );
      }
    }
    
    // Process credit addition
    const credits = parseInt(creditAmount);
    let newBalance;
    let transactionRecord;
    
    if (purchaseType === 'user') {
      // Add credits to user
      const currentBalance = targetUser.creditBalance || 0;
      newBalance = currentBalance + credits;
      
      console.log(`💳 User balance: ${currentBalance} → ${newBalance}`);
      
      // Update user credit balance
      await base44.asServiceRole.entities.User.update(targetUser.id, {
        creditBalance: newBalance
      });
      
      console.log('✅ User balance updated');
      
      // Create transaction record
      const txDescription = description || `Simulated purchase: ${credits} credits added`;
      
      transactionRecord = await base44.asServiceRole.entities.Transaction.create({
        orgId: targetUser.orgId || '',
        userId: targetUser.id,
        type: 'voucher',
        amount: credits,
        balanceAfter: newBalance,
        balanceType: 'user',
        description: txDescription,
        metadata: {
          source: 'simulated_dev_tool',
          simulatedBy: user.email,
          simulatedAt: new Date().toISOString(),
          previousBalance: currentBalance
        }
      });
      
      console.log('✅ Transaction record created:', transactionRecord.id);
      console.log(`✅ Simulated user purchase complete: ${credits} credits added to ${targetUser.email}`);
      
    } else {
      // Add credits to organization
      const currentBalance = targetOrg.creditBalance || 0;
      newBalance = currentBalance + credits;
      
      console.log(`💳 Organization balance: ${currentBalance} → ${newBalance}`);
      
      // Update organization credit balance
      await base44.asServiceRole.entities.Organization.update(targetOrg.id, {
        creditBalance: newBalance
      });
      
      console.log('✅ Organization balance updated');
      
      // Create transaction record
      const txDescription = description || `Simulated purchase: ${credits} credits added to organization pool`;
      
      transactionRecord = await base44.asServiceRole.entities.Transaction.create({
        orgId: targetOrg.id,
        userId: user.id,
        type: 'voucher',
        amount: credits,
        balanceAfter: newBalance,
        balanceType: 'organization',
        description: txDescription,
        metadata: {
          source: 'simulated_dev_tool',
          simulatedBy: user.email,
          simulatedAt: new Date().toISOString(),
          previousBalance: currentBalance
        }
      });
      
      console.log('✅ Transaction record created:', transactionRecord.id);
      console.log(`✅ Simulated organization purchase complete: ${credits} credits added to ${targetOrg.name}`);
    }
    
    console.log('========================================');
    console.log('✅ SIMULATION COMPLETE');
    console.log('========================================\n');
    
    return Response.json({
      success: true,
      message: `Successfully added ${credits} credits!`,
      creditsAdded: credits,
      previousBalance: newBalance - credits,
      newBalance: newBalance,
      purchaseType: purchaseType,
      targetEntity: purchaseType === 'user' 
        ? targetUser.email 
        : targetOrg.name,
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