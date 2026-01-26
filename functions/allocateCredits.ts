import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Allocate credits from organization pool to team members
 * Organization owners AND managers can perform this action
 * Credits are allocated to user.companyAllocatedCredits
 * 
 * When a manager allocates credits, the owner is notified via email
 * 
 * @version 2026-01-26-inlined-with-notification
 */

// =============================================================================
// INLINED ROLE CONSTANTS AND HELPERS
// =============================================================================

const ORG_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  MEMBER: 'member',
};

const APP_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORGANIZATION_OWNER: 'organization_owner',
  ORGANIZATION_MANAGER: 'organization_manager',
  SALES_REP: 'sales_rep',
};

function mapLegacyAppRoleToOrgRole(appRole, isOrgOwnerFlag) {
  if (isOrgOwnerFlag || appRole === APP_ROLES.ORGANIZATION_OWNER) {
    return ORG_ROLES.OWNER;
  }
  if (appRole === APP_ROLES.ORGANIZATION_MANAGER) {
    return ORG_ROLES.MANAGER;
  }
  return ORG_ROLES.MEMBER;
}

async function getUserProfile(base44, userId, orgId) {
  try {
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      userId: userId,
      orgId: orgId
    });
    return profiles.length > 0 ? profiles[0] : null;
  } catch (error) {
    console.error('Error fetching UserProfile:', error);
    return null;
  }
}

function isOrgAdmin(user) {
  const orgRole = user.orgProfile?.orgRole;
  const appRole = user.appRole;
  const isOrgOwner = user.isOrgOwner === true;
  
  // Check new orgRole system first
  if (orgRole === ORG_ROLES.OWNER || orgRole === ORG_ROLES.MANAGER) {
    return true;
  }
  
  // Fall back to legacy appRole check
  if (appRole === APP_ROLES.SUPER_ADMIN || 
      appRole === APP_ROLES.ORGANIZATION_OWNER || 
      appRole === APP_ROLES.ORGANIZATION_MANAGER ||
      isOrgOwner) {
    return true;
  }
  
  return false;
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

Deno.serve(async (req) => {
  console.log('=== allocateCredits START (2026-01-26-inlined-with-notification) ===');
  
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Current user:', JSON.stringify({
      id: user.id,
      email: user.email,
      appRole: user.appRole,
      isOrgOwner: user.isOrgOwner,
      orgId: user.orgId
    }));
    
    // Get user's org profile to check permissions
    let userOrgRole = null;
    if (user.orgId) {
      const userProfile = await getUserProfile(base44, user.id, user.orgId);
      userOrgRole = userProfile?.orgRole || mapLegacyAppRoleToOrgRole(user.appRole, user.isOrgOwner);
    }
    
    console.log('User orgRole:', userOrgRole);
    
    // Verify user is organization owner OR manager (check both new orgRole and legacy appRole)
    const canAllocate = isOrgAdmin({ ...user, orgProfile: { orgRole: userOrgRole } });
    
    if (!canAllocate) {
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
      // Credits flow FROM organization pool TO user
      await base44.asServiceRole.entities.Transaction.create({
        orgId: user.orgId,
        userId: userId,
        type: 'allocation_in',
        amount: amount,
        balanceAfter: newCompanyAllocated,
        balanceType: 'user',
        description: `Credit allocation from organization pool by ${user.full_name || user.email}`,
        // Required fields for transaction tracking
        fromAccountId: organization.id,
        fromAccountType: 'company',
        toAccountId: userId,
        toAccountType: 'user',
        metadata: {
          allocatedBy: user.id,
          allocatedByName: user.full_name || user.email,
          creditType: 'companyAllocatedCredits'
        }
      });
      
      allocationResults.push({
        userId: userId,
        userName: teamMember.full_name || teamMember.email,
        success: true,
        amount: amount,
        newBalance: newCompanyAllocated,
        updatedUser: {
          id: userId,
          companyAllocatedCredits: newCompanyAllocated
        }
      });
    }
    
    // Update organization balance
    const newOrgBalance = currentOrgBalance - totalToAllocate;
    
    await base44.asServiceRole.entities.Organization.update(organization.id, {
      creditBalance: newOrgBalance
    });
    
    // Create transaction record for organization (allocation out)
    // Credits flow FROM organization pool TO team members (represented by allocating user as counterparty)
    await base44.asServiceRole.entities.Transaction.create({
      orgId: user.orgId,
      userId: user.id,
      type: 'allocation_out',
      amount: -totalToAllocate,
      balanceAfter: newOrgBalance,
      balanceType: 'organization',
      description: `Allocated ${totalToAllocate} credits to team members`,
      // Required fields for transaction tracking
      fromAccountId: organization.id,
      fromAccountType: 'company',
      toAccountId: user.id,
      toAccountType: 'user',
      metadata: {
        allocationCount: allocationResults.filter(r => r.success).length,
        allocations: allocations
      }
    });
    
    // If a manager (not owner) allocated credits, notify the organization owner(s)
    const isManager = userOrgRole === ORG_ROLES.MANAGER || user.appRole === APP_ROLES.ORGANIZATION_MANAGER;
    const isOwner = userOrgRole === ORG_ROLES.OWNER || user.appRole === APP_ROLES.ORGANIZATION_OWNER || user.isOrgOwner === true;
    
    if (isManager && !isOwner) {
      console.log('Manager allocated credits - notifying owner(s)...');
      
      try {
        // Find organization owners
        const orgOwners = await base44.asServiceRole.entities.User.filter({
          orgId: user.orgId,
          isOrgOwner: true
        });
        
        // Also check for organization_owner appRole
        const orgOwnersByRole = await base44.asServiceRole.entities.User.filter({
          orgId: user.orgId,
          appRole: APP_ROLES.ORGANIZATION_OWNER
        });
        
        // Combine and deduplicate owners
        const ownerEmails = new Set();
        [...orgOwners, ...orgOwnersByRole].forEach(owner => {
          if (owner.email && owner.id !== user.id) {
            ownerEmails.add(owner.email);
          }
        });
        
        // Build allocation summary for email
        const successfulAllocations = allocationResults.filter(r => r.success);
        const allocationSummary = successfulAllocations
          .map(a => `• ${a.userName}: ${a.amount} credits`)
          .join('\n');
        
        // Send notification to each owner
        for (const ownerEmail of ownerEmails) {
          try {
            await base44.integrations.Core.SendEmail({
              to: ownerEmail,
              subject: `Credit Allocation by ${user.full_name || user.email}`,
              body: `Hello,

A manager in your organization has allocated credits from the company pool.

Allocated by: ${user.full_name || user.email}
Total credits allocated: ${totalToAllocate}
New organization pool balance: ${newOrgBalance}

Allocation details:
${allocationSummary}

This is an automated notification. If you have questions about this allocation, please contact the manager directly.

Best regards,
NurturInk Team`,
              from_name: 'NurturInk'
            });
            console.log('Owner notification sent to:', ownerEmail);
          } catch (emailError) {
            console.error('Failed to send owner notification to', ownerEmail, ':', emailError);
          }
        }
      } catch (notifyError) {
        console.error('Error sending owner notifications:', notifyError);
        // Continue - allocation was successful even if notification failed
      }
    }
    
    console.log('=== allocateCredits SUCCESS ===');
    console.log('Total allocated:', totalToAllocate, 'New org balance:', newOrgBalance);
    
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
