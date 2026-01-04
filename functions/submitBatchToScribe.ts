import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ============================================================
// SUBMIT BATCH TO SCRIBE - CORRECTED VERSION
// ============================================================
// 
// KEY FIXES FROM TESTING:
// 1. REMOVED create-campaign-id-v2 - it creates orphan drafts that add-campaign-v2 ignores
// 2. Use add-campaign-v2 directly - creates campaign with message/design in one call
// 3. Use ARRAY NOTATION for return_address - NOT JSON.stringify (causes 500 error)
//
// CORRECT WORKFLOW:
// 1. POST /api/add-campaign-v2 → Creates campaign with message/design, returns campaign_id
// 2. POST /api/add-contacts-bulk → Adds contacts to that campaign_id
// 3. PUT /api/v1/campaign/send → Submits campaign
//
// ============================================================

const SCRIBE_API_BASE_URL = Deno.env.get('SCRIBE_API_BASE_URL') || 'https://staging.scribenurture.com';
const SCRIBE_API_TOKEN = Deno.env.get('SCRIBE_API_TOKEN');

// ============================================================
// PLACEHOLDER RESOLUTION
// ============================================================

/**
 * Resolve ALL sender/user/organization placeholders
 * Supports: {{me.*}}, {{user.*}}, {{rep_*}}, {{org.*}}
 */
function resolveSenderPlaceholders(text, user, organization) {
  if (!text) return '';
  let result = text;
  
  if (user) {
    const firstName = user.firstName || user.full_name?.split(' ')[0] || '';
    const lastName = user.lastName || user.full_name?.split(' ').slice(1).join(' ') || '';
    const fullName = user.full_name || `${firstName} ${lastName}`.trim() || '';
    
    // {{me.*}} format
    result = result.replace(/\{\{me\.fullName\}\}/g, fullName);
    result = result.replace(/\{\{me\.firstName\}\}/g, firstName);
    result = result.replace(/\{\{me\.lastName\}\}/g, lastName);
    result = result.replace(/\{\{me\.email\}\}/g, user.email || '');
    result = result.replace(/\{\{me\.phone\}\}/g, user.phone || '');
    result = result.replace(/\{\{me\.companyName\}\}/g, user.companyName || '');
    
    // {{user.*}} format (from signatures)
    result = result.replace(/\{\{user\.fullName\}\}/g, fullName);
    result = result.replace(/\{\{user\.firstName\}\}/g, firstName);
    result = result.replace(/\{\{user\.lastName\}\}/g, lastName);
    result = result.replace(/\{\{user\.email\}\}/g, user.email || '');
    result = result.replace(/\{\{user\.phone\}\}/g, user.phone || '');
    result = result.replace(/\{\{user\.companyName\}\}/g, user.companyName || '');
    
    // Legacy {{rep_*}} format
    result = result.replace(/\{\{rep_full_name\}\}/g, fullName);
    result = result.replace(/\{\{rep_first_name\}\}/g, firstName);
    result = result.replace(/\{\{rep_last_name\}\}/g, lastName);
    result = result.replace(/\{\{rep_company_name\}\}/g, user.companyName || '');
    result = result.replace(/\{\{rep_phone\}\}/g, user.phone || '');
    result = result.replace(/\{\{rep_email\}\}/g, user.email || '');
  }
  
  if (organization) {
    result = result.replace(/\{\{org\.name\}\}/g, organization.name || '');
    result = result.replace(/\{\{org\.phone\}\}/g, organization.phone || '');
  }
  
  return result;
}

/**
 * Map client placeholders to Scribe format
 * Converts {{client.*}} and {{firstName}} to {FIRST_NAME} etc.
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
    .replace(/\{\{phone\}\}/g, '{PHONE}');
}

/**
 * Create a hash key for grouping notes by message+design+returnAddress
 */
