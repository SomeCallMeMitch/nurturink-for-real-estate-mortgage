import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignType } = await req.json();

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
      return Response.json({ 
        success: false, 
        error: 'User profile not found. Please complete onboarding.' 
      }, { status: 400 });
    }

    const userProfile = userProfiles[0];
    const orgId = userProfile.orgId;

    // Determine which field to check based on campaign type
    const triggerFieldMap = {
      birthday: 'birthday',
      welcome: 'policy_start_date',
      renewal: 'renewal_date'
    };
    const triggerField = triggerFieldMap[campaignType];

    // Fetch all clients for this organization
    const allClients = await base44.entities.Client.filter({ orgId });

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