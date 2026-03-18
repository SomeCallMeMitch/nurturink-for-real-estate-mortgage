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

    // Validate user has permission (owner or manager)
    const allowedRoles = ['owner', 'manager'];
    if (!allowedRoles.includes(userProfile.orgRole)) {
      return Response.json({ 
        success: false, 
        error: 'Permission denied. Only organization owners and managers can delete campaigns.' 
      }, { status: 403 });
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

    // Verify user belongs to the campaign's org
    if (campaign.orgId !== orgId) {
      return Response.json({ 
        success: false, 
        error: 'Permission denied. Campaign belongs to a different organization.' 
      }, { status: 403 });
    }

    // Delete all CampaignStep records for this campaign
    const steps = await base44.entities.CampaignStep.filter({ campaignId });
    for (const step of steps) {
      await base44.entities.CampaignStep.delete(step.id);
    }

    // Delete all CampaignEnrollment records for this campaign
    const enrollments = await base44.entities.CampaignEnrollment.filter({ campaignId });
    for (const enrollment of enrollments) {
      await base44.entities.CampaignEnrollment.delete(enrollment.id);
    }

    // Delete all ScheduledSend records for this campaign
    const scheduledSends = await base44.entities.ScheduledSend.filter({ campaignId });
    for (const send of scheduledSends) {
      await base44.entities.ScheduledSend.delete(send.id);
    }

    // Delete the Campaign record
    await base44.entities.Campaign.delete(campaignId);

    return Response.json({ 
      success: true,
      message: 'Campaign and all related data deleted successfully'
    });

  } catch (error) {
    console.error('deleteCampaign error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An error occurred while deleting the campaign' 
    }, { status: 500 });
  }
});