/**
 * checkAndSendAutomatedCards.js
 * 
 * Main automation engine that evaluates triggers and sends cards to Scribe API.
 * 
 * This function:
 * 1. Fetches all active automation rules for the user
 * 2. Evaluates trigger conditions (birthdays, dates, status changes)
 * 3. Checks frequency caps to avoid duplicate sends
 * 4. Creates card batches from templates
 * 5. Submits batches to Scribe API
 * 6. Logs automation history
 * 
 * Can be called manually or via scheduled trigger (e.g., daily cron job).
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

    console.log(`[checkAndSendAutomatedCards] Starting automation check for user: ${currentUser.id}`);

    // Fetch all active automation rules for this user
    const automationRules = await base44.entities.AutomationRule.filter({
      isActive: true,
      created_by: currentUser.id,
    });

    if (!automationRules || automationRules.length === 0) {
      console.log('[checkAndSendAutomatedCards] No active automation rules found');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active automation rules to process',
          summary: { processed: 0, sent: 0, skipped: 0, errors: 0 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[checkAndSendAutomatedCards] Found ${automationRules.length} active automation rules`);

    let totalProcessed = 0;
    let totalSent = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    const results = [];

    // Process each automation rule
    for (const rule of automationRules) {
      try {
        console.log(`[checkAndSendAutomatedCards] Processing rule: ${rule.id}`);

        // Fetch trigger type, template, and card design
        const triggerType = await base44.entities.TriggerType.filter({ id: rule.triggerTypeId });
        const template = await base44.entities.Template.filter({ id: rule.templateId });

        if (!triggerType || triggerType.length === 0 || !template || template.length === 0) {
          console.error(`[checkAndSendAutomatedCards] Invalid rule: missing trigger type or template`);
          totalErrors++;
          continue;
        }

        const trigger = triggerType[0];
        const tmpl = template[0];

        // Fetch clients based on trigger type
        const clients = await getClientsForTrigger(base44, currentUser.id, trigger.key, rule);

        if (!clients || clients.length === 0) {
          console.log(`[checkAndSendAutomatedCards] No eligible clients for trigger: ${trigger.key}`);
          totalSkipped++;
          continue;
        }

        console.log(`[checkAndSendAutomatedCards] Found ${clients.length} eligible clients for trigger: ${trigger.key}`);

        // Evaluate each client for sending
        const cardsToSend = [];
        for (const client of clients) {
          try {
            const shouldSend = await evaluateTriggerCondition(
              base44,
              currentUser.id,
              rule,
              trigger,
              client
            );

            if (shouldSend) {
              const cardData = await prepareCardData(base44, client, tmpl, trigger, currentUser);
              if (cardData) {
                cardsToSend.push({
                  cardData,
                  clientId: client.id,
                  ruleId: rule.id,
                });
              }
            }

            totalProcessed++;
          } catch (error) {
            console.error(`[checkAndSendAutomatedCards] Error evaluating client ${client.id}:`, error);
            totalErrors++;
          }
        }

        // Submit cards to Scribe API if any
        if (cardsToSend.length > 0) {
          try {
            const scribeResponse = await submitToScribeAPI(base44, cardsToSend);

            if (scribeResponse.success) {
              // Log automation history for each card
              for (const card of cardsToSend) {
                await base44.entities.AutomationHistory.create({
                  automationRuleId: rule.id,
                  clientId: card.clientId,
                  triggerType: trigger.key,
                  templateId: tmpl.id,
                  sentDate: new Date().toISOString(),
                  scribeBatchId: scribeResponse.batchId,
                  status: 'sent',
                });

                totalSent++;
              }

              console.log(`[checkAndSendAutomatedCards] Submitted ${cardsToSend.length} cards to Scribe API`);
              results.push({
                ruleId: rule.id,
                triggerType: trigger.name,
                cardsSent: cardsToSend.length,
                scribeBatchId: scribeResponse.batchId,
              });
            } else {
              console.error(`[checkAndSendAutomatedCards] Scribe API error:`, scribeResponse.error);
              totalErrors += cardsToSend.length;
            }
          } catch (error) {
            console.error(`[checkAndSendAutomatedCards] Error submitting to Scribe API:`, error);
            totalErrors += cardsToSend.length;
          }
        }

        // Update rule's last_run_date
        await base44.entities.AutomationRule.update(rule.id, {
          last_run_date: new Date().toISOString(),
        });

      } catch (error) {
        console.error(`[checkAndSendAutomatedCards] Error processing rule ${rule.id}:`, error);
        totalErrors++;
      }
    }

    console.log('[checkAndSendAutomatedCards] Automation check complete');
    console.log(`  - Processed: ${totalProcessed} clients`);
    console.log(`  - Sent: ${totalSent} cards`);
    console.log(`  - Skipped: ${totalSkipped} rules`);
    console.log(`  - Errors: ${totalErrors}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Automation check completed',
        summary: {
          processed: totalProcessed,
          sent: totalSent,
          skipped: totalSkipped,
          errors: totalErrors,
        },
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[checkAndSendAutomatedCards] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to process automation check',
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Fetch clients eligible for a specific trigger type
 */
