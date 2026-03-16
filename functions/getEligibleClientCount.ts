import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { campaignType, dateField } = body;

    // Look up TriggerType by key to get the dateField if not provided directly
    let triggerField = dateField;
    if (!triggerField && campaignType) {
      const triggerTypes = await base44.entities.TriggerType.filter({ key: campaignType, isActive: true });
      const tt = triggerTypes[0];
      if (!tt) {
        return Response.json({
          success: false,
          error: `Unknown campaign type: ${campaignType}`
        }, { status: 400 });
      }
      triggerField = tt.dateField;
    }

    if (!triggerField) {
      return Response.json({
        success: false,
        error: 'Could not determine which client field to check'
      }, { status: 400 });
    }

    // Get orgId directly from user (no UserProfile lookup needed)
    const orgId = user.orgId;
    if (!orgId) {
      return Response.json({ success: true, count: 0, triggerField });
    }

    // Fetch only the rep's own clients
    const allClients = await base44.entities.Client.filter({
      orgId,
      ownerId: user.id
    });

    // Count clients where the trigger field is set and automation is enabled
    const eligibleClients = allClients.filter((client) => {
      const hasFieldValue = client[triggerField] && client[triggerField] !== '';
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
