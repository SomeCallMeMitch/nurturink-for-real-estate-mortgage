import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, clientId, reason } = await req.json();

    // Validate required fields
    if (!campaignId || !clientId) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields: campaignId and clientId' 
      }, { status: 400 });
    }

    // Get user's orgId from UserProfile
    let orgId = null;
    let userProfile = null;
    
    const userProfiles = await base44.entities.UserProfile.filter({ userId: user.id });
    
    if (userProfiles && userProfiles.length > 0) {
      userProfile = userProfiles[0];
      orgId = userProfile.orgId;
    } else if (user.role === 'admin') {
      // Super admin - proceed
    } else {
      return Response.json({ 
        success: false, 
        error: 'User profile not found.' 
      }, { status: 400 });
    }

    // Check permission
    if (userProfile && user.role !== 'admin') {
      const allowedRoles = ['owner', 'manager'];
      if (!allowedRoles.includes(userProfile.orgRole)) {
        return Response.json({ 
          success: false, 
          error: 'Permission denied. Only organization owners and managers can manage enrollments.' 
        }, { status: 403 });
      }
    }

    // Fetch the campaign
    const campaigns = await base44.entities.Campaign.filter({ id: campaignId });
    if (!campaigns || campaigns.length === 0) {
      return Response.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }
    const campaign = campaigns[0];

    // Verify org ownership
    if (orgId && campaign.orgId !== orgId) {
      return Response.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Check existing enrollment
    const existingEnrollments = await base44.entities.CampaignEnrollment.filter({ 
      campaignId, 
      clientId 
    });

    if (existingEnrollments && existingEnrollments.length > 0) {
      // Update existing enrollment to excluded
      const existing = existingEnrollments[0];
      await base44.entities.CampaignEnrollment.update(existing.id, {
        status: 'excluded',
        excludedAt: new Date().toISOString()
      });
    } else {
      // Create new enrollment with excluded status
      await base44.entities.CampaignEnrollment.create({
        campaignId,
        clientId,
        status: 'excluded',
        enrolledAt: new Date().toISOString(),
        excludedAt: new Date().toISOString()
      });
    }

    // Remove campaign tag from client
    try {
      const clients = await base44.entities.Client.filter({ id: clientId });
      if (clients && clients.length > 0) {
        const client = clients[0];
        const campaignTag = `${campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)} Campaign`;
        const existingTags = client.tags && Array.isArray(client.tags) ? client.tags : [];
        const updatedTags = existingTags.filter(tag => tag !== campaignTag);
        
        if (updatedTags.length !== existingTags.length) {
          await base44.entities.Client.update(clientId, { tags: updatedTags });
        }
      }
    } catch (tagError) {
      console.error('Error removing campaign tag:', tagError);
      // Don't fail the exclusion if tag removal fails
    }

    // Cancel any pending scheduled sends for this client + campaign
    try {
      const pendingSends = await base44.entities.ScheduledSend.filter({ 
        campaignId, 
        clientId 
      });
      
      const toCancel = pendingSends.filter(s => 
        s.status === 'pending' || s.status === 'awaiting_approval'
      );

      for (const send of toCancel) {
        await base44.entities.ScheduledSend.update(send.id, {
          status: 'skipped',
          failureReason: reason || 'Client excluded from campaign'
        });
      }
    } catch (scheduleError) {
      console.error('Error cancelling scheduled sends:', scheduleError);
      // Don't fail the exclusion if this fails
    }

    return Response.json({ 
      success: true, 
      message: 'Client excluded from campaign'
    });

  } catch (error) {
    console.error('excludeClientFromCampaign error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An error occurred' 
    }, { status: 500 });
  }
});