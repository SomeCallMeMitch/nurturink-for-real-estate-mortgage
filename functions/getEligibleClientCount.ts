import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const campaignType = body?.campaignType;

    // Validate campaign type
    const validTypes = ['birthday', 'welcome', 'renewal'];
    if (!campaignType || !validTypes.includes(campaignType)) {
      return Response.json({ 
        success: false, 
        error: `Invalid campaignType. Must be one of: ${validTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Get user's orgId from UserProfile
    const userProfiles = await base44.entities.UserProfile.filter({ userId: user.id });
    if (!userProfiles || userProfiles.length === 0) {
      // If no user profile, return 0 eligible clients (not an error)
      return Response.json({ success: true, count: 0, triggerField: null });
    }

    const userProfile = userProfiles[0];
    const orgId = userProfile.orgId;

    if (!orgId) {
      // If no orgId, return 0 eligible clients (not an error)
      return Response.json({ success: true, count: 0, triggerField: null });
    }

    // Determine which field to check based on campaign type
    const triggerFieldMap = {
      birthday: 'birthday',
      welcome: 'policy_start_date',
      renewal: 'renewal_date'
    };
    const triggerField = triggerFieldMap[campaignType];

    // PHASE 2: Fetch only the rep's own clients (not all org clients)
    const allClients = await base44.entities.Client.filter({ 
      orgId,
      ownerId: user.id  // Count only the rep's own clients
    });

    // Count clients where the trigger field is set and automation is enabled
    const eligibleClients = allClients.filter(client => {
      // Check if trigger field has a value
      const hasFieldValue = client[triggerField] && client[triggerField] !== '';
      
      // Check if automation is not disabled (default is enabled)
      const automationEnabled = client.automationEnabled !== false;
      
      return hasFieldValue && automationEnabled;
    });

    return Response.json({ 
      success: true, 
      count: eligibleClients.length,
      triggerField
    });

  } catch (error) {
    console.error('getEligibleClientCount error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An error occurred while counting eligible clients' 
    }, { status: 500 });
  }
});