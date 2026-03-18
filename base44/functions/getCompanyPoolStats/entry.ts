import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Get company pool credit statistics for organization admins
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
    
    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Get all team members in organization
    const teamMembers = await base44.asServiceRole.entities.User.filter({
      orgId: user.orgId
    });
    
    const teamSize = teamMembers.length;
    
    // Get credits used this month (deduction transactions)
    const monthlyTransactions = await base44.asServiceRole.entities.Transaction.filter({
      orgId: user.orgId,
      type: 'deduction',
      created_date: {
        $gte: startOfMonth.toISOString(),
        $lte: endOfMonth.toISOString()
      }
    });
    
    // Calculate total credits used this month (absolute value since deductions are negative)
    const creditsUsedThisMonth = monthlyTransactions.reduce((sum, t) => {
      return sum + Math.abs(t.amount);
    }, 0);
    
    // Calculate average credits per user this month
    const avgCreditsPerUser = teamSize > 0 
      ? Math.round(creditsUsedThisMonth / teamSize * 10) / 10 
      : 0;
    
    return Response.json({
      totalPoolCredits: organization.creditBalance || 0,
      teamSize: teamSize,
      creditsUsedThisMonth: creditsUsedThisMonth,
      avgCreditsPerUser: avgCreditsPerUser,
      monthStart: startOfMonth.toISOString(),
      monthEnd: endOfMonth.toISOString()
    });
    
  } catch (error) {
    console.error('Error in getCompanyPoolStats:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to get company pool stats',
        details: error.stack
      },
      { status: 500 }
    );
  }
});