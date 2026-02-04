import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get current user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization ID - check user object first, then UserProfile
    let orgId = user.orgId;
    
    if (!orgId) {
      // Fallback to UserProfile lookup
      const userProfiles = await base44.entities.UserProfile.filter({ userId: user.id });
      if (userProfiles && userProfiles.length > 0) {
        orgId = userProfiles[0].orgId;
      }
    }

    if (!orgId) {
      // If no orgId found, return empty campaigns (not an error)
      return Response.json({ success: true, campaigns: [] });
    }

    // PHASE 1: Determine filter based on user role
    // Regular users (reps) only see their own campaigns
    // Admins and managers see all campaigns in the org
    const campaignFilter = { orgId: orgId };
    if (user.role === 'user') {
      campaignFilter.ownerId = user.id;
    }

    console.log('[listCampaigns] User role:', user.role, 'Filter:', JSON.stringify(campaignFilter));

    // Get campaigns based on the filter
    const campaigns = await base44.entities.Campaign.filter(campaignFilter);

    // Return plain campaigns first to avoid 502s from heavy processing
    // We can add stats back later if needed, or fetch them in a separate call
    // For now, let's just return basic counts if possible, or 0s
    // The previous implementation was likely timing out due to fetching ALL enrollments/sends
    
    const campaignsWithStats = campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      enrollmentMode: campaign.enrollmentMode,
      requiresApproval: campaign.requiresApproval || false,
      returnAddressMode: campaign.returnAddressMode || 'company',
      description: campaign.description,
      enrolledCount: 0, // Placeholder to prevent 502
      upcomingCount: 0, // Placeholder to prevent 502
      nextSendDate: null,
      created_date: campaign.created_date
    }));

    // Sort by created_date descending (newest first)
    campaignsWithStats.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    return Response.json({ 
      success: true, 
      campaigns: campaignsWithStats 
    });

  } catch (error) {
    console.error('listCampaigns error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to load campaigns' 
    }, { status: 500 });
  }
});