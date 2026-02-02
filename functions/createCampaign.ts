import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // 1. Get current user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate user role - must be owner or manager
    const appRole = user.appRole || user.orgRole;
    if (!appRole || !['owner', 'manager'].includes(appRole)) {
      return Response.json({ 
        success: false, 
        error: 'Permission denied. Only organization owners or managers can create campaigns.' 
      }, { status: 403 });
    }

    // 3. Get user's orgId from UserProfile
    const userProfiles = await base44.entities.UserProfile.filter({ userId: user.id });
    if (!userProfiles || userProfiles.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'User profile not found. Please complete your profile setup.' 
      }, { status: 400 });
    }
    const orgId = userProfiles[0].orgId;

    if (!orgId) {
      return Response.json({ 
        success: false, 
        error: 'Organization not found for user.' 
      }, { status: 400 });
    }

    // Parse request body
    const body = await req.json();
    const { name, type, enrollmentMode, requiresApproval, description, steps } = body;

    // Validate required fields
    if (!name || !type || !enrollmentMode) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields: name, type, and enrollmentMode are required.' 
      }, { status: 400 });
    }

    // Validate campaign type
    const validTypes = ['birthday', 'welcome', 'renewal'];
    if (!validTypes.includes(type)) {
      return Response.json({ 
        success: false, 
        error: `Invalid campaign type. Must be one of: ${validTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Validate enrollment mode
    const validEnrollmentModes = ['opt_in', 'opt_out'];
    if (!validEnrollmentModes.includes(enrollmentMode)) {
      return Response.json({ 
        success: false, 
        error: `Invalid enrollment mode. Must be one of: ${validEnrollmentModes.join(', ')}` 
      }, { status: 400 });
    }

    // Validate steps
    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'At least one campaign step is required.' 
      }, { status: 400 });
    }

    // 4. Determine triggerField based on type
    const triggerFieldMap = {
      'birthday': 'birthday',
      'welcome': 'policy_start_date',
      'renewal': 'renewal_date'
    };
    const triggerField = triggerFieldMap[type];

    // 5. Create Campaign record with status='draft'
    const campaign = await base44.asServiceRole.entities.Campaign.create({
      orgId: orgId,
      createdBy: user.id,
      name: name,
      type: type,
      status: 'draft',
      enrollmentMode: enrollmentMode,
      triggerField: triggerField,
      requiresApproval: requiresApproval || false,
      description: description || null
    });

    // 6. Create CampaignStep records for each step
    const createdSteps = [];
    for (const step of steps) {
      // Validate step required fields
      if (step.stepOrder === undefined || !step.cardDesignId || step.timingDays === undefined) {
        // Rollback: delete the campaign we just created
        await base44.asServiceRole.entities.Campaign.delete(campaign.id);
        return Response.json({ 
          success: false, 
          error: 'Each step requires stepOrder, cardDesignId, and timingDays.' 
        }, { status: 400 });
      }

      const stepRecord = await base44.asServiceRole.entities.CampaignStep.create({
        campaignId: campaign.id,
        stepOrder: step.stepOrder,
        cardDesignId: step.cardDesignId,
        templateId: step.templateId || null,
        messageText: step.messageText || null,
        timingDays: step.timingDays,
        timingReference: step.timingReference || 'trigger_date',
        isEnabled: step.isEnabled !== undefined ? step.isEnabled : true
      });
      createdSteps.push(stepRecord);
    }

    // 7. Return success response
    return Response.json({ 
      success: true, 
      campaignId: campaign.id,
      stepsCreated: createdSteps.length
    });

  } catch (error) {
    console.error('createCampaign error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    }, { status: 500 });
  }
});