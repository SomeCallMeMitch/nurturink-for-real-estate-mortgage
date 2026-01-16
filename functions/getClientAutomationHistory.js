/**
 * getClientAutomationHistory.js
 * 
 * Audit trail showing all automated cards sent to a specific client.
 * 
 * This function:
 * 1. Fetches all automation history records for a client
 * 2. Joins with related entities (rules, templates, trigger types)
 * 3. Returns paginated results sorted by date
 * 4. Supports filtering by date range, trigger type, and status
 * 
 * Query Parameters:
 * - clientId: Client ID (required)
 * - startDate: Filter by start date (YYYY-MM-DD, optional)
 * - endDate: Filter by end date (YYYY-MM-DD, optional)
 * - triggerType: Filter by trigger type (optional)
 * - status: Filter by status - sent, failed, pending, cancelled (optional)
 * - limit: Results per page (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
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
    const clientId = url.searchParams.get('clientId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const triggerTypeFilter = url.searchParams.get('triggerType');
    const statusFilter = url.searchParams.get('status');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Validate required parameters
    if (!clientId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameter',
          details: 'clientId is required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[getClientAutomationHistory] Fetching history for client: ${clientId}`);
    console.log(`  - User: ${currentUser.id}`);
    console.log(`  - Limit: ${limit}, Offset: ${offset}`);

    // Fetch and verify client exists and belongs to current user
    const clients = await base44.entities.Client.filter({
      id: clientId,
      created_by: currentUser.id,
    });

    if (!clients || clients.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Client not found',
          details: 'The specified client does not exist or does not belong to you',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const client = clients[0];
    console.log(`[getClientAutomationHistory] Found client: ${client.name}`);

    // Fetch automation history for this client
    const historyRecords = await base44.entities.AutomationHistory.filter({
      clientId: clientId,
    });

    if (!historyRecords || historyRecords.length === 0) {
      console.log('[getClientAutomationHistory] No automation history found for client');
      return new Response(
        JSON.stringify({
          success: true,
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          history: [],
          pagination: {
            total: 0,
            limit,
            offset,
            hasMore: false,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[getClientAutomationHistory] Found ${historyRecords.length} history records`);

    // Filter and enrich history records
    let filteredRecords = historyRecords;

    // Apply date range filter
    if (startDate || endDate) {
      filteredRecords = filteredRecords.filter(record => {
        const recordDate = new Date(record.sentDate);
        if (startDate && recordDate < new Date(startDate)) return false;
        if (endDate && recordDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Apply trigger type filter
    if (triggerTypeFilter) {
      filteredRecords = filteredRecords.filter(record => record.triggerType === triggerTypeFilter);
    }

    // Apply status filter
    if (statusFilter) {
      filteredRecords = filteredRecords.filter(record => record.status === statusFilter);
    }

    console.log(`[getClientAutomationHistory] After filtering: ${filteredRecords.length} records`);

    // Sort by date descending (newest first)
    filteredRecords.sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));

    // Apply pagination
    const totalRecords = filteredRecords.length;
    const paginatedRecords = filteredRecords.slice(offset, offset + limit);

    // Enrich records with related data
    const enrichedHistory = [];
    for (const record of paginatedRecords) {
      try {
        // Fetch trigger type
        const triggerTypes = await base44.entities.TriggerType.filter({
          id: record.triggerType === 'birthday' || record.triggerType === 'new_client_welcome' ||
               record.triggerType === 'renewal_reminder' || record.triggerType === 'referral_request'
            ? undefined  // We have the key, not the ID
            : record.triggerType,
        });

        // Fetch template
        const templates = await base44.entities.Template.filter({
          id: record.templateId,
        });

        // Fetch automation rule
        const rules = await base44.entities.AutomationRule.filter({
          id: record.automationRuleId,
        });

        enrichedHistory.push({
          id: record.id,
          sentDate: record.sentDate,
          status: record.status,
          triggerType: record.triggerType,
          templateName: templates && templates.length > 0 ? templates[0].name : 'Unknown',
          templateId: record.templateId,
          cardDesign: templates && templates.length > 0 ? templates[0].cardDesign : 'Unknown',
          noteStyle: templates && templates.length > 0 ? templates[0].noteStyle : 'casual',
          scribeBatchId: record.scribeBatchId,
          errorMessage: record.errorMessage || null,
          ruleId: record.automationRuleId,
        });
      } catch (error) {
        console.error(`[getClientAutomationHistory] Error enriching record ${record.id}:`, error);
        // Still include the record even if enrichment fails
        enrichedHistory.push({
          id: record.id,
          sentDate: record.sentDate,
          status: record.status,
          triggerType: record.triggerType,
          templateId: record.templateId,
          scribeBatchId: record.scribeBatchId,
          errorMessage: record.errorMessage || null,
          ruleId: record.automationRuleId,
        });
      }
    }

    console.log(`[getClientAutomationHistory] Returning ${enrichedHistory.length} enriched records`);

    return new Response(
      JSON.stringify({
        success: true,
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        history: enrichedHistory,
        pagination: {
          total: totalRecords,
          limit,
          offset,
          hasMore: offset + limit < totalRecords,
        },
        filters: {
          startDate: startDate || null,
          endDate: endDate || null,
          triggerType: triggerTypeFilter || null,
          status: statusFilter || null,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[getClientAutomationHistory] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch client automation history',
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
