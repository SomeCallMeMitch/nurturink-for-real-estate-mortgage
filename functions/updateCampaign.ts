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
      return Response.json({ success: false, error: 'Missing campaignId' }, { status: 400 });
    }

    const campaign = await base44.entities.Campaign.get(campaignId);
    if (!campaign) {
      return Response.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // FIX #4: Use appRole and ownerId — original used user.role (always 'user')
    // and campaign.createdBy (never set), so both checks always failed.
    const userRole = user.appRole;
    const isOwnerOrManager = ['organization_owner', 'organization_manager', 'super_admin'].includes(userRole);
    const isCreator = campaign.ownerId === user.id;

    if (!isOwnerOrManager && !isCreator) {
      return Response.json({ success: false, error: 'Permission denied' }, { status: 403 });
    }

    const { steps: stepUpdates, ...campaignUpdates } = updates;

    if (Object.keys(campaignUpdates).length > 0) {
      await base44.entities.Campaign.update(campaignId, campaignUpdates);
    }

    // Auto-enroll clients when campaign is activated
    const wasActivated = campaignUpdates.status === 'active' && campaign.status !== 'active';
    if (wasActivated && campaign.enrollmentMode !== 'manual') {
      try {
        const orgId = user.orgId;
        const triggerTypes = await base44.entities.TriggerType.filter({ key: campaign.type });
        const triggerType = triggerTypes[0];

        if (!triggerType) {
          console.error(`No TriggerType found for key: ${campaign.type}`);
        } else {
          const triggerField = triggerType.dateField;

          const allClients = await base44.entities.Client.filter({
            orgId,
            ownerId: user.id
          });

          const eligibleClients = allClients.filter((client) => {
            const hasFieldValue = client[triggerField] && client[triggerField] !== '';
            const automationEnabled = client.automationEnabled !== false;
            return hasFieldValue && automationEnabled;
          });

          if (eligibleClients.length > 0) {
            const enrollmentRecords = eligibleClients.map((client) => ({
              campaignId,
              clientId: client.id,
              status: 'active',
              enrolledAt: new Date().toISOString()
            }));
            await base44.entities.CampaignEnrollment.bulkCreate(enrollmentRecords);

            // FIX #10: Concurrent tag updates
            const campaignTag = `${triggerType.name} Campaign`;
            const tagUpdatePromises = eligibleClients
              .filter((client) => {
                const existingTags = Array.isArray(client.tags) ? client.tags : [];
                return !existingTags.includes(campaignTag);
              })
              .map((client) => {
                const existingTags = Array.isArray(client.tags) ? client.tags : [];
                return base44.entities.Client.update(client.id, {
                  tags: [...existingTags, campaignTag]
                });
              });
            await Promise.all(tagUpdatePromises);
          }
        }
      } catch (enrollmentError) {
        console.error('Error during auto-enrollment on campaign activation:', enrollmentError);
      }
    }

    // Handle steps replacement if provided
    if (stepUpdates && Array.isArray(stepUpdates)) {
      const existingSteps = await base44.entities.CampaignStep.filter({ campaignId });
      for (const step of existingSteps) {
        await base44.entities.CampaignStep.delete(step.id);
      }

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

      const targetStatus = campaignUpdates.status || campaign.status;
      if (targetStatus === 'active' && stepUpdates.length === 0) {
        return Response.json({
          success: false,
          error: 'Cannot activate a campaign with no steps. Add at least one card step first.'
        }, { status: 400 });
      }

      if (stepUpdates.length > 0) {
        const stepRecords = stepUpdates.map((step, index) => ({
          campaignId,
          stepOrder: step.stepOrder || index + 1,
          cardDesignId: step.cardDesignId,
          templateId: step.templateId || null,
          messageText: step.messageText || null,
          timingDays: step.timingDays,
          timingReference: step.timingReference || 'trigger_date',
          isEnabled: step.isEnabled !== false
        }));

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