async function getClientsForTrigger(base44, userId, triggerKey, rule) {
  try {
    // Fetch all clients for this user
    const clients = await base44.entities.Client.filter({
      created_by: userId,
    });

    if (!clients || clients.length === 0) {
      return [];
    }

    // Filter based on trigger type
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eligibleClients = clients.filter(client => {
      switch (triggerKey) {
        case 'birthday':
          return client.birthday && isBirthdayToday(client.birthday, rule.daysBefore);
        case 'new_client_welcome':
          return isNewClientToday(client, rule.daysBefore);
        case 'renewal_reminder':
          return client.renewal_date && isRenewalDateApproaching(client.renewal_date, rule.daysBefore);
        case 'referral_request':
          return client.referral_status === 'pending' && isReferralPending(client, rule.daysBefore);
        default:
          return false;
      }
    });

    return eligibleClients;
  } catch (error) {
    console.error('[getClientsForTrigger] Error fetching clients:', error);
    return [];
  }
}

/**
 * Check if today is the client's birthday (accounting for daysBefore)
 */
function isBirthdayToday(birthdayString, daysBefore) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const birthday = new Date(birthdayString);
    const birthdayThisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

    // Adjust for daysBefore
    const sendDate = new Date(birthdayThisYear);
    sendDate.setDate(sendDate.getDate() - daysBefore);
    sendDate.setHours(0, 0, 0, 0);

    return today.getTime() === sendDate.getTime();
  } catch (error) {
    console.error('[isBirthdayToday] Error:', error);
    return false;
  }
}

/**
 * Check if client was added today (new client welcome)
 */
function isNewClientToday(client, daysBefore) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const createdDate = new Date(client.created_date);
    createdDate.setHours(0, 0, 0, 0);

    const sendDate = new Date(createdDate);
    sendDate.setDate(sendDate.getDate() + daysBefore);

    return today.getTime() === sendDate.getTime();
  } catch (error) {
    console.error('[isNewClientToday] Error:', error);
    return false;
  }
}

/**
 * Check if renewal date is approaching (within daysBefore)
 */
function isRenewalDateApproaching(renewalDateString, daysBefore) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const renewalDate = new Date(renewalDateString);
    renewalDate.setHours(0, 0, 0, 0);

    const sendDate = new Date(renewalDate);
    sendDate.setDate(sendDate.getDate() - daysBefore);

    return today.getTime() === sendDate.getTime();
  } catch (error) {
    console.error('[isRenewalDateApproaching] Error:', error);
    return false;
  }
}

/**
 * Check if referral is pending and should be sent today
 */
