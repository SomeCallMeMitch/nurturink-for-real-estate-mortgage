import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * testSchedulerForClient.js
 * 
 * Purpose: Test what would be scheduled for a specific client without creating records.
 * Useful for debugging and showing users what to expect.
 * 
 * Input: { clientId: string, campaignId?: string }
 * 
 * Returns: Array of what WOULD be scheduled:
 * {
 *   campaignName: string,
 *   stepOrder: number,
 *   triggerDate: string,
 *   scheduledDate: string,
 *   cardDesignName: string,
 *   wouldBeStatus: 'pending' | 'awaiting_approval' | 'already_scheduled' | 'insufficient_credits'
 * }
 */

// Date helpers (same as runDailyScheduler)
function getNextOccurrence(dateStr, campaignType) {
  if (!dateStr) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (campaignType === 'welcome') {
    return new Date(dateStr);
  }
  
  const date = new Date(dateStr);
  const thisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate());
  const nextYear = new Date(today.getFullYear() + 1, date.getMonth(), date.getDate());
  
  return thisYear >= today ? thisYear : nextYear;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isWithinDays(date, days) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureLimit = addDays(today, days);
  futureLimit.setHours(23, 59, 59, 999);
  return date >= today && date <= futureLimit;
}

function getTriggerField(campaignType) {
  switch (campaignType) {
    case 'birthday': return 'birthday';
    case 'renewal': return 'renewal_date';
    case 'welcome': return 'policy_start_date';
    default: return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { clientId, campaignId } = await req.json();

    if (!clientId) {
      return Response.json({ error: 'clientId is required' }, { status: 400 });
    }

    // Get client
    const clients = await base44.asServiceRole.entities.Client.filter({ id: clientId });
    if (!clients || clients.length === 0) {
      return Response.json({ error: 'Client not found' }, { status: 404 });
    }
    const client = clients[0];

    // Get enrollments for this client
    const enrollmentFilter = { clientId };
    if (campaignId) {
      enrollmentFilter.campaignId = campaignId;
    }
    const enrollments = await base44.asServiceRole.entities.CampaignEnrollment.filter(enrollmentFilter);

    // Get existing scheduled sends for this client
    const existingSends = await base44.asServiceRole.entities.ScheduledSend.filter({ clientId });
    const existingSendKeys = new Set(
      existingSends.map(s => `${s.campaignStepId}-${s.scheduledDate}`)
    );

    const projectedSends = [];

    for (const enrollment of enrollments) {
      if (enrollment.status !== 'enrolled') continue;

      // Get campaign
      const campaigns = await base44.asServiceRole.entities.Campaign.filter({ id: enrollment.campaignId });
      if (!campaigns || campaigns.length === 0) continue;
      const campaign = campaigns[0];

      if (campaign.status !== 'active') continue;

      // Get trigger date
      const triggerField = getTriggerField(campaign.type);
      const triggerDateStr = client[triggerField];

      if (!triggerDateStr) {
        projectedSends.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          campaignType: campaign.type,
          stepOrder: null,
          triggerDate: null,
          scheduledDate: null,
          cardDesignName: null,
          wouldBeStatus: 'missing_trigger_date',
          reason: `Client is missing ${triggerField}`
        });
        continue;
      }

      const triggerDate = getNextOccurrence(triggerDateStr, campaign.type);
      if (!triggerDate) continue;

      // Get steps
      const steps = await base44.asServiceRole.entities.CampaignStep.filter({
        campaignId: campaign.id,
        isEnabled: true
      });

      // Check credit availability
      const orgs = await base44.asServiceRole.entities.Organization.filter({ id: campaign.orgId });
      const org = orgs?.[0];
      const poolBalance = org?.creditBalance || 0;
      const pendingSends = await base44.asServiceRole.entities.ScheduledSend.filter({
        orgId: campaign.orgId
      });
      const reservedCredits = pendingSends.filter(s => 
        ['pending', 'awaiting_approval', 'processing'].includes(s.status)
      ).length;
      const availableCredits = Math.max(0, poolBalance - reservedCredits);

      for (const step of steps) {
        const sendDate = addDays(triggerDate, step.timingDays);
        const sendDateStr = formatDate(sendDate);
        const sendKey = `${step.id}-${sendDateStr}`;

        // Get card design name
        let cardDesignName = 'Unknown';
        if (step.cardDesignId) {
          const designs = await base44.asServiceRole.entities.CardDesign.filter({ id: step.cardDesignId });
          cardDesignName = designs[0]?.name || 'Unknown';
        }

        // Determine status
        let wouldBeStatus = 'pending';
        let reason = null;

        if (existingSendKeys.has(sendKey)) {
          wouldBeStatus = 'already_scheduled';
          reason = 'A ScheduledSend already exists for this step and date';
        } else if (!isWithinDays(sendDate, 14)) {
          wouldBeStatus = 'outside_window';
          reason = 'Scheduled date is more than 14 days away';
        } else if (availableCredits < 1) {
          wouldBeStatus = 'insufficient_credits';
          reason = `Only ${availableCredits} credits available`;
        } else if (campaign.requiresApproval) {
          wouldBeStatus = 'awaiting_approval';
          reason = 'Campaign requires approval before sending';
        }

        projectedSends.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          campaignType: campaign.type,
          stepOrder: step.stepOrder,
          triggerDate: formatDate(triggerDate),
          scheduledDate: sendDateStr,
          timingDays: step.timingDays,
          cardDesignId: step.cardDesignId,
          cardDesignName,
          wouldBeStatus,
          reason
        });
      }
    }

    // Sort by scheduledDate
    projectedSends.sort((a, b) => {
      if (!a.scheduledDate) return 1;
      if (!b.scheduledDate) return -1;
      return a.scheduledDate.localeCompare(b.scheduledDate);
    });

    return Response.json({
      success: true,
      client: {
        id: client.id,
        fullName: client.fullName,
        birthday: client.birthday,
        renewal_date: client.renewal_date,
        policy_start_date: client.policy_start_date
      },
      projectedSends,
      count: projectedSends.length
    });

  } catch (error) {
    console.error('[testSchedulerForClient] Error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});