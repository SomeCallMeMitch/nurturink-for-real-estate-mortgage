import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MANUAL_SCHEDULING_NOT_IMPLEMENTED =
  'Activation blocked: Campaign Type requires manual scheduling which is not yet implemented.';

function isClientAutomationEligible(client) {
  return client.automation_status == null || client.automation_status === 'active';
}

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, updates } = await req.json();
    // DEBUG ADDED: request-scoped backend logging for campaign update failures.
    console.error('[updateCampaign][DIAG] request received', {
      requestId,
      userId: user.id,
      orgId: user.orgId || null,
      campaignId: campaignId || null,
      updateKeys: updates ? Object.keys(updates) : [],
      stepsIsArray: Array.isArray(updates?.steps),
      stepsCount: Array.isArray(updates?.steps) ? updates.steps.length : null,
      status: updates?.status || null,
    });

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
    const wasActivated = campaignUpdates.status === 'active' && campaign.status !== 'active';
    let resolvedCampaignType = null;
    let resolvedTriggerField =
      campaignUpdates.triggerField ||
      campaignUpdates.dateField ||
      campaign.triggerField ||
      campaign.dateField ||
      null;

    if (wasActivated || !resolvedTriggerField) {
      const campaignTypeMatches = await base44.entities.CampaignType.filter({
        slug: campaignUpdates.type || campaign.type,
        isActive: true
      });
      resolvedCampaignType = campaignTypeMatches[0] || null;
      resolvedTriggerField = resolvedTriggerField || resolvedCampaignType?.triggerField || null;
    }

    if (wasActivated && resolvedCampaignType?.triggerMode === 'manual') {
      return Response.json({
        success: false,
        error: MANUAL_SCHEDULING_NOT_IMPLEMENTED
      }, { status: 400 });
    }

    if (wasActivated && !resolvedTriggerField) {
      return Response.json({
        success: false,
        error: resolvedCampaignType?.triggerMode === 'manual'
          ? MANUAL_SCHEDULING_NOT_IMPLEMENTED
          : 'Campaign type is missing a triggerField configuration. Contact your administrator.'
      }, { status: 400 });
    }

    if (Object.prototype.hasOwnProperty.call(campaignUpdates, 'triggerField')) {
      // Transitional compatibility: legacy reads may still use dateField.
      campaignUpdates.dateField = campaignUpdates.triggerField;
    } else if (Object.prototype.hasOwnProperty.call(campaignUpdates, 'dateField')) {
      campaignUpdates.triggerField = campaignUpdates.dateField;
    }

    let validatedStepRecords = null;
    if (stepUpdates && Array.isArray(stepUpdates)) {
      const targetStatus = campaignUpdates.status || campaign.status;
      if (targetStatus === 'active' && stepUpdates.length === 0) {
        return Response.json({
          success: false,
          error: 'Cannot activate a campaign with no steps. Add at least one card step first.'
        }, { status: 400 });
      }

      validatedStepRecords = stepUpdates.map((step, index) => ({
        campaignId,
        stepOrder: step.stepOrder || index + 1,
        cardDesignId: step.cardDesignId,
        templateId: step.templateId || null,
        messageText: step.messageText || null,
        timingDays: step.timingDays,
        timingReference: step.timingReference || 'trigger_date',
        isEnabled: step.isEnabled !== false
      }));

      for (let i = 0; i < validatedStepRecords.length; i++) {
        const step = validatedStepRecords[i];
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
    }

    if (Object.keys(campaignUpdates).length > 0) {
      await base44.entities.Campaign.update(campaignId, campaignUpdates);
    }

    // Auto-enroll clients when campaign is activated
    if (wasActivated && (campaignUpdates.enrollmentMode || campaign.enrollmentMode) === 'opt_out') {
      try {
        const orgId = campaign.orgId || user.orgId;
        let campaignType = resolvedCampaignType;
        if (!campaignType) {
          const campaignTypeMatches = await base44.asServiceRole.entities.CampaignType.filter({ slug: campaign.type, isActive: true });
          campaignType = campaignTypeMatches[0];
        }

        if (!campaignType) {
          console.error(`No CampaignType found for slug: ${campaign.type}`);
        } else {
          const triggerField = resolvedTriggerField || campaign.triggerField || campaign.dateField || campaignType.triggerField;

          const allClients = await base44.asServiceRole.entities.Client.filter({
            orgId,
            ownerId: campaign.ownerId || user.id
          });

          const eligibleClients = allClients.filter((client) => {
            const hasFieldValue = client[triggerField] && client[triggerField] !== '';
            return hasFieldValue && isClientAutomationEligible(client);
          });

          if (eligibleClients.length > 0) {
            const existingEnrollments = await base44.asServiceRole.entities.CampaignEnrollment.filter({ campaignId });
            const existingClientIds = new Set(existingEnrollments.map((enrollment) => enrollment.clientId));
            const clientsToEnroll = eligibleClients.filter((client) => !existingClientIds.has(client.id));

            const enrollmentRecords = clientsToEnroll.map((client) => ({
              campaignId,
              orgId: campaign.orgId || orgId,
              clientId: client.id,
              status: 'enrolled',
              enrolledAt: new Date().toISOString()
            }));

            if (clientsToEnroll.length > 0) {
              await base44.asServiceRole.entities.CampaignEnrollment.bulkCreate(enrollmentRecords);
            }

            const campaignTag = `${campaignType.name} Campaign`;
            const tagUpdatePromises = clientsToEnroll
              .filter((client) => {
                const existingTags = Array.isArray(client.tags) ? client.tags : [];
                return !existingTags.includes(campaignTag);
              })
              .map((client) => {
                const existingTags = Array.isArray(client.tags) ? client.tags : [];
                return base44.asServiceRole.entities.Client.update(client.id, {
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

      if (validatedStepRecords && validatedStepRecords.length > 0) {
        await base44.entities.CampaignStep.bulkCreate(validatedStepRecords);
      }
    }

    return Response.json({
      success: true,
      requestId,
      message: 'Campaign updated successfully'
    });

  } catch (error) {
    console.error('[updateCampaign] unhandled error', {
      requestId,
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return Response.json({
      success: false,
      requestId,
      error: error.message || 'An error occurred while updating the campaign'
    }, { status: 500 });
  }
});