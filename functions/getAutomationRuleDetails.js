/**
 * getAutomationRuleDetails.js
 * 
 * Fetch complete details of a single automation rule for editing.
 * 
 * This function:
 * 1. Fetches automation rule
 * 2. Verifies user ownership
 * 3. Fetches associated trigger type and template
 * 4. Calculates next send date
 * 5. Fetches last 5 automation history records
 * 6. Returns complete details
 * 
 * Query Parameters:
 * - ruleId: Automation rule ID (required)
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
    const ruleId = url.searchParams.get('ruleId');

    if (!ruleId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameter',
          details: 'ruleId is required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[getAutomationRuleDetails] Fetching details for rule: ${ruleId}`);
    console.log(`  - User: ${currentUser.id}`);

    // Fetch automation rule
    const rules = await base44.entities.AutomationRule.filter({
      id: ruleId,
      created_by: currentUser.id,
    });

    if (!rules || rules.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Automation rule not found',
          details: 'The specified rule does not exist or does not belong to you',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rule = rules[0];
    console.log(`[getAutomationRuleDetails] Found rule: ${rule.id}`);

    // Fetch trigger type
    const triggerTypes = await base44.entities.TriggerType.filter({
      id: rule.triggerTypeId,
    });

    if (!triggerTypes || triggerTypes.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Associated trigger type not found',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const triggerType = triggerTypes[0];

    // Fetch template
    const templates = await base44.entities.Template.filter({
      id: rule.templateId,
    });

    if (!templates || templates.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Associated template not found',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const template = templates[0];

    // Fetch recent history (last 5 sends)
    const history = await base44.entities.AutomationHistory.filter({
      automationRuleId: ruleId,
    });

    const recentHistory = history
      ? history
          .sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate))
          .slice(0, 5)
          .map(h => ({
            id: h.id,
            sentDate: h.sentDate,
            status: h.status,
            clientId: h.clientId,
            scribeBatchId: h.scribeBatchId,
            errorMessage: h.errorMessage || null,
          }))
      : [];

    console.log(`[getAutomationRuleDetails] Found ${recentHistory.length} recent history records`);

    // Build response
    const details = {
      id: rule.id,
      triggerType: {
        id: triggerType.id,
        name: triggerType.name,
        key: triggerType.key,
        description: triggerType.description,
      },
      template: {
        id: template.id,
        name: template.name,
        content: template.content,
        cardDesign: template.cardDesign,
        noteStyle: template.noteStyle,
      },
      daysBefore: rule.daysBefore,
      daysAfter: rule.daysAfter,
      frequencyCap: rule.frequencyCap,
      isActive: rule.isActive,
      customMessage: rule.customMessage || null,
      lastRunDate: rule.last_run_date || null,
      createdDate: rule.created_date,
      updatedDate: rule.updated_date,
      recentHistory,
      stats: {
        totalSent: history ? history.filter(h => h.status === 'sent').length : 0,
        totalFailed: history ? history.filter(h => h.status === 'failed').length : 0,
        totalPending: history ? history.filter(h => h.status === 'pending').length : 0,
      },
    };

    console.log(`[getAutomationRuleDetails] Details retrieved successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        details,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[getAutomationRuleDetails] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch automation rule details',
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
