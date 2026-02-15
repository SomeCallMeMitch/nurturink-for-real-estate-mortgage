import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ============================================================
// CONFIGURATION
// ============================================================
const SCRIBE_API_BASE_URL = Deno.env.get('SCRIBE_API_BASE_URL') || 'https://scribenurture.com';
const SCRIBE_API_TOKEN = Deno.env.get('SCRIBE_API_TOKEN');
const REQUIRE_ADMIN_APPROVAL = Deno.env.get('REQUIRE_ADMIN_APPROVAL') === 'true';

// ============================================================
// PLACEHOLDER HELPER FUNCTIONS
// ============================================================

/**
 * Resolve ONLY sender/user/organization placeholders - leave client placeholders intact
 * Supports multiple syntax formats:
 * - NEW: {{me.fullName}}, {{org.name}}
 * - LEGACY: {{rep_full_name}}, {{rep_company_name}}
 * - ALTERNATE: {{user.fullName}}, {{user.companyName}} (from UI signature templates)
 */
function resolveSenderPlaceholders(text, user, organization) {
  if (!text) return '';
  let result = text;
  
  if (user) {
    const firstName = user.firstName || user.full_name?.split(' ')[0] || '';
    const lastName = user.lastName || user.full_name?.split(' ').slice(1).join(' ') || '';
    const fullName = user.full_name || '';
    const email = user.email || '';
    const phone = user.phone || '';
    const title = user.title || '';
    const companyName = user.companyName || '';
    
    // NEW SYNTAX: {{me.*}}
    result = result.replace(/\{\{me\.fullName\}\}/g, fullName);
    result = result.replace(/\{\{me\.firstName\}\}/g, firstName);
    result = result.replace(/\{\{me\.lastName\}\}/g, lastName);
    result = result.replace(/\{\{me\.email\}\}/g, email);
    result = result.replace(/\{\{me\.phone\}\}/g, phone);
    result = result.replace(/\{\{me\.title\}\}/g, title);
    result = result.replace(/\{\{me\.companyName\}\}/g, companyName);
    
    // ALTERNATE SYNTAX: {{user.*}} (used by UI/signature templates)
    result = result.replace(/\{\{user\.fullName\}\}/g, fullName);
    result = result.replace(/\{\{user\.firstName\}\}/g, firstName);
    result = result.replace(/\{\{user\.lastName\}\}/g, lastName);
    result = result.replace(/\{\{user\.email\}\}/g, email);
    result = result.replace(/\{\{user\.phone\}\}/g, phone);
    result = result.replace(/\{\{user\.title\}\}/g, title);
    result = result.replace(/\{\{user\.companyName\}\}/g, companyName);
    
    // LEGACY SYNTAX: {{rep_*}}
    result = result.replace(/\{\{rep_full_name\}\}/g, fullName);
    result = result.replace(/\{\{rep_first_name\}\}/g, firstName);
    result = result.replace(/\{\{rep_last_name\}\}/g, lastName);
    result = result.replace(/\{\{rep_company_name\}\}/g, companyName);
    result = result.replace(/\{\{rep_phone\}\}/g, phone);
    result = result.replace(/\{\{rep_email\}\}/g, email);
  }
  
  if (organization) {
    const orgName = organization.name || '';
    const orgPhone = organization.phone || '';
    const orgEmail = organization.email || '';
    const orgWebsite = organization.website || '';
    
    // NEW SYNTAX: {{org.*}}
    result = result.replace(/\{\{org\.name\}\}/g, orgName);
    result = result.replace(/\{\{org\.phone\}\}/g, orgPhone);
    result = result.replace(/\{\{org\.email\}\}/g, orgEmail);
    result = result.replace(/\{\{org\.website\}\}/g, orgWebsite);
  }
  
  return result;
}

/**
 * Resolve ALL placeholders - for display/audit message
 * Supports all syntax formats for both client and sender
 */
