import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Check if a user has enough credits to send notes
 * 
 * CORRECTED Credit Deduction Hierarchy:
 * 1. FIRST: Company-allocated credits (user.companyAllocatedCredits)
 * 2. SECOND: Company pool credits (organization.creditBalance) - IF user.canAccessCompanyPool = true
 * 3. LAST: Personal purchased credits (user.personalPurchasedCredits)
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
    
    // Get user's credit balances
    const companyAllocatedCredits = user.companyAllocatedCredits || 0;
    const personalPurchasedCredits = user.personalPurchasedCredits || 0;
    const canAccessCompanyPool = user.canAccessCompanyPool !== false; // Default to true if not set
    
    let companyPoolCredits = 0;
    
    // Check company pool if user belongs to an organization AND has access
    if (user.orgId && canAccessCompanyPool) {
      const orgs = await base44.asServiceRole.entities.Organization.filter({ 
        id: user.orgId 
      });
      
      if (orgs && orgs.length > 0) {
        companyPoolCredits = orgs[0].creditBalance || 0;
      }
    }
    
    // Calculate total available credits
    const totalAvailable = companyAllocatedCredits + companyPoolCredits + personalPurchasedCredits;
    
    // Determine if user has enough credits
    if (totalAvailable >= creditsNeeded) {
      // User has enough - calculate breakdown of sources following CORRECTED hierarchy
      let remaining = creditsNeeded;
      let fromCompanyAllocated = 0;
      let fromCompanyPool = 0;
      let fromPersonalPurchased = 0;
      
      // Step 1: Use company-allocated credits FIRST
      if (companyAllocatedCredits > 0) {
        fromCompanyAllocated = Math.min(companyAllocatedCredits, remaining);
        remaining -= fromCompanyAllocated;
      }
      
      // Step 2: Use company pool SECOND (if accessible)
      if (remaining > 0 && companyPoolCredits > 0 && canAccessCompanyPool) {
        fromCompanyPool = Math.min(companyPoolCredits, remaining);
        remaining -= fromCompanyPool;
      }
      
      // Step 3: Use personal purchased credits LAST
      if (remaining > 0 && personalPurchasedCredits > 0) {
        fromPersonalPurchased = Math.min(personalPurchasedCredits, remaining);
        remaining -= fromPersonalPurchased;
      }
      
      // Determine primary source
      let source = 'company_allocated';
      if (fromCompanyAllocated === creditsNeeded) {
        source = 'company_allocated';
      } else if (fromCompanyPool > 0 && fromPersonalPurchased === 0) {
        source = fromCompanyAllocated > 0 ? 'mixed_company' : 'company_pool';
      } else if (fromPersonalPurchased > 0) {
        source = 'mixed_all';
      }
      
      return Response.json({
        available: true,
        source: source,
        totalAvailable: totalAvailable,
        breakdown: {
          companyAllocatedCredits: companyAllocatedCredits,
          companyPoolCredits: canAccessCompanyPool ? companyPoolCredits : 0,
          personalPurchasedCredits: personalPurchasedCredits
        },
        deductionPlan: {
          fromCompanyAllocated: fromCompanyAllocated,
          fromCompanyPool: fromCompanyPool,
          fromPersonalPurchased: fromPersonalPurchased
        },
        creditsNeeded: creditsNeeded,
        deficit: 0,
        canAccessCompanyPool: canAccessCompanyPool
      });
    } else {
      // Not enough credits
      const deficit = creditsNeeded - totalAvailable;
      
      return Response.json({
        available: false,
        source: null,
        totalAvailable: totalAvailable,
        breakdown: {
          companyAllocatedCredits: companyAllocatedCredits,
          companyPoolCredits: canAccessCompanyPool ? companyPoolCredits : 0,
          personalPurchasedCredits: personalPurchasedCredits
        },
        creditsNeeded: creditsNeeded,
        deficit: deficit,
        canAccessCompanyPool: canAccessCompanyPool
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