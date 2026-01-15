import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { formatMessageForScribe } from './formatMessageForScribe.ts';

// ============================================================
// SUBMIT BATCH TO SCRIBE - REFACTORED VERSION
// ============================================================
// 
// KEY CHANGES:
// 1. Hybrid placeholder strategy (greeting-only vs body placeholders)
// 2. Message formatting with formatMessageForScribe() for proper line breaks
// 3. Groups by FORMATTED message (not template)
// 4. Rate limiting (60 requests/minute)
// 5. Per-note error handling
//
// WORKFLOW:
// 1. POST /api/add-campaign-v2 → Creates campaign with formatted message/design
// 2. POST /api/add-contacts-bulk → Adds contacts to that campaign_id
// 3. PUT /api/v1/campaign/send → Submits campaign
//
// ============================================================

const SCRIBE_API_BASE_URL = Deno.env.get('SCRIBE_API_BASE_URL') || 'https://staging.scribenurture.com';
const SCRIBE_API_TOKEN = Deno.env.get('SCRIBE_API_TOKEN');

// ============================================================
// RATE LIMITER
// ============================================================

class ScribeAPIQueue {
  constructor() {
    this.queue = [];
    this.requestsThisMinute = 0;
    this.lastResetTime = Date.now();
    this.maxRequestsPerMinute = 60;
    this.processing = false;
  }

  async enqueue(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;

    // Reset counter every minute
    const now = Date.now();
    if (now - this.lastResetTime >= 60000) {
      this.requestsThisMinute = 0;
      this.lastResetTime = now;
    }

    // Check if we can make another request
    if (this.requestsThisMinute < this.maxRequestsPerMinute) {
      const fn = this.queue.shift();
      if (fn) {
        this.requestsThisMinute++;
        await fn();
        // Process next immediately
        setTimeout(() => this.processQueue(), 0);
      }
    } else {
      // Wait until next minute
      const waitTime = 60000 - (now - this.lastResetTime) + 100;
      console.log(`[RateLimit] Reached ${this.maxRequestsPerMinute} req/min. Waiting ${Math.ceil(waitTime / 1000)}s...`);
      setTimeout(() => this.processQueue(), waitTime);
    }
  }
}

const apiQueue = new ScribeAPIQueue();

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
 * HYBRID PLACEHOLDER STRATEGY
 * 
 * Checks if template has placeholders ONLY in greeting (first line)
 * If yes: use Scribe merge tags {FIRST_NAME}
 * If no: fully resolve placeholders per recipient
 */
function hasPlaceholderOnlyInGreeting(template) {
  if (!template) return false;
  
  const lines = template.split('\n');
  const firstLine = lines[0] || '';
  const restOfMessage = lines.slice(1).join('\n');

  const placeholderRegex = /\{\{client\.\w+\}\}/g;
  
  const hasInGreeting = placeholderRegex.test(firstLine);
  const hasInBody = placeholderRegex.test(restOfMessage);

  return hasInGreeting && !hasInBody;
}

/**
 * Resolve ALL client placeholders with actual client data
 * Used when placeholders appear in message body
 */
function resolveClientPlaceholders(text, client) {
  if (!text || !client) return text || '';
  
  const firstName = client.firstName || '';
  const lastName = client.lastName || '';
  const fullName = client.fullName || `${firstName} ${lastName}`.trim();
  
  return text
    // {{client.*}} format
    .replace(/\{\{client\.firstName\}\}/g, firstName)
    .replace(/\{\{client\.lastName\}\}/g, lastName)
    .replace(/\{\{client\.fullName\}\}/g, fullName)
    .replace(/\{\{client\.email\}\}/g, client.email || '')
    .replace(/\{\{client\.phone\}\}/g, client.phone || '')
    .replace(/\{\{client\.company\}\}/g, client.company || '')
    .replace(/\{\{client\.street\}\}/g, client.street || '')
    .replace(/\{\{client\.city\}\}/g, client.city || '')
    .replace(/\{\{client\.state\}\}/g, client.state || '')
    .replace(/\{\{client\.zipCode\}\}/g, client.zipCode || '')
    // Legacy format
    .replace(/\{\{firstName\}\}/g, firstName)
    .replace(/\{\{lastName\}\}/g, lastName)
    .replace(/\{\{fullName\}\}/g, fullName)
    .replace(/\{\{email\}\}/g, client.email || '')
    .replace(/\{\{phone\}\}/g, client.phone || '');
}

/**
 * Convert client placeholders to Scribe merge tags
 * Only used for greeting-only placeholders
 */
function convertToScribeMergeTags(template) {
  if (!template) return '';
  
  return template
    // {{client.*}} format → {PARAM} format
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
 * Determine text type based on line count
 * (Word count validation removed per requirements)
 */
function determineTextType(message) {
  if (!message) return 'Short Text';
  const lineCount = message.split('\n').length;
  return lineCount > 13 ? 'Long Text' : 'Short Text';
}

/**
 * Build return address object from user/organization based on mode
 */
function buildReturnAddress(mode, user, organization) {
  if (mode === 'none' || !mode) {
    return null;
  }
  
  if (mode === 'company' && organization?.companyReturnAddress) {
    const addr = organization.companyReturnAddress;
    return {
      firstName: addr.name || organization.name || '',
      lastName: '',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.zip || ''
    };
  }
  
  if (mode === 'rep' && user) {
    return {
      firstName: user.returnAddressName || user.full_name || '',
      lastName: '',
      street: user.street || '',
      city: user.city || '',
      state: user.state || '',
      zip: user.zipCode || ''
    };
  }
  
  return null;
}

// ============================================================
// SCRIBE API FUNCTIONS
// ============================================================

/**
 * Create campaign with add-campaign-v2
 * Sends FORMATTED message with proper line breaks
 * 
 * IMPORTANT: return_address must use ARRAY NOTATION, not JSON.stringify
 */
async function createCampaignWithDetails(message, textType, zipBuffer, returnAddress = null) {
  return apiQueue.enqueue(async () => {
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
  });
}

/**
 * Add contacts to a campaign (rate limited)
 */
async function addScribeContacts(campaignId, contacts) {
  return apiQueue.enqueue(async () => {
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
  });
}

/**
 * Submit campaign for processing (rate limited)
 */
async function submitScribeCampaign(campaignId) {
  return apiQueue.enqueue(async () => {
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
  });
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
    // Notes with same (FORMATTED message + design + returnAddressMode) go in one campaign
    
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
      
      // Step 1: Get message with sender placeholders already resolved
      let messageWithSenderResolved = note.messageTemplate;
      if (!messageWithSenderResolved) {
        // Fallback: resolve sender placeholders if not pre-computed
        console.warn(`Note ${note.id} missing messageTemplate - rebuilding`);
        messageWithSenderResolved = resolveSenderPlaceholders(note.message, senderUser, organization);
      }
      
      // Step 2: HYBRID STRATEGY - Check if placeholder only in greeting
      const useScribeMergeTags = hasPlaceholderOnlyInGreeting(messageWithSenderResolved);
      
      let messageToFormat;
      
      if (useScribeMergeTags) {
        // Mode A: Greeting-only placeholders → Use Scribe merge tags
        console.log(`[Note ${note.id}] Using Scribe merge tags (greeting-only placeholders)`);
        messageToFormat = convertToScribeMergeTags(messageWithSenderResolved);
      } else {
        // Mode B: Body placeholders → Fully resolve per recipient
        console.log(`[Note ${note.id}] Fully resolving placeholders (body placeholders detected)`);
        messageToFormat = resolveClientPlaceholders(messageWithSenderResolved, client);
      }
      
      // Step 3: Format the message with proper line breaks and indentation
      let formatted;
      let textType;
      
      console.log(`[Note ${note.id}] 🔍 DEBUG: messageToFormat BEFORE formatting:`, messageToFormat.substring(0, 150));
      
      try {
        // Try Short Text first
        textType = 'Short Text';
        formatted = formatMessageForScribe(messageToFormat, textType);
        console.log(`[Note ${note.id}] ✅ Formatted as Short Text (${formatted.lineCount} lines)`);
        console.log(`[Note ${note.id}] 🔍 DEBUG: formatted.formatted AFTER formatting:`, formatted.formatted.substring(0, 150));
      } catch (error) {
        // If Short Text fails, try Long Text
        try {
          textType = 'Long Text';
          formatted = formatMessageForScribe(messageToFormat, textType);
          console.log(`[Note ${note.id}] Formatted as Long Text (${formatted.lineCount} lines)`);
        } catch (longError) {
          // Message too long even for Long Text
          processingErrors.push({
            noteId: note.id,
            clientId: note.clientId,
            error: `Message too long: ${longError.message}`
          });
          continue;
        }
      }
      
      // Step 4: Get return address mode
      const mailing = mailingMap[note.id];
      const returnAddressMode = note.returnAddressMode || mailing?.returnAddressMode || batch.returnAddressModeGlobal || 'none';
      
      // Step 5: Create group key with FORMATTED message
      const groupKey = createCampaignGroupKey(formatted.formatted, note.cardDesignId, returnAddressMode);
      
      // Step 6: Add to campaign group
      if (!campaignGroups.has(groupKey)) {
        console.log(`[Note ${note.id}] 🔍 DEBUG: Creating new group with formattedMessage:`, formatted.formatted.substring(0, 150));
        campaignGroups.set(groupKey, {
          formattedMessage: formatted.formatted, // Fully resolved and formatted
          cardDesignId: note.cardDesignId,
          cardDesign,
          returnAddressMode,
          textType: formatted.textType,
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
    console.log(`Processing errors: ${processingErrors.length}`);
    
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
        console.log(`🔍 DEBUG: group.formattedMessage:`, group.formattedMessage.substring(0, 150));
        console.log(`Message preview: ${group.formattedMessage.substring(0, 100)}...`);
        
        // 1. Fetch ZIP
        const zipBuffer = await fetchZipFromStorage(base44, group.cardDesign.scribeZipUrl);
        
        // 2. Build return address
        const returnAddress = buildReturnAddress(group.returnAddressMode, senderUser, organization);
        
        // 3. Create campaign with FORMATTED message/design
        scribeCampaignId = await createCampaignWithDetails(
          group.formattedMessage, // NEW: Use formatted message
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