function createCampaignGroupKey(scribeMessage, cardDesignId, returnAddressMode) {
  const keyString = `${scribeMessage}|||${cardDesignId}|||${returnAddressMode || 'none'}`;
  let hash = 0;
  for (let i = 0; i < keyString.length; i++) {
    hash = ((hash << 5) - hash) + keyString.charCodeAt(i);
    hash = hash & hash;
  }
  return `grp_${Math.abs(hash).toString(36)}`;
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
 * Build return address object from user/organization based on mode
 * 
 * For Scribe API:
 *   - firstName: company name (for company mode) or user's return address name (for rep mode)
 *   - lastName: empty string
 *   - street, city, state, zip: from respective source
 * 
 * Note: organization.companyReturnAddress uses 'companyName' field (not 'name')
 */
function buildReturnAddress(mode, user, organization) {
  if (mode === 'none' || !mode) {
    return null;
  }
  
  if (mode === 'company') {
    const addr = organization?.companyReturnAddress;
    if (!addr) {
      console.warn('[Return Address] Company mode but no companyReturnAddress on organization');
      return null;
    }
    
    return {
      // companyName is the correct field (not 'name')
      firstName: addr.companyName || organization?.name || '',
      lastName: '',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.zip || ''
    };
  }
  
  if (mode === 'rep') {
    if (!user) {
      console.warn('[Return Address] Rep mode but no user provided');
      return null;
    }
    
    return {
      // returnAddressName is preferred, fallback to full_name
      firstName: user.returnAddressName || user.full_name || '',
      lastName: '',
      street: user.street || '',
      city: user.city || '',
      state: user.state || '',
      zip: user.zipCode || ''
    };
  }
  
  console.warn(`[Return Address] Unknown mode: ${mode}`);
  return null;
}

// ============================================================
// SCRIBE API FUNCTIONS
// ============================================================

/**
 * Create campaign with add-campaign-v2 (NOT create-campaign-id-v2)
 * This creates the campaign with message/design in ONE call
 * 
 * IMPORTANT: return_address must use ARRAY NOTATION, not JSON.stringify
 */
async function createCampaignWithDetails(message, textType, zipBuffer, returnAddress = null) {
  const url = `${SCRIBE_API_BASE_URL}/api/add-campaign-v2`;
  
  console.log('[Scribe] Creating campaign at:', url);
  console.log('[Scribe] Message preview:', message?.substring(0, 100));
  console.log('[Scribe] Text type:', textType);
  console.log('[Scribe] ZIP size:', zipBuffer?.byteLength, 'bytes');
  
  const formData = new FormData();
  formData.append('message', message);
  formData.append('text_type', textType);
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  
  // CRITICAL: Use ARRAY NOTATION for return_address, NOT JSON.stringify
  // JSON.stringify causes PHP 500 error: "Cannot access offset of type string on string"
  if (returnAddress) {
    formData.append('return_address[firstName]', returnAddress.firstName || '');
    formData.append('return_address[lastName]', returnAddress.lastName || '');
    formData.append('return_address[street]', returnAddress.street || '');
    formData.append('return_address[city]', returnAddress.city || '');
    formData.append('return_address[state]', returnAddress.state || '');
    formData.append('return_address[zip]', returnAddress.zip || '');
    console.log('[Scribe] Return address (array notation):', returnAddress.firstName, '-', returnAddress.city, returnAddress.state);
  } else {
    console.log('[Scribe] No return_address');
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SCRIBE_API_TOKEN}` },
    body: formData
  });
  
  const responseText = await response.text();
  console.log('[Scribe] Create campaign response:', response.status, responseText.substring(0, 300));
  
  if (!response.ok) {
    throw new Error(`Scribe create campaign failed: ${response.status} - ${responseText}`);
  }
  
  const result = JSON.parse(responseText);
  if (!result.success) {
    throw new Error(`Scribe create campaign unsuccessful: ${JSON.stringify(result)}`);
  }
  
  const campaignId = result.data?.campaign_id || result.data?.id;
  if (!campaignId) {
    throw new Error(`No campaign_id in response: ${JSON.stringify(result)}`);
  }
  
  console.log('[Scribe] Campaign created:', campaignId);
  return campaignId;
}

/**
 * Add contacts to a campaign
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
    body: JSON.stringify({ campaign_id: campaignId, contacts })
  });
  
  const responseText = await response.text();
  console.log('[Scribe] Add contacts response:', response.status, responseText.substring(0, 300));
  
  if (!response.ok) {
    throw new Error(`Scribe add contacts failed: ${response.status} - ${responseText}`);
  }
  
  const result = JSON.parse(responseText);
  if (!result.success) {
    throw new Error(`Scribe add contacts unsuccessful: ${JSON.stringify(result)}`);
  }
  
  return result;
}

/**
 * Submit campaign for processing
 */
async function submitScribeCampaign(campaignId) {
  const url = `${SCRIBE_API_BASE_URL}/api/v1/campaign/send`;
  
  console.log('[Scribe] Submitting campaign', campaignId);
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${SCRIBE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ campaign_id: campaignId })
  });
  
  const responseText = await response.text();
  console.log('[Scribe] Submit response:', response.status, responseText.substring(0, 300));
  
  // 402 = insufficient funds (can happen on staging)
  if (response.status === 402) {
    console.log('[Scribe] ⚠️ 402 Insufficient funds - campaign created but not submitted');
    return { success: true, status: 'needs_credits', campaignId };
  }
  
  if (!response.ok) {
    throw new Error(`Scribe submit failed: ${response.status} - ${responseText}`);
  }
  
  return JSON.parse(responseText);
}

/**
 * Fetch ZIP file from Base44 storage
 */
async function fetchZipFromStorage(base44, fileUri) {
  console.log('[Storage] Fetching ZIP from:', fileUri);
  const signedUrlResult = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri });
  const response = await fetch(signedUrlResult.signed_url);
  if (!response.ok) throw new Error(`Failed to fetch ZIP: ${response.status}`);
  const buffer = await response.arrayBuffer();
  console.log('[Storage] ZIP fetched:', buffer.byteLength, 'bytes');
  return buffer;
}

// ============================================================
// MAIN HANDLER
// ============================================================

Deno.serve(async (req) => {
  console.log('===========================================');
  console.log('=== SUBMIT BATCH TO SCRIBE (CORRECTED) ===');
  console.log('===========================================');
  console.log('SCRIBE_API_BASE_URL:', SCRIBE_API_BASE_URL);
  console.log('SCRIBE_API_TOKEN set:', !!SCRIBE_API_TOKEN);
  
  try {
    const base44 = createClientFromRequest(req);
    const { mailingBatchId } = await req.json();
    
    if (!mailingBatchId) {
      return Response.json({ success: false, error: 'mailingBatchId is required' }, { status: 400 });
    }
    
    if (!SCRIBE_API_TOKEN) {
      return Response.json({ success: false, error: 'SCRIBE_API_TOKEN not configured' }, { status: 500 });
    }
    
    // Verify admin user
    const adminUser = await base44.auth.me();
    if (!adminUser) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log(`Admin ${adminUser.email} approving batch ${mailingBatchId}`);
    
    // Load batch
    const batchList = await base44.entities.MailingBatch.filter({ id: mailingBatchId });
    if (!batchList?.length) {
      return Response.json({ success: false, error: 'Batch not found' }, { status: 404 });
    }
    
    const batch = batchList[0];
    console.log('Batch status:', batch.status);
    
    // Verify batch is ready for submission
    if (batch.status !== 'pending_review' && batch.status !== 'ready_to_send') {
      return Response.json({ 
        success: false, 
        error: `Batch status is "${batch.status}", expected "pending_review" or "ready_to_send"` 
      }, { status: 400 });
    }
    
    // Update status to sending
    await base44.entities.MailingBatch.update(mailingBatchId, { status: 'sending' });
    
    // Load sender user and organization
    let senderUser = null, organization = null;
    if (batch.userId) {
      const userList = await base44.entities.User.filter({ id: batch.userId });
      if (userList?.length) senderUser = userList[0];
    }
    if (batch.organizationId) {
      const orgList = await base44.entities.Organization.filter({ id: batch.organizationId });
      if (orgList?.length) organization = orgList[0];
    }
    
    // Load notes for this batch
    const notes = await base44.entities.Note.filter({ mailingBatchId });
    if (!notes?.length) {
      await base44.entities.MailingBatch.update(mailingBatchId, { status: 'failed' });
      return Response.json({ success: false, error: 'No notes found for this batch' }, { status: 400 });
    }
    
    console.log(`Processing ${notes.length} notes`);
    
    // Load related data
    const clientIds = [...new Set(notes.map(n => n.clientId).filter(Boolean))];
    const clientList = clientIds.length ? await base44.entities.Client.filter({ id: { $in: clientIds } }) : [];
    const clientMap = Object.fromEntries(clientList.map(c => [c.id, c]));
    
    const designIds = [...new Set(notes.map(n => n.cardDesignId).filter(Boolean))];
    const designList = designIds.length ? await base44.entities.CardDesign.filter({ id: { $in: designIds } }) : [];
    const cardDesignMap = Object.fromEntries(designList.map(d => [d.id, d]));
    
    const mailingList = await base44.entities.Mailing.filter({ mailingBatchId });
    const mailingMap = Object.fromEntries(mailingList.map(m => [m.noteId, m]));
    
    // ========================================
    // GROUP NOTES INTO CAMPAIGNS
    // ========================================
    // Notes with same (message + design + returnAddressMode) go in one campaign
    
    const campaignGroups = new Map();
    const notesByGroupKey = new Map();
    const processingErrors = [];
    
    for (const note of notes) {
      const client = clientMap[note.clientId];
      const cardDesign = cardDesignMap[note.cardDesignId];
      
      if (!client) {
        processingErrors.push({ noteId: note.id, clientId: note.clientId, error: 'Client not found' });
        continue;
      }
      
      if (!cardDesign?.scribeZipUrl) {
        processingErrors.push({ noteId: note.id, clientId: note.clientId, error: 'Card design missing scribeZipUrl' });
        continue;
      }
      
      // Build Scribe-format message
      let scribeMessage = note.messageTemplate;
      if (!scribeMessage) {
        // Rebuild if not pre-computed: resolve sender placeholders, then map client placeholders to Scribe format
        console.warn(`Note ${note.id} missing messageTemplate - rebuilding`);
        const withSenderResolved = resolveSenderPlaceholders(note.message, senderUser, organization);
        scribeMessage = mapToScribePlaceholders(withSenderResolved);
      }
      
      // Get return address mode (from note, mailing, or batch default)
      const mailing = mailingMap[note.id];
      const returnAddressMode = note.returnAddressMode || mailing?.returnAddressMode || batch.returnAddressMode || 'none';
      
      // Create group key
      const groupKey = createCampaignGroupKey(scribeMessage, note.cardDesignId, returnAddressMode);
      
      if (!campaignGroups.has(groupKey)) {
        campaignGroups.set(groupKey, {
          scribeMessage,
          cardDesignId: note.cardDesignId,
          cardDesign,
          returnAddressMode,
          textType: determineTextType(scribeMessage),
          recipients: []
        });
        notesByGroupKey.set(groupKey, []);
      }
      
      campaignGroups.get(groupKey).recipients.push({ 
        clientId: note.clientId, 
        client, 
        noteId: note.id,
        mailingId: mailing?.id
      });
      notesByGroupKey.get(groupKey).push(note);
    }
    
    console.log(`Created ${campaignGroups.size} campaign groups from ${notes.length} notes`);
    
    // ========================================
    // PROCESS EACH CAMPAIGN GROUP
    // ========================================
    
    const scribeCampaigns = [];
    
    for (const [groupKey, group] of campaignGroups) {
      let scribeCampaignId = null;
      
      try {
        console.log(`\n=== PROCESSING GROUP: ${groupKey} ===`);
        console.log(`Recipients: ${group.recipients.length}`);
        console.log(`Return address mode: ${group.returnAddressMode}`);
        console.log(`Message preview: ${group.scribeMessage.substring(0, 100)}...`);
        
        // 1. Fetch ZIP
        const zipBuffer = await fetchZipFromStorage(base44, group.cardDesign.scribeZipUrl);
        
        // 2. Build return address
        const returnAddress = buildReturnAddress(group.returnAddressMode, senderUser, organization);
        
        // 3. Create campaign with message/design (SKIP create-campaign-id-v2!)
        scribeCampaignId = await createCampaignWithDetails(
          group.scribeMessage,
          group.textType,
          zipBuffer,
          returnAddress
        );
        console.log('✅ Campaign created:', scribeCampaignId);
        
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
        console.log('✅ Contacts added');
        
        // 6. Submit campaign
        const submitResult = await submitScribeCampaign(scribeCampaignId);
        console.log('✅ Campaign submitted:', submitResult.status || 'success');
        
        // 7. Update Note and Mailing records
        const scribeStatus = submitResult.status === 'needs_credits' ? 'pending_credits' : 'sent';
        
        for (const note of notesByGroupKey.get(groupKey)) {
          await base44.entities.Note.update(note.id, { 
            scribeCampaignId: String(scribeCampaignId), 
            status: scribeStatus 
          });
        }
        
        for (const r of group.recipients) {
          if (r.mailingId) {
            await base44.entities.Mailing.update(r.mailingId, { 
              scribeCampaignId: String(scribeCampaignId), 
              status: scribeStatus 
            });
          }
        }
        
        scribeCampaigns.push({
          scribeCampaignId: String(scribeCampaignId),
          contactCount: contacts.length,
          status: scribeStatus === 'pending_credits' ? 'needs_credits' : 'submitted',
          returnAddressMode: group.returnAddressMode,
          submittedAt: new Date().toISOString()
        });
        
        console.log(`SUCCESS: Campaign ${scribeCampaignId} with ${contacts.length} contacts`);
        
      } catch (error) {
        console.error(`FAILED: Campaign error:`, error.message);
        
        // Mark notes as failed
        for (const note of notesByGroupKey.get(groupKey) || []) {
          await base44.entities.Note.update(note.id, { status: 'failed' });
        }
        
        scribeCampaigns.push({
          scribeCampaignId: scribeCampaignId ? String(scribeCampaignId) : null,
          contactCount: group.recipients.length,
          status: 'failed',
          errorMessage: error.message,
          submittedAt: new Date().toISOString()
        });
        
        for (const r of group.recipients) {
          processingErrors.push({ 
            noteId: r.noteId,
            clientId: r.clientId, 
            error: `Scribe failed: ${error.message}` 
          });
        }
      }
    }
    
    // ========================================
    // UPDATE BATCH STATUS
    // ========================================
    
    const successCount = scribeCampaigns.filter(c => c.status === 'submitted' || c.status === 'needs_credits').length;
    const failCount = scribeCampaigns.filter(c => c.status === 'failed').length;
    const needsCreditsCount = scribeCampaigns.filter(c => c.status === 'needs_credits').length;
    
    let finalStatus;
    if (failCount === 0 && needsCreditsCount === 0) {
      finalStatus = 'completed';
    } else if (failCount === 0 && needsCreditsCount > 0) {
      finalStatus = 'pending_credits';
    } else if (successCount > 0) {
      finalStatus = 'partial';
    } else {
      finalStatus = 'failed';
    }
    
    await base44.entities.MailingBatch.update(mailingBatchId, {
      status: finalStatus,
      scribeCampaigns,
      processingErrors: processingErrors.length ? processingErrors : null,
      processedAt: new Date().toISOString()
    });
    
    console.log(`\n=== BATCH COMPLETE: ${finalStatus} ===`);
    console.log(`Campaigns: ${successCount} success, ${failCount} failed, ${needsCreditsCount} needs_credits`);
    
    return Response.json({
      success: true,
      status: finalStatus,
      campaignsCreated: successCount,
      campaignsFailed: failCount,
      campaignsNeedCredits: needsCreditsCount,
      totalContacts: scribeCampaigns.reduce((sum, c) => sum + c.contactCount, 0),
      scribeCampaigns,
      processingErrors: processingErrors.length ? processingErrors : null
    });
    
  } catch (error) {
    console.error('submitBatchToScribe error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});