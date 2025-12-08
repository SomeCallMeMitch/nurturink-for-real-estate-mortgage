import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Allocate credits from organization pool to team members
 * Only organization owners can perform this action
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
    
    // Verify user is organization owner (check both appRole and isOrgOwner flag)
    const isOrgOwner = user.appRole === 'organization_owner' || user.isOrgOwner === true;
    
    if (!isOrgOwner) {
      return Response.json(
        { error: 'Only organization owners can allocate credits' },
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
    
    // Fetch whitelabel settings for logo
    let logoUrl = `${Deno.env.get("APP_URL")}/logo.png`;
    try {
      const whitelabelSettings = await base44.asServiceRole.entities.WhitelabelSettings.filter({}, '', 1);
      if (whitelabelSettings.length > 0 && whitelabelSettings[0].logoUrl) {
        logoUrl = whitelabelSettings[0].logoUrl;
      }
    } catch (error) {
      console.error('Failed to fetch whitelabel settings for logo:', error);
      // Continue with default logo URL
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
      
      const updatedUser = await base44.asServiceRole.entities.User.update(userId, {
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
        fromAccountType: 'company',
        toAccountId: userId,
        toAccountType: 'user',
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
        userEmail: teamMember.email,
        success: true,
        amount: amount,
        newBalance: newCompanyAllocated,
        updatedUser: updatedUser
      });
      
      // Send email notification to the team member
      try {
        await base44.functions.invoke('sendCreditsAllocatedEmail', {
          member_firstName: teamMember.full_name?.split(' ')[0] || teamMember.email,
          member_email: teamMember.email,
          admin_name: user.full_name || user.email,
          credits_allocated: amount,
          allocation_date: new Date().toLocaleString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          new_personal_balance: newCompanyAllocated,
          org_pool_available: newOrgBalance,
          send_note_url: `${Deno.env.get("APP_URL")}/FindClients`,
          app_logo_url: logoUrl
        });
      } catch (emailError) {
        console.error(`Failed to send allocation email to ${teamMember.email}:`, emailError);
        // Don't fail the allocation if email fails
      }
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
      fromAccountType: 'company',
      toAccountId: organization.id,
      toAccountType: 'company',
      description: `Allocated ${totalToAllocate} credits to team members`,
      metadata: {
        allocationCount: allocationResults.filter(r => r.success).length,
        allocations: allocations
      }
    });
    
    // Send summary email to the allocating admin
    const successfulAllocations = allocationResults.filter(r => r.success);
    if (successfulAllocations.length > 0) {
      try {
        // Get other admins in the organization for notification (optional)
        const allAdmins = await base44.asServiceRole.entities.User.filter({
          orgId: user.orgId,
          isOrgOwner: true
        });
        
        const otherAdminEmails = allAdmins
          .filter(admin => admin.id !== user.id)
          .map(admin => admin.email);
        
        // Prepare allocation summary for email
        const allocationsSummary = successfulAllocations.map(result => ({
          member_name: result.userName,
          credits_allocated: result.amount
        }));
        
        // Send to allocating admin
        await base44.functions.invoke('sendCreditAllocationTeamNotif', {
          other_admins_emails: [user.email, ...otherAdminEmails],
          admin_firstNames: [user.full_name?.split(' ')[0] || 'Admin', ...otherAdminEmails.map(() => 'Admin')],
          allocating_admin_name: user.full_name || user.email,
          organization_name: organization.name,
          allocations: allocationsSummary,
          remaining_org_pool: newOrgBalance,
          allocation_date: new Date().toLocaleString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          team_management_url: `${Deno.env.get("APP_URL")}/TeamManagement`,
          app_logo_url: logoUrl
        });
      } catch (emailError) {
        console.error('Failed to send admin summary email:', emailError);
        // Don't fail the allocation if email fails
      }
    }
    
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