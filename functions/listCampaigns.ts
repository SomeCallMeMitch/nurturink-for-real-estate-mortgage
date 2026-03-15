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

    // FIX05: Fetch real enrollment and upcoming send counts.
    // Use a single batch query per entity type (not one per campaign) to avoid timeouts.
    const campaignIds = campaigns.map(c => c.id);
    let allEnrollments = [];
    let allUpcomingSends = [];

    if (campaignIds.length > 0) {
      try {
        // Fetch all active enrollments for these campaigns (not by orgId, which may not be set)
        // Query by campaignId to get enrollments regardless of orgId field
        allEnrollments = await base44.entities.CampaignEnrollment.filter({
          campaignId: { $in: campaignIds }
        });
        console.log('[listCampaigns] Fetched enrollments by campaignId:', { campaignCount: campaignIds.length, totalEnrollments: allEnrollments.length });
        if (allEnrollments.length > 0) {
          console.log('[listCampaigns] First enrollment record:', JSON.stringify(allEnrollments[0]));
        }
        // Fetch upcoming pending sends (next 30 days) for this org
        const today = new Date();
        const in30Days = new Date(today);
        in30Days.setDate(in30Days.getDate() + 30);
        allUpcomingSends = await base44.entities.ScheduledSend.filter({ orgId, status: 'pending' });
      } catch (statsError) {
        console.error('[listCampaigns] Failed to fetch stats, using 0s:', statsError.message);
        // Non-fatal: fall back to 0s rather than failing the whole request
      }
    }

    // Build lookup maps for O(1) access
    const enrollmentCountMap = {};
    console.log('[listCampaigns] Processing enrollments - checking each one:');
    for (const e of allEnrollments) {
      console.log('[listCampaigns] Enrollment:', {
        id: e.id,
        campaignId: e.campaignId,
        status: e.status,
        clientId: e.clientId,
        enrolledAt: e.enrolledAt,
        allKeys: Object.keys(e)
      });
      
      if (e.campaignId) {
        enrollmentCountMap[e.campaignId] = (enrollmentCountMap[e.campaignId] || 0) + 1;
      }
    }
    console.log('[listCampaigns] Final enrollment count map:', JSON.stringify(enrollmentCountMap));
    console.log('[listCampaigns] Total enrollments processed:', allEnrollments.length);
    console.log('[listCampaigns] Campaigns being returned:', campaignIds.length);
    const upcomingCountMap = {};
    const nextSendDateMap = {};
    for (const s of allUpcomingSends) {
      if (s.campaignId) {
        upcomingCountMap[s.campaignId] = (upcomingCountMap[s.campaignId] || 0) + 1;
        if (!nextSendDateMap[s.campaignId] || s.scheduledDate < nextSendDateMap[s.campaignId]) {
          nextSendDateMap[s.campaignId] = s.scheduledDate;
        }
      }
    }

    const campaignsWithStats = campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      enrollmentMode: campaign.enrollmentMode,
      requiresApproval: campaign.requiresApproval || false,
      returnAddressMode: campaign.returnAddressMode || 'company',
      description: campaign.description,
      enrolledCount: enrollmentCountMap[campaign.id] || 0,
      upcomingCount: upcomingCountMap[campaign.id] || 0,
      nextSendDate: nextSendDateMap[campaign.id] || null,
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