import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function isClientAutomationEligible(client) {
  return client.automation_status == null || client.automation_status === 'active';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { campaignType, triggerField: requestedTriggerField, dateField } = body;

    // Prefer explicit System B triggerField; dateField remains backwards-compatible input.
    let triggerField = requestedTriggerField || dateField || null;
    if (!triggerField && campaignType) {
      const campaignTypes = await base44.entities.CampaignType.filter({ slug: campaignType, isActive: true });
      const campaignTypeRecord = campaignTypes[0];
      if (!campaignTypeRecord) {
        return Response.json({
          success: false,
          error: `Unknown campaign type: ${campaignType}`
        }, { status: 400 });
      }
      triggerField = campaignTypeRecord.triggerField || null;

      if (!triggerField && campaignTypeRecord.triggerMode === 'manual') {
        return Response.json({
          success: false,
          error: 'Campaign Type requires manual scheduling which is not yet implemented.'
        }, { status: 400 });
      }
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
      return hasFieldValue && isClientAutomationEligible(client);
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
