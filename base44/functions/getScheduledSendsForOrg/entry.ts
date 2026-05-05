import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * getScheduledSendsForOrg.js
 * 
 * Purpose: Get all scheduled sends for an organization with filtering.
 * 
 * Input: { 
 *   orgId: string,
 *   status?: string | string[],
 *   campaignId?: string,
 *   dateFrom?: string,
 *   dateTo?: string,
 *   limit?: number
 * }
 * 
 * Returns: Array of ScheduledSend records with populated campaign, step, and client info
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      status, 
      campaignId, 
      dateFrom, 
      dateTo, 
      limit = 100 
    } = await req.json();

    const userOrgId = user.orgId;
    if (!userOrgId) {
      return Response.json({ error: 'User organization not found' }, { status: 403 });
    }

    const isOwnerOrManager = ['organization_owner', 'organization_manager'].includes(user.role) || user.isOrgOwner === true;

    // Build filter query
    const filter = { orgId: userOrgId };
    
    if (campaignId) {
      filter.campaignId = campaignId;
    }

    // Get all sends matching base filter
    let sends = await base44.asServiceRole.entities.ScheduledSend.filter(filter);

    if (!isOwnerOrManager) {
      sends = sends.filter(s => {
        const ownerId = s.userId || s.createdBy || s.ownerId || s.createdById;
        return ownerId === user.id;
      });
    }

    // Apply status filter (can be string or array)
    if (status) {
      const statusArray = Array.isArray(status) ? status : [status];
      sends = sends.filter(s => statusArray.includes(s.status));
    }

    // Apply date filters
    if (dateFrom) {
      sends = sends.filter(s => s.scheduledDate >= dateFrom);
    }
    if (dateTo) {
      sends = sends.filter(s => s.scheduledDate <= dateTo);
    }

    // Sort by scheduledDate ascending
    sends.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

    // Apply limit
    if (limit && sends.length > limit) {
      sends = sends.slice(0, limit);
    }

    // Populate related data
    const populatedSends = await Promise.all(sends.map(async (send) => {
      const [campaigns, steps, clients] = await Promise.all([
        base44.asServiceRole.entities.Campaign.filter({ id: send.campaignId }),
        base44.asServiceRole.entities.CampaignStep.filter({ id: send.campaignStepId }),
        base44.asServiceRole.entities.Client.filter({ id: send.clientId })
      ]);

      return {
        ...send,
        campaign: campaigns[0] || null,
        step: steps[0] || null,
        client: clients[0] || null
      };
    }));

    return Response.json({
      success: true,
      sends: populatedSends,
      count: populatedSends.length
    });

  } catch (error) {
    console.error('[getScheduledSendsForOrg] Error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});