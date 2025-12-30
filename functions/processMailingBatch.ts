import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ============================================================
// SCRIBE API CONFIGURATION
// ============================================================
const SCRIBE_API_BASE_URL = Deno.env.get('SCRIBE_API_BASE_URL') || 'https://api.scribenurture.com';
const SCRIBE_API_TOKEN = Deno.env.get('SCRIBE_API_TOKEN');

// ============================================================
// SCRIBE HELPER FUNCTIONS
// ============================================================

/**
 * Resolve sender placeholders ({{me.*}}, {{org.*}}) but leave client placeholders
 * for Scribe to handle at print time
 */
function resolveSenderPlaceholders(text, user, organization) {
  if (!text) return '';
  let result = text;
  
  // User/Me placeholders
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
  
  // Organization placeholders
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
 * Map our placeholders to Scribe's format
 * Our format: {{client.firstName}} -> Scribe format: {FIRST_NAME}
 */
function mapToScribePlaceholders(text) {
  if (!text) return '';
  return text
    .replace(/\{\{client\.firstName\}\}/g, '{FIRST_NAME}')
    .replace(/\{\{client\.lastName\}\}/g, '{LAST_NAME}')
    .replace(/\{\{client\.fullName\}\}/g, '{FIRST_NAME} {LAST_NAME}')
    .replace(/\{\{client\.company\}\}/g, '{COMPANY_NAME}')
    .replace(/\{\{client\.street\}\}/g, '{STREET}')
    .replace(/\{\{client\.city\}\}/g, '{CITY}')
    .replace(/\{\{client\.state\}\}/g, '{STATE}')
    .replace(/\{\{client\.zipCode\}\}/g, '{ZIP}');
}

/**
 * Resolve return address based on mode
 */
function resolveReturnAddress(mode, user, organization) {
  if (mode === 'none') return null;
  
  if (mode === 'company' && organization?.companyReturnAddress) {
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

/**
 * Create a unique key for grouping campaigns
 */
function createCampaignGroupKey(message, cardDesignId, returnAddress) {
  const returnKey = returnAddress 
    ? `${returnAddress.name}|${returnAddress.street}|${returnAddress.city}|${returnAddress.state}|${returnAddress.zip}`
    : 'none';
  return `${message}::${cardDesignId}::${returnKey}`;
}

/**
 * Determine text type based on message content
 */
function determineTextType(message) {
  if (!message) return 'standard';
  const lineCount = (message.match(/\n/g) || []).length + 1;
  const charCount = message.length;
  // Use 'small' for shorter messages, 'standard' for longer
  if (lineCount <= 8 && charCount < 400) return 'small';
  return 'standard';
}

/**
 * Create a draft campaign in Scribe
 */
async function createScribeDraftCampaign() {
  const response = await fetch(`${SCRIBE_API_BASE_URL}/api/v1/campaign/draft`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SCRIBE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Scribe draft campaign creation failed: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  if (!result.campaign_id) {
    throw new Error(`Scribe draft campaign creation failed: no campaign_id returned`);
  }
  
  return result.campaign_id;
}

/**
 * Add campaign details (message, ZIP, return address) to Scribe
 * Uses multipart/form-data as required by Scribe API
 */
async function addScribeCampaignDetails(campaignId, message, textType, zipBuffer, returnAddress) {
  const formData = new FormData();
  
  formData.append('campaign_id', String(campaignId));
  formData.append('message', message);
  formData.append('text_type', textType);
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  
  if (returnAddress) {
    // Scribe expects: { firstName, lastName, street, city, state, zip }
    // For company addresses, put company name in firstName
    const scribeReturnAddress = {
      firstName: returnAddress.name || '',
      lastName: '',
      street: returnAddress.street || '',
      city: returnAddress.city || '',
      state: returnAddress.state || '',
      zip: returnAddress.zip || ''
    };
    formData.append('return_address', JSON.stringify(scribeReturnAddress));
  }
  
  const response = await fetch(`${SCRIBE_API_BASE_URL}/api/add-campaign-v2`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SCRIBE_API_TOKEN}`
      // Note: Do NOT set Content-Type - fetch sets it automatically with boundary for FormData
    },
    body: formData
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Scribe add campaign details failed: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(`Scribe add campaign details failed: ${JSON.stringify(result)}`);
  }
  
  return result;
}

/**
 * Add contacts to a Scribe campaign in bulk
 */
async function addScribeContacts(campaignId, contacts) {
  const response = await fetch(`${SCRIBE_API_BASE_URL}/api/add-contacts-bulk`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SCRIBE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      campaign_id: campaignId,
      contacts: contacts
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Scribe add contacts failed: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(`Scribe add contacts failed: ${JSON.stringify(result)}`);
  }
  
  return result;
}

/**
 * Submit a Scribe campaign for processing
 */
async function submitScribeCampaign(campaignId) {
  const response = await fetch(`${SCRIBE_API_BASE_URL}/api/v1/campaign/send`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${SCRIBE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ campaign_id: campaignId })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Scribe submit failed: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
}

/**
 * Fetch ZIP file from private storage
 */
async function fetchZipFromStorage(base44, fileUri) {
  // Get signed URL for private file
  const signedUrlResult = await base44.integrations.Core.CreateFileSignedUrl({
    file_uri: fileUri
  });
  
  // Fetch the ZIP bytes
  const response = await fetch(signedUrlResult.signed_url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ZIP: ${response.status}`);
  }
  
  return await response.arrayBuffer();
}

// ============================================================
// ORIGINAL HELPER FUNCTIONS
// ============================================================

// Helper function to replace placeholders in text
function replacePlaceholders(text, client, user, organization) {
  if (!text) return '';
  
  let result = text;
  
  // Client placeholders
  if (client) {
    result = result.replace(/\{\{client\.firstName\}\}/g, client.firstName || '');
    result = result.replace(/\{\{client\.lastName\}\}/g, client.lastName || '');
    result = result.replace(/\{\{client\.fullName\}\}/g, client.fullName || '');
    result = result.replace(/\{\{client\.initials\}\}/g, 
      client.firstName && client.lastName 
        ? `${client.firstName[0]}${client.lastName[0]}` 
        : ''
    );
    result = result.replace(/\{\{client\.email\}\}/g, client.email || '');
    result = result.replace(/\{\{client\.phone\}\}/g, client.phone || '');
    result = result.replace(/\{\{client\.street\}\}/g, client.street || '');
    result = result.replace(/\{\{client\.city\}\}/g, client.city || '');
    result = result.replace(/\{\{client\.state\}\}/g, client.state || '');
    result = result.replace(/\{\{client\.zipCode\}\}/g, client.zipCode || '');
    result = result.replace(/\{\{client\.company\}\}/g, client.company || '');
  }
  
  // User/Me placeholders
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
  
  // Organization placeholders
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    const { mailingBatchId } = body;
    
    // Validate input
    if (!mailingBatchId) {
      return Response.json(
        { error: 'mailingBatchId is required' },
        { status: 400 }
      );
    }
    
    // Load mailing batch
    const batches = await base44.entities.MailingBatch.filter({ id: mailingBatchId });
    if (!batches || batches.length === 0) {
      return Response.json(
        { error: 'Mailing batch not found' },
        { status: 404 }
      );
    }
    
    const batch = batches[0];
    
    // Verify ownership
    if (batch.userId !== user.id && batch.organizationId !== user.orgId) {
      return Response.json(
        { error: 'Unauthorized to process this batch' },
        { status: 403 }
      );
    }
    
    // Validate batch has required data
    if (!batch.selectedClientIds || batch.selectedClientIds.length === 0) {
      return Response.json(
        { error: 'No clients selected in batch' },
        { status: 400 }
      );
    }
    
    if (!batch.selectedCardDesignId) {
      return Response.json(
        { error: 'No card design selected' },
        { status: 400 }
      );
    }
    
    // Calculate total credits needed
    const creditsNeeded = batch.selectedClientIds.length;
    
    // Get user's credit balances with new granular tracking
    const companyAllocatedCredits = user.companyAllocatedCredits || 0;
    const personalPurchasedCredits = user.personalPurchasedCredits || 0;
    const canAccessCompanyPool = user.canAccessCompanyPool !== false; // Default to true if not set
    
    let companyPoolCredits = 0;
    let organization = null;
    
    if (user.orgId) {
      const orgs = await base44.asServiceRole.entities.Organization.filter({ 
        id: user.orgId 
      });
      
      if (orgs && orgs.length > 0) {
        organization = orgs[0];
        companyPoolCredits = canAccessCompanyPool ? (organization.creditBalance || 0) : 0;
      }
    }
    
    const totalAvailable = companyAllocatedCredits + companyPoolCredits + personalPurchasedCredits;
    
    // Verify user has enough credits
    if (totalAvailable < creditsNeeded) {
      return Response.json(
        { 
          error: 'Insufficient credits',
          creditsNeeded: creditsNeeded,
          totalAvailable: totalAvailable,
          breakdown: {
            companyAllocatedCredits: companyAllocatedCredits,
            companyPoolCredits: companyPoolCredits,
            personalPurchasedCredits: personalPurchasedCredits,
            canAccessCompanyPool: canAccessCompanyPool
          },
          deficit: creditsNeeded - totalAvailable
        },
        { status: 402 }
      );
    }
    
    // CORRECTED Calculate credit deduction plan following hierarchy:
    // 1. Company-allocated credits FIRST
    // 2. Company pool credits SECOND (if accessible)
    // 3. Personal purchased credits LAST
    let remaining = creditsNeeded;
    let fromCompanyAllocated = 0;
    let fromCompanyPool = 0;
    let fromPersonalPurchased = 0;
    
    // Step 1: Use company-allocated credits FIRST
    if (companyAllocatedCredits > 0) {
      fromCompanyAllocated = Math.min(companyAllocatedCredits, remaining);
      remaining -= fromCompanyAllocated;
    }
    
    // Step 2: Use company pool SECOND (if accessible)
    if (remaining > 0 && companyPoolCredits > 0 && canAccessCompanyPool) {
      fromCompanyPool = Math.min(companyPoolCredits, remaining);
      remaining -= fromCompanyPool;
    }
    
    // Step 3: Use personal purchased credits LAST
    if (remaining > 0 && personalPurchasedCredits > 0) {
      fromPersonalPurchased = Math.min(personalPurchasedCredits, remaining);
      remaining -= fromPersonalPurchased;
    }
    
    // Load necessary data
    const [clients, noteStyleProfile] = await Promise.all([
      base44.asServiceRole.entities.Client.filter({ 
        id: { $in: batch.selectedClientIds } 
      }),
      batch.selectedNoteStyleProfileId 
        ? base44.asServiceRole.entities.NoteStyleProfile.filter({ 
            id: batch.selectedNoteStyleProfileId 
          }).then(profiles => profiles.length > 0 ? profiles[0] : null)
        : Promise.resolve(null)
    ]);
    
    // Verify all clients were found
    if (clients.length !== batch.selectedClientIds.length) {
      return Response.json(
        { error: 'Some clients could not be found' },
        { status: 400 }
      );
    }
    
    // Process each client and create Note + Mailing records
    const processedMailings = [];
    const errors = [];
    const currentTimestamp = new Date().toISOString();
    
    for (const client of clients) {
      try {
        // 1. Determine final message for this client
        const clientMessage = batch.contentOverrides?.[client.id] || batch.globalMessage || '';
        
        // 2. Compose full message with greeting and signature
        let fullMessage = '';
        
        // Add greeting if enabled
        if (batch.includeGreeting && noteStyleProfile?.defaultGreeting) {
          const greeting = replacePlaceholders(
            noteStyleProfile.defaultGreeting, 
            client, 
            user, 
            organization
          );
          if (greeting) {
            fullMessage += greeting + '\n\n';
          }
        }
        
        // Add main message
        const processedMessage = replacePlaceholders(clientMessage, client, user, organization);
        fullMessage += processedMessage;
        
        // Add signature if enabled
        let signatureText = null;
        if (batch.includeSignature && noteStyleProfile?.signatureText) {
          signatureText = replacePlaceholders(
            noteStyleProfile.signatureText, 
            client, 
            user, 
            organization
          );
          if (signatureText) {
            fullMessage += '\n\n' + signatureText;
          }
        }
        
        // 3. Determine card design for this client
        const cardDesignId = batch.cardDesignOverrides?.[client.id] || batch.selectedCardDesignId;
        
        // 4. Determine return address mode for this client
        const returnMode = batch.returnAddressModeOverrides?.[client.id] 
          || batch.returnAddressModeGlobal 
          || 'company';
        
        // 4a. Generate Scribe-formatted message (sender placeholders resolved, client placeholders mapped)
        const messageWithSenderResolved = resolveSenderPlaceholders(fullMessage, user, organization);
        const scribeMessage = mapToScribePlaceholders(messageWithSenderResolved);
        
        // 4b. Create Note entity with Scribe tracking fields
        const note = await base44.asServiceRole.entities.Note.create({
          orgId: user.orgId,
          userId: user.id,
          clientId: client.id,
          mailingBatchId: mailingBatchId,
          cardDesignId: cardDesignId,
          noteStyleProfileId: batch.selectedNoteStyleProfileId || null,
          message: fullMessage,
          messageTemplate: scribeMessage,
          signature: signatureText,
          status: 'queued_for_sending',
          sentDate: currentTimestamp,
          creditCost: 1,
          recipientName: client.fullName,
          senderUserId: user.id,
          senderName: user.full_name,
          returnAddressMode: returnMode
        });
        
        // 5. Resolve return address
        const returnAddress = resolveReturnAddress(returnMode, user, organization);
        
        // 6. Create Mailing entity with batch tracking
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
        
        // 7. Update Client tracking fields
        const currentTotalNotes = (client.totalNotesSent || 0) + 1;
        
        await base44.asServiceRole.entities.Client.update(client.id, {
          lastNoteSentDate: currentTimestamp,
          totalNotesSent: currentTotalNotes
        });
        
        processedMailings.push({
          noteId: note.id,
          mailingId: mailing.id,
          clientId: client.id,
          clientName: client.fullName
        });
        
      } catch (clientError) {
        console.error(`Error processing client ${client.id}:`, clientError);
        errors.push({
          clientId: client.id,
          clientName: client.fullName,
          error: clientError.message
        });
      }
    }
    
    // 8. Deduct credits following the CORRECTED hierarchy and create transaction records
    const successfulSends = processedMailings.length;
    let actualFromCompanyAllocated = 0;
    let actualFromCompanyPool = 0;
    let actualFromPersonalPurchased = 0;
    
    if (successfulSends > 0) {
      // Recalculate deductions based on successful sends
      let remainingToDeduct = successfulSends;
      
      // Step 1: Deduct from company-allocated credits FIRST
      if (fromCompanyAllocated > 0) {
        actualFromCompanyAllocated = Math.min(fromCompanyAllocated, remainingToDeduct);
        remainingToDeduct -= actualFromCompanyAllocated;
        
        const newCompanyAllocatedBalance = companyAllocatedCredits - actualFromCompanyAllocated;
        
        await base44.asServiceRole.entities.User.update(user.id, {
          companyAllocatedCredits: newCompanyAllocatedBalance
        });
        
        // Create transaction record
        await base44.asServiceRole.entities.Transaction.create({
          fromAccountType: 'organization',
          fromAccountId: user.orgId,
          toAccountId: user.id,
          toAccountType: 'user',
          orgId: user.orgId,
          userId: user.id,
          type: 'deduction',
          amount: -actualFromCompanyAllocated,
          balanceAfter: newCompanyAllocatedBalance,
          balanceType: 'user',
          description: `Sent ${actualFromCompanyAllocated} handwritten ${actualFromCompanyAllocated === 1 ? 'note' : 'notes'} (company-allocated credits)`,
          metadata: {
            mailingBatchId: mailingBatchId,
            noteCount: actualFromCompanyAllocated,
            source: 'company_allocated',
            creditType: 'companyAllocatedCredits'
          }
        });
      }
      
      // Step 2: Deduct from company pool SECOND (if accessible)
      if (remainingToDeduct > 0 && fromCompanyPool > 0 && organization && canAccessCompanyPool) {
        actualFromCompanyPool = Math.min(fromCompanyPool, remainingToDeduct);
        remainingToDeduct -= actualFromCompanyPool;
        
        const newCompanyPoolBalance = companyPoolCredits - actualFromCompanyPool;
        
        await base44.asServiceRole.entities.Organization.update(organization.id, {
          creditBalance: newCompanyPoolBalance
        });
        
        // Create transaction record for organization
        await base44.asServiceRole.entities.Transaction.create({
          fromAccountType: 'organization',
          fromAccountId: organization.id,
          toAccountId: user.id,
          toAccountType: 'user',
          orgId: user.orgId,
          userId: user.id,
          type: 'deduction',
          amount: -actualFromCompanyPool,
          balanceAfter: newCompanyPoolBalance,
          balanceType: 'organization',
          description: `Sent ${actualFromCompanyPool} handwritten ${actualFromCompanyPool === 1 ? 'note' : 'notes'} (company pool credits)`,
          metadata: {
            mailingBatchId: mailingBatchId,
            noteCount: actualFromCompanyPool,
            source: 'company_pool'
          }
        });
      }
      
      // Step 3: Deduct from personal purchased credits LAST
      if (remainingToDeduct > 0 && fromPersonalPurchased > 0) {
        actualFromPersonalPurchased = Math.min(fromPersonalPurchased, remainingToDeduct);
        remainingToDeduct -= actualFromPersonalPurchased;
        
        const newPersonalPurchasedBalance = personalPurchasedCredits - actualFromPersonalPurchased;
        
        await base44.asServiceRole.entities.User.update(user.id, {
          personalPurchasedCredits: newPersonalPurchasedBalance
        });
        
        // Create transaction record
        await base44.asServiceRole.entities.Transaction.create({
          fromAccountType: 'user',
          fromAccountId: user.id,
          toAccountId: user.id,
          toAccountType: 'user',
          orgId: user.orgId,
          userId: user.id,
          type: 'deduction',
          amount: -actualFromPersonalPurchased,
          balanceAfter: newPersonalPurchasedBalance,
          balanceType: 'user',
          description: `Sent ${actualFromPersonalPurchased} handwritten ${actualFromPersonalPurchased === 1 ? 'note' : 'notes'} (personal purchased credits)`,
          metadata: {
            mailingBatchId: mailingBatchId,
            noteCount: actualFromPersonalPurchased,
            source: 'personal_purchased',
            creditType: 'personalPurchasedCredits'
          }
        });
      }
    }
    
    // 9. Update batch status
    await base44.asServiceRole.entities.MailingBatch.update(mailingBatchId, {
      status: 'completed'
    });
    
    // Return success response
    const response = {
      success: true,
      processedCount: processedMailings.length,
      totalClients: clients.length,
      mailings: processedMailings,
      creditsDeducted: {
        companyAllocated: actualFromCompanyAllocated,
        personalPurchased: actualFromPersonalPurchased,
        companyPool: actualFromCompanyPool,
        total: successfulSends
      }
    };
    
    // Include errors if any occurred
    if (errors.length > 0) {
      response.errors = errors;
      response.partialSuccess = true;
    }
    
    return Response.json(response);
    
  } catch (error) {
    console.error('Error in processMailingBatch:', error);
    return Response.json(
      { 
        error: error.message || 'Failed to process mailing batch',
        details: error.stack
      },
      { status: 500 }
    );
  }
});