import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
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
      dateField,
      enrollmentMode = 'opt_out',
      requiresApproval = false,
      returnAddressMode = 'company',
      status: campaignStatus = 'draft',
      steps = []
    } = body;

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
      return Response.json({
        success: false,
        error: 'Invalid campaign type. Please select a valid campaign type.'
      }, { status: 400 });
    }

    // Resolve the trigger field from the CampaignType record
    const triggerField = dateField || campaignType.triggerField;
    if (!triggerField) {
      return Response.json({
        success: false,
        error: 'Campaign type is missing a triggerField configuration. Contact your administrator.'
      }, { status: 400 });
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
    const preValidatedSteps = steps.length > 0 ? steps.map((step, index) => ({
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
    const campaign = await base44.entities.Campaign.create({
      name: name || `${campaignType.name} Campaign`,
      type: campaignType.slug,
      triggerTypeId: campaignType.id,
      dateField: triggerField,
      enrollmentMode,
      requiresApproval,
      returnAddressMode,
      status: campaignStatus,
      orgId,
      ownerId: user.id,
      createdAt: new Date().toISOString()
    });

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
          const automationEnabled = client.automationEnabled !== false;
          return hasFieldValue && automationEnabled;
        });

        if (eligibleClients.length > 0) {
          const enrollmentRecords = eligibleClients.map((client) => ({
            campaignId: campaign.id,
            clientId: client.id,
            status: 'active',
            enrolledAt: new Date().toISOString()
          }));
          await base44.entities.CampaignEnrollment.bulkCreate(enrollmentRecords);
          enrolledCount = eligibleClients.length;

          // FIX #10: Concurrent tag updates instead of sequential loop
          const campaignTag = `${campaignType.name} Campaign`;
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
      } catch (enrollmentError) {
        console.error('Error during auto-enrollment:', enrollmentError);
      }
    }

    return Response.json({
      success: true,
      campaignId: campaign.id,
      stepsCreated: steps?.length || 0,
      enrolledCount,
      message: 'Campaign created successfully'
    });

  } catch (error) {
    console.error('createCampaign error:', error);
    return Response.json({
      success: false,
      error: error.message || 'An error occurred while creating the campaign'
    }, { status: 500 });
  }
});