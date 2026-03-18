import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Reset all credits for the current user and their organization to zero.
 * Useful for clearing "bad" state from previous testing.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Update User Credits (Personal & Allocated)
    await base44.asServiceRole.entities.User.update(user.id, {
      personalPurchasedCredits: 0,
      companyAllocatedCredits: 0
    });
    
    // Create audit log for user reset
    await base44.asServiceRole.entities.Transaction.create({
      fromAccountId: user.id,
      fromAccountType: 'user',
      toAccountId: user.id,
      toAccountType: 'user',
      orgId: user.orgId || 'no-org',
      userId: user.id,
      type: 'deduction', // Using deduction to indicate removal
      amount: 0, // Symbolic, real change is in balanceAfter
      balanceAfter: 0,
      balanceType: 'user',
      description: 'Manual Reset: Cleared personal and allocated credits',
      metadata: {
        action: 'reset_credits',
        previousPersonal: user.personalPurchasedCredits,
        previousAllocated: user.companyAllocatedCredits
      }
    });

    let orgResetMessage = 'No organization found or not owner';
    
    // Update Organization Credits (if Owner)
    if (user.orgId && (user.appRole === 'organization_owner' || user.isOrgOwner)) {
      const orgs = await base44.asServiceRole.entities.Organization.filter({ id: user.orgId });
      if (orgs.length > 0) {
        const org = orgs[0];
        
        await base44.asServiceRole.entities.Organization.update(org.id, {
          creditBalance: 0
        });
        
        // Create audit log for org reset
        await base44.asServiceRole.entities.Transaction.create({
          fromAccountId: user.id,
          fromAccountType: 'user',
          toAccountId: org.id,
          toAccountType: 'company',
          orgId: org.id,
          userId: user.id,
          type: 'deduction',
          amount: 0,
          balanceAfter: 0,
          balanceType: 'organization',
          description: 'Manual Reset: Cleared organization credit pool',
          metadata: {
            action: 'reset_credits',
            previousBalance: org.creditBalance
          }
        });
        
        orgResetMessage = 'Organization pool cleared';
      }
    }

    return Response.json({
      success: true,
      message: 'Credits reset successfully',
      details: {
        userCredits: 'Cleared (Personal & Allocated)',
        orgCredits: orgResetMessage
      }
    });
    
  } catch (error) {
    console.error('Error in resetCredits:', error);
    return Response.json(
      { error: error.message || 'Failed to reset credits' },
      { status: 500 }
    );
  }
});