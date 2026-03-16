import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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
      type,             // TriggerType key (e.g., 'birthday')
      triggerTypeId,    // TriggerType record ID
      dateField,        // Client field to check (e.g., 'birthday', 'renewal_date')
      enrollmentMode = 'opt_out',
      requiresApproval = false,
      returnAddressMode = 'company',
      status: campaignStatus = 'draft',
      steps = []
    } = body;

    // Validate type against TriggerType entity instead of hardcoded list
    let triggerType = null;
    if (triggerTypeId) {
      try {
        triggerType = await base44.entities.TriggerType.get(triggerTypeId);
      } catch (e) {
        // TriggerType not found by ID — fall through to key lookup
      }
    }
    if (!triggerType && type) {
      const matches = await base44.entities.TriggerType.filter({ key: type, isActive: true });
      triggerType = matches[0] || null;
    }
    if (!triggerType) {
      return Response.json({
        success: false,
        error: 'Invalid campaign type. Please select a valid campaign type.'
      }, { status: 400 });
    }

    // Resolve the trigger field from the TriggerType record
    const triggerField = dateField || triggerType.dateField;
    if (!triggerField) {
      return Response.json({
        success: false,
        error: 'Campaign type is missing a dateField configuration. Contact your administrator.'
      }, { status: 400 });
    }

    // Get user's orgId
    const orgId = user.orgId;
    if (!orgId) {
      return Response.json({
        success: false,
        error: 'User is not associated with an organization'
      }, { status: 400 });
    }

    // Create the campaign record
    const campaign = await base44.entities.Campaign.create({
      name: name || `${triggerType.name} Campaign`,
      type: triggerType.key,
      triggerTypeId: triggerType.id,
      dateField: triggerField,
      enrollmentMode,
      requiresApproval,
      returnAddressMode,
      status: campaignStatus,
      orgId,
      ownerId: user.id,
      createdAt: new Date().toISOString()
    });

    // Validate and create campaign steps
    if (steps.length > 0) {
      const stepRecords = steps.map((step: any, index: number) => ({
        campaignId: campaign.id,
        stepOrder: step.stepOrder || index + 1,
        cardDesignId: step.cardDesignId,
        templateId: step.templateId || null,
        messageText: step.messageText || '',
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
        if (campaignStatus !== 'draft' && !step.templateId && !step.messageText) {
          return Response.json({
            success: false,
            error: `Step ${i + 1} requires either a template or a custom message`
          }, { status: 400 });
        }
      }

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

        const eligibleClients = allClients.filter((client: any) => {
          const hasFieldValue = client[triggerField] && client[triggerField] !== '';
          const automationEnabled = client.automationEnabled !== false;
          return hasFieldValue && automationEnabled;
        });

        if (eligibleClients.length > 0) {
          const enrollmentRecords = eligibleClients.map((client: any) => ({
            campaignId: campaign.id,
            clientId: client.id,
            status: 'active',
            enrolledAt: new Date().toISOString()
          }));
          await base44.entities.CampaignEnrollment.bulkCreate(enrollmentRecords);
          enrolledCount = eligibleClients.length;

          // FIX #10: Tag clients in batches to avoid sequential per-client updates.
          // Build a map of updated tag arrays first, then fire all updates concurrently.
          const campaignTag = `${triggerType.name} Campaign`;
          const tagUpdatePromises = eligibleClients
            .filter((client: any) => {
              const existingTags = Array.isArray(client.tags) ? client.tags : [];
              return !existingTags.includes(campaignTag);
            })
            .map((client: any) => {
              const existingTags = Array.isArray(client.tags) ? client.tags : [];
              return base44.entities.Client.update(client.id, {
                tags: [...existingTags, campaignTag]
              });
            });
          await Promise.all(tagUpdatePromises);
        }
      } catch (enrollmentError: any) {
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

  } catch (error: any) {
    console.error('createCampaign error:', error);
    return Response.json({
      success: false,
      error: error.message || 'An error occurred while creating the campaign'
    }, { status: 500 });
  }
});
