import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type, enrollmentMode, requiresApproval, description, steps } = await req.json();

    // Validate required fields
    if (!name || !type || !enrollmentMode) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields: name, type, enrollmentMode' 
      }, { status: 400 });
    }

    // Validate type
    const validTypes = ['birthday', 'welcome', 'renewal'];
    if (!validTypes.includes(type)) {
      return Response.json({ 
        success: false, 
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Validate enrollmentMode
    const validModes = ['opt_in', 'opt_out'];
    if (!validModes.includes(enrollmentMode)) {
      return Response.json({ 
        success: false, 
        error: `Invalid enrollmentMode. Must be one of: ${validModes.join(', ')}` 
      }, { status: 400 });
    }

    // Get user's orgId from UserProfile
    const userProfiles = await base44.entities.UserProfile.filter({ userId: user.id });
    if (!userProfiles || userProfiles.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'User profile not found. Please complete onboarding.' 
      }, { status: 400 });
    }

    const userProfile = userProfiles[0];
    const orgId = userProfile.orgId;

    // Validate user has permission (owner or manager)
    const allowedRoles = ['owner', 'manager'];
    if (!allowedRoles.includes(userProfile.orgRole)) {
      return Response.json({ 
        success: false, 
        error: 'Permission denied. Only organization owners and managers can create campaigns.' 
      }, { status: 403 });
    }

    // Determine triggerField based on type
    const triggerFieldMap = {
      birthday: 'birthday',
      welcome: 'policy_start_date',
      renewal: 'renewal_date'
    };
    const triggerField = triggerFieldMap[type];

    // Create Campaign record
    const campaignData = {
      orgId,
      createdBy: user.id,
      name,
      type,
      status: 'draft',
      enrollmentMode,
      triggerField,
      requiresApproval: requiresApproval || false,
      description: description || null
    };

    const campaign = await base44.entities.Campaign.create(campaignData);

    // Create CampaignStep records if provided
    if (steps && Array.isArray(steps) && steps.length > 0) {
      const stepRecords = steps.map((step, index) => ({
        campaignId: campaign.id,
        stepOrder: step.stepOrder || index + 1,
        cardDesignId: step.cardDesignId,
        templateId: step.templateId || null,
        messageText: step.messageText || null,
        timingDays: step.timingDays,
        timingReference: step.timingReference || 'trigger_date',
        isEnabled: step.isEnabled !== false
      }));

      // Validate steps have required fields
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
      }

      await base44.entities.CampaignStep.bulkCreate(stepRecords);
    }

    return Response.json({ 
      success: true, 
      campaignId: campaign.id,
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