function isReferralPending(client, daysBefore) {
  try {
    // Referral logic: send if status is pending and enough time has passed
    // This could be enhanced with more sophisticated logic
    return client.referral_status === 'pending';
  } catch (error) {
    console.error('[isReferralPending] Error:', error);
    return false;
  }
}

/**
 * Evaluate if a card should be sent based on trigger condition and frequency cap
 */
async function evaluateTriggerCondition(base44, userId, rule, trigger, client) {
  try {
    // Check frequency cap
    const lastSend = await base44.entities.AutomationHistory.filter({
      automationRuleId: rule.id,
      clientId: client.id,
      status: 'sent',
    });

    if (!lastSend || lastSend.length === 0) {
      // Never sent before, OK to send
      return true;
    }

    const lastSendDate = new Date(lastSend[0].sentDate);
    const today = new Date();

    switch (rule.frequencyCap) {
      case 'once':
        // Only send once ever
        return false;

      case 'annually':
        // Send once per calendar year
        return lastSendDate.getFullYear() < today.getFullYear();

      case 'monthly':
        // Send once per calendar month
        return lastSendDate.getFullYear() < today.getFullYear() ||
               lastSendDate.getMonth() < today.getMonth();

      case 'per_event':
        // Send for each occurrence (no frequency cap)
        return true;

      default:
        return false;
    }
  } catch (error) {
    console.error('[evaluateTriggerCondition] Error:', error);
    return false;
  }
}

/**
 * Prepare card data from template and client information
 */
async function prepareCardData(base44, client, template, trigger, user) {
  try {
    // Render template with client data
    const message = renderTemplate(template.content, {
      clientName: client.name,
      clientCompany: client.company,
      userFullName: user.full_name,
      userCompany: user.company || 'NurturInk',
    });

    return {
      recipient_name: client.name,
      recipient_address: formatAddress(client),
      card_design: template.cardDesign || 'Thank you - Plain White',
      note_style: template.noteStyle || 'casual',
      message: message,
      sender_name: user.full_name,
      sender_company: user.company || 'NurturInk',
    };
  } catch (error) {
    console.error('[prepareCardData] Error:', error);
    return null;
  }
}

/**
 * Simple template rendering - replace placeholders with actual values
 */
function renderTemplate(template, data) {
  try {
    let rendered = template;

    // Replace placeholders
    rendered = rendered.replace(/\{\{clientName\}\}/g, data.clientName || '');
    rendered = rendered.replace(/\{\{clientCompany\}\}/g, data.clientCompany || '');
    rendered = rendered.replace(/\{\{userFullName\}\}/g, data.userFullName || '');
    rendered = rendered.replace(/\{\{userCompany\}\}/g, data.userCompany || '');

    return rendered;
  } catch (error) {
    console.error('[renderTemplate] Error:', error);
    return template;
  }
}

/**
 * Format client address for Scribe API
 */
function formatAddress(client) {
  try {
    const parts = [
      client.street_address,
      client.city,
      client.state,
      client.zip_code,
    ].filter(Boolean);

    return parts.join(', ');
  } catch (error) {
    console.error('[formatAddress] Error:', error);
    return '';
  }
}

/**
 * Submit card batch to Scribe API
 */
async function submitToScribeAPI(base44, cardsToSend) {
  try {
    // Prepare batch for Scribe API
    const batch = {
      cards: cardsToSend.map(card => card.cardData),
    };

    console.log(`[submitToScribeAPI] Submitting batch with ${batch.cards.length} cards`);

    // Call Scribe API integration (assuming it exists)
    // This would be replaced with actual Scribe API call
    const response = await base44.integrations.Scribe.SubmitBatch({
      batch: JSON.stringify(batch),
    });

    if (response && response.batchId) {
      return {
        success: true,
        batchId: response.batchId,
      };
    } else {
      return {
        success: false,
        error: 'No batch ID returned from Scribe API',
      };
    }
  } catch (error) {
    console.error('[submitToScribeAPI] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