function resolveAllPlaceholders(text, client, user, organization) {
  if (!text) return '';
  
  // First resolve sender/org placeholders
  let result = resolveSenderPlaceholders(text, user, organization);
  
  // Then resolve client placeholders (both new and legacy syntax)
  if (client) {
    const firstName = client.firstName || '';
    const lastName = client.lastName || '';
    const fullName = client.fullName || `${firstName} ${lastName}`.trim();
    const initials = ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
    
    // NEW SYNTAX: {{client.*}}
    result = result.replace(/\{\{client\.firstName\}\}/g, firstName);
    result = result.replace(/\{\{client\.lastName\}\}/g, lastName);
    result = result.replace(/\{\{client\.fullName\}\}/g, fullName);
    result = result.replace(/\{\{client\.initials\}\}/g, initials);
    result = result.replace(/\{\{client\.email\}\}/g, client.email || '');
    result = result.replace(/\{\{client\.phone\}\}/g, client.phone || '');
    result = result.replace(/\{\{client\.street\}\}/g, client.street || '');
    result = result.replace(/\{\{client\.city\}\}/g, client.city || '');
    result = result.replace(/\{\{client\.state\}\}/g, client.state || '');
    result = result.replace(/\{\{client\.zipCode\}\}/g, client.zipCode || '');
    result = result.replace(/\{\{client\.company\}\}/g, client.company || '');
    
    // LEGACY SYNTAX: {{field}}
    result = result.replace(/\{\{firstName\}\}/g, firstName);
    result = result.replace(/\{\{lastName\}\}/g, lastName);
    result = result.replace(/\{\{fullName\}\}/g, fullName);
    result = result.replace(/\{\{company\}\}/g, client.company || '');
    result = result.replace(/\{\{address1\}\}/g, client.street || '');
    result = result.replace(/\{\{city\}\}/g, client.city || '');
    result = result.replace(/\{\{state\}\}/g, client.state || '');
    result = result.replace(/\{\{zip\}\}/g, client.zipCode || '');
  }
  
  return result;
}

/**
 * Map client placeholders to Scribe merge tag format.
 * Only includes tags that Scribe actually supports in message body.
 * REMOVED: {{client.street}}, {{client.address2}}, {{address1}} — 
 * Scribe confirmed {STREET_ADDRESS} and {ADDRESS_2} are NOT supported 
 * as message merge tags. Street/address data is handled separately 
 * in the contacts payload, not in message body.
 */
function mapToScribePlaceholders(text) {
  if (!text) return '';
  return text
    // NEW SYNTAX: {{client.*}}
    .replace(/\{\{client\.firstName\}\}/g, '{FIRST_NAME}')
    .replace(/\{\{client\.lastName\}\}/g, '{LAST_NAME}')
    .replace(/\{\{client\.fullName\}\}/g, '{FIRST_NAME} {LAST_NAME}')
    .replace(/\{\{client\.email\}\}/g, '{EMAIL}')
    .replace(/\{\{client\.phone\}\}/g, '{PHONE}')
    .replace(/\{\{client\.company\}\}/g, '{COMPANY_NAME}')
    // NOTE: {{client.street}}, {{client.address2}} deliberately excluded
    // Scribe does not support {STREET_ADDRESS} or {ADDRESS_2} as message merge tags
    .replace(/\{\{client\.city\}\}/g, '{CITY}')
    .replace(/\{\{client\.state\}\}/g, '{STATE}')
    .replace(/\{\{client\.zipCode\}\}/g, '{ZIP}')
    // LEGACY SYNTAX: {{field}}
    .replace(/\{\{firstName\}\}/g, '{FIRST_NAME}')
    .replace(/\{\{lastName\}\}/g, '{LAST_NAME}')
    .replace(/\{\{fullName\}\}/g, '{FIRST_NAME} {LAST_NAME}')
    .replace(/\{\{company\}\}/g, '{COMPANY_NAME}')
    // NOTE: {{address1}} deliberately excluded — same reason as above
    .replace(/\{\{city\}\}/g, '{CITY}')
    .replace(/\{\{state\}\}/g, '{STATE}')
    .replace(/\{\{zip\}\}/g, '{ZIP}');
}

/**
 * Resolve return address based on mode
 */
function resolveReturnAddress(mode, user, organization) {
  if (mode === 'none') return null;
  
  if (mode === 'company' && organization?.companyReturnAddress?.street) {
    const addr = organization.companyReturnAddress;
    return {
      name: addr.companyName || organization.name || '',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.zip || ''
    };
  }
  
  if (mode === 'rep' && user?.street) {
    return {
      name: user.returnAddressName || user.full_name || '',
      street: user.street || '',
      city: user.city || '',
      state: user.state || '',
      zip: user.zipCode || ''
    };
  }
  
  return null;
}

// ============================================================
// MAIN HANDLER
// ============================================================

Deno.serve(async (req) => {
  console.log('=== PROCESS MAILING BATCH ===');
  console.log('REQUIRE_ADMIN_APPROVAL:', REQUIRE_ADMIN_APPROVAL);
  
  try {
    const base44 = createClientFromRequest(req);
    
    // Try to get user, but for service-role calls user may be null
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (authErr) {
      console.log('[PMB] auth.me() failed (may be service-role call):', authErr.message);
    }
    
    const { mailingBatchId, serviceRoleBypass } = await req.json();
    
    if (!mailingBatchId) {
      return Response.json({ error: 'mailingBatchId is required' }, { status: 400 });
    }
    
    console.log('[PMB] User:', user.id, user.email, 'orgId:', user.orgId, 'role:', user.role);
    console.log('[PMB] mailingBatchId:', mailingBatchId, 'serviceRoleBypass:', !!serviceRoleBypass);
    
    // Load mailing batch — use service role for system automation calls
    const batches = serviceRoleBypass
      ? await base44.asServiceRole.entities.MailingBatch.filter({ id: mailingBatchId })
      : await base44.entities.MailingBatch.filter({ id: mailingBatchId });
    console.log('[PMB] Batch lookup result:', batches?.length || 0, 'batch(es) found');
    
    if (!batches?.length) {
      return Response.json({ error: 'Mailing batch not found' }, { status: 404 });
    }
    
    const batch = batches[0];
    console.log('[PMB] Batch data - userId:', batch.userId, 'organizationId:', batch.organizationId, 
      'status:', batch.status, 'selectedClientIds:', batch.selectedClientIds?.length);
    
    // Verify ownership — skip for service-role automation callers
    // When called via base44.asServiceRole.functions.invoke(), the caller is already trusted
    if (serviceRoleBypass) {
      console.log('[PMB] Service-role bypass active. Skipping ownership check.');
    } else if (batch.userId !== user.id && batch.organizationId !== user.orgId) {
      console.error('[PMB] Ownership check FAILED - batch.userId:', batch.userId, 'vs user.id:', user.id, 
        '| batch.organizationId:', batch.organizationId, 'vs user.orgId:', user.orgId);
      return Response.json({ error: 'Unauthorized to process this batch' }, { status: 403 });
    }
    
    // ============================================================
    // IDEMPOTENCY GUARD
    // Prevents double-processing if called twice for the same batch
    // (network retry, double-click, race condition, etc.)
    // ============================================================
    const existingNotes = await base44.asServiceRole.entities.Note.filter({ 
      mailingBatchId: mailingBatchId 
    });
    if (existingNotes && existingNotes.length > 0) {
      console.log(`[IDEMPOTENCY] Batch ${mailingBatchId} already has ${existingNotes.length} Notes. Returning existing result.`);
      return Response.json({ 
        error: 'Batch already processed',
        mailingBatchId,
        existingNoteCount: existingNotes.length,
        message: 'This batch has already been processed. Notes already exist.'
      }, { status: 409 });
    }
    
    // BATCH STATUS GUARD
    // Only process batches in 'draft' or 'ready_to_send' status
    if (batch.status !== 'draft' && batch.status !== 'ready_to_send') {
      console.log(`[STATUS] Batch ${mailingBatchId} status is "${batch.status}", expected draft or ready_to_send.`);
      return Response.json({ 
        error: `Batch status is "${batch.status}", expected "draft" or "ready_to_send"`,
        mailingBatchId
      }, { status: 400 });
    }
    
    // Validate batch data
    if (!batch.selectedClientIds?.length) {
      return Response.json({ error: 'No clients selected in batch' }, { status: 400 });
    }
    
    if (!batch.selectedCardDesignId) {
      return Response.json({ error: 'No card design selected' }, { status: 400 });
    }
    
    // ============================================================
    // RESOLVE THE BATCH OWNER (may differ from caller in automation)
    // ============================================================
    
    let batchOwner = user; // Default: caller is the batch owner
    if (serviceRoleBypass && batch.userId && batch.userId !== user.id) {
      console.log('[PMB] Service-role bypass: loading batch owner user', batch.userId);
      const ownerUsers = await base44.asServiceRole.entities.User.filter({ id: batch.userId });
      if (ownerUsers?.length) {
        batchOwner = ownerUsers[0];
        console.log('[PMB] Batch owner loaded:', batchOwner.id, batchOwner.email);
      } else {
        console.warn('[PMB] Batch owner not found, falling back to caller');
      }
    }
    
    // ============================================================
    // CREDIT VALIDATION & CALCULATION
    // ============================================================
    
    const creditsNeeded = batch.selectedClientIds.length;
    const companyAllocatedCredits = batchOwner.companyAllocatedCredits || 0;
    const personalPurchasedCredits = batchOwner.personalPurchasedCredits || 0;
    const canAccessCompanyPool = batchOwner.canAccessCompanyPool !== false;
    
    console.log('[PMB] Credits needed:', creditsNeeded);
    console.log('[PMB] Batch owner credit fields - companyAllocatedCredits:', batchOwner.companyAllocatedCredits, 
      'personalPurchasedCredits:', batchOwner.personalPurchasedCredits, 'canAccessCompanyPool:', batchOwner.canAccessCompanyPool);
    console.log('[PMB] Resolved - allocated:', companyAllocatedCredits, 'personal:', personalPurchasedCredits, 
      'canAccessPool:', canAccessCompanyPool);
    
    let companyPoolCredits = 0;
    let organization = null;
    
    const effectiveOrgId = batchOwner.orgId || batch.organizationId;
    if (effectiveOrgId) {
      console.log('[PMB] Looking up organization:', effectiveOrgId);
      const orgs = await base44.asServiceRole.entities.Organization.filter({ id: effectiveOrgId });
      console.log('[PMB] Organization lookup: found', orgs?.length || 0, 'org(s)');
      
      if (orgs?.length) {
        organization = orgs[0];
        console.log('[PMB] Org creditBalance:', organization.creditBalance, 'name:', organization.name);
        companyPoolCredits = canAccessCompanyPool ? (organization.creditBalance || 0) : 0;
      } else {
        console.warn('[PMB] No organization found for orgId:', effectiveOrgId);
      }
    } else {
      console.warn('[PMB] No orgId available from batch owner or batch!');
    }
    
    const totalAvailable = companyAllocatedCredits + companyPoolCredits + personalPurchasedCredits;
    console.log('[PMB] CREDIT SUMMARY - total available:', totalAvailable, '(allocated:', companyAllocatedCredits, 
      '+ pool:', companyPoolCredits, '+ personal:', personalPurchasedCredits, ') vs needed:', creditsNeeded);
    
    if (totalAvailable < creditsNeeded) {
      console.error('[PMB] INSUFFICIENT CREDITS - available:', totalAvailable, 'needed:', creditsNeeded);
      return Response.json({ 
        error: 'Insufficient credits',
        creditsNeeded,
        totalAvailable,
        breakdown: { companyAllocatedCredits, companyPoolCredits, personalPurchasedCredits, canAccessCompanyPool },
        deficit: creditsNeeded - totalAvailable
      }, { status: 402 });
    }
    
    console.log('[PMB] Credit check PASSED');
    
    // Calculate deduction plan
    let remaining = creditsNeeded;
    let fromCompanyAllocated = Math.min(companyAllocatedCredits, remaining);
    remaining -= fromCompanyAllocated;
    
    let fromCompanyPool = 0;
    if (remaining > 0 && canAccessCompanyPool) {
      fromCompanyPool = Math.min(companyPoolCredits, remaining);
      remaining -= fromCompanyPool;
    }
    
    let fromPersonalPurchased = Math.min(personalPurchasedCredits, remaining);
    
    // ============================================================
    // LOAD DATA
    // ============================================================
    
    const [clients, noteStyleProfile] = await Promise.all([
      base44.asServiceRole.entities.Client.filter({ id: { $in: batch.selectedClientIds } }),
      batch.selectedNoteStyleProfileId 
        ? base44.asServiceRole.entities.NoteStyleProfile.filter({ id: batch.selectedNoteStyleProfileId })
            .then(profiles => profiles?.[0] || null)
        : Promise.resolve(null)
    ]);
    
    if (clients.length !== batch.selectedClientIds.length) {
      return Response.json({ error: 'Some clients could not be found' }, { status: 400 });
    }
    
    // ============================================================
    // PROCESS EACH CLIENT - CREATE NOTES & MAILINGS
    // ============================================================
    
    const processedMailings = [];
    const errors = [];
    const currentTimestamp = new Date().toISOString();
    
    for (const client of clients) {
      try {
        // Get raw message (contains placeholders)
        const rawClientMessage = batch.contentOverrides?.[client.id] || batch.globalMessage || '';
        
        // ============================================================
        // BUILD RAW MESSAGE WITH GREETING/SIGNATURE (placeholders intact)
        // ============================================================
        
        let rawMessageWithGreeting = '';
        
        // Add greeting (keep placeholders intact)
        if (batch.includeGreeting && noteStyleProfile?.defaultGreeting) {
          rawMessageWithGreeting += noteStyleProfile.defaultGreeting + '\n\n';
        }
        
        // Add main message (keep placeholders intact)
        rawMessageWithGreeting += rawClientMessage;
        
        // Add signature (keep placeholders intact)
        let rawSignature = null;
        if (batch.includeSignature && noteStyleProfile?.signatureText) {
          rawSignature = noteStyleProfile.signatureText;
          rawMessageWithGreeting += '\n\n' + rawSignature;
        }
        
        // ============================================================
        // BUILD TWO MESSAGE VERSIONS
        // ============================================================
        
        // 1. SCRIBE MESSAGE: Resolve sender placeholders, map client placeholders to Scribe format
        //    Result: "Dear {FIRST_NAME}, ... Sincerely, Mitch Fields"
        const senderResolved = resolveSenderPlaceholders(rawMessageWithGreeting, user, organization);
        const scribeMessage = mapToScribePlaceholders(senderResolved);
        
        // 2. DISPLAY MESSAGE: Resolve ALL placeholders for this specific client
        //    Result: "Dear Joshua, ... Sincerely, Mitch Fields"
        const displayMessage = resolveAllPlaceholders(rawMessageWithGreeting, client, user, organization);
        const resolvedSignature = rawSignature ? resolveAllPlaceholders(rawSignature, client, user, organization) : null;
        
        // Determine card design and return address mode
        const cardDesignId = batch.cardDesignOverrides?.[client.id] || batch.selectedCardDesignId;
        const returnMode = batch.returnAddressModeOverrides?.[client.id] || batch.returnAddressModeGlobal || 'company';
        const returnAddress = resolveReturnAddress(returnMode, user, organization);
        
        // Create Note with BOTH messages
        const note = await base44.asServiceRole.entities.Note.create({
          orgId: effectiveOrgId,
          userId: batchOwner.id,
          clientId: client.id,
          mailingBatchId: mailingBatchId,
          cardDesignId: cardDesignId,
          noteStyleProfileId: batch.selectedNoteStyleProfileId || null,
          message: displayMessage,           // Fully resolved (for display/audit)
          messageTemplate: scribeMessage,    // Scribe format with {FIRST_NAME} etc
          signature: resolvedSignature,
          status: 'queued_for_sending',
          sentDate: currentTimestamp,
          creditCost: 1,
          recipientName: client.fullName,
          senderUserId: batchOwner.id,
          senderName: batchOwner.full_name,
          returnAddressMode: returnMode
        });
        
        // Create Mailing
        const mailing = await base44.asServiceRole.entities.Mailing.create({
          noteId: note.id,
          orgId: effectiveOrgId,
          mailingBatchId: mailingBatchId,
          recipientAddress: {
            name: client.fullName || '',
            street: client.street || '',
            address2: client.address2 || null,
            city: client.city || '',
            state: client.state || '',
            zip: client.zipCode || ''
          },
          returnAddress: returnAddress ? {
            name: returnAddress.name || '',
            street: returnAddress.street || '',
            address2: null,
            city: returnAddress.city || '',
            state: returnAddress.state || '',
            zip: returnAddress.zip || ''
          } : null,
          status: 'queued',
          returnAddressMode: returnMode
        });
        
        // Update Client tracking
        await base44.asServiceRole.entities.Client.update(client.id, {
          lastNoteSentDate: currentTimestamp,
          totalNotesSent: (client.totalNotesSent || 0) + 1
        });
        
        processedMailings.push({
          noteId: note.id,
          mailingId: mailing.id,
          clientId: client.id,
          clientName: client.fullName,
          cardDesignId,
          returnAddressMode: returnMode,
          scribeMessage
        });
        
      } catch (clientError) {
        console.error(`Error processing client ${client.id}:`, clientError);
        errors.push({ clientId: client.id, clientName: client.fullName, error: clientError.message });
      }
    }
    
    // ============================================================
    // DEDUCT CREDITS
    // ============================================================
    
    const successfulSends = processedMailings.length;
    let actualFromCompanyAllocated = 0;
    let actualFromCompanyPool = 0;
    let actualFromPersonalPurchased = 0;
    
    if (successfulSends > 0) {
      let remainingToDeduct = successfulSends;
      
      if (fromCompanyAllocated > 0) {
        actualFromCompanyAllocated = Math.min(fromCompanyAllocated, remainingToDeduct);
        remainingToDeduct -= actualFromCompanyAllocated;
        
        const newBalance = companyAllocatedCredits - actualFromCompanyAllocated;
        await base44.asServiceRole.entities.User.update(batchOwner.id, { companyAllocatedCredits: newBalance });
        
        await base44.asServiceRole.entities.Transaction.create({
          fromAccountType: 'organization', fromAccountId: effectiveOrgId,
          toAccountId: batchOwner.id, toAccountType: 'user',
          orgId: effectiveOrgId, userId: batchOwner.id,
          type: 'deduction', amount: -actualFromCompanyAllocated,
          balanceAfter: newBalance, balanceType: 'user',
          description: `Sent ${actualFromCompanyAllocated} handwritten note(s) (company-allocated)`,
          metadata: { mailingBatchId, noteCount: actualFromCompanyAllocated, source: 'company_allocated' }
        });
      }
      
      if (remainingToDeduct > 0 && fromCompanyPool > 0 && organization) {
        actualFromCompanyPool = Math.min(fromCompanyPool, remainingToDeduct);
        remainingToDeduct -= actualFromCompanyPool;
        
        const newBalance = companyPoolCredits - actualFromCompanyPool;
        await base44.asServiceRole.entities.Organization.update(organization.id, { creditBalance: newBalance });
        
        await base44.asServiceRole.entities.Transaction.create({
          fromAccountType: 'organization', fromAccountId: organization.id,
          toAccountId: batchOwner.id, toAccountType: 'user',
          orgId: effectiveOrgId, userId: batchOwner.id,
          type: 'deduction', amount: -actualFromCompanyPool,
          balanceAfter: newBalance, balanceType: 'organization',
          description: `Sent ${actualFromCompanyPool} handwritten note(s) (company pool)`,
          metadata: { mailingBatchId, noteCount: actualFromCompanyPool, source: 'company_pool' }
        });
      }
      
      if (remainingToDeduct > 0 && fromPersonalPurchased > 0) {
        actualFromPersonalPurchased = Math.min(fromPersonalPurchased, remainingToDeduct);
        
        const newBalance = personalPurchasedCredits - actualFromPersonalPurchased;
        await base44.asServiceRole.entities.User.update(batchOwner.id, { personalPurchasedCredits: newBalance });
        
        await base44.asServiceRole.entities.Transaction.create({
          fromAccountType: 'user', fromAccountId: batchOwner.id,
          toAccountId: batchOwner.id, toAccountType: 'user',
          orgId: effectiveOrgId, userId: batchOwner.id,
          type: 'deduction', amount: -actualFromPersonalPurchased,
          balanceAfter: newBalance, balanceType: 'user',
          description: `Sent ${actualFromPersonalPurchased} handwritten note(s) (personal)`,
          metadata: { mailingBatchId, noteCount: actualFromPersonalPurchased, source: 'personal_purchased' }
        });
      }
    }
    
    const creditsUsed = actualFromCompanyAllocated + actualFromCompanyPool + actualFromPersonalPurchased;
    
    // ============================================================
    // ADMIN APPROVAL GATE
    // ============================================================
    
    if (REQUIRE_ADMIN_APPROVAL) {
      console.log('REQUIRE_ADMIN_APPROVAL=true - stopping at pending_review');
      
      await base44.asServiceRole.entities.MailingBatch.update(mailingBatchId, {
        status: 'pending_review',
        processedAt: currentTimestamp,
        totalCreditsUsed: creditsUsed,
        processingErrors: errors.length ? errors.map(e => ({ clientId: e.clientId, error: e.error, timestamp: currentTimestamp })) : []
      });
      
      return Response.json({
        success: true,
        status: 'pending_review',
        message: 'Batch created and awaiting admin approval',
        mailingBatchId,
        noteCount: processedMailings.length,
        creditsUsed,
        creditsDeducted: {
          companyAllocated: actualFromCompanyAllocated,
          companyPool: actualFromCompanyPool,
          personalPurchased: actualFromPersonalPurchased,
          total: creditsUsed
        }
      });
    }
    
    // Direct completion (if REQUIRE_ADMIN_APPROVAL=false)
    await base44.asServiceRole.entities.MailingBatch.update(mailingBatchId, {
      status: 'completed',
      processedAt: currentTimestamp,
      totalCreditsUsed: creditsUsed,
      processingErrors: errors.length ? errors.map(e => ({ clientId: e.clientId, error: e.error, timestamp: currentTimestamp })) : []
    });
    
    return Response.json({
      success: true,
      status: 'completed',
      processedCount: processedMailings.length,
      totalClients: clients.length,
      creditsDeducted: {
        companyAllocated: actualFromCompanyAllocated,
        companyPool: actualFromCompanyPool,
        personalPurchased: actualFromPersonalPurchased,
        total: creditsUsed
      },
      errors: errors.length ? errors : undefined
    });
    
  } catch (error) {
    console.error('Error in processMailingBatch:', error);
    return Response.json({ error: error.message || 'Failed to process mailing batch', details: error.stack }, { status: 500 });
  }
});