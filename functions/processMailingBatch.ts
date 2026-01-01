import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ============================================================
// PROCESS MAILING BATCH - CORRECTED VERSION
// ============================================================
//
// This function runs when the user clicks "Send" on ReviewAndSend page.
// It creates Note and Mailing records for each recipient.
//
// KEY FIX: Properly compose the full message with:
//   1. Greeting (from NoteStyleProfile.defaultGreeting)
//   2. Body (from batch.globalMessage or contentOverrides)
//   3. Signature (from NoteStyleProfile.signatureText)
//
// Creates TWO message versions per note:
//   - note.message = Fully resolved for display/audit (actual names)
//   - note.messageTemplate = Scribe format with {FIRST_NAME} etc.
//
// ============================================================

const REQUIRE_ADMIN_APPROVAL = Deno.env.get('REQUIRE_ADMIN_APPROVAL') === 'true';

// ============================================================
// PLACEHOLDER UTILITIES
// ============================================================

/**
 * Resolve sender/user/organization placeholders to actual values
 * Supports: {{me.*}}, {{user.*}}, {{rep_*}}, {{org.*}}
 */
function resolveSenderPlaceholders(text, user, organization) {
  if (!text) return '';
  let result = text;
  
  if (user) {
    const firstName = user.firstName || user.full_name?.split(' ')[0] || '';
    const lastName = user.lastName || user.full_name?.split(' ').slice(1).join(' ') || '';
    const fullName = user.full_name || `${firstName} ${lastName}`.trim() || '';
    const companyName = user.companyName || organization?.name || '';
    
    // {{me.*}} format
    result = result.replace(/\{\{me\.fullName\}\}/g, fullName);
    result = result.replace(/\{\{me\.firstName\}\}/g, firstName);
    result = result.replace(/\{\{me\.lastName\}\}/g, lastName);
    result = result.replace(/\{\{me\.email\}\}/g, user.email || '');
    result = result.replace(/\{\{me\.phone\}\}/g, user.phone || '');
    result = result.replace(/\{\{me\.companyName\}\}/g, companyName);
    
    // {{user.*}} format (from signatures)
    result = result.replace(/\{\{user\.fullName\}\}/g, fullName);
    result = result.replace(/\{\{user\.firstName\}\}/g, firstName);
    result = result.replace(/\{\{user\.lastName\}\}/g, lastName);
    result = result.replace(/\{\{user\.email\}\}/g, user.email || '');
    result = result.replace(/\{\{user\.phone\}\}/g, user.phone || '');
    result = result.replace(/\{\{user\.companyName\}\}/g, companyName);
    
    // Legacy {{rep_*}} format
    result = result.replace(/\{\{rep_full_name\}\}/g, fullName);
    result = result.replace(/\{\{rep_first_name\}\}/g, firstName);
    result = result.replace(/\{\{rep_last_name\}\}/g, lastName);
    result = result.replace(/\{\{rep_company_name\}\}/g, companyName);
    result = result.replace(/\{\{rep_phone\}\}/g, user.phone || '');
    result = result.replace(/\{\{rep_email\}\}/g, user.email || '');
  }
  
  if (organization) {
    result = result.replace(/\{\{org\.name\}\}/g, organization.name || '');
    result = result.replace(/\{\{org\.phone\}\}/g, organization.phone || '');
    result = result.replace(/\{\{org\.email\}\}/g, organization.email || '');
  }
  
  return result;
}

/**
 * Resolve client placeholders to actual values (for display/audit version)
 * Supports: {{client.*}}, {{firstName}}, etc.
 */
