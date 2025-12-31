import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ============================================================
// SCRIBE API CONFIGURATION
// ============================================================
const SCRIBE_API_BASE_URL = Deno.env.get('SCRIBE_API_BASE_URL') || 'https://scribenurture.com';
const SCRIBE_API_TOKEN = Deno.env.get('SCRIBE_API_TOKEN');

// ============================================================
// ADMIN APPROVAL GATE
// When true, batches stop at pending_review and require admin approval
// ============================================================
const REQUIRE_ADMIN_APPROVAL = Deno.env.get('REQUIRE_ADMIN_APPROVAL') === 'true';

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
 * Per Scribe docs: Short Text (max 110 words/13 lines) or Long Text (max 190 words/19 lines)
 */
function determineTextType(message) {
  if (!message) return 'Short Text';
  
  const wordCount = message.trim().split(/\s+/).length;
  const lineCount = (message.match(/\n/g) || []).length + 1;
  
  // Use Long Text if exceeds Short Text limits
  if (wordCount > 110 || lineCount > 13) {
    return 'Long Text';
  }
  
  return 'Short Text';
}

/**
 * Create a draft campaign in Scribe
 * Endpoint: POST /api/create-campaign-id-v2
 */
async function createScribeDraftCampaign() {
  const url = `${SCRIBE_API_BASE_URL}/api/create-campaign-id-v2`;
  
  console.log('[Scribe] Creating draft campaign at:', url);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SCRIBE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'draft' })
  });
  
  const responseText = await response.text();
  console.log('[Scribe] Create draft response:', response.status, responseText.substring(0, 200));
  
  if (!response.ok) {
    throw new Error(`Scribe draft campaign creation failed: ${response.status} - ${responseText.substring(0, 200)}`);
  }
  
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Scribe returned non-JSON: ${responseText.substring(0, 200)}`);
  }
  
  if (!result.success || !result.data?.id) {
    throw new Error(`Scribe draft campaign creation failed: ${JSON.stringify(result)}`);
  }
  
  console.log('[Scribe] Draft campaign created:', result.data.id);
  return result.data.id;
}

/**
 * Add campaign details (message, ZIP, return address) to Scribe
 * Endpoint: POST /api/add-campaign-v2
 * Uses multipart/form-data as required by Scribe API
 */
async function addScribeCampaignDetails(campaignId, message, textType, zipBuffer, returnAddress) {
  const url = `${SCRIBE_API_BASE_URL}/api/add-campaign-v2`;
  
  console.log('[Scribe] Adding campaign details to:', url);
  console.log('[Scribe] Campaign ID:', campaignId, 'Text type:', textType, 'ZIP size:', zipBuffer?.byteLength);
  
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
    console.log('[Scribe] Return address:', JSON.stringify(scribeReturnAddress));
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SCRIBE_API_TOKEN}`
      // Note: Do NOT set Content-Type - fetch sets it automatically with boundary for FormData
    },
    body: formData
  });
  
  const responseText = await response.text();
  console.log('[Scribe] Add details response:', response.status, responseText.substring(0, 200));
  
  if (!response.ok) {
    throw new Error(`Scribe add campaign details failed: ${response.status} - ${responseText.substring(0, 200)}`);
  }
  
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Scribe returned non-JSON: ${responseText.substring(0, 200)}`);
  }
  
  if (!result.success) {
    throw new Error(`Scribe add campaign details failed: ${JSON.stringify(result)}`);
  }
  
  console.log('[Scribe] Campaign details added successfully');
  return result;
}

/**
 * Add contacts to a Scribe campaign in bulk
 * Endpoint: POST /api/add-contacts-bulk
 */
async function addScribeContacts(campaignId, contacts) {
  const url = `${SCRIBE_API_BASE_URL}/api/add-contacts-bulk`;
  
  console.log('[Scribe] Adding', contacts.length, 'contacts to campaign', campaignId);
  
  const response = await fetch(url, {
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
  
  const responseText = await response.text();
  console.log('[Scribe] Add contacts response:', response.status, responseText.substring(0, 200));
  
  if (!response.ok) {
    throw new Error(`Scribe add contacts failed: ${response.status} - ${responseText.substring(0, 200)}`);
  }
  
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Scribe returned non-JSON: ${responseText.substring(0, 200)}`);
  }
  
  if (!result.success) {
    throw new Error(`Scribe add contacts failed: ${JSON.stringify(result)}`);
  }
  
  console.log('[Scribe] Contacts added successfully');
  return result;
}

