import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, clientId, reason } = await req.json();

    if (!campaignId || !clientId) {
      return Response.json({
        success: false,
        error: 'Missing required fields: campaignId and clientId'
      }, { status: 400 });
    }

    // FIX #2: Use appRole — original used user.role which is always 'user' in Base44,
    // causing every permission check to fail and denying all legitimate org owners.
    const userRole = user.appRole;
    const isSuperAdmin = userRole === 'super_admin';
    const isOwnerOrManager = ['organization_owner', 'organization_manager', 'super_admin'].includes(userRole);

    if (!isOwnerOrManager) {
      return Response.json({
        success: false,
        error: 'Permission denied. Only organization owners and managers can manage enrollments.'
      }, { status: 403 });
    }

    const orgId = user.orgId;

    // Fetch the campaign
    const campaigns = await base44.entities.Campaign.filter({ id: campaignId });
    if (!campaigns || campaigns.length === 0) {
      return Response.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }
    const campaign = campaigns[0];

    // Verify org ownership (super_admin can act across orgs)
    if (!isSuperAdmin && orgId && campaign.orgId !== orgId) {
      return Response.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Update or create enrollment record with excluded status
    const existingEnrollments = await base44.entities.CampaignEnrollment.filter({
      campaignId,
      clientId
    });

    if (existingEnrollments && existingEnrollments.length > 0) {
      await base44.entities.CampaignEnrollment.update(existingEnrollments[0].id, {
        status: 'excluded',
        excludedAt: new Date().toISOString()
      });
    } else {
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

        // Build tag name from TriggerType.name; fall back to capitalized key
        let campaignTag = `${campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)} Campaign`;
        try {
          const triggerTypes = await base44.entities.TriggerType.filter({ key: campaign.type });
          if (triggerTypes && triggerTypes.length > 0) {
            campaignTag = `${triggerTypes[0].name} Campaign`;
          }
        } catch (e) {
          // Fall back to capitalized key already set above
        }

        const existingTags = Array.isArray(client.tags) ? client.tags : [];
        const updatedTags = existingTags.filter((tag) => tag !== campaignTag);

        if (updatedTags.length !== existingTags.length) {
          await base44.entities.Client.update(clientId, { tags: updatedTags });
        }
      }
    } catch (tagError) {
      console.error('Error removing campaign tag:', tagError);
    }

    // Cancel any pending scheduled sends for this client + campaign
    try {
      const pendingSends = await base44.entities.ScheduledSend.filter({
        campaignId,
        clientId
      });

      const toCancel = pendingSends.filter((s) =>
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