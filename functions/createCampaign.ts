import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // === DIAGNOSTIC LOGGING START ===
    console.log('[createCampaign] === DIAGNOSTIC INFO ===');
    console.log('[createCampaign] user.id:', user?.id);
    console.log('[createCampaign] user.email:', user?.email);
    console.log('[createCampaign] user.role:', user?.role);
    console.log('[createCampaign] user object:', JSON.stringify(user, null, 2));
    // === DIAGNOSTIC LOGGING END ===

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type, enrollmentMode, requiresApproval, returnAddressMode, description, steps, status } = await req.json();

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

    // Validate returnAddressMode if provided
    const validReturnModes = ['company', 'rep', 'none'];
    const finalReturnAddressMode = returnAddressMode && validReturnModes.includes(returnAddressMode) 
      ? returnAddressMode 
      : 'company';

    // Get user's orgId - prioritize direct assignment, then UserProfile
    let orgId = user.orgId || null;
    let userProfile = null;

    console.log('[createCampaign] Initial orgId from user object:', orgId);
    
    // Always fetch UserProfile as it's needed for permission checking later
    console.log('[createCampaign] Fetching UserProfile for userId:', user.id);
    const userProfiles = await base44.entities.UserProfile.filter({ userId: user.id });
    
    if (userProfiles && userProfiles.length > 0) {
      userProfile = userProfiles[0];
      // If orgId wasn't on user object, try getting it from profile
      if (!orgId && userProfile.orgId) {
        orgId = userProfile.orgId;
        console.log('[createCampaign] Using orgId from UserProfile:', orgId);
      }
    }

    // Critical check: Ensure we have an orgId
    if (!orgId) {
      console.log('[createCampaign] ERROR: No orgId found for user');
      return Response.json({ 
        success: false, 
        error: 'No organization associated with your account. You must belong to an organization to create a campaign.' 
      }, { status: 400 });
    }
    
    console.log('[createCampaign] Final orgId to be used:', orgId);

    // PHASE 1: Removed role restriction - ALL users (reps) can now create campaigns
    // Campaign ownership is tracked by ownerId field
    console.log('[createCampaign] User role:', user.role, 'OrgRole:', userProfile?.orgRole);

    // Determine triggerField based on type
    const triggerFieldMap = {
      birthday: 'birthday',
      welcome: 'policy_start_date',
      renewal: 'renewal_date'
    };
    const triggerField = triggerFieldMap[type];

    // Validate status if provided
    const validStatuses = ['draft', 'active', 'paused'];
    const campaignStatus = status && validStatuses.includes(status) ? status : 'draft';

    // Create Campaign record
    // PHASE 1: Added ownerId field for rep-based campaign ownership
    const campaignData = {
      orgId,
      ownerId: user.id,  // Rep who owns this campaign
      createdBy: user.id,
      name,
      type,
      status: campaignStatus,
      enrollmentMode,
      triggerField,
      requiresApproval: requiresApproval || false,
      returnAddressMode: finalReturnAddressMode,
      description: description || null
    };

    console.log('[createCampaign] Creating campaign with data:', JSON.stringify(campaignData, null, 2));

    const campaign = await base44.entities.Campaign.create(campaignData);
    console.log('[createCampaign] Campaign created successfully, id:', campaign.id);

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

    // Auto-enroll eligible clients if opt_out mode AND status is active
    let enrolledCount = 0;
    if (enrollmentMode === 'opt_out' && campaignStatus === 'active') {
      try {
        // Fetch all clients for this organization
        const allClients = await base44.entities.Client.filter({ orgId });

        // Filter eligible clients (have trigger field value and automation enabled)
        const eligibleClients = allClients.filter(client => {
          const hasFieldValue = client[triggerField] && client[triggerField] !== '';
          const automationEnabled = client.automationEnabled !== false;
          return hasFieldValue && automationEnabled;
        });

        // Create enrollment records for each eligible client
        if (eligibleClients.length > 0) {
          const enrollmentRecords = eligibleClients.map(client => ({
            campaignId: campaign.id,
            clientId: client.id,
            status: 'enrolled',
            enrolledAt: new Date().toISOString()
          }));

          await base44.entities.CampaignEnrollment.bulkCreate(enrollmentRecords);
          enrolledCount = eligibleClients.length;
        }
      } catch (enrollmentError) {
        console.error('Error during auto-enrollment:', enrollmentError);
        // Don't fail the campaign creation if enrollment fails
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