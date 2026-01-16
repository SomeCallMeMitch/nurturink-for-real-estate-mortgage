/**
 * getAutomationRuleStats.js
 * 
 * Analytics dashboard showing automation performance.
 * 
 * This function:
 * 1. Queries AutomationHistory for current user
 * 2. Groups by trigger type, template, month
 * 3. Calculates success/failure rates
 * 4. Returns aggregated stats
 * 
 * Query Parameters:
 * - startDate: Filter by start date (YYYY-MM-DD, optional, default: 90 days ago)
 * - endDate: Filter by end date (YYYY-MM-DD, optional, default: today)
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
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    // Calculate default date range (last 90 days)
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam ? new Date(startDateParam) : new Date(endDate);
    startDate.setDate(startDate.getDate() - 90);

    console.log(`[getAutomationRuleStats] Fetching stats for user: ${currentUser.id}`);
    console.log(`  - Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    // Fetch all automation history for this user
    const automationRules = await base44.entities.AutomationRule.filter({
      created_by: currentUser.id,
    });

    if (!automationRules || automationRules.length === 0) {
      console.log('[getAutomationRuleStats] No automation rules found');
      return new Response(
        JSON.stringify({
          success: true,
          stats: {
            totalCardsSent: 0,
            byTriggerType: {},
            byTemplate: {},
            successRate: 0,
            failureRate: 0,
            monthlyTrend: [],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Collect all history records for these rules
    const allHistory = [];
    for (const rule of automationRules) {
      try {
        const history = await base44.entities.AutomationHistory.filter({
          automationRuleId: rule.id,
        });

        if (history && history.length > 0) {
          allHistory.push(...history);
        }
      } catch (error) {
        console.error(`[getAutomationRuleStats] Error fetching history for rule ${rule.id}:`, error);
      }
    }

    if (allHistory.length === 0) {
      console.log('[getAutomationRuleStats] No automation history found');
      return new Response(
        JSON.stringify({
          success: true,
          stats: {
            totalCardsSent: 0,
            byTriggerType: {},
            byTemplate: {},
            successRate: 0,
            failureRate: 0,
            monthlyTrend: [],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[getAutomationRuleStats] Found ${allHistory.length} history records`);

    // Filter by date range
    const filteredHistory = allHistory.filter(record => {
      const recordDate = new Date(record.sentDate);
      return recordDate >= startDate && recordDate <= endDate;
    });

    console.log(`[getAutomationRuleStats] After date filtering: ${filteredHistory.length} records`);

    // Calculate statistics
    const stats = calculateStats(filteredHistory);

    console.log(`[getAutomationRuleStats] Stats calculated successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[getAutomationRuleStats] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch automation statistics',
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Calculate statistics from automation history records
 */
function calculateStats(historyRecords) {
  const stats = {
    totalCardsSent: 0,
    totalCardsFailed: 0,
    totalCardsPending: 0,
    byTriggerType: {},
    byTemplate: {},
    byStatus: {},
    successRate: 0,
    failureRate: 0,
    monthlyTrend: {},
  };

  // Process each history record
  for (const record of historyRecords) {
    try {
      // Count by status
      if (record.status === 'sent') {
        stats.totalCardsSent++;
      } else if (record.status === 'failed') {
        stats.totalCardsFailed++;
      } else if (record.status === 'pending') {
        stats.totalCardsPending++;
      }

      // Count by status type
      stats.byStatus[record.status] = (stats.byStatus[record.status] || 0) + 1;

      // Count by trigger type
      stats.byTriggerType[record.triggerType] = (stats.byTriggerType[record.triggerType] || 0) + 1;

      // Count by template (would need to fetch template name)
      const templateKey = `template_${record.templateId}`;
      stats.byTemplate[templateKey] = (stats.byTemplate[templateKey] || 0) + 1;

      // Count by month
      const recordDate = new Date(record.sentDate);
      const monthKey = recordDate.toISOString().substring(0, 7); // YYYY-MM format
      stats.monthlyTrend[monthKey] = (stats.monthlyTrend[monthKey] || 0) + 1;

    } catch (error) {
      console.error('[calculateStats] Error processing record:', error);
    }
  }

  // Calculate rates
  const totalProcessed = stats.totalCardsSent + stats.totalCardsFailed;
  if (totalProcessed > 0) {
    stats.successRate = (stats.totalCardsSent / totalProcessed).toFixed(4);
    stats.failureRate = (stats.totalCardsFailed / totalProcessed).toFixed(4);
  }

  // Convert monthlyTrend object to sorted array
  const monthlyArray = Object.entries(stats.monthlyTrend)
    .map(([month, count]) => ({ month, sent: count }))
    .sort((a, b) => a.month.localeCompare(b.month));
  stats.monthlyTrend = monthlyArray;

  return stats;
}