function resolveClientPlaceholders(text, client) {
  if (!text || !client) return text || '';
  let result = text;
  
  const firstName = client.firstName || '';
  const lastName = client.lastName || '';
  const fullName = client.fullName || `${firstName} ${lastName}`.trim() || '';
  
  // {{client.*}} format
  result = result.replace(/\{\{client\.firstName\}\}/g, firstName);
  result = result.replace(/\{\{client\.lastName\}\}/g, lastName);
  result = result.replace(/\{\{client\.fullName\}\}/g, fullName);
  result = result.replace(/\{\{client\.email\}\}/g, client.email || '');
  result = result.replace(/\{\{client\.phone\}\}/g, client.phone || '');
  result = result.replace(/\{\{client\.company\}\}/g, client.company || '');
  result = result.replace(/\{\{client\.street\}\}/g, client.street || '');
  result = result.replace(/\{\{client\.city\}\}/g, client.city || '');
  result = result.replace(/\{\{client\.state\}\}/g, client.state || '');
  result = result.replace(/\{\{client\.zipCode\}\}/g, client.zipCode || '');
  
  // Legacy format
  result = result.replace(/\{\{firstName\}\}/g, firstName);
  result = result.replace(/\{\{lastName\}\}/g, lastName);
  result = result.replace(/\{\{fullName\}\}/g, fullName);
  result = result.replace(/\{\{email\}\}/g, client.email || '');
  result = result.replace(/\{\{phone\}\}/g, client.phone || '');
  result = result.replace(/\{\{company\}\}/g, client.company || '');
  
  return result;
}

/**
 * Convert client placeholders to Scribe format
 * {{client.firstName}} → {FIRST_NAME}
 */
function mapToScribePlaceholders(text) {
  if (!text) return '';
  return text
    // {{client.*}} format
    .replace(/\{\{client\.firstName\}\}/g, '{FIRST_NAME}')
    .replace(/\{\{client\.lastName\}\}/g, '{LAST_NAME}')
    .replace(/\{\{client\.fullName\}\}/g, '{FIRST_NAME} {LAST_NAME}')
    .replace(/\{\{client\.email\}\}/g, '{EMAIL}')
    .replace(/\{\{client\.phone\}\}/g, '{PHONE}')
    .replace(/\{\{client\.company\}\}/g, '{COMPANY_NAME}')
    .replace(/\{\{client\.street\}\}/g, '{STREET_ADDRESS}')
    .replace(/\{\{client\.city\}\}/g, '{CITY}')
    .replace(/\{\{client\.state\}\}/g, '{STATE}')
    .replace(/\{\{client\.zipCode\}\}/g, '{ZIP}')
    // Legacy format
    .replace(/\{\{firstName\}\}/g, '{FIRST_NAME}')
    .replace(/\{\{lastName\}\}/g, '{LAST_NAME}')
    .replace(/\{\{fullName\}\}/g, '{FIRST_NAME} {LAST_NAME}')
    .replace(/\{\{email\}\}/g, '{EMAIL}')
    .replace(/\{\{phone\}\}/g, '{PHONE}')
    .replace(/\{\{company\}\}/g, '{COMPANY_NAME}');
}

/**
 * Compose full message with greeting + body + signature
 */
function composeFullMessage(greeting, body, signature, includeGreeting, includeSignature) {
  const parts = [];
  
  if (includeGreeting && greeting) {
    parts.push(greeting);
  }
  
  if (body) {
    parts.push(body);
  }
  
  if (includeSignature && signature) {
    parts.push(signature);
  }
  
  return parts.join('\n\n');
}

/**
 * Determine text type based on word count
 */
function determineTextType(message) {
  if (!message) return 'Short Text';
  const wordCount = message.trim().split(/\s+/).length;
  return wordCount > 110 ? 'Long Text' : 'Short Text';
}

/**
 * Build return address object based on mode
 */
function buildReturnAddress(mode, user, organization) {
  if (mode === 'none' || !mode) {
    return null;
  }
  
  if (mode === 'company' && organization?.companyReturnAddress) {
    const addr = organization.companyReturnAddress;
    return {
      mode: 'company',
      name: addr.name || organization.name || '',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.zip || ''
    };
  }
  
  if (mode === 'rep' && user) {
    return {
      mode: 'rep',
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
// CREDIT HANDLING
// ============================================================

async function deductCredits(base44, user, organization, creditsNeeded) {
  console.log(`[Credits] Deducting ${creditsNeeded} credits`);
  
  // Calculate available credits
  const personalPurchased = user.personalPurchasedCredits || 0;
  const companyAllocated = user.companyAllocatedCredits || 0;
  const hasPoolAccess = user.hasCompanyPoolAccess || false;
  const poolCredits = hasPoolAccess ? (organization?.creditBalance || 0) : 0;
  
  const totalAvailable = personalPurchased + companyAllocated + poolCredits;
  
  console.log(`[Credits] Available: personal=${personalPurchased}, allocated=${companyAllocated}, pool=${poolCredits}, total=${totalAvailable}`);
  
  if (totalAvailable < creditsNeeded) {
    throw new Error(`Insufficient credits. Need ${creditsNeeded}, have ${totalAvailable}`);
  }
  
  let remaining = creditsNeeded;
  let deductFromPersonal = 0;
  let deductFromAllocated = 0;
  let deductFromPool = 0;
  
  // Deduct from allocated first
  if (remaining > 0 && companyAllocated > 0) {
    deductFromAllocated = Math.min(remaining, companyAllocated);
    remaining -= deductFromAllocated;
  }
  
  // Then from personal
  if (remaining > 0 && personalPurchased > 0) {
    deductFromPersonal = Math.min(remaining, personalPurchased);
    remaining -= deductFromPersonal;
  }
  
  // Finally from pool
  if (remaining > 0 && poolCredits > 0) {
    deductFromPool = Math.min(remaining, poolCredits);
    remaining -= deductFromPool;
  }
  
  console.log(`[Credits] Deducting: allocated=${deductFromAllocated}, personal=${deductFromPersonal}, pool=${deductFromPool}`);
  
  // Update user credits
  if (deductFromAllocated > 0 || deductFromPersonal > 0) {
    await base44.entities.User.update(user.id, {
      companyAllocatedCredits: companyAllocated - deductFromAllocated,
      personalPurchasedCredits: personalPurchased - deductFromPersonal
    });
  }
  
  // Update organization pool
  if (deductFromPool > 0 && organization) {
    await base44.entities.Organization.update(organization.id, {
      creditBalance: (organization.creditBalance || 0) - deductFromPool
    });
  }
  
  return {
    deductedFromAllocated: deductFromAllocated,
    deductedFromPersonal: deductFromPersonal,
    deductedFromPool: deductFromPool,
    totalDeducted: creditsNeeded
  };
}

// ============================================================
// MAIN HANDLER
// ============================================================

Deno.serve(async (req) => {
  console.log('===========================================');
  console.log('=== PROCESS MAILING BATCH (CORRECTED) ===');
  console.log('===========================================');
  console.log('REQUIRE_ADMIN_APPROVAL:', REQUIRE_ADMIN_APPROVAL);
  
  try {
    const base44 = createClientFromRequest(req);
    const { mailingBatchId } = await req.json();
    
    if (!mailingBatchId) {
      return Response.json({ success: false, error: 'mailingBatchId is required' }, { status: 400 });
    }
    
    // Get current user
    const currentUser = await base44.auth.me();
    if (!currentUser) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log(`User ${currentUser.email} processing batch ${mailingBatchId}`);
    
    // ========================================
    // LOAD BATCH AND RELATED DATA
    // ========================================
    
    const batchList = await base44.entities.MailingBatch.filter({ id: mailingBatchId });
    if (!batchList?.length) {
      return Response.json({ success: false, error: 'Batch not found' }, { status: 404 });
    }
    
    const batch = batchList[0];
    console.log('Batch loaded:', batch.id, 'status:', batch.status);
    
    // Verify batch belongs to this user
    if (batch.userId !== currentUser.id) {
      return Response.json({ success: false, error: 'Not authorized to process this batch' }, { status: 403 });
    }
    
    // Check batch status
    if (batch.status !== 'draft' && batch.status !== 'ready_to_send') {
      return Response.json({ 
        success: false, 
        error: `Batch status is "${batch.status}", expected "draft" or "ready_to_send"` 
      }, { status: 400 });
    }
    
    // Load user with full data
    const userList = await base44.entities.User.filter({ id: currentUser.id });
    const user = userList?.[0] || currentUser;
    
    // Load organization
    let organization = null;
    if (batch.organizationId) {
      const orgList = await base44.entities.Organization.filter({ id: batch.organizationId });
      organization = orgList?.[0] || null;
    }
    
    // Enrich user with org data
    if (organization && !user.companyName) {
      user.companyName = organization.name;
    }
    
    // Load clients
    const clientIds = batch.selectedClientIds || [];
    if (!clientIds.length) {
      return Response.json({ success: false, error: 'No clients selected' }, { status: 400 });
    }
    
    const clientList = await base44.entities.Client.filter({ id: { $in: clientIds } });
    const clientMap = Object.fromEntries(clientList.map(c => [c.id, c]));
    console.log(`Loaded ${clientList.length} clients`);
    
    // Load NoteStyleProfile (CRITICAL for greeting/signature)
    let noteStyleProfile = null;
    if (batch.selectedNoteStyleProfileId) {
      const profileList = await base44.entities.NoteStyleProfile.filter({ id: batch.selectedNoteStyleProfileId });
      noteStyleProfile = profileList?.[0] || null;
    }
    
    if (!noteStyleProfile) {
      console.warn('No NoteStyleProfile found - greeting/signature may be missing');
    } else {
      console.log('NoteStyleProfile loaded:', noteStyleProfile.name);
      console.log('  defaultGreeting:', noteStyleProfile.defaultGreeting);
      console.log('  signatureText:', noteStyleProfile.signatureText?.substring(0, 50) + '...');
    }
    
    // Load card design
    let cardDesign = null;
    if (batch.selectedCardDesignId) {
      const designList = await base44.entities.CardDesign.filter({ id: batch.selectedCardDesignId });
      cardDesign = designList?.[0] || null;
    }
    
    // Load card design overrides
    const designOverrideIds = Object.values(batch.cardDesignOverrides || {}).filter(Boolean);
    let cardDesignOverridesMap = {};
    if (designOverrideIds.length) {
      const overrideDesigns = await base44.entities.CardDesign.filter({ id: { $in: designOverrideIds } });
      cardDesignOverridesMap = Object.fromEntries(overrideDesigns.map(d => [d.id, d]));
    }
    
    // ========================================
    // DEDUCT CREDITS
    // ========================================
    
    const creditsNeeded = clientIds.length;
    const creditResult = await deductCredits(base44, user, organization, creditsNeeded);
    console.log('Credits deducted:', creditResult);
    
    // ========================================
    // CREATE NOTES FOR EACH RECIPIENT
    // ========================================
    
    const notes = [];
    const mailings = [];
    const errors = [];
    
    for (const clientId of clientIds) {
      const client = clientMap[clientId];
      
      if (!client) {
        errors.push({ clientId, error: 'Client not found' });
        continue;
      }
      
      try {
        // Get message body (with possible override)
        const messageBody = batch.contentOverrides?.[clientId] || batch.globalMessage || '';
        
        // Get greeting (with possible override)
        // Check greetingOverrides first, then use profile default
        let greetingTemplate = batch.greetingOverrides?.[clientId] || noteStyleProfile?.defaultGreeting || '';
        
        // Get signature (with possible override)
        let signatureTemplate = batch.signatureOverrides?.[clientId] || noteStyleProfile?.signatureText || '';
        
        // Get include flags (with possible override)
        const includeGreeting = batch.includeGreeting !== false;
        const includeSignature = batch.includeSignature !== false;
        
        // Get return address mode (with possible override)
        const returnAddressMode = batch.returnAddressModeOverrides?.[clientId] || batch.returnAddressModeGlobal || 'none';
        
        // Get card design (with possible override)
        const clientCardDesignId = batch.cardDesignOverrides?.[clientId] || batch.selectedCardDesignId;
        const clientCardDesign = cardDesignOverridesMap[clientCardDesignId] || cardDesign;
        
        console.log(`\n--- Processing client: ${client.fullName || client.firstName} ---`);
        console.log('  Greeting template:', greetingTemplate);
        console.log('  Include greeting:', includeGreeting);
        console.log('  Include signature:', includeSignature);
        
        // ========================================
        // COMPOSE FULL MESSAGE (RAW with placeholders)
        // ========================================
        const rawFullMessage = composeFullMessage(
          greetingTemplate,
          messageBody,
          signatureTemplate,
          includeGreeting,
          includeSignature
        );
        
        console.log('  Raw full message (first 100 chars):', rawFullMessage.substring(0, 100));
        
        // ========================================
        // CREATE TWO VERSIONS:
        // 1. message = Fully resolved (for display/audit)
        // 2. messageTemplate = Scribe format (for printing)
        // ========================================
        
        // Step 1: Resolve sender placeholders ({{user.*}}, {{me.*}}, {{rep_*}})
        const withSenderResolved = resolveSenderPlaceholders(rawFullMessage, user, organization);
        
        // Step 2a: For display - also resolve client placeholders
        const fullyResolved = resolveClientPlaceholders(withSenderResolved, client);
        
        // Step 2b: For Scribe - convert client placeholders to {FIRST_NAME} format
        const scribeTemplate = mapToScribePlaceholders(withSenderResolved);
        
        console.log('  Fully resolved (first 100 chars):', fullyResolved.substring(0, 100));
        console.log('  Scribe template (first 100 chars):', scribeTemplate.substring(0, 100));
        
        // Build return address
        const returnAddress = buildReturnAddress(returnAddressMode, user, organization);
        
        // Determine text type
        const textType = determineTextType(scribeTemplate);
        
        // ========================================
        // CREATE NOTE RECORD
        // ========================================
        const noteData = {
          userId: user.id,
          organizationId: batch.organizationId,
          clientId: client.id,
          mailingBatchId: batch.id,
          
          // Message versions
          message: fullyResolved,           // Display/audit version
          messageTemplate: scribeTemplate,  // Scribe version with {FIRST_NAME}
          
          // Components used to build message
          greetingTemplate: greetingTemplate,
          bodyTemplate: messageBody,
          signatureTemplate: signatureTemplate,
          includeGreeting: includeGreeting,
          includeSignature: includeSignature,
          
          // Card design
          cardDesignId: clientCardDesignId,
          noteStyleProfileId: batch.selectedNoteStyleProfileId,
          
          // Recipient info (snapshot)
          recipientName: client.fullName || `${client.firstName} ${client.lastName}`.trim(),
          recipientAddress: {
            street: client.street,
            city: client.city,
            state: client.state,
            zip: client.zipCode
          },
          
          // Return address (snapshot)
          returnAddressMode: returnAddressMode,
          returnAddress: returnAddress,
          
          // Scribe metadata
          textType: textType,
          
          // Status
          status: REQUIRE_ADMIN_APPROVAL ? 'pending_review' : 'queued_for_sending',
          createdAt: new Date().toISOString()
        };
        
        const createdNote = await base44.entities.Note.create(noteData);
        notes.push(createdNote);
        console.log('  Note created:', createdNote.id);
        
        // ========================================
        // CREATE MAILING RECORD
        // ========================================
        const mailingData = {
          userId: user.id,
          organizationId: batch.organizationId,
          noteId: createdNote.id,
          mailingBatchId: batch.id,
          clientId: client.id,
          
          // Address snapshot
          recipientName: noteData.recipientName,
          recipientStreet: client.street,
          recipientCity: client.city,
          recipientState: client.state,
          recipientZip: client.zipCode,
          
          // Return address snapshot
          returnAddressMode: returnAddressMode,
          returnName: returnAddress?.name || null,
          returnStreet: returnAddress?.street || null,
          returnCity: returnAddress?.city || null,
          returnState: returnAddress?.state || null,
          returnZip: returnAddress?.zip || null,
          
          // Status
          status: REQUIRE_ADMIN_APPROVAL ? 'pending_review' : 'queued',
          createdAt: new Date().toISOString()
        };
        
        const createdMailing = await base44.entities.Mailing.create(mailingData);
        mailings.push(createdMailing);
        console.log('  Mailing created:', createdMailing.id);
        
      } catch (err) {
        console.error(`  Error processing client ${clientId}:`, err.message);
        errors.push({ clientId, error: err.message });
      }
    }
    
    // ========================================
    // UPDATE BATCH STATUS
    // ========================================
    
    const newStatus = REQUIRE_ADMIN_APPROVAL ? 'pending_review' : 'sending';
    
    await base44.entities.MailingBatch.update(mailingBatchId, {
      status: newStatus,
      totalCreditsUsed: creditsNeeded,
      processedAt: new Date().toISOString(),
      processingErrors: errors.length ? errors : null
    });
    
    console.log(`\n===========================================`);
    console.log(`BATCH PROCESSING COMPLETE`);
    console.log(`Status: ${newStatus}`);
    console.log(`Notes created: ${notes.length}`);
    console.log(`Mailings created: ${mailings.length}`);
    console.log(`Errors: ${errors.length}`);
    console.log(`===========================================`);
    
    return Response.json({
      success: true,
      status: newStatus,
      processedCount: notes.length,
      totalClients: clientIds.length,
      creditsDeducted: creditResult.totalDeducted,
      requiresAdminApproval: REQUIRE_ADMIN_APPROVAL,
      partialSuccess: errors.length > 0 && notes.length > 0,
      errors: errors.length ? errors : null
    });
    
  } catch (error) {
    console.error('processMailingBatch error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});