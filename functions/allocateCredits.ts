import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { isOrgAdmin, canAllocateCredits } from './utils/roleHelpers.ts';

/**
 * Allocate credits from organization pool to team members
 * Organization owners AND managers can perform this action
 * Credits are allocated to user.companyAllocatedCredits
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user can allocate credits (org owner, org manager, or super admin)
    if (!canAllocateCredits(user)) {
      return Response.json(
        { error: 'Only organization owners and managers can allocate credits' },
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
    const { allocations } = body;
    
    // Validate allocations
    if (!allocations || typeof allocations !== 'object') {
      return Response.json(
        { error: 'allocations must be an object with userId: amount pairs' },
        { status: 400 }
      );
    }
    
    // Calculate total credits to allocate
    const totalToAllocate = Object.values(allocations).reduce((sum, amount) => {
      return sum + (typeof amount === 'number' ? amount : 0);
    }, 0);
    
    if (totalToAllocate <= 0) {
      return Response.json(
        { error: 'Total allocation must be greater than 0' },
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
    
    // Verify organization has enough credits
    if (currentOrgBalance < totalToAllocate) {
      return Response.json(
        { 
          error: 'Insufficient credits in organization pool',
          available: currentOrgBalance,
          requested: totalToAllocate,
          deficit: totalToAllocate - currentOrgBalance
        },
        { status: 400 }
      );
    }
    
    // Process allocations
    const allocationResults = [];
    
    for (const [userId, amount] of Object.entries(allocations)) {
      if (typeof amount !== 'number' || amount <= 0) {
        continue; // Skip invalid allocations
      }
      
      // Load user
      const users = await base44.asServiceRole.entities.User.filter({ 
        id: userId 
      });
      
      if (!users || users.length === 0) {
        allocationResults.push({
          userId: userId,
          success: false,
          error: 'User not found'
        });
        continue;
      }
      
      const teamMember = users[0];
      
      // Verify user belongs to same organization
      if (teamMember.orgId !== user.orgId) {
        allocationResults.push({
          userId: userId,
          success: false,
          error: 'User does not belong to your organization'
        });
        continue;
      }
      
      // Update user's company-allocated credit balance
      const newCompanyAllocated = (teamMember.companyAllocatedCredits || 0) + amount;
      
      await base44.asServiceRole.entities.User.update(userId, {
        companyAllocatedCredits: newCompanyAllocated
      });
      
      // Create transaction record for user (allocation in)
      await base44.asServiceRole.entities.Transaction.create({
        orgId: user.orgId,
        userId: userId,
        type: 'allocation_in',
        amount: amount,
        balanceAfter: newCompanyAllocated,
        balanceType: 'user',
        description: `Credit allocation from organization pool by ${user.full_name}`,
        metadata: {
          allocatedBy: user.id,
          allocatedByName: user.full_name,
          creditType: 'companyAllocatedCredits'
        }
      });
      
      allocationResults.push({
        userId: userId,
        userName: teamMember.full_name || teamMember.email,
        success: true,
        amount: amount,
        newBalance: newCompanyAllocated
      });
    }
    
    // Update organization balance
    const newOrgBalance = currentOrgBalance - totalToAllocate;
    
    await base44.asServiceRole.entities.Organization.update(organization.id, {
      creditBalance: newOrgBalance
    });
    
    // Create transaction record for organization (allocation out)
    await base44.asServiceRole.entities.Transaction.create({
      orgId: user.orgId,
      userId: user.id,
      type: 'allocation_out',
      amount: -totalToAllocate,
      balanceAfter: newOrgBalance,
      balanceType: 'organization',
      description: `Allocated ${totalToAllocate} credits to team members`,
      metadata: {
        allocationCount: allocationResults.filter(r => r.success).length,
        allocations: allocations
      }
    });
    
    return Response.json({
      success: true,
      totalAllocated: totalToAllocate,
      organizationBalanceAfter: newOrgBalance,
      allocations: allocationResults
    });
    
  } catch (error) {
    console.error('Error in allocateCredits:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to allocate credits',
        details: error.stack
      },
      { status: 500 }
    );
  }
});
