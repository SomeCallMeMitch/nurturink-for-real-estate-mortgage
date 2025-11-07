import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Check if a user has enough credits to send notes
 * Follows the credit usage hierarchy: Company pool first, then personal credits
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    const { creditsNeeded } = body;
    
    if (!creditsNeeded || creditsNeeded <= 0) {
      return Response.json(
        { error: 'creditsNeeded must be a positive number' },
        { status: 400 }
      );
    }
    
    let companyPoolCredits = 0;
    let personalCredits = user.creditBalance || 0;
    
    // Check company pool if user belongs to an organization
    if (user.orgId) {
      const orgs = await base44.asServiceRole.entities.Organization.filter({ 
        id: user.orgId 
      });
      
      if (orgs && orgs.length > 0) {
        companyPoolCredits = orgs[0].creditBalance || 0;
      }
    }
    
    // Calculate total available credits
    const totalAvailable = companyPoolCredits + personalCredits;
    
    // Determine if user has enough credits
    if (totalAvailable >= creditsNeeded) {
      // User has enough - determine source
      let source = 'company';
      
      if (companyPoolCredits >= creditsNeeded) {
        // All credits will come from company pool
        source = 'company';
      } else if (companyPoolCredits > 0) {
        // Credits will come from both company and personal
        source = 'mixed';
      } else {
        // All credits will come from personal balance
        source = 'personal';
      }
      
      return Response.json({
        available: true,
        source: source,
        totalAvailable: totalAvailable,
        companyPoolCredits: companyPoolCredits,
        personalCredits: personalCredits,
        creditsNeeded: creditsNeeded,
        deficit: 0
      });
    } else {
      // Not enough credits
      const deficit = creditsNeeded - totalAvailable;
      
      return Response.json({
        available: false,
        source: null,
        totalAvailable: totalAvailable,
        companyPoolCredits: companyPoolCredits,
        personalCredits: personalCredits,
        creditsNeeded: creditsNeeded,
        deficit: deficit
      });
    }
    
  } catch (error) {
    console.error('Error in checkCreditAvailability:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to check credit availability',
        details: error.stack
      },
      { status: 500 }
    );
  }
});