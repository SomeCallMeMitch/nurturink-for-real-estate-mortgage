/**
 * getUpcomingAutomatedCampaigns.js
 * 
 * Dashboard preview showing upcoming automated card sends.
 * 
 * This function:
 * 1. Fetches all active automation rules for the user
 * 2. Calculates next send dates based on client data and frequency caps
 * 3. Returns upcoming campaigns sorted by date
 * 4. Provides breakdown by trigger type
 * 
 * Query Parameters:
 * - days: Number of days to look ahead (default: 30, max: 365)
 * - triggerType: Filter by specific trigger type (optional)
 * - ruleId: Filter by specific automation rule (optional)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();

    if (!currentUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: User not authenticated' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const daysParam = parseInt(url.searchParams.get('days') || '30', 10);
    const triggerTypeFilter = url.searchParams.get('triggerType');
    const ruleIdFilter = url.searchParams.get('ruleId');

    // Validate parameters
    const days = Math.min(Math.max(daysParam, 1), 365);

    console.log(`[getUpcomingAutomatedCampaigns] Fetching campaigns for next ${days} days`);
    console.log(`  - User: ${currentUser.id}`);
    if (triggerTypeFilter) console.log(`  - Trigger type filter: ${triggerTypeFilter}`);
    if (ruleIdFilter) console.log(`  - Rule ID filter: ${ruleIdFilter}`);

    // Fetch all active automation rules for this user
    const automationRules = await base44.entities.AutomationRule.filter({
      isActive: true,
      created_by: currentUser.id,
    });

    if (!automationRules || automationRules.length === 0) {
      console.log('[getUpcomingAutomatedCampaigns] No active automation rules found');
      return new Response(
        JSON.stringify({
          success: true,
          campaigns: [],
          summary: {
            totalCampaigns: 0,
            totalClients: 0,
            byTriggerType: {},
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[getUpcomingAutomatedCampaigns] Found ${automationRules.length} active rules`);

    // Fetch all clients
    const clients = await base44.entities.Client.filter({
      created_by: currentUser.id,
    });

    if (!clients || clients.length === 0) {
      console.log('[getUpcomingAutomatedCampaigns] No clients found');
      return new Response(
        JSON.stringify({
          success: true,
          campaigns: [],
          summary: {
            totalCampaigns: 0,
            totalClients: 0,
            byTriggerType: {},
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[getUpcomingAutomatedCampaigns] Found ${clients.length} clients`);

    const campaigns = [];
    const triggerTypeCounts = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);

    // Process each automation rule
    for (const rule of automationRules) {
      try {
        // Apply rule ID filter if provided
        if (ruleIdFilter && rule.id !== ruleIdFilter) {
          continue;
        }

        // Fetch trigger type and template
        const triggerTypes = await base44.entities.TriggerType.filter({ id: rule.triggerTypeId });
        const templates = await base44.entities.Template.filter({ id: rule.templateId });

        if (!triggerTypes || triggerTypes.length === 0 || !templates || templates.length === 0) {
          console.warn(`[getUpcomingAutomatedCampaigns] Invalid rule: missing trigger type or template`);
          continue;
        }

        const trigger = triggerTypes[0];
        const template = templates[0];

        // Apply trigger type filter if provided
        if (triggerTypeFilter && trigger.key !== triggerTypeFilter) {
          continue;
        }

        // Calculate upcoming send dates for this rule
        const upcomingSends = calculateUpcomingSends(
          clients,
          rule,
          trigger,
          today,
          endDate
        );

        if (upcomingSends.length > 0) {
          campaigns.push(...upcomingSends.map(send => ({
            id: `${rule.id}_${send.clientId}`,
            ruleId: rule.id,
            triggerType: trigger.key,
            triggerName: trigger.name,
            templateId: template.id,
            templateName: template.name,
            clientId: send.clientId,
            clientName: send.clientName,
            scheduledDate: send.scheduledDate,
            reason: send.reason,
          })));

          // Count by trigger type
          triggerTypeCounts[trigger.key] = (triggerTypeCounts[trigger.key] || 0) + upcomingSends.length;
        }

      } catch (error) {
        console.error(`[getUpcomingAutomatedCampaigns] Error processing rule ${rule.id}:`, error);
      }
    }

    // Sort campaigns by date
    campaigns.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

    // Limit to 100 results for performance
    const paginatedCampaigns = campaigns.slice(0, 100);

    console.log(`[getUpcomingAutomatedCampaigns] Found ${campaigns.length} upcoming campaigns (showing ${paginatedCampaigns.length})`);

    return new Response(
      JSON.stringify({
        success: true,
        campaigns: paginatedCampaigns,
        summary: {
          totalCampaigns: campaigns.length,
          totalClients: new Set(campaigns.map(c => c.clientId)).size,
          byTriggerType: triggerTypeCounts,
          dateRange: {
            start: today.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0],
          },
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[getUpcomingAutomatedCampaigns] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch upcoming campaigns',
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Calculate upcoming send dates for a specific rule
 */
function calculateUpcomingSends(clients, rule, trigger, startDate, endDate) {
  const upcomingSends = [];

  for (const client of clients) {
    try {
      let sendDate = null;
      let reason = '';

      switch (trigger.key) {
        case 'birthday':
          sendDate = calculateBirthdaySendDate(client, rule, startDate, endDate);
          reason = `Birthday on ${formatDate(new Date(client.birthday))}`;
          break;

        case 'new_client_welcome':
          sendDate = calculateNewClientSendDate(client, rule, startDate, endDate);
          reason = 'New client welcome';
          break;

        case 'renewal_reminder':
          sendDate = calculateRenewalSendDate(client, rule, startDate, endDate);
          reason = `Renewal on ${formatDate(new Date(client.renewal_date))}`;
          break;

        case 'referral_request':
          if (client.referral_status === 'pending') {
            sendDate = calculateReferralSendDate(client, rule, startDate, endDate);
            reason = 'Referral request';
          }
          break;

        default:
          break;
      }

      if (sendDate) {
        // Check if we should send based on frequency cap
        if (shouldSendBasedOnFrequencyCap(client, rule, sendDate)) {
          upcomingSends.push({
            clientId: client.id,
            clientName: client.name,
            scheduledDate: sendDate.toISOString().split('T')[0],
            reason,
          });
        }
      }

    } catch (error) {
      console.error(`[calculateUpcomingSends] Error for client ${client.id}:`, error);
    }
  }

  return upcomingSends;
}

/**
 * Calculate birthday send date within the date range
 */
function calculateBirthdaySendDate(client, rule, startDate, endDate) {
  try {
    if (!client.birthday) return null;

    const birthday = new Date(client.birthday);
    const today = new Date();

    // Calculate birthday for this year and next year
    for (let year = today.getFullYear(); year <= today.getFullYear() + 1; year++) {
      const birthdayThisYear = new Date(year, birthday.getMonth(), birthday.getDate());
      const sendDate = new Date(birthdayThisYear);
      sendDate.setDate(sendDate.getDate() - rule.daysBefore);

      if (sendDate >= startDate && sendDate <= endDate) {
        return sendDate;
      }
    }

    return null;
  } catch (error) {
    console.error('[calculateBirthdaySendDate] Error:', error);
    return null;
  }
}

/**
 * Calculate new client welcome send date
 */
function calculateNewClientSendDate(client, rule, startDate, endDate) {
  try {
    const createdDate = new Date(client.created_date);
    const sendDate = new Date(createdDate);
    sendDate.setDate(sendDate.getDate() + rule.daysBefore);

    if (sendDate >= startDate && sendDate <= endDate) {
      return sendDate;
    }

    return null;
  } catch (error) {
    console.error('[calculateNewClientSendDate] Error:', error);
    return null;
  }
}

/**
 * Calculate renewal reminder send date
 */
function calculateRenewalSendDate(client, rule, startDate, endDate) {
  try {
    if (!client.renewal_date) return null;

    const renewalDate = new Date(client.renewal_date);
    const sendDate = new Date(renewalDate);
    sendDate.setDate(sendDate.getDate() - rule.daysBefore);

    if (sendDate >= startDate && sendDate <= endDate) {
      return sendDate;
    }

    return null;
  } catch (error) {
    console.error('[calculateRenewalSendDate] Error:', error);
    return null;
  }
}

/**
 * Calculate referral request send date
 */
function calculateReferralSendDate(client, rule, startDate, endDate) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today >= startDate && today <= endDate) {
      return today;
    }

    return null;
  } catch (error) {
    console.error('[calculateReferralSendDate] Error:', error);
    return null;
  }
}

/**
 * Check if we should send based on frequency cap
 * This is a simplified check - in production, would query AutomationHistory
 */
function shouldSendBasedOnFrequencyCap(client, rule, sendDate) {
  try {
    // For upcoming campaigns, we assume they should be sent
    // unless there's a specific reason to skip them
    // In a real implementation, this would check AutomationHistory

    switch (rule.frequencyCap) {
      case 'once':
        // Would need to check if ever sent
        return true;

      case 'annually':
        // Would need to check if sent this year
        return true;

      case 'monthly':
        // Would need to check if sent this month
        return true;

      case 'per_event':
        // Always send
        return true;

      default:
        return true;
    }
  } catch (error) {
    console.error('[shouldSendBasedOnFrequencyCap] Error:', error);
    return false;
  }
}

/**
 * Format date for display
 */
function formatDate(date) {
  try {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    console.error('[formatDate] Error:', error);
    return date.toString();
  }
}
