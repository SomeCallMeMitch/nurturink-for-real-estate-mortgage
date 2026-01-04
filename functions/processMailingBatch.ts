import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ============================================================
// PROCESS MAILING BATCH - FINAL VERSION
// ============================================================
//
// Triggered when user clicks "Send" on ReviewAndSend page.
// Creates Note and Mailing records for each recipient.
//
// PLACEHOLDER RESOLUTION:
// 1. Sender placeholders ({{user.*}}, {{me.*}}, {{rep_*}}, {{org.*}})
//    → Resolved to actual values (same for all recipients)
// 2. Client placeholders ({{client.*}}, {{firstName}}, etc.)
//    → Converted to Scribe format ({FIRST_NAME}) for messageTemplate
//    → Resolved to actual values for message (display/audit)
//
// SCHEMA - Note (required fields):
//   orgId, userId, clientId, cardDesignId, message,
//   recipientName, senderUserId, senderName
//
// SCHEMA - Mailing (required fields):
//   noteId, orgId, recipientAddress (object: name, street, city, state, zip)
//
// ============================================================

const REQUIRE_ADMIN_APPROVAL = Deno.env.get('REQUIRE_ADMIN_APPROVAL') === 'true';

// Word limits for Scribe text types
const SHORT_TEXT_WORD_LIMIT = 110;
const LONG_TEXT_WORD_LIMIT = 190;

// ============================================================
// PLACEHOLDER RESOLUTION FUNCTIONS
// ============================================================

/**
 * Resolve sender/user/organization placeholders to actual values.
 * These are the SAME for all recipients in a batch.
 * 
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
    const phone = user.phone || '';
    const email = user.email || '';
    
    // {{me.*}} format
    result = result.replace(/\{\{me\.fullName\}\}/g, fullName);
    result = result.replace(/\{\{me\.firstName\}\}/g, firstName);
    result = result.replace(/\{\{me\.lastName\}\}/g, lastName);
    result = result.replace(/\{\{me\.email\}\}/g, email);
    result = result.replace(/\{\{me\.phone\}\}/g, phone);
    result = result.replace(/\{\{me\.companyName\}\}/g, companyName);
    
    // {{user.*}} format (commonly used in signatures)
    result = result.replace(/\{\{user\.fullName\}\}/g, fullName);
    result = result.replace(/\{\{user\.firstName\}\}/g, firstName);
    result = result.replace(/\{\{user\.lastName\}\}/g, lastName);
    result = result.replace(/\{\{user\.email\}\}/g, email);
    result = result.replace(/\{\{user\.phone\}\}/g, phone);
    result = result.replace(/\{\{user\.companyName\}\}/g, companyName);
    
    // Legacy {{rep_*}} format
    result = result.replace(/\{\{rep_full_name\}\}/g, fullName);
    result = result.replace(/\{\{rep_first_name\}\}/g, firstName);
    result = result.replace(/\{\{rep_last_name\}\}/g, lastName);
    result = result.replace(/\{\{rep_company_name\}\}/g, companyName);
    result = result.replace(/\{\{rep_phone\}\}/g, phone);
    result = result.replace(/\{\{rep_email\}\}/g, email);
  }
  
  if (organization) {
    result = result.replace(/\{\{org\.name\}\}/g, organization.name || '');
    result = result.replace(/\{\{org\.phone\}\}/g, organization.phone || '');
    result = result.replace(/\{\{org\.email\}\}/g, organization.email || '');
  }
  
  return result;
}

/**
 * Resolve client placeholders to actual values.
 * Used to create the fully-resolved message for display/audit (Note.message).
 * 
 * Supports: {{client.*}}, {{firstName}}, {{lastName}}, etc.
 */
function resolveClientPlaceholders(text, client) {
  if (!text || !client) return text || '';
  let result = text;
  
  const firstName = client.firstName || '';
  const lastName = client.lastName || '';
  const fullName = client.fullName || `${firstName} ${lastName}`.trim() || '';
  
  // {{client.*}} format (preferred)
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
  
  // Legacy format (for backward compatibility)
  result = result.replace(/\{\{firstName\}\}/g, firstName);
  result = result.replace(/\{\{lastName\}\}/g, lastName);
  result = result.replace(/\{\{fullName\}\}/g, fullName);
  result = result.replace(/\{\{email\}\}/g, client.email || '');
  result = result.replace(/\{\{phone\}\}/g, client.phone || '');
  result = result.replace(/\{\{company\}\}/g, client.company || '');
  
  return result;
}

/**
 * Convert client placeholders to Scribe merge tag format.
 * Used to create Note.messageTemplate for Scribe API.
 * 
 * {{client.firstName}} → {FIRST_NAME}
 */
function convertToScribePlaceholders(text) {
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

// ============================================================
// MESSAGE COMPOSITION
// ============================================================

/**
 * Compose full message from greeting + body + signature.
 * Parts are joined with double line breaks.
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
 * Count words in a message.
 */
function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Determine Scribe text type based on word count.
 * Short Text: ≤110 words
 * Long Text: ≤190 words
 */
function determineTextType(message) {
  const wordCount = countWords(message);
  return wordCount > SHORT_TEXT_WORD_LIMIT ? 'Long Text' : 'Short Text';
}

/**
 * Validate message length against Scribe limits.
 * Returns { valid: boolean, wordCount: number, textType: string, error?: string }
 */
function validateMessageLength(message) {
  const wordCount = countWords(message);
  const textType = wordCount > SHORT_TEXT_WORD_LIMIT ? 'Long Text' : 'Short Text';
  
  if (wordCount > LONG_TEXT_WORD_LIMIT) {
    return {
      valid: false,
      wordCount,
      textType,
      error: `Message has ${wordCount} words, exceeds maximum of ${LONG_TEXT_WORD_LIMIT} words`
    };
  }
  
  return { valid: true, wordCount, textType };
}

// ============================================================
// RETURN ADDRESS HANDLING
// ============================================================

/**
 * Build return address object for Mailing entity storage.
 * 
 * For Scribe API submission (in submitBatchToScribe), the format will be:
 *   - firstName: company name OR user's return address name
 *   - lastName: empty string
 *   - street, city, state, zip: from respective source
 * 
 * @param {string} mode - 'company', 'rep', or 'none'
 * @param {Object} user - User entity
 * @param {Object} organization - Organization entity
 * @returns {Object|null} Return address object or null if mode is 'none'
 */
function buildReturnAddress(mode, user, organization) {
  if (mode === 'none' || !mode) {
    return null;
  }
  
  if (mode === 'company') {
    const addr = organization?.companyReturnAddress;
    if (!addr) {
      console.warn('[Return Address] Company mode selected but no companyReturnAddress on organization');
      return null;
    }
    
    return {
      // For Scribe: put company name in firstName field
      firstName: addr.companyName || organization?.name || '',
      lastName: '',
      // Full name for display purposes
      name: addr.companyName || organization?.name || '',
      street: addr.street || '',
      address2: addr.address2 || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.zip || ''
    };
  }
  
  if (mode === 'rep') {
    if (!user) {
      console.warn('[Return Address] Rep mode selected but no user provided');
      return null;
    }
    
    // Use returnAddressName if set, otherwise fall back to full_name
    const displayName = user.returnAddressName || user.full_name || '';
    
    return {
      // For Scribe: put name in firstName field
      firstName: displayName,
      lastName: '',
      // Full name for display purposes
      name: displayName,
      street: user.street || '',
      address2: user.address2 || '',
      city: user.city || '',
      state: user.state || '',
      zip: user.zipCode || ''
    };
  }
  
  console.warn(`[Return Address] Unknown mode: ${mode}`);
  return null;
}

/**
 * Validate return address has required fields.
 */
function validateReturnAddress(returnAddress, mode) {
  if (mode === 'none' || !mode) {
    return { valid: true };
  }
  
  if (!returnAddress) {
    return { valid: false, error: `Return address mode is "${mode}" but no address configured` };
  }
  
  const missing = [];
  if (!returnAddress.firstName && !returnAddress.name) missing.push('name');
  if (!returnAddress.street) missing.push('street');
  if (!returnAddress.city) missing.push('city');
  if (!returnAddress.state) missing.push('state');
  if (!returnAddress.zip) missing.push('zip');
  
  if (missing.length > 0) {
    return { valid: false, error: `Return address missing: ${missing.join(', ')}` };
  }
  
  return { valid: true };
}

// ============================================================
// RECIPIENT ADDRESS VALIDATION
// ============================================================

/**
 * Validate client has required address fields for mailing.
 */
function validateRecipientAddress(client) {
  const missing = [];
  
  if (!client.firstName && !client.fullName) missing.push('name');
  if (!client.street) missing.push('street');
  if (!client.city) missing.push('city');
  if (!client.state) missing.push('state');
  if (!client.zipCode) missing.push('zip');
  
  if (missing.length > 0) {
    return { 
      valid: false, 
      error: `Missing address fields: ${missing.join(', ')}` 
    };
  }
  
  return { valid: true };
}

// ============================================================
// CREDIT HANDLING
// ============================================================

/**
 * Deduct credits from user and/or organization.
 * Priority: allocated credits → personal credits → organization pool
 */
async function deductCredits(base44, user, organization, creditsNeeded) {
  console.log(`[Credits] Deducting ${creditsNeeded} credits`);
  
  const personalPurchased = user.personalPurchasedCredits || 0;
  const companyAllocated = user.companyAllocatedCredits || 0;
  const hasPoolAccess = user.hasCompanyPoolAccess || false;
  const poolCredits = hasPoolAccess ? (organization?.creditBalance || 0) : 0;
  
  const totalAvailable = personalPurchased + companyAllocated + poolCredits;
  
  console.log(`[Credits] Available: allocated=${companyAllocated}, personal=${personalPurchased}, pool=${poolCredits}, total=${totalAvailable}`);
  
  if (totalAvailable < creditsNeeded) {
    throw new Error(`Insufficient credits. Need ${creditsNeeded}, have ${totalAvailable}`);
  }
  
  let remaining = creditsNeeded;
  let deductFromAllocated = 0;
  let deductFromPersonal = 0;
  let deductFromPool = 0;
  
  // 1. Deduct from allocated first
  if (remaining > 0 && companyAllocated > 0) {
    deductFromAllocated = Math.min(remaining, companyAllocated);
    remaining -= deductFromAllocated;
  }
  
  // 2. Then from personal
  if (remaining > 0 && personalPurchased > 0) {
    deductFromPersonal = Math.min(remaining, personalPurchased);
    remaining -= deductFromPersonal;
  }
  
  // 3. Finally from pool
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
  console.log('=== PROCESS MAILING BATCH ===');
  console.log('===========================================');
  console.log('REQUIRE_ADMIN_APPROVAL:', REQUIRE_ADMIN_APPROVAL);
  
  try {
    const base44 = createClientFromRequest(req);
    const { mailingBatchId } = await req.json();
    
    if (!mailingBatchId) {
      return Response.json({ success: false, error: 'mailingBatchId is required' }, { status: 400 });
    }
    
    // ========================================
    // AUTHENTICATION & AUTHORIZATION
    // ========================================
    
    const currentUser = await base44.auth.me();
    if (!currentUser) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log(`User ${currentUser.email} processing batch ${mailingBatchId}`);
    
    // ========================================
    // LOAD MAILING BATCH
    // ========================================
    
    const batchList = await base44.entities.MailingBatch.filter({ id: mailingBatchId });
    if (!batchList?.length) {
      return Response.json({ success: false, error: 'Batch not found' }, { status: 404 });
    }
    
    const batch = batchList[0];
    console.log('Batch loaded:', batch.id, 'status:', batch.status);
    
    // Verify ownership
    if (batch.userId !== currentUser.id) {
      return Response.json({ success: false, error: 'Not authorized to process this batch' }, { status: 403 });
    }
    
    // Check status (prevent duplicate processing)
    if (batch.status !== 'draft' && batch.status !== 'ready_to_send') {
      return Response.json({ 
        success: false, 
        error: `Batch already processed (status: ${batch.status})` 
      }, { status: 400 });
    }
    
    // ========================================
    // LOAD RELATED DATA
    // ========================================
    
    // Load user with full data
    const userList = await base44.entities.User.filter({ id: currentUser.id });
    const user = userList?.[0] || currentUser;
    
    // Load organization
    let organization = null;
    if (batch.organizationId) {
      const orgList = await base44.entities.Organization.filter({ id: batch.organizationId });
      organization = orgList?.[0] || null;
    }
    
    // Enrich user with org data if needed
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
    
    // Load NoteStyleProfile (for greeting/signature)
    let noteStyleProfile = null;
    if (batch.selectedNoteStyleProfileId) {
      const profileList = await base44.entities.NoteStyleProfile.filter({ id: batch.selectedNoteStyleProfileId });
      noteStyleProfile = profileList?.[0] || null;
    }
    
    if (noteStyleProfile) {
      console.log('NoteStyleProfile loaded:', noteStyleProfile.name);
      console.log('  Greeting:', noteStyleProfile.defaultGreeting?.substring(0, 50));
      console.log('  Signature:', noteStyleProfile.signatureText?.substring(0, 50));
    } else {
      console.warn('No NoteStyleProfile found');
    }
    
    // Load default card design (required)
    let defaultCardDesign = null;
    if (batch.selectedCardDesignId) {
      const designList = await base44.entities.CardDesign.filter({ id: batch.selectedCardDesignId });
      defaultCardDesign = designList?.[0] || null;
    }
    
    if (!defaultCardDesign) {
      return Response.json({ success: false, error: 'No card design selected' }, { status: 400 });
    }
    
    // Load card design overrides
    const overrideDesignIds = [...new Set(Object.values(batch.cardDesignOverrides || {}).filter(Boolean))];
    const cardDesignMap = { [defaultCardDesign.id]: defaultCardDesign };
    
    if (overrideDesignIds.length) {
      const overrideDesigns = await base44.entities.CardDesign.filter({ id: { $in: overrideDesignIds } });
      overrideDesigns.forEach(d => { cardDesignMap[d.id] = d; });
    }
    
    // ========================================
    // DEDUCT CREDITS
    // ========================================
    
    const creditsNeeded = clientIds.length;
    const creditResult = await deductCredits(base44, user, organization, creditsNeeded);
    console.log('Credits deducted:', creditResult);
    
    // ========================================
    // PREPARE SENDER INFO
    // ========================================
    
    const senderName = user.full_name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    
    // ========================================
    // PROCESS EACH RECIPIENT
    // ========================================
    
    const createdNotes = [];
    const createdMailings = [];
    const errors = [];
    const warnings = [];
    
    for (const clientId of clientIds) {
      const client = clientMap[clientId];
      
      if (!client) {
        errors.push({ clientId, error: 'Client not found' });
        continue;
      }
      
      const clientName = client.fullName || `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unknown';
      
      try {
        console.log(`\n--- Processing: ${clientName} ---`);
        
        // ========================================
        // VALIDATE RECIPIENT ADDRESS
        // ========================================
        
        const addressValidation = validateRecipientAddress(client);
        if (!addressValidation.valid) {
          console.warn(`  ⚠️ Skipping: ${addressValidation.error}`);
          warnings.push({ clientId, clientName, warning: addressValidation.error });
          continue; // Skip this client, don't fail entire batch
        }
        
        // ========================================
        // GET MESSAGE COMPONENTS
        // ========================================
        
        // Message body (global or override)
        const messageBody = batch.contentOverrides?.[clientId] || batch.globalMessage || '';
        
        // Greeting (from profile or override)
        const greetingTemplate = batch.greetingOverrides?.[clientId] || noteStyleProfile?.defaultGreeting || '';
        
        // Signature (from profile or override)
        const signatureTemplate = batch.signatureOverrides?.[clientId] || noteStyleProfile?.signatureText || '';
        
        // Include flags
        const includeGreeting = batch.includeGreeting !== false;
        const includeSignature = batch.includeSignature !== false;
        
        // Return address mode (global or override)
        const returnAddressMode = batch.returnAddressModeOverrides?.[clientId] || batch.returnAddressModeGlobal || 'none';
        
        // Card design (global or override)
        const cardDesignId = batch.cardDesignOverrides?.[clientId] || batch.selectedCardDesignId;
        const cardDesign = cardDesignMap[cardDesignId] || defaultCardDesign;
        
        // ========================================
        // COMPOSE MESSAGE
        // ========================================
        
        // Step 1: Compose raw message (greeting + body + signature)
        const rawMessage = composeFullMessage(
          greetingTemplate,
          messageBody,
          signatureTemplate,
          includeGreeting,
          includeSignature
        );
        
        // Step 2: Resolve sender placeholders ({{user.*}}, {{me.*}}, {{rep_*}}, {{org.*}})
        const withSenderResolved = resolveSenderPlaceholders(rawMessage, user, organization);
        
        // Step 3a: For display/audit (Note.message) - resolve client placeholders too
        const fullyResolvedMessage = resolveClientPlaceholders(withSenderResolved, client);
        
        // Step 3b: For Scribe (Note.messageTemplate) - convert client placeholders to Scribe format
        const scribeMessageTemplate = convertToScribePlaceholders(withSenderResolved);
        
        console.log('  Message (first 80 chars):', fullyResolvedMessage.substring(0, 80));
        console.log('  Template (first 80 chars):', scribeMessageTemplate.substring(0, 80));
        
        // ========================================
        // VALIDATE MESSAGE LENGTH
        // ========================================
        
        const lengthValidation = validateMessageLength(fullyResolvedMessage);
        if (!lengthValidation.valid) {
          console.warn(`  ⚠️ Skipping: ${lengthValidation.error}`);
          warnings.push({ clientId, clientName, warning: lengthValidation.error });
          continue;
        }
        
        console.log(`  Word count: ${lengthValidation.wordCount}, Text type: ${lengthValidation.textType}`);
        
        // ========================================
        // BUILD ADDRESSES
        // ========================================
        
        // Recipient name
        const recipientName = client.fullName || `${client.firstName || ''} ${client.lastName || ''}`.trim();
        
        // Recipient address (for Mailing entity)
        const recipientAddress = {
          name: recipientName,
          street: client.street || '',
          address2: client.address2 || '',
          city: client.city || '',
          state: client.state || '',
          zip: client.zipCode || ''
        };
        
        // Return address
        const returnAddress = buildReturnAddress(returnAddressMode, user, organization);
        
        // Validate return address if mode is not 'none'
        const returnAddressValidation = validateReturnAddress(returnAddress, returnAddressMode);
        if (!returnAddressValidation.valid) {
          console.warn(`  ⚠️ ${returnAddressValidation.error}`);
          warnings.push({ clientId, clientName, warning: returnAddressValidation.error });
          // Continue anyway - return address is optional
        }
        
        // ========================================
        // CREATE NOTE RECORD
        // ========================================
        
        const noteData = {
          // Required fields
          orgId: batch.organizationId,
          userId: user.id,
          clientId: client.id,
          cardDesignId: cardDesign.id,
          message: fullyResolvedMessage,
          recipientName: recipientName,
          senderUserId: user.id,
          senderName: senderName,
          
          // Important optional fields
          mailingBatchId: batch.id,
          messageTemplate: scribeMessageTemplate,
          returnAddressMode: returnAddressMode,
          textType: lengthValidation.textType,
          wordCount: lengthValidation.wordCount,
          status: REQUIRE_ADMIN_APPROVAL ? 'pending_review' : 'queued_for_sending'
        };
        
        const createdNote = await base44.entities.Note.create(noteData);
        createdNotes.push(createdNote);
        console.log('  ✅ Note created:', createdNote.id);
        
        // ========================================
        // CREATE MAILING RECORD
        // ========================================
        
        const mailingData = {
          // Required fields
          noteId: createdNote.id,
          orgId: batch.organizationId,
          recipientAddress: recipientAddress,
          
          // Important optional fields
          mailingBatchId: batch.id,
          returnAddress: returnAddress,
          returnAddressMode: returnAddressMode,
          status: REQUIRE_ADMIN_APPROVAL ? 'pending_review' : 'queued'
        };
        
        const createdMailing = await base44.entities.Mailing.create(mailingData);
        createdMailings.push(createdMailing);
        console.log('  ✅ Mailing created:', createdMailing.id);
        
      } catch (err) {
        console.error(`  ❌ Error: ${err.message}`);
        errors.push({ clientId, clientName, error: err.message });
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
      processingErrors: errors.length ? errors : null,
      processingWarnings: warnings.length ? warnings : null
    });
    
    // ========================================
    // RETURN RESULT
    // ========================================
    
    console.log(`\n===========================================`);
    console.log(`BATCH PROCESSING COMPLETE`);
    console.log(`Status: ${newStatus}`);
    console.log(`Notes created: ${createdNotes.length}`);
    console.log(`Mailings created: ${createdMailings.length}`);
    console.log(`Warnings: ${warnings.length}`);
    console.log(`Errors: ${errors.length}`);
    console.log(`===========================================`);
    
    return Response.json({
      success: true,
      status: newStatus,
      processedCount: createdNotes.length,
      totalClients: clientIds.length,
      creditsDeducted: creditResult.totalDeducted,
      requiresAdminApproval: REQUIRE_ADMIN_APPROVAL,
      partialSuccess: (errors.length > 0 || warnings.length > 0) && createdNotes.length > 0,
      warnings: warnings.length ? warnings : null,
      errors: errors.length ? errors : null
    });
    
  } catch (error) {
    console.error('processMailingBatch error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});