import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // 1. Get current user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's orgId from UserProfile
    const userProfiles = await base44.entities.UserProfile.filter({ userId: user.id });
    if (!userProfiles || userProfiles.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'User profile not found.' 
      }, { status: 400 });
    }
    const userOrgId = userProfiles[0].orgId;

    // Parse request body
    const body = await req.json();
    const { campaignId } = body;

    if (!campaignId) {
      return Response.json({ 
        success: false, 
        error: 'campaignId is required.' 
      }, { status: 400 });
    }

    // 2. Load Campaign record
    const campaigns = await base44.entities.Campaign.filter({ id: campaignId });
    if (!campaigns || campaigns.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Campaign not found.' 
      }, { status: 404 });
    }
    const campaign = campaigns[0];

    // Verify user belongs to the campaign's org
    if (campaign.orgId !== userOrgId) {
      return Response.json({ 
        success: false, 
        error: 'Access denied. Campaign belongs to a different organization.' 
      }, { status: 403 });
    }

    // 3. Load all CampaignStep records for this campaign (sorted by stepOrder)
    const steps = await base44.entities.CampaignStep.filter({ campaignId: campaignId });
    // Sort by stepOrder
    steps.sort((a, b) => a.stepOrder - b.stepOrder);

    // 4. Count CampaignEnrollment records with status='enrolled'
    const enrollments = await base44.entities.CampaignEnrollment.filter({ 
      campaignId: campaignId,
      status: 'enrolled'
    });
    const enrolledCount = enrollments.length;

    // 5. Load ScheduledSend records for next 30 days (status='pending' or 'awaiting_approval')
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    // Format dates as YYYY-MM-DD for comparison
    const todayStr = today.toISOString().split('T')[0];
    const futureStr = thirtyDaysFromNow.toISOString().split('T')[0];

    // Get all pending/awaiting_approval sends for this campaign
    const pendingSends = await base44.entities.ScheduledSend.filter({ 
      campaignId: campaignId,
      status: 'pending'
    });
    const awaitingApprovalSends = await base44.entities.ScheduledSend.filter({ 
      campaignId: campaignId,
      status: 'awaiting_approval'
    });

    // Combine and filter to next 30 days
    const allUpcomingSends = [...pendingSends, ...awaitingApprovalSends];
    const upcomingSends = allUpcomingSends.filter(send => {
      const sendDate = send.scheduledDate;
      return sendDate >= todayStr && sendDate <= futureStr;
    });

    // Sort by scheduledDate
    upcomingSends.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

    // 6. Return response
    return Response.json({ 
      success: true,
      campaign: campaign,
      steps: steps,
      enrolledCount: enrolledCount,
      upcomingSends: upcomingSends
    });

  } catch (error) {
    console.error('getCampaignDetails error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    }, { status: 500 });
  }
});