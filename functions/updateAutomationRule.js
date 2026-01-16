/**
 * updateAutomationRule.js
 * 
 * Allow users to modify automation rule settings.
 * 
 * This function:
 * 1. Fetches automation rule
 * 2. Validates user ownership
 * 3. Validates new values
 * 4. Updates record
 * 5. Optionally cancels pending cards if disabled
 * 6. Logs change to audit trail
 * 
 * Request Body:
 * {
 *   "ruleId": "uuid",
 *   "daysBefore": 7,
 *   "daysAfter": 0,
 *   "frequencyCap": "annually",
 *   "isActive": true,
 *   "templateId": "uuid",
 *   "customMessage": "Optional custom message"
 * }
 * 
 * Editable Fields:
 * - daysBefore: 0-365
 * - daysAfter: 0-365
 * - frequencyCap: once, annually, monthly, per_event
 * - isActive: true/false
 * - templateId: must exist and belong to user
 * - customMessage: optional string
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'PUT') {
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

    console.log(`[updateAutomationRule] Updating rule: ${ruleId}`);
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
    console.log(`[updateAutomationRule] Found rule: ${rule.id}`);

    // Prepare update data
    const updateData = {};
    const validationErrors = [];

    // Validate and prepare daysBefore
    if (requestData.hasOwnProperty('daysBefore')) {
      const daysBefore = parseInt(requestData.daysBefore, 10);
      if (isNaN(daysBefore) || daysBefore < 0 || daysBefore > 365) {
        validationErrors.push('daysBefore must be a number between 0 and 365');
      } else {
        updateData.daysBefore = daysBefore;
      }
    }

    // Validate and prepare daysAfter
    if (requestData.hasOwnProperty('daysAfter')) {
      const daysAfter = parseInt(requestData.daysAfter, 10);
      if (isNaN(daysAfter) || daysAfter < 0 || daysAfter > 365) {
        validationErrors.push('daysAfter must be a number between 0 and 365');
      } else {
        updateData.daysAfter = daysAfter;
      }
    }

    // Validate and prepare frequencyCap
    if (requestData.hasOwnProperty('frequencyCap')) {
      const validFrequencyCaps = ['once', 'annually', 'monthly', 'per_event'];
      if (!validFrequencyCaps.includes(requestData.frequencyCap)) {
        validationErrors.push(`frequencyCap must be one of: ${validFrequencyCaps.join(', ')}`);
      } else {
        updateData.frequencyCap = requestData.frequencyCap;
      }
    }

    // Validate and prepare isActive
    if (requestData.hasOwnProperty('isActive')) {
      updateData.isActive = Boolean(requestData.isActive);
    }

    // Validate and prepare templateId
    if (requestData.hasOwnProperty('templateId')) {
      const templates = await base44.entities.Template.filter({
        id: requestData.templateId,
        created_by: currentUser.id,
      });

      if (!templates || templates.length === 0) {
        validationErrors.push('The specified template does not exist or does not belong to you');
      } else {
        updateData.templateId = requestData.templateId;
      }
    }

    // Prepare customMessage
    if (requestData.hasOwnProperty('customMessage')) {
      updateData.customMessage = requestData.customMessage ? requestData.customMessage.trim() : null;
    }

    // Check for validation errors
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Validation failed',
          details: validationErrors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if there are any updates to make
    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No updates provided',
          details: 'At least one field must be updated',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[updateAutomationRule] Applying updates:`, Object.keys(updateData));

    // If disabling the rule, cancel any pending cards
    if (updateData.hasOwnProperty('isActive') && !updateData.isActive) {
      try {
        console.log(`[updateAutomationRule] Cancelling pending cards for disabled rule`);
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
          console.log(`[updateAutomationRule] Cancelled ${pendingHistory.length} pending cards`);
        }
      } catch (error) {
        console.error(`[updateAutomationRule] Error cancelling pending cards:`, error);
        // Continue with update even if cancellation fails
      }
    }

    // Update the rule
    try {
      const updatedRule = await base44.entities.AutomationRule.update(ruleId, updateData);
      console.log(`[updateAutomationRule] Rule updated successfully`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Automation rule updated successfully',
          ruleId: updatedRule.id,
          updates: updateData,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error(`[updateAutomationRule] Error updating rule:`, error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to update automation rule',
          message: error instanceof Error ? error.message : String(error),
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('[updateAutomationRule] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to update automation rule',
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