/**
 * Submit a Scribe campaign for processing
 * Endpoint: PUT /api/v1/campaign/send
 */
async function submitScribeCampaign(campaignId) {
  const url = `${SCRIBE_API_BASE_URL}/api/v1/campaign/send`;
  
  console.log('[Scribe] Submitting campaign', campaignId, 'at:', url);
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${SCRIBE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ campaign_id: campaignId })
  });
  
  const responseText = await response.text();
  console.log('[Scribe] Submit response:', response.status, responseText.substring(0, 200));
  
  if (!response.ok) {
    throw new Error(`Scribe submit failed: ${response.status} - ${responseText.substring(0, 200)}`);
  }
  
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Scribe returned non-JSON: ${responseText.substring(0, 200)}`);
  }
  
  console.log('[Scribe] Campaign submitted successfully');
  return result;
}

/**
 * Fetch ZIP file from private storage
 */
async function fetchZipFromStorage(base44, fileUri) {
  console.log('[Storage] Fetching ZIP from:', fileUri);
  
  // Get signed URL for private file
  const signedUrlResult = await base44.integrations.Core.CreateFileSignedUrl({
    file_uri: fileUri
  });
  
  // Fetch the ZIP bytes
  const response = await fetch(signedUrlResult.signed_url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ZIP: ${response.status}`);
  }
  
  const buffer = await response.arrayBuffer();
  console.log('[Storage] ZIP fetched, size:', buffer.byteLength, 'bytes');
  return buffer;
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
  // Log configuration at startup
  console.log('=== PROCESS MAILING BATCH ===');
  console.log('SCRIBE_API_BASE_URL:', SCRIBE_API_BASE_URL);
  console.log('SCRIBE_API_TOKEN set:', !!SCRIBE_API_TOKEN);
  console.log('REQUIRE_ADMIN_APPROVAL:', REQUIRE_ADMIN_APPROVAL);
  
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
          clientName: client.fullName,
          cardDesignId: cardDesignId,
          returnAddressMode: returnMode,
          scribeMessage: scribeMessage
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
    
    // ============================================================
    // ADMIN APPROVAL GATE - Stop here if approval required
    // ============================================================
    
    if (REQUIRE_ADMIN_APPROVAL) {
      console.log(`[processMailingBatch] REQUIRE_ADMIN_APPROVAL is true - stopping at pending_review`);
      
      // Calculate total credits used
      const creditsUsed = actualFromCompanyAllocated + actualFromCompanyPool + actualFromPersonalPurchased;
      
      // Update batch to pending_review status
      await base44.asServiceRole.entities.MailingBatch.update(mailingBatchId, {
        status: 'pending_review',
        processedAt: currentTimestamp,
        totalCreditsUsed: creditsUsed,
        processingErrors: errors.length > 0 ? errors.map(e => ({
          clientId: e.clientId,
          error: e.error,
          timestamp: currentTimestamp
        })) : []
      });
      
      return Response.json({
        success: true,
        status: 'pending_review',
        message: 'Batch created and awaiting admin approval before sending to Scribe',
        mailingBatchId,
        noteCount: processedMailings.length,
        creditsUsed: creditsUsed,
        creditsDeducted: {
          companyAllocated: actualFromCompanyAllocated,
          personalPurchased: actualFromPersonalPurchased,
          companyPool: actualFromCompanyPool,
          total: creditsUsed
        }
      });
    }
    
    // ============================================================
    // SCRIBE INTEGRATION - Process campaigns after credit deduction
    // (Only reached if REQUIRE_ADMIN_APPROVAL is false)
    // ============================================================
    
    const scribeCampaigns = [];
    const processingErrors = [...errors.map(e => ({
      clientId: e.clientId,
      error: e.error,
      timestamp: currentTimestamp
    }))];
    
    // Only proceed with Scribe if we have successful mailings and API token is configured
    if (processedMailings.length > 0 && SCRIBE_API_TOKEN) {
      console.log(`[processMailingBatch] Starting Scribe integration for ${processedMailings.length} mailings`);
      
      // Load card designs for ZIP URLs
      const cardDesignIds = [...new Set(processedMailings.map(m => m.cardDesignId))];
      const cardDesigns = await base44.asServiceRole.entities.CardDesign.filter({
        id: { $in: cardDesignIds }
      });
      const cardDesignMap = {};
      cardDesigns.forEach(d => { cardDesignMap[d.id] = d; });
      
      // Build client map for contact data
      const clientMap = {};
      clients.forEach(c => { clientMap[c.id] = c; });
      
      // Group mailings by (message + cardDesign + returnAddress) for Scribe campaigns
      const campaignGroups = new Map();
      
      for (const mailing of processedMailings) {
        const cardDesign = cardDesignMap[mailing.cardDesignId];
        
        // Skip if card design missing or no ZIP
        if (!cardDesign?.scribeZipUrl) {
          processingErrors.push({
            clientId: mailing.clientId,
            error: `Card design ${mailing.cardDesignId} missing scribeZipUrl - run generateCardDesignZip first`,
            timestamp: new Date().toISOString()
          });
          continue;
        }
        
        // Resolve return address for grouping key
        const returnAddress = resolveReturnAddress(mailing.returnAddressMode, user, organization);
        const groupKey = createCampaignGroupKey(mailing.scribeMessage, mailing.cardDesignId, returnAddress);
        
        if (!campaignGroups.has(groupKey)) {
          campaignGroups.set(groupKey, {
            scribeMessage: mailing.scribeMessage,
            cardDesignId: mailing.cardDesignId,
            cardDesign: cardDesign,
            returnAddress: returnAddress,
            returnAddressMode: mailing.returnAddressMode,
            textType: determineTextType(mailing.scribeMessage),
            recipients: []
          });
        }
        
        campaignGroups.get(groupKey).recipients.push({
          clientId: mailing.clientId,
          noteId: mailing.noteId,
          mailingId: mailing.mailingId,
          client: clientMap[mailing.clientId]
        });
      }
      
      console.log(`[processMailingBatch] Created ${campaignGroups.size} campaign groups`);
      
      // Process each campaign group
      for (const [groupKey, group] of campaignGroups) {
        let scribeCampaignId = null;
        
        try {
          console.log(`[processMailingBatch] Processing group with ${group.recipients.length} recipients`);
          
          // 1. Create draft campaign
          scribeCampaignId = await createScribeDraftCampaign();
          console.log(`[processMailingBatch] Created draft campaign: ${scribeCampaignId}`);
          
          // 2. Fetch ZIP from storage
          const zipBuffer = await fetchZipFromStorage(base44, group.cardDesign.scribeZipUrl);
          console.log(`[processMailingBatch] Fetched ZIP, size: ${zipBuffer.byteLength} bytes`);
          
          // 3. Add campaign details with ZIP
          await addScribeCampaignDetails(
            scribeCampaignId,
            group.scribeMessage,
            group.textType,
            zipBuffer,
            group.returnAddress
          );
          console.log(`[processMailingBatch] Added campaign details`);
          
          // 4. Build contacts array
          const contacts = group.recipients.map(r => ({
            first_name: r.client.firstName || '',
            last_name: r.client.lastName || '',
            street: r.client.street || '',
            address2: r.client.address2 || '',
            city: r.client.city || '',
            state: r.client.state || '',
            zip: r.client.zipCode || '',
            email: r.client.email || '',
            phone: r.client.phone || '',
            company_name: r.client.company || ''
          }));
          
          // 5. Add contacts
          await addScribeContacts(scribeCampaignId, contacts);
          console.log(`[processMailingBatch] Added ${contacts.length} contacts`);
          
          // 6. Submit campaign
          await submitScribeCampaign(scribeCampaignId);
          console.log(`[processMailingBatch] Submitted campaign`);
          
          // 7. Update Notes with scribeCampaignId
          for (const recipient of group.recipients) {
            await base44.asServiceRole.entities.Note.update(recipient.noteId, {
              scribeCampaignId: String(scribeCampaignId),
              status: 'pending_print'
            });
            
            await base44.asServiceRole.entities.Mailing.update(recipient.mailingId, {
              scribeCampaignId: String(scribeCampaignId)
            });
          }
          
          // 8. Record successful campaign
          scribeCampaigns.push({
            scribeCampaignId: String(scribeCampaignId),
            campaignGroupKey: groupKey.substring(0, 100), // Truncate for storage
            cardDesignId: group.cardDesignId,
            returnAddressMode: group.returnAddressMode,
            clientIds: group.recipients.map(r => r.clientId),
            contactCount: group.recipients.length,
            status: 'submitted',
            scribeStatus: 'pending',
            submittedAt: new Date().toISOString()
          });
          
          console.log(`[processMailingBatch] Campaign ${scribeCampaignId} submitted successfully`);
          
        } catch (scribeError) {
          console.error(`[processMailingBatch] Scribe error for group:`, scribeError);
          
          // Record failed campaign
          scribeCampaigns.push({
            scribeCampaignId: scribeCampaignId ? String(scribeCampaignId) : null,
            campaignGroupKey: groupKey.substring(0, 100),
            cardDesignId: group.cardDesignId,
            returnAddressMode: group.returnAddressMode,
            clientIds: group.recipients.map(r => r.clientId),
            contactCount: group.recipients.length,
            status: 'failed',
            errorMessage: scribeError.message,
            submittedAt: new Date().toISOString()
          });
          
          // Add per-client errors
          for (const recipient of group.recipients) {
            processingErrors.push({
              clientId: recipient.clientId,
              error: `Scribe API error: ${scribeError.message}`,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    } else if (!SCRIBE_API_TOKEN) {
      console.log(`[processMailingBatch] Skipping Scribe integration - SCRIBE_API_TOKEN not configured`);
    }
    
    // Determine final batch status
    const successfulCampaigns = scribeCampaigns.filter(c => c.status === 'submitted').length;
    const failedCampaigns = scribeCampaigns.filter(c => c.status === 'failed').length;
    
    let finalStatus = 'completed';
    if (scribeCampaigns.length > 0) {
      if (failedCampaigns === scribeCampaigns.length) {
        finalStatus = 'failed';
      } else if (failedCampaigns > 0) {
        finalStatus = 'partial';
      }
    }
    
    // 9. Update batch status with Scribe tracking data
    await base44.asServiceRole.entities.MailingBatch.update(mailingBatchId, {
      status: finalStatus,
      scribeCampaigns: scribeCampaigns,
      processedAt: currentTimestamp,
      totalCreditsUsed: successfulSends,
      processingErrors: processingErrors
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
      },
      scribe: {
        campaignsCreated: scribeCampaigns.length,
        campaignsSubmitted: successfulCampaigns,
        campaignsFailed: failedCampaigns,
        campaigns: scribeCampaigns
      },
      batchStatus: finalStatus
    };
    
    // Include errors if any occurred
    if (processingErrors.length > 0) {
      response.errors = processingErrors;
      response.partialSuccess = failedCampaigns > 0;
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