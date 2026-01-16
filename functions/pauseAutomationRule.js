/**
 * pauseAutomationRule.js
 * 
 * Convenience function to temporarily disable an automation rule without deleting it.
 * 
 * This function:
 * 1. Fetches automation rule
 * 2. Verifies user ownership
 * 3. Sets isActive to false
 * 4. Cancels any pending cards for this rule
 * 5. Returns success response
 * 
 * Request Body:
 * {
 *   "ruleId": "uuid"
 * }
 * 
 * Note: This is a convenience function that essentially calls updateAutomationRule
 * with isActive: false, but provides a simpler interface for pausing.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
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

    // Parse request body
    let requestData;
    try {
      const body = await req.text();
      requestData = JSON.parse(body);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ruleId = requestData.ruleId;

    if (!ruleId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required field',
          details: 'ruleId is required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[pauseAutomationRule] Pausing rule: ${ruleId}`);
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
    console.log(`[pauseAutomationRule] Found rule: ${rule.id}`);

    // Check if already paused
    if (!rule.isActive) {
      console.log(`[pauseAutomationRule] Rule is already paused`);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Automation rule is already paused',
          ruleId: rule.id,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cancel any pending cards for this rule
    try {
      console.log(`[pauseAutomationRule] Cancelling pending cards`);
      const pendingHistory = await base44.entities.AutomationHistory.filter({
        automationRuleId: ruleId,
        status: 'pending',
      });

      if (pendingHistory && pendingHistory.length > 0) {
        for (const history of pendingHistory) {
          await base44.entities.AutomationHistory.update(history.id, {
            status: 'cancelled',
          });
        }
        console.log(`[pauseAutomationRule] Cancelled ${pendingHistory.length} pending cards`);
      }
    } catch (error) {
      console.error(`[pauseAutomationRule] Error cancelling pending cards:`, error);
      // Continue with pause even if cancellation fails
    }

    // Update the rule to disable it
    try {
      const updatedRule = await base44.entities.AutomationRule.update(ruleId, {
        isActive: false,
      });

      console.log(`[pauseAutomationRule] Rule paused successfully`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Automation rule paused successfully',
          ruleId: updatedRule.id,
          isActive: updatedRule.isActive,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error(`[pauseAutomationRule] Error pausing rule:`, error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to pause automation rule',
          message: error instanceof Error ? error.message : String(error),
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('[pauseAutomationRule] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to pause automation rule',
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
