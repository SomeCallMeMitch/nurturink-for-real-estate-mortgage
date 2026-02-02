import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, search, page = 1, limit = 25 } = await req.json();

    // Validate required fields
    if (!campaignId) {
      return Response.json({ 
        success: false, 
        error: 'Missing required field: campaignId' 
      }, { status: 400 });
    }

    const actualLimit = Math.min(Math.max(1, limit), 100);
    const actualPage = Math.max(1, page);

    // Get user's orgId
    let orgId = null;
    const userProfiles = await base44.entities.UserProfile.filter({ userId: user.id });
    
    if (userProfiles && userProfiles.length > 0) {
      orgId = userProfiles[0].orgId;
    } else if (user.role !== 'admin') {
      return Response.json({ success: false, error: 'User profile not found.' }, { status: 400 });
    }

    // Fetch the campaign
    const campaigns = await base44.entities.Campaign.filter({ id: campaignId });
    if (!campaigns || campaigns.length === 0) {
      return Response.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }
    const campaign = campaigns[0];

    // Verify org ownership
    if (orgId && campaign.orgId !== orgId) {
      return Response.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Determine required field
    const triggerFieldMap = {
      birthday: 'birthday',
      welcome: 'policy_start_date',
      renewal: 'renewal_date'
    };
    const requiredField = triggerFieldMap[campaign.type];

    // Fetch all clients in the org
    const allClients = await base44.entities.Client.filter({ orgId: campaign.orgId });

    // Fetch existing enrollments
    const existingEnrollments = await base44.entities.CampaignEnrollment.filter({ campaignId });
    const enrolledClientIds = new Set(existingEnrollments.map(e => e.clientId));

    // Filter eligible clients (have required field AND not already enrolled)
    let eligibleClients = allClients.filter(client => {
      // Must have the required date field
      if (!client[requiredField]) return false;
      // Must not be already enrolled
      if (enrolledClientIds.has(client.id)) return false;
      // Automation must be enabled
      if (client.automationEnabled === false) return false;
      return true;
    });

    // Apply search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      eligibleClients = eligibleClients.filter(client => 
        client.fullName?.toLowerCase().includes(searchLower) ||
        client.firstName?.toLowerCase().includes(searchLower) ||
        client.lastName?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const total = eligibleClients.length;
    const totalPages = Math.ceil(total / actualLimit);
    const skip = (actualPage - 1) * actualLimit;

    // Apply pagination
    const paginatedClients = eligibleClients.slice(skip, skip + actualLimit);

    // Format response
    const formattedClients = paginatedClients.map(client => ({
      clientId: client.id,
      clientName: client.fullName || `${client.firstName} ${client.lastName}`,
      clientEmail: client.email,
      triggerDate: client[requiredField]
    }));

    return Response.json({ 
      success: true,
      clients: formattedClients,
      pagination: {
        page: actualPage,
        limit: actualLimit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('getCampaignEligibleClients error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An error occurred' 
    }, { status: 500 });
  }
});