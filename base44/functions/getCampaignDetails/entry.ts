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

    // Get user's orgId from UserProfile (allow super_admin without profile)
    let orgId = null;
    const userProfiles = await base44.entities.UserProfile.filter({ userId: user.id });
    
    if (userProfiles && userProfiles.length > 0) {
      orgId = userProfiles[0].orgId;
    } else if (user.role !== 'admin') {
      return Response.json({ 
        success: false, 
        error: 'User profile not found' 
      }, { status: 400 });
    }

    // Load Campaign record
    const campaigns = await base44.entities.Campaign.filter({ id: campaignId });
    if (!campaigns || campaigns.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Campaign not found' 
      }, { status: 404 });
    }

    const campaign = campaigns[0];

    // Verify user belongs to the campaign's org (skip for super_admin)
    if (orgId && campaign.orgId !== orgId) {
      return Response.json({ 
        success: false, 
        error: 'Permission denied. Campaign belongs to a different organization.' 
      }, { status: 403 });
    }

    // PHASE 1: Additional check for rep-level access
    // Regular users (reps) can only view their own campaigns
    if (user.role === 'user' && campaign.ownerId && campaign.ownerId !== user.id) {
      return Response.json({ 
        success: false, 
        error: 'Permission denied. You do not have access to this campaign.' 
      }, { status: 403 });
    }

    // Load all CampaignStep records for this campaign
    const allSteps = await base44.entities.CampaignStep.filter({ campaignId });
    // Sort by stepOrder
    const steps = allSteps.sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0));

    // Count CampaignEnrollment records
    const allEnrollments = await base44.entities.CampaignEnrollment.filter({ campaignId });
    const enrolledCount = allEnrollments.filter(e => e.status === 'enrolled').length;
    const excludedCount = allEnrollments.filter(e => e.status === 'excluded').length;

    // Load ScheduledSend records
    const allScheduledSends = await base44.entities.ScheduledSend.filter({ campaignId });

    // Calculate stats
    const today = new Date();
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    
    const todayStr = today.toISOString().split('T')[0];
    const thirtyDaysStr = thirtyDaysLater.toISOString().split('T')[0];

    // Filter sends
    const pendingSends = allScheduledSends.filter(s => s.status === 'pending' || s.status === 'awaiting_approval');
    const sentSends = allScheduledSends.filter(s => s.status === 'sent');
    const failedSends = allScheduledSends.filter(s => s.status === 'failed');

    // Upcoming sends in next 30 days
    const upcomingSends = pendingSends.filter(send => {
      const sendDate = send.scheduledDate;
      return sendDate >= todayStr && sendDate <= thirtyDaysStr;
    }).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

    // Build stats object
    const stats = {
      totalEnrolled: enrolledCount,
      totalExcluded: excludedCount,
      totalSent: sentSends.length,
      totalFailed: failedSends.length,
      upcomingCount: upcomingSends.length
    };

    return Response.json({
      success: true,
      campaign,
      steps,
      stats,
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