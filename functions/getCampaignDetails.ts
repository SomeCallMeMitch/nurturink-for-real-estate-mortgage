import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = await req.json();

    if (!campaignId) {
      return Response.json({ 
        success: false, 
        error: 'Missing required field: campaignId' 
      }, { status: 400 });
    }

    // Get user's orgId from UserProfile
    const userProfiles = await base44.entities.UserProfile.filter({ userId: user.id });
    if (!userProfiles || userProfiles.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'User profile not found' 
      }, { status: 400 });
    }

    const userProfile = userProfiles[0];
    const orgId = userProfile.orgId;

    // Load Campaign record
    const campaigns = await base44.entities.Campaign.filter({ id: campaignId });
    if (!campaigns || campaigns.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Campaign not found' 
      }, { status: 404 });
    }

    const campaign = campaigns[0];

    // Verify user belongs to the campaign's org
    if (campaign.orgId !== orgId) {
      return Response.json({ 
        success: false, 
        error: 'Permission denied. Campaign belongs to a different organization.' 
      }, { status: 403 });
    }

    // Load all CampaignStep records for this campaign
    const allSteps = await base44.entities.CampaignStep.filter({ campaignId });
    // Sort by stepOrder
    const steps = allSteps.sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0));

    // Count CampaignEnrollment records with status='enrolled'
    const enrollments = await base44.entities.CampaignEnrollment.filter({ 
      campaignId, 
      status: 'enrolled' 
    });
    const enrolledCount = enrollments.length;

    // Load ScheduledSend records for next 30 days (status='pending' or 'awaiting_approval')
    const today = new Date();
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    
    const todayStr = today.toISOString().split('T')[0];
    const thirtyDaysStr = thirtyDaysLater.toISOString().split('T')[0];

    // Get pending and awaiting_approval sends
    const pendingSends = await base44.entities.ScheduledSend.filter({ 
      campaignId, 
      status: 'pending' 
    });
    const awaitingSends = await base44.entities.ScheduledSend.filter({ 
      campaignId, 
      status: 'awaiting_approval' 
    });

    // Filter to next 30 days and combine
    const filterByDateRange = (sends) => {
      return sends.filter(send => {
        const sendDate = send.scheduledDate;
        return sendDate >= todayStr && sendDate <= thirtyDaysStr;
      });
    };

    const upcomingSends = [
      ...filterByDateRange(pendingSends),
      ...filterByDateRange(awaitingSends)
    ].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

    return Response.json({
      success: true,
      campaign,
      steps,
      enrolledCount,
      upcomingSends
    });

  } catch (error) {
    console.error('getCampaignDetails error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An error occurred while fetching campaign details' 
    }, { status: 500 });
  }
});