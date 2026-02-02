import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // 1. Get current user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Validate user role - must be owner or manager
    const appRole = user.appRole || user.orgRole;
    if (!appRole || !['owner', 'manager'].includes(appRole)) {
      return Response.json({ 
        success: false, 
        error: 'Permission denied. Only organization owners or managers can update campaigns.' 
      }, { status: 403 });
    }

    // Get user's orgId from UserProfile
    const userProfiles = await base44.entities.UserProfile.filter({ userId: user.id });
    if (!userProfiles || userProfiles.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'User profile not found.' 
      }, { status: 400 });
    }
    const userOrgId = userProfiles[0].orgId;

    // Parse request body
    const body = await req.json();
    const { campaignId, updates } = body;

    if (!campaignId) {
      return Response.json({ 
        success: false, 
        error: 'campaignId is required.' 
      }, { status: 400 });
    }

    if (!updates || typeof updates !== 'object') {
      return Response.json({ 
        success: false, 
        error: 'updates object is required.' 
      }, { status: 400 });
    }

    // Load Campaign record
    const campaigns = await base44.entities.Campaign.filter({ id: campaignId });
    if (!campaigns || campaigns.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Campaign not found.' 
      }, { status: 404 });
    }
    const campaign = campaigns[0];

    // Verify user owns the campaign (same org)
    if (campaign.orgId !== userOrgId) {
      return Response.json({ 
        success: false, 
        error: 'Access denied. Campaign belongs to a different organization.' 
      }, { status: 403 });
    }

    // 2. Build campaign update object with allowed fields only
    const allowedCampaignFields = ['name', 'status', 'requiresApproval', 'description', 'enrollmentMode'];
    const campaignUpdates = {};
    
    for (const field of allowedCampaignFields) {
      if (updates[field] !== undefined) {
        // Validate status if provided
        if (field === 'status') {
          const validStatuses = ['active', 'paused', 'draft'];
          if (!validStatuses.includes(updates[field])) {
            return Response.json({ 
              success: false, 
              error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
            }, { status: 400 });
          }
        }
        // Validate enrollmentMode if provided
        if (field === 'enrollmentMode') {
          const validModes = ['opt_in', 'opt_out'];
          if (!validModes.includes(updates[field])) {
            return Response.json({ 
              success: false, 
              error: `Invalid enrollmentMode. Must be one of: ${validModes.join(', ')}` 
            }, { status: 400 });
          }
        }
        campaignUpdates[field] = updates[field];
      }
    }

    // Update campaign record if there are changes
    if (Object.keys(campaignUpdates).length > 0) {
      await base44.asServiceRole.entities.Campaign.update(campaignId, campaignUpdates);
    }

    // 3. If steps array is provided, replace all steps
    if (updates.steps !== undefined) {
      if (!Array.isArray(updates.steps)) {
        return Response.json({ 
          success: false, 
          error: 'steps must be an array.' 
        }, { status: 400 });
      }

      // a. Delete all existing CampaignStep records for this campaign
      const existingSteps = await base44.entities.CampaignStep.filter({ campaignId: campaignId });
      for (const step of existingSteps) {
        await base44.asServiceRole.entities.CampaignStep.delete(step.id);
      }

      // b. Create new CampaignStep records
      for (const step of updates.steps) {
        if (step.stepOrder === undefined || !step.cardDesignId || step.timingDays === undefined) {
          return Response.json({ 
            success: false, 
            error: 'Each step requires stepOrder, cardDesignId, and timingDays.' 
          }, { status: 400 });
        }

        await base44.asServiceRole.entities.CampaignStep.create({
          campaignId: campaignId,
          stepOrder: step.stepOrder,
          cardDesignId: step.cardDesignId,
          templateId: step.templateId || null,
          messageText: step.messageText || null,
          timingDays: step.timingDays,
          timingReference: step.timingReference || 'trigger_date',
          isEnabled: step.isEnabled !== undefined ? step.isEnabled : true
        });
      }

      // c. Delete all pending ScheduledSend records
      const pendingSends = await base44.entities.ScheduledSend.filter({ 
        campaignId: campaignId,
        status: 'pending'
      });
      const awaitingApprovalSends = await base44.entities.ScheduledSend.filter({ 
        campaignId: campaignId,
        status: 'awaiting_approval'
      });

      for (const send of [...pendingSends, ...awaitingApprovalSends]) {
        await base44.asServiceRole.entities.ScheduledSend.delete(send.id);
      }
    }

    // 4. Return success
    return Response.json({ success: true });

  } catch (error) {
    console.error('updateCampaign error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    }, { status: 500 });
  }
});