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

    const body = await req.json();
    const {
      name,
      type,
      triggerTypeId,
      triggerField: requestedTriggerField,
      dateField,
      enrollmentMode = 'opt_out',
      requiresApproval = false,
      returnAddressMode = 'company',
      status: campaignStatus = 'draft',
      steps = []
    } = body;
    const safeSteps = Array.isArray(steps) ? steps : [];
    // DEBUG ADDED: request-scoped backend logging without dumping full client records.
    console.error('[createCampaign][DIAG] request received', {
      requestId,
      userId: user.id,
      orgId: user.orgId || null,
      type,
      triggerTypeId: triggerTypeId || null,
      requestedTriggerField: requestedTriggerField || null,
      dateField: dateField || null,
      campaignStatus,
      stepsIsArray: Array.isArray(steps),
      stepsCount: safeSteps.length,
      hasName: !!name,
    });

    // Sprint 3: Validate type against CampaignType entity instead of TriggerType
    let campaignType = null;
    if (triggerTypeId) {
      try {
        campaignType = await base44.entities.CampaignType.get(triggerTypeId);
      } catch (e) {
        // CampaignType not found by ID — fall through to slug lookup
      }
    }
    if (!campaignType && type) {
      const matches = await base44.entities.CampaignType.filter({ slug: type, isActive: true });
      campaignType = matches[0] || null;
    }
    if (!campaignType) {
      console.error('[createCampaign][DIAG] invalid campaign type', { requestId, type, triggerTypeId: triggerTypeId || null });
      return Response.json({
        success: false,
        error: 'Invalid campaign type. Please select a valid campaign type.'
      }, { status: 400 });
    }

    console.error('[createCampaign][DIAG] campaign type resolved', {
      requestId,
      campaignTypeId: campaignType.id,
      slug: campaignType.slug,
      triggerField: campaignType.triggerField || null,
      triggerMode: campaignType.triggerMode || null,
    });

    if (campaignStatus === 'active' && campaignType.triggerMode === 'manual') {
      return Response.json({
        success: false,
        error: MANUAL_SCHEDULING_NOT_IMPLEMENTED
      }, { status: 400 });
    }

    // Resolve the trigger field from the CampaignType record
    const triggerField = requestedTriggerField || dateField || campaignType.triggerField || null;
    if (!triggerField) {
      if (campaignType.triggerMode === 'manual' && campaignStatus === 'draft') {
        // Manual/null-trigger campaign drafts are valid; activation is blocked below.
      } else if (campaignType.triggerMode === 'manual' && campaignStatus === 'active') {
        return Response.json({
          success: false,
          error: MANUAL_SCHEDULING_NOT_IMPLEMENTED
        }, { status: 400 });
      } else {
        return Response.json({
          success: false,
          error: 'Campaign type is missing a triggerField configuration. Contact your administrator.'
        }, { status: 400 });
      }
    }

    const orgId = user.orgId;
    if (!orgId) {
      return Response.json({
        success: false,
        error: 'User is not associated with an organization'
      }, { status: 400 });
    }

    // Validate and pre-build step records BEFORE writing anything to the database
    // This prevents the bug where Campaign is created but steps fail validation,
    // leaving an orphaned Campaign record and showing a false error to the user.
    const preValidatedSteps = safeSteps.length > 0 ? safeSteps.map((step, index) => ({
      stepOrder: step.stepOrder || index + 1,
      cardDesignId: step.cardDesignId,
      templateId: step.templateId || null,
      messageText: step.messageText || '',
      timingDays: step.timingDays,
      timingReference: step.timingReference || 'trigger_date',
      isEnabled: step.isEnabled !== false
    })) : [];

    for (let i = 0; i < preValidatedSteps.length; i++) {
      const step = preValidatedSteps[i];
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
      if (campaignStatus !== 'draft' && !step.templateId && !step.messageText) {
        return Response.json({
          success: false,
          error: `Step ${i + 1} requires either a template or a custom message`
        }, { status: 400 });
      }
    }

    // All validation passed — now write to the database
    console.error('[createCampaign][DIAG] creating campaign record', {
      requestId,
      orgId,
      ownerId: user.id,
      triggerField,
      status: campaignStatus,
      preValidatedStepsCount: preValidatedSteps.length,
    });
    const campaign = await base44.entities.Campaign.create({
      name: name || `${campaignType.name} Campaign`,
      type: campaignType.slug,
      triggerTypeId: campaignType.id,
      triggerField,
      // Transitional compatibility: legacy reads may still use dateField.
      dateField: triggerField,
      enrollmentMode,
      requiresApproval,
      returnAddressMode,
      status: campaignStatus,
      orgId,
      ownerId: user.id,
      createdBy: user.id,
      createdAt: new Date().toISOString()
    });

    console.error('[createCampaign][DIAG] campaign record created', { requestId, campaignId: campaign.id });

    // Create campaign steps (already validated above)
    if (preValidatedSteps.length > 0) {
      const stepRecords = preValidatedSteps.map(step => ({ campaignId: campaign.id, ...step }));
      await base44.entities.CampaignStep.bulkCreate(stepRecords);
    }

    // Auto-enroll eligible clients if opt_out mode AND status is active
    let enrolledCount = 0;
    if (enrollmentMode === 'opt_out' && campaignStatus === 'active') {
      try {
        const allClients = await base44.entities.Client.filter({
          orgId,
          ownerId: user.id
        });

        const eligibleClients = allClients.filter((client) => {
          const hasFieldValue = client[triggerField] && client[triggerField] !== '';
          return hasFieldValue && isClientAutomationEligible(client);
        });

        if (eligibleClients.length > 0) {
          const existingEnrollments = await base44.entities.CampaignEnrollment.filter({ campaignId: campaign.id });
          const existingClientIds = new Set(existingEnrollments.map((enrollment) => enrollment.clientId));
          const clientsToEnroll = eligibleClients.filter((client) => !existingClientIds.has(client.id));

          const enrollmentRecords = clientsToEnroll.map((client) => ({
            campaignId: campaign.id,
            orgId,
            clientId: client.id,
            status: 'enrolled',
            enrolledAt: new Date().toISOString()
          }));

          if (clientsToEnroll.length > 0) {
            await base44.entities.CampaignEnrollment.bulkCreate(enrollmentRecords);
            enrolledCount = clientsToEnroll.length;
          }

          // FIX #10: Concurrent tag updates instead of sequential loop
          const campaignTag = `${campaignType.name} Campaign`;
          const tagUpdatePromises = clientsToEnroll
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
      } catch (enrollmentError) {
        console.error('Error during auto-enrollment:', enrollmentError);
      }
    }

    return Response.json({
      success: true,
      requestId,
      campaignId: campaign.id,
      stepsCreated: safeSteps.length,
      enrolledCount,
      message: 'Campaign created successfully'
    });

  } catch (error) {
    console.error('[createCampaign] unhandled error', {
      requestId,
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return Response.json({
      success: false,
      requestId,
      error: error.message || 'An error occurred while creating the campaign'
    }, { status: 500 });
  }
});