import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await req.json();

    // Validate required fields
    if (!clientId) {
      return Response.json({ 
        success: false, 
        error: 'Missing required field: clientId' 
      }, { status: 400 });
    }

    // Get user's orgId
    let orgId = null;
    const userProfiles = await base44.entities.UserProfile.filter({ userId: user.id });
    
    if (userProfiles && userProfiles.length > 0) {
      orgId = userProfiles[0].orgId;
    } else if (user.role !== 'admin') {
      return Response.json({ success: false, error: 'User profile not found.' }, { status: 400 });
    }

    // Fetch the client
    const clients = await base44.entities.Client.filter({ id: clientId });
    if (!clients || clients.length === 0) {
      return Response.json({ success: false, error: 'Client not found' }, { status: 404 });
    }
    const client = clients[0];

    // Verify org ownership
    if (orgId && client.orgId !== orgId) {
      return Response.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    // Fetch client's enrollments
    const enrollments = await base44.entities.CampaignEnrollment.filter({ clientId });

    // Fetch all campaigns in the org
    const allCampaigns = await base44.entities.Campaign.filter({ orgId: client.orgId });
    const campaignMap = new Map(allCampaigns.map(c => [c.id, c]));

    // Build enrolled campaigns list
    const enrolled = enrollments.map(enrollment => {
      const campaign = campaignMap.get(enrollment.campaignId);
      if (!campaign) return null;
      
      return {
        enrollmentId: enrollment.id,
        campaignId: enrollment.campaignId,
        campaignName: campaign.name,
        campaignType: campaign.type,
        campaignStatus: campaign.status,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        excludedAt: enrollment.excludedAt
      };
    }).filter(Boolean);

    // Determine which trigger fields the client has
    const clientFields = {
      birthday: !!client.birthday,
      policy_start_date: !!client.policy_start_date,
      renewal_date: !!client.renewal_date
    };

    // Mapping campaign type to required field
    const triggerFieldMap = {
      birthday: 'birthday',
      welcome: 'policy_start_date',
      renewal: 'renewal_date'
    };

    // Find campaigns client is NOT enrolled in but could be
    const enrolledCampaignIds = new Set(enrollments.map(e => e.campaignId));
    
    const available = allCampaigns
      .filter(campaign => {
        // Not already enrolled
        if (enrolledCampaignIds.has(campaign.id)) return false;
        // Campaign is active
        if (campaign.status !== 'active') return false;
        return true;
      })
      .map(campaign => {
        const requiredField = triggerFieldMap[campaign.type];
        return {
          campaignId: campaign.id,
          campaignName: campaign.name,
          campaignType: campaign.type,
          requiredField,
          hasRequiredField: clientFields[requiredField] || false
        };
      });

    return Response.json({ 
      success: true,
      enrolled,
      available
    });

  } catch (error) {
    console.error('getClientCampaigns error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An error occurred' 
    }, { status: 500 });
  }
});