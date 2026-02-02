import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // 1. Get current user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Validate user role - must be owner or manager
    const appRole = user.appRole || user.orgRole;
    if (!appRole || !['owner', 'manager'].includes(appRole)) {
      return Response.json({ 
        success: false, 
        error: 'Permission denied. Only organization owners or managers can delete campaigns.' 
      }, { status: 403 });
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

    // Load Campaign record
    const campaigns = await base44.entities.Campaign.filter({ id: campaignId });
    if (!campaigns || campaigns.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Campaign not found.' 
      }, { status: 404 });
    }
    const campaign = campaigns[0];

    // Verify user owns the campaign (same org)
    if (campaign.orgId !== userOrgId) {
      return Response.json({ 
        success: false, 
        error: 'Access denied. Campaign belongs to a different organization.' 
      }, { status: 403 });
    }

    // 2. Delete all CampaignStep records for this campaign
    const steps = await base44.entities.CampaignStep.filter({ campaignId: campaignId });
    for (const step of steps) {
      await base44.asServiceRole.entities.CampaignStep.delete(step.id);
    }

    // 3. Delete all CampaignEnrollment records for this campaign
    const enrollments = await base44.entities.CampaignEnrollment.filter({ campaignId: campaignId });
    for (const enrollment of enrollments) {
      await base44.asServiceRole.entities.CampaignEnrollment.delete(enrollment.id);
    }

    // 4. Delete all ScheduledSend records for this campaign
    const scheduledSends = await base44.entities.ScheduledSend.filter({ campaignId: campaignId });
    for (const send of scheduledSends) {
      await base44.asServiceRole.entities.ScheduledSend.delete(send.id);
    }

    // 5. Delete the Campaign record
    await base44.asServiceRole.entities.Campaign.delete(campaignId);

    // 6. Return success
    return Response.json({ 
      success: true,
      deleted: {
        campaign: 1,
        steps: steps.length,
        enrollments: enrollments.length,
        scheduledSends: scheduledSends.length
      }
    });

  } catch (error) {
    console.error('deleteCampaign error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    }, { status: 500 });
  }
});