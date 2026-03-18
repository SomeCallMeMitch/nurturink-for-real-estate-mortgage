import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, clientId } = await req.json();

    // Validate required fields
    if (!campaignId || !clientId) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields: campaignId and clientId' 
      }, { status: 400 });
    }

    // Get user's orgId from UserProfile
    let orgId = null;
    let userProfile = null;
    
    const userProfiles = await base44.entities.UserProfile.filter({ userId: user.id });
    
    if (userProfiles && userProfiles.length > 0) {
      userProfile = userProfiles[0];
      orgId = userProfile.orgId;
    } else if (user.role === 'admin') {
      // Super admin - proceed without org restriction
    } else {
      return Response.json({ 
        success: false, 
        error: 'User profile not found. Please complete onboarding.' 
      }, { status: 400 });
    }

    // Check permission (owner or manager)
    if (userProfile && user.role !== 'admin') {
      const allowedRoles = ['owner', 'manager'];
      if (!allowedRoles.includes(userProfile.orgRole)) {
        return Response.json({ 
          success: false, 
          error: 'Permission denied. Only organization owners and managers can manage enrollments.' 
        }, { status: 403 });
      }
    }

    // Fetch the campaign and verify ownership
    const campaigns = await base44.entities.Campaign.filter({ id: campaignId });
    if (!campaigns || campaigns.length === 0) {
      return Response.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }
    const campaign = campaigns[0];

    // Verify campaign belongs to user's org (skip for super_admin)
    if (orgId && campaign.orgId !== orgId) {
      return Response.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Fetch the client and verify ownership
    const clients = await base44.entities.Client.filter({ id: clientId });
    if (!clients || clients.length === 0) {
      return Response.json({ success: false, error: 'Client not found' }, { status: 404 });
    }
    const client = clients[0];

    // Verify client belongs to same org as campaign
    if (client.orgId !== campaign.orgId) {
      return Response.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    // Check if client is already enrolled
    const existingEnrollments = await base44.entities.CampaignEnrollment.filter({ 
      campaignId, 
      clientId 
    });

    if (existingEnrollments && existingEnrollments.length > 0) {
      const existing = existingEnrollments[0];
      if (existing.status === 'enrolled') {
        return Response.json({ 
          success: false, 
          error: 'Client is already enrolled in this campaign' 
        }, { status: 400 });
      }
      // If excluded, reactivate
      if (existing.status === 'excluded') {
        await base44.entities.CampaignEnrollment.update(existing.id, {
          status: 'enrolled',
          enrolledAt: new Date().toISOString(),
          excludedAt: null
        });
        return Response.json({ 
          success: true, 
          enrollmentId: existing.id,
          message: 'Client re-enrolled in campaign'
        });
      }
    }

    // Determine required field based on campaign type
    const triggerFieldMap = {
      birthday: 'birthday',
      welcome: 'policy_start_date',
      renewal: 'renewal_date'
    };
    const requiredField = triggerFieldMap[campaign.type];

    // Check if client has the required trigger field
    if (!client[requiredField]) {
      const fieldLabels = {
        birthday: 'birthday date',
        policy_start_date: 'policy start date',
        renewal_date: 'renewal date'
      };
      return Response.json({ 
        success: false, 
        error: `Client cannot be enrolled: missing ${fieldLabels[requiredField]}. Please update the client's profile first.`
      }, { status: 400 });
    }

    // Create enrollment record
    const enrollment = await base44.entities.CampaignEnrollment.create({
      campaignId,
      clientId,
      status: 'enrolled',
      enrolledAt: new Date().toISOString()
    });

    return Response.json({ 
      success: true, 
      enrollmentId: enrollment.id,
      message: 'Client enrolled successfully'
    });

  } catch (error) {
    console.error('enrollClientInCampaign error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An error occurred while enrolling the client' 
    }, { status: 500 });
  }
});