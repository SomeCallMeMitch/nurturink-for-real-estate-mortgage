import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Get team member credit usage for organization admins
 * UPDATED: Now includes company pool access status
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user has organization
    if (!user.orgId) {
      return Response.json(
        { error: 'User does not belong to an organization' },
        { status: 400 }
      );
    }
    
    // Verify user is organization owner (check both appRole and isOrgOwner flag)
    const isOrgOwner = user.appRole === 'organization_owner' || user.isOrgOwner === true;
    
    if (!isOrgOwner) {
      return Response.json(
        { error: 'Only organization owners can view team member usage' },
        { status: 403 }
      );
    }
    
    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Get all team members in organization (excluding org owners)
    const teamMembers = await base44.asServiceRole.entities.User.filter({
      orgId: user.orgId,
      appRole: 'sales_rep' // Only include sales reps
    });
    
    // For each team member, get their usage this month
    const memberUsagePromises = teamMembers.map(async (member) => {
      // Get deduction transactions for this member this month
      const transactions = await base44.asServiceRole.entities.Transaction.filter({
        orgId: user.orgId,
        userId: member.id,
        type: 'deduction',
        created_date: {
          $gte: startOfMonth.toISOString(),
          $lte: endOfMonth.toISOString()
        }
      });
      
      // Calculate credits used (absolute value since deductions are negative)
      const creditsUsed = transactions.reduce((sum, t) => {
        return sum + Math.abs(t.amount);
      }, 0);
      
      // Get last transaction date
      let lastUsed = null;
      if (transactions.length > 0) {
        // Transactions are sorted by -created_date, so first one is most recent
        lastUsed = transactions[0].created_date;
      }
      
      // Calculate total personal balance (allocated + purchased)
      const companyAllocated = member.companyAllocatedCredits || 0;
      const personalPurchased = member.personalPurchasedCredits || 0;
      const personalBalance = companyAllocated + personalPurchased;
      
      // Check company pool access
      const canAccessCompanyPool = member.canAccessCompanyPool !== false; // Default to true
      
      return {
        userId: member.id,
        name: member.full_name || member.email,
        email: member.email,
        creditsUsed: creditsUsed,
        lastUsed: lastUsed,
        personalBalance: personalBalance,
        companyAllocatedCredits: companyAllocated,
        personalPurchasedCredits: personalPurchased,
        canAccessCompanyPool: canAccessCompanyPool
      };
    });
    
    const memberUsage = await Promise.all(memberUsagePromises);
    
    // Sort by credits used (descending)
    memberUsage.sort((a, b) => b.creditsUsed - a.creditsUsed);
    
    return Response.json({
      teamMembers: memberUsage,
      monthStart: startOfMonth.toISOString(),
      monthEnd: endOfMonth.toISOString()
    });
    
  } catch (error) {
    console.error('Error in getTeamMemberUsage:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to get team member usage',
        details: error.stack
      },
      { status: 500 }
    );
  }
});