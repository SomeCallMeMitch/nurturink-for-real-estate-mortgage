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
 * Resolve ONLY sender/organization placeholders - leave client placeholders intact
 * This is used to build the Scribe template message
 */
function resolveSenderPlaceholders(text, user, organization) {
  if (!text) return '';
  let result = text;
  
  if (user) {
    result = result.replace(/\{\{me\.firstName\}\}/g, user.firstName || user.full_name?.split(' ')[0] || '');
    result = result.replace(/\{\{me\.lastName\}\}/g, user.lastName || user.full_name?.split(' ').slice(1).join(' ') || '');
    result = result.replace(/\{\{me\.fullName\}\}/g, user.full_name || '');
    result = result.replace(/\{\{me\.email\}\}/g, user.email || '');
    result = result.replace(/\{\{me\.phone\}\}/g, user.phone || '');
    result = result.replace(/\{\{me\.title\}\}/g, user.title || '');
    result = result.replace(/\{\{me\.companyName\}\}/g, user.companyName || '');
    result = result.replace(/\{\{me\.street\}\}/g, user.street || '');
    result = result.replace(/\{\{me\.city\}\}/g, user.city || '');
    result = result.replace(/\{\{me\.state\}\}/g, user.state || '');
    result = result.replace(/\{\{me\.zipCode\}\}/g, user.zipCode || '');
  }
  
  if (organization) {
    result = result.replace(/\{\{org\.name\}\}/g, organization.name || '');
    result = result.replace(/\{\{org\.website\}\}/g, organization.website || '');
    result = result.replace(/\{\{org\.email\}\}/g, organization.email || '');
    result = result.replace(/\{\{org\.phone\}\}/g, organization.phone || '');
    result = result.replace(/\{\{org\.street\}\}/g, organization.companyReturnAddress?.street || '');
    result = result.replace(/\{\{org\.city\}\}/g, organization.companyReturnAddress?.city || '');
    result = result.replace(/\{\{org\.state\}\}/g, organization.companyReturnAddress?.state || '');
    result = result.replace(/\{\{org\.zipCode\}\}/g, organization.companyReturnAddress?.zip || '');
  }
  
  return result;
}

/**
 * Resolve ALL placeholders including client - used for display/audit message
 */
function resolveAllPlaceholders(text, client, user, organization) {
  if (!text) return '';
  
  // First resolve sender/org placeholders
  let result = resolveSenderPlaceholders(text, user, organization);
  
  // Then resolve client placeholders
  if (client) {
    result = result.replace(/\{\{client\.firstName\}\}/g, client.firstName || '');
    result = result.replace(/\{\{client\.lastName\}\}/g, client.lastName || '');
    result = result.replace(/\{\{client\.fullName\}\}/g, client.fullName || '');
    result = result.replace(/\{\{client\.initials\}\}/g, 
      client.firstName && client.lastName ? `${client.firstName[0]}${client.lastName[0]}` : '');
    result = result.replace(/\{\{client\.email\}\}/g, client.email || '');
    result = result.replace(/\{\{client\.phone\}\}/g, client.phone || '');
    result = result.replace(/\{\{client\.street\}\}/g, client.street || '');
    result = result.replace(/\{\{client\.city\}\}/g, client.city || '');
    result = result.replace(/\{\{client\.state\}\}/g, client.state || '');
    result = result.replace(/\{\{client\.zipCode\}\}/g, client.zipCode || '');
    result = result.replace(/\{\{client\.company\}\}/g, client.company || '');
  }
  
  return result;
}

/**
 * Map RoofScribe client placeholders to Scribe format
 * {{client.firstName}} -> {FIRST_NAME}
 */
