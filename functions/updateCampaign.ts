import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, updates } = await req.json();

    if (!campaignId) {
      return Response.json({ 
        success: false, 
        error: 'Missing required field: campaignId' 
      }, { status: 400 });
    }

    if (!updates || typeof updates !== 'object') {
      return Response.json({ 
        success: false, 
        error: 'Missing or invalid updates object' 
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

    // Load Campaign record first — needed for ownership check
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

    // FIX06: Allow owners, managers, OR the user who created the campaign to update it.
    // Previously only owners/managers could update, which meant reps could create but not edit.
    const isOwnerOrManager = ['owner', 'manager'].includes(userProfile.orgRole);
    const isCampaignCreator = campaign.ownerId === user.id;
    if (!isOwnerOrManager && !isCampaignCreator) {
      return Response.json({ 
        success: false, 
        error: 'Permission denied. You can only update campaigns you created.' 
      }, { status: 403 });
    }

    // Build update data (only allowed fields)
    const allowedFields = ['name', 'status', 'requiresApproval', 'description'];
    const campaignUpdates = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        // Validate status if provided
        if (field === 'status') {
          const validStatuses = ['active', 'paused', 'draft'];
          if (!validStatuses.includes(updates.status)) {
            return Response.json({ 
              success: false, 
              error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
            }, { status: 400 });
          }
        }
        campaignUpdates[field] = updates[field];
      }
    }

    // Update Campaign record if there are changes
    if (Object.keys(campaignUpdates).length > 0) {
      await base44.entities.Campaign.update(campaignId, campaignUpdates);
    }

    // Handle steps replacement if provided
    if (updates.steps && Array.isArray(updates.steps)) {
      // Delete all existing CampaignStep records for this campaign
      const existingSteps = await base44.entities.CampaignStep.filter({ campaignId });
      for (const step of existingSteps) {
        await base44.entities.CampaignStep.delete(step.id);
      }

      // Delete all pending ScheduledSend records
      const pendingSends = await base44.entities.ScheduledSend.filter({ 
        campaignId, 
        status: 'pending' 
      });
      const awaitingSends = await base44.entities.ScheduledSend.filter({ 
        campaignId, 
        status: 'awaiting_approval' 
      });

      for (const send of [...pendingSends, ...awaitingSends]) {
        await base44.entities.ScheduledSend.delete(send.id);
      }

      // Create new CampaignStep records
      if (updates.steps.length > 0) {
        const stepRecords = updates.steps.map((step, index) => ({
          campaignId,
          stepOrder: step.stepOrder || index + 1,
          cardDesignId: step.cardDesignId,
          templateId: step.templateId || null,
          messageText: step.messageText || null,
          timingDays: step.timingDays,
          timingReference: step.timingReference || 'trigger_date',
          isEnabled: step.isEnabled !== false
        }));

        // Validate steps have required fields
        // FIX08: Block activating a campaign with no steps
        const targetStatus = campaignUpdates.status || campaign.status;
        if (targetStatus === 'active' && updates.steps.length === 0) {
          return Response.json({ 
            success: false, 
            error: 'Cannot activate a campaign with no steps. Add at least one card step first.' 
          }, { status: 400 });
        }

        for (let i = 0; i < stepRecords.length; i++) {
          const step = stepRecords[i];
          if (!step.cardDesignId) {
            return Response.json({ 
              success: false, 
              error: `Step ${i + 1} is missing required cardDesignId` 
            }, { status: 400 });
          }
          if (step.timingDays === undefined || step.timingDays === null) {
            return Response.json({ 
              success: false, 
              error: `Step ${i + 1} is missing required timingDays` 
            }, { status: 400 });
          }
          // FIX08: Require message content when activating
          if (targetStatus === 'active' && !step.templateId && !step.messageText) {
            return Response.json({ 
              success: false, 
              error: `Step ${i + 1} requires either a template or a custom message before activating` 
            }, { status: 400 });
          }
        }

        await base44.entities.CampaignStep.bulkCreate(stepRecords);
      }
    }

    return Response.json({ 
      success: true,
      message: 'Campaign updated successfully'
    });

  } catch (error) {
    console.error('updateCampaign error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An error occurred while updating the campaign' 
    }, { status: 500 });
  }
});