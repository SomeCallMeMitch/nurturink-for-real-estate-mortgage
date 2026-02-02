import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get current user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // === DIAGNOSTIC LOGGING START ===
    console.log('[listCampaigns] User ID:', user.id);
    console.log('[listCampaigns] User role:', user.role);
    console.log('[listCampaigns] User orgId (direct):', user.orgId);
    // === DIAGNOSTIC LOGGING END ===

    // Get user's organization ID - check user object first, then UserProfile
    let orgId = user.orgId;
    
    if (!orgId) {
      // Fallback to UserProfile lookup
      const userProfiles = await base44.entities.UserProfile.filter({ userId: user.id });
      console.log('[listCampaigns] UserProfile lookup result:', JSON.stringify(userProfiles));
      
      if (userProfiles && userProfiles.length > 0) {
        orgId = userProfiles[0].orgId;
      }
    }

    console.log('[listCampaigns] Final orgId being used:', orgId);

    if (!orgId) {
      // If no orgId found, return empty campaigns (not an error)
      console.log('[listCampaigns] No orgId found - returning empty campaigns');
      return Response.json({ success: true, campaigns: [] });
    }

    // Get all campaigns for this organization
    const campaigns = await base44.entities.Campaign.filter({ orgId: orgId });
    console.log('[listCampaigns] Campaigns found by filter:', JSON.stringify(campaigns));

    // Get stats for each campaign
    const campaignsWithStats = await Promise.all(campaigns.map(async (campaign) => {
      // Count enrolled clients
      const enrollments = await base44.entities.CampaignEnrollment.filter({ 
        campaignId: campaign.id, 
        status: 'enrolled' 
      });
      const enrolledCount = enrollments.length;

      // Get upcoming sends in next 7 days
      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);
      
      const todayStr = today.toISOString().split('T')[0];
      const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0];

      const scheduledSends = await base44.entities.ScheduledSend.filter({ 
        campaignId: campaign.id
      });
      
      // Filter for pending/awaiting_approval and within 7 days
      const upcomingSends = scheduledSends.filter(send => {
        const isPendingOrAwaiting = send.status === 'pending' || send.status === 'awaiting_approval';
        const isWithinRange = send.scheduledDate >= todayStr && send.scheduledDate <= sevenDaysStr;
        return isPendingOrAwaiting && isWithinRange;
      });
      const upcomingCount = upcomingSends.length;

      // Find next send date
      const pendingSends = scheduledSends
        .filter(send => (send.status === 'pending' || send.status === 'awaiting_approval') && send.scheduledDate >= todayStr)
        .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
      
      const nextSendDate = pendingSends.length > 0 ? pendingSends[0].scheduledDate : null;

      return {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        enrollmentMode: campaign.enrollmentMode,
        requiresApproval: campaign.requiresApproval || false,
        returnAddressMode: campaign.returnAddressMode || 'company',
        description: campaign.description,
        enrolledCount,
        upcomingCount,
        nextSendDate,
        created_date: campaign.created_date
      };
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