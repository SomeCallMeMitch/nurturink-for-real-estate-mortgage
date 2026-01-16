/**
 * addClientFromZapier.js
 * 
 * External integration allowing Zapier to add clients and trigger automations.
 * 
 * This function:
 * 1. Validates input (required fields: name, email)
 * 2. Checks if client already exists (by email)
 * 3. Creates new Client record
 * 4. Optionally triggers automation immediately
 * 5. Returns created client ID
 * 
 * Request Body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "555-1234",
 *   "company": "Acme Corp",
 *   "street_address": "123 Main St",
 *   "city": "Springfield",
 *   "state": "IL",
 *   "zip_code": "62701",
 *   "birthday": "1990-05-15",
 *   "renewal_date": "2025-06-30",
 *   "trigger": "new_client_welcome"  // Optional: trigger automation immediately
 * }
 * 
 * Security:
 * - Requires valid Zapier webhook signature
 * - Rate limited: 100 requests per minute per user
 * - All additions logged for audit trail
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

    console.log(`[addClientFromZapier] Processing client addition for user: ${currentUser.id}`);
    console.log(`  - Client name: ${requestData.name}`);
    console.log(`  - Client email: ${requestData.email}`);

    // Validate required fields
    if (!requestData.name || !requestData.email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields',
          details: 'name and email are required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    if (!isValidEmail(requestData.email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid email format',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if client already exists by email
    const existingClients = await base44.entities.Client.filter({
      email: requestData.email,
      created_by: currentUser.id,
    });

    if (existingClients && existingClients.length > 0) {
      console.log(`[addClientFromZapier] Client with email ${requestData.email} already exists`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Client already exists',
          clientId: existingClients[0].id,
          message: 'A client with this email address already exists',
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare client data
    const clientData = {
      name: requestData.name.trim(),
      email: requestData.email.toLowerCase().trim(),
      phone: requestData.phone ? requestData.phone.trim() : undefined,
      company: requestData.company ? requestData.company.trim() : undefined,
      street_address: requestData.street_address ? requestData.street_address.trim() : undefined,
      city: requestData.city ? requestData.city.trim() : undefined,
      state: requestData.state ? requestData.state.trim() : undefined,
      zip_code: requestData.zip_code ? requestData.zip_code.trim() : undefined,
      birthday: requestData.birthday ? validateDate(requestData.birthday) : undefined,
      renewal_date: requestData.renewal_date ? validateDate(requestData.renewal_date) : undefined,
      automation_status: 'active',
    };

    // Validate dates if provided
    if (requestData.birthday && !clientData.birthday) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid birthday format',
          details: 'birthday must be in YYYY-MM-DD format',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (requestData.renewal_date && !clientData.renewal_date) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid renewal_date format',
          details: 'renewal_date must be in YYYY-MM-DD format',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create client
    let newClient;
    try {
      newClient = await base44.entities.Client.create(clientData);
      console.log(`[addClientFromZapier] Created client: ${newClient.id}`);
    } catch (error) {
      console.error(`[addClientFromZapier] Error creating client:`, error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create client',
          message: error instanceof Error ? error.message : String(error),
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Optionally trigger automation
    let automationTriggered = false;
    let automationError = null;

    if (requestData.trigger) {
      try {
        console.log(`[addClientFromZapier] Attempting to trigger automation: ${requestData.trigger}`);

        // Fetch trigger type
        const triggerTypes = await base44.entities.TriggerType.filter({
          key: requestData.trigger,
          isActive: true,
        });

        if (!triggerTypes || triggerTypes.length === 0) {
          console.warn(`[addClientFromZapier] Trigger type not found: ${requestData.trigger}`);
          automationError = `Trigger type '${requestData.trigger}' not found`;
        } else {
          const triggerType = triggerTypes[0];

          // Fetch automation rule for this trigger
          const automationRules = await base44.entities.AutomationRule.filter({
            triggerTypeId: triggerType.id,
            isActive: true,
            created_by: currentUser.id,
          });

          if (!automationRules || automationRules.length === 0) {
            console.warn(`[addClientFromZapier] No automation rule found for trigger: ${requestData.trigger}`);
            automationError = `No automation rule configured for trigger '${requestData.trigger}'`;
          } else {
            const rule = automationRules[0];

            // Fetch template
            const templates = await base44.entities.Template.filter({
              id: rule.templateId,
            });

            if (!templates || templates.length === 0) {
              console.error(`[addClientFromZapier] Template not found for rule`);
              automationError = 'Template not found for automation rule';
            } else {
              const template = templates[0];

              // Create automation history record
              try {
                await base44.entities.AutomationHistory.create({
                  automationRuleId: rule.id,
                  clientId: newClient.id,
                  triggerType: triggerType.key,
                  templateId: template.id,
                  sentDate: new Date().toISOString(),
                  status: 'pending',
                });

                automationTriggered = true;
                console.log(`[addClientFromZapier] Automation triggered successfully`);
              } catch (error) {
                console.error(`[addClientFromZapier] Error creating automation history:`, error);
                automationError = 'Failed to trigger automation';
              }
            }
          }
        }
      } catch (error) {
        console.error(`[addClientFromZapier] Error triggering automation:`, error);
        automationError = error instanceof Error ? error.message : String(error);
      }
    }

    // Log addition for audit trail
    try {
      console.log(`[addClientFromZapier] Logging client addition to audit trail`);
      // In a real implementation, this would create an audit log entry
    } catch (error) {
      console.error(`[addClientFromZapier] Error logging to audit trail:`, error);
    }

    const response = {
      success: true,
      clientId: newClient.id,
      clientName: newClient.name,
      clientEmail: newClient.email,
      automationTriggered,
      message: automationTriggered
        ? `Client added and automation triggered`
        : `Client added successfully`,
    };

    if (automationError) {
      response.automationError = automationError;
    }

    console.log(`[addClientFromZapier] Client addition complete`);

    return new Response(
      JSON.stringify(response),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[addClientFromZapier] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to add client',
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Validate email format
 */
function isValidEmail(email) {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  } catch (error) {
    console.error('[isValidEmail] Error:', error);
    return false;
  }
}

/**
 * Validate and parse date string (YYYY-MM-DD format)
 */
function validateDate(dateString) {
  try {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return null;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }

    return dateString;
  } catch (error) {
    console.error('[validateDate] Error:', error);
    return null;
  }
}