function mapToScribePlaceholders(text) {
  if (!text) return '';
  return text
    .replace(/\{\{client\.firstName\}\}/g, '{FIRST_NAME}')
    .replace(/\{\{client\.lastName\}\}/g, '{LAST_NAME}')
    .replace(/\{\{client\.fullName\}\}/g, '{FIRST_NAME} {LAST_NAME}')
    .replace(/\{\{client\.email\}\}/g, '{EMAIL}')
    .replace(/\{\{client\.phone\}\}/g, '{PHONE}')
    .replace(/\{\{client\.company\}\}/g, '{COMPANY_NAME}')
    .replace(/\{\{client\.street\}\}/g, '{STREET_ADDRESS}')
    .replace(/\{\{client\.address2\}\}/g, '{ADDRESS_2}')
    .replace(/\{\{client\.city\}\}/g, '{CITY}')
    .replace(/\{\{client\.state\}\}/g, '{STATE}')
    .replace(/\{\{client\.zipCode\}\}/g, '{ZIP}');
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
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { mailingBatchId } = await req.json();
    
    if (!mailingBatchId) {
      return Response.json({ error: 'mailingBatchId is required' }, { status: 400 });
    }
    
    // Load mailing batch
    const batches = await base44.entities.MailingBatch.filter({ id: mailingBatchId });
    if (!batches?.length) {
      return Response.json({ error: 'Mailing batch not found' }, { status: 404 });
    }
    
    const batch = batches[0];
    
    // Verify ownership
    if (batch.userId !== user.id && batch.organizationId !== user.orgId) {
      return Response.json({ error: 'Unauthorized to process this batch' }, { status: 403 });
    }
    
    // Validate batch data
    if (!batch.selectedClientIds?.length) {
      return Response.json({ error: 'No clients selected in batch' }, { status: 400 });
    }
    
    if (!batch.selectedCardDesignId) {
      return Response.json({ error: 'No card design selected' }, { status: 400 });
    }
    
    // ============================================================
    // CREDIT VALIDATION & CALCULATION
    // ============================================================
    
    const creditsNeeded = batch.selectedClientIds.length;
    const companyAllocatedCredits = user.companyAllocatedCredits || 0;
    const personalPurchasedCredits = user.personalPurchasedCredits || 0;
    const canAccessCompanyPool = user.canAccessCompanyPool !== false;
    
    let companyPoolCredits = 0;
    let organization = null;
    
    if (user.orgId) {
      const orgs = await base44.asServiceRole.entities.Organization.filter({ id: user.orgId });
      if (orgs?.length) {
        organization = orgs[0];
        companyPoolCredits = canAccessCompanyPool ? (organization.creditBalance || 0) : 0;
      }
    }
    
    const totalAvailable = companyAllocatedCredits + companyPoolCredits + personalPurchasedCredits;
    
    if (totalAvailable < creditsNeeded) {
      return Response.json({ 
        error: 'Insufficient credits',
        creditsNeeded,
        totalAvailable,
        breakdown: { companyAllocatedCredits, companyPoolCredits, personalPurchasedCredits, canAccessCompanyPool },
        deficit: creditsNeeded - totalAvailable
      }, { status: 402 });
    }
    
    // Calculate deduction plan (company allocated -> company pool -> personal)
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
        // Get raw message (may contain placeholders)
        const rawClientMessage = batch.contentOverrides?.[client.id] || batch.globalMessage || '';
        
        // ============================================================
        // CRITICAL FIX: Build TWO versions of the message
        // 1. rawMessageWithGreeting: Contains {{client.*}} placeholders intact
        // 2. displayMessage: All placeholders resolved (for audit/display)
        // ============================================================
        
        let rawMessageWithGreeting = '';
        
        // Add greeting if enabled (keep client placeholders intact)
        if (batch.includeGreeting && noteStyleProfile?.defaultGreeting) {
          rawMessageWithGreeting += noteStyleProfile.defaultGreeting + '\n\n';
        }
        
        // Add main message (keep client placeholders intact)
        rawMessageWithGreeting += rawClientMessage;
        
        // Add signature if enabled (keep client placeholders intact)
        let signatureText = null;
        if (batch.includeSignature && noteStyleProfile?.signatureText) {
          signatureText = noteStyleProfile.signatureText;
          rawMessageWithGreeting += '\n\n' + signatureText;
        }
        
        // BUILD SCRIBE MESSAGE: Resolve sender placeholders, then map client placeholders to Scribe format
        // This keeps {{client.firstName}} as {FIRST_NAME} for Scribe to resolve at print time
        const senderResolved = resolveSenderPlaceholders(rawMessageWithGreeting, user, organization);
        const scribeMessage = mapToScribePlaceholders(senderResolved);
        
        // BUILD DISPLAY MESSAGE: Resolve ALL placeholders for audit/display
        const displayMessage = resolveAllPlaceholders(rawMessageWithGreeting, client, user, organization);
        const resolvedSignature = signatureText ? resolveAllPlaceholders(signatureText, client, user, organization) : null;
        
        // Determine card design and return address mode
        const cardDesignId = batch.cardDesignOverrides?.[client.id] || batch.selectedCardDesignId;
        const returnMode = batch.returnAddressModeOverrides?.[client.id] || batch.returnAddressModeGlobal || 'company';
        const returnAddress = resolveReturnAddress(returnMode, user, organization);
        
        // Create Note with BOTH messages
        const note = await base44.asServiceRole.entities.Note.create({
          orgId: user.orgId,
          userId: user.id,
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
          senderUserId: user.id,
          senderName: user.full_name,
          returnAddressMode: returnMode
        });
        
        // Create Mailing
        const mailing = await base44.asServiceRole.entities.Mailing.create({
          noteId: note.id,
          orgId: user.orgId,
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
          scribeMessage  // For grouping verification
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
      
      // Company allocated first
      if (fromCompanyAllocated > 0) {
        actualFromCompanyAllocated = Math.min(fromCompanyAllocated, remainingToDeduct);
        remainingToDeduct -= actualFromCompanyAllocated;
        
        const newBalance = companyAllocatedCredits - actualFromCompanyAllocated;
        await base44.asServiceRole.entities.User.update(user.id, { companyAllocatedCredits: newBalance });
        
        await base44.asServiceRole.entities.Transaction.create({
          fromAccountType: 'organization', fromAccountId: user.orgId,
          toAccountId: user.id, toAccountType: 'user',
          orgId: user.orgId, userId: user.id,
          type: 'deduction', amount: -actualFromCompanyAllocated,
          balanceAfter: newBalance, balanceType: 'user',
          description: `Sent ${actualFromCompanyAllocated} handwritten note(s) (company-allocated)`,
          metadata: { mailingBatchId, noteCount: actualFromCompanyAllocated, source: 'company_allocated' }
        });
      }
      
      // Company pool second
      if (remainingToDeduct > 0 && fromCompanyPool > 0 && organization) {
        actualFromCompanyPool = Math.min(fromCompanyPool, remainingToDeduct);
        remainingToDeduct -= actualFromCompanyPool;
        
        const newBalance = companyPoolCredits - actualFromCompanyPool;
        await base44.asServiceRole.entities.Organization.update(organization.id, { creditBalance: newBalance });
        
        await base44.asServiceRole.entities.Transaction.create({
          fromAccountType: 'organization', fromAccountId: organization.id,
          toAccountId: user.id, toAccountType: 'user',
          orgId: user.orgId, userId: user.id,
          type: 'deduction', amount: -actualFromCompanyPool,
          balanceAfter: newBalance, balanceType: 'organization',
          description: `Sent ${actualFromCompanyPool} handwritten note(s) (company pool)`,
          metadata: { mailingBatchId, noteCount: actualFromCompanyPool, source: 'company_pool' }
        });
      }
      
      // Personal purchased last
      if (remainingToDeduct > 0 && fromPersonalPurchased > 0) {
        actualFromPersonalPurchased = Math.min(fromPersonalPurchased, remainingToDeduct);
        
        const newBalance = personalPurchasedCredits - actualFromPersonalPurchased;
        await base44.asServiceRole.entities.User.update(user.id, { personalPurchasedCredits: newBalance });
        
        await base44.asServiceRole.entities.Transaction.create({
          fromAccountType: 'user', fromAccountId: user.id,
          toAccountId: user.id, toAccountType: 'user',
          orgId: user.orgId, userId: user.id,
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
        message: 'Batch created and awaiting admin approval before sending to Scribe',
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
    
    // ============================================================
    // DIRECT SCRIBE SUBMISSION (if REQUIRE_ADMIN_APPROVAL=false)
    // Note: This path is currently not used since REQUIRE_ADMIN_APPROVAL=true
    // ============================================================
    
    // Update batch to completed (Scribe integration happens via submitBatchToScribe)
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