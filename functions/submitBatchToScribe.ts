import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SCRIBE_API_BASE_URL = Deno.env.get('SCRIBE_API_BASE_URL') || 'https://staging.scribenurture.com';
const SCRIBE_API_TOKEN = Deno.env.get('SCRIBE_API_TOKEN');

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Resolve sender/organization placeholders to literal text
 */
function resolveSenderPlaceholders(text, user, organization) {
  if (!text) return '';
  
  let result = text;
  
  if (user) {
    result = result.replace(/\{\{me\.fullName\}\}/g, user.full_name || '');
    result = result.replace(/\{\{me\.firstName\}\}/g, user.firstName || user.full_name?.split(' ')[0] || '');
    result = result.replace(/\{\{me\.lastName\}\}/g, user.lastName || user.full_name?.split(' ').slice(1).join(' ') || '');
    result = result.replace(/\{\{me\.email\}\}/g, user.email || '');
    result = result.replace(/\{\{me\.phone\}\}/g, user.phone || '');
    result = result.replace(/\{\{me\.title\}\}/g, user.title || '');
    result = result.replace(/\{\{me\.companyName\}\}/g, user.companyName || '');
  }
  
  if (organization) {
    result = result.replace(/\{\{org\.name\}\}/g, organization.name || '');
    result = result.replace(/\{\{org\.phone\}\}/g, organization.phone || '');
    result = result.replace(/\{\{org\.email\}\}/g, organization.email || '');
    result = result.replace(/\{\{org\.website\}\}/g, organization.website || '');
  }
  
  return result;
}

/**
 * Map RoofScribe client placeholders to Scribe format
 * Our format: {{client.firstName}} -> Scribe format: {FIRST_NAME}
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

/**
 * Create deterministic group key for campaign grouping
 */
function createCampaignGroupKey(scribeMessage, cardDesignId, returnAddress) {
  const returnAddressStr = returnAddress 
    ? `${returnAddress.name || ''}|${returnAddress.street}|${returnAddress.city}|${returnAddress.state}|${returnAddress.zip}`
    : 'NONE';
  
  const keyString = `${scribeMessage}|||${cardDesignId}|||${returnAddressStr}`;
  
  let hash = 0;
  for (let i = 0; i < keyString.length; i++) {
    const char = keyString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `grp_${Math.abs(hash).toString(36)}`;
}

/**
 * Determine Short Text vs Long Text for Scribe
 */
function determineTextType(message) {
  if (!message) return 'Short Text';
  
  const wordCount = message.trim().split(/\s+/).length;
  const lineCount = (message.match(/\n/g) || []).length + 1;
  
  return (wordCount > 110 || lineCount > 13) ? 'Long Text' : 'Short Text';
}

// ============================================================
// SCRIBE API FUNCTIONS
// ============================================================

/**
 * Create a draft campaign in Scribe
 * Endpoint: POST /api/create-campaign-id-v2
 */
async function createScribeDraftCampaign() {
  const url = `${SCRIBE_API_BASE_URL}/api/create-campaign-id-v2`;
  
  console.log('[Scribe] Creating draft campaign...');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SCRIBE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'draft' })
  });
  
  const responseText = await response.text();
  console.log('[Scribe] Create draft response:', response.status);
  
  if (!response.ok) {
    throw new Error(`Scribe draft creation failed: ${response.status} - ${responseText.substring(0, 200)}`);
  }
  
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Scribe returned non-JSON: ${responseText.substring(0, 200)}`);
  }
  
  // Scribe returns data.campaign_id (not data.id)
  const campaignId = result.data?.campaign_id || result.data?.id;
  if (!result.success || !campaignId) {
    throw new Error(`Scribe draft creation failed: ${JSON.stringify(result)}`);
  }
  
  console.log('[Scribe] Draft campaign created:', campaignId);
  return campaignId;
}

/**
 * Add campaign details (message, ZIP, return address) to an EXISTING draft campaign
 * 
 * CRITICAL FIX: Use /api/edit-campaign-v2 (not /api/add-campaign-v2)
 * - add-campaign-v2 creates a NEW campaign
 * - edit-campaign-v2 updates an EXISTING draft campaign
 * 
 * Endpoint: POST /api/edit-campaign-v2 (multipart/form-data)
 */
async function addScribeCampaignDetails(campaignId, message, textType, zipBuffer, returnAddress) {
  // FIXED: Changed from /api/add-campaign-v2 to /api/edit-campaign-v2
  const url = `${SCRIBE_API_BASE_URL}/api/edit-campaign-v2`;
  
  console.log('[Scribe] Adding campaign details to draft:', campaignId);
  console.log('[Scribe] Message length:', message?.length, 'Text type:', textType);
  
  const formData = new FormData();
  formData.append('campaign_id', String(campaignId));
  formData.append('message', message);
  formData.append('text_type', textType);
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  
  if (returnAddress) {
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
  console.log('[Scribe] Edit campaign response:', response.status);
  
  if (!response.ok) {
    throw new Error(`Scribe edit campaign failed: ${response.status} - ${responseText.substring(0, 200)}`);
  }
  
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Scribe returned non-JSON: ${responseText.substring(0, 200)}`);
  }
  
  if (!result.success) {
    throw new Error(`Scribe edit campaign failed: ${JSON.stringify(result)}`);
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
  console.log('[Scribe] Add contacts response:', response.status);
  
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
  console.log('[Scribe] Submit response:', response.status);
  
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
  
  const signedUrlResult = await base44.integrations.Core.CreateFileSignedUrl({
    file_uri: fileUri
  });
  
  const response = await fetch(signedUrlResult.signed_url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ZIP: ${response.status}`);
  }
  
  const buffer = await response.arrayBuffer();
  console.log('[Storage] ZIP fetched:', buffer.byteLength, 'bytes');
  return buffer;
}

// ============================================================
// MAIN HANDLER
// ============================================================

Deno.serve(async (req) => {
  console.log('=== SUBMIT BATCH TO SCRIBE ===');
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
    
    // Verify caller is authenticated admin
    const adminUser = await base44.auth.me();
    if (!adminUser) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const isAdmin = adminUser.role === 'admin' || 
                    ['super_admin', 'organization_admin', 'organization_owner'].includes(adminUser.appRole);
    
    if (!isAdmin) {
      return Response.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }
    
    console.log(`Admin ${adminUser.email} approving batch ${mailingBatchId}`);
    
    // Load batch
    const batchList = await base44.entities.MailingBatch.filter({ id: mailingBatchId });
    if (!batchList?.length) {
      return Response.json({ success: false, error: 'Batch not found' }, { status: 404 });
    }
    
    const batch = batchList[0];
    
    if (batch.status !== 'pending_review') {
      return Response.json({ 
        success: false, 
        error: `Batch status is "${batch.status}", expected "pending_review"` 
      }, { status: 400 });
    }
    
    // Update status to processing
    await base44.entities.MailingBatch.update(mailingBatchId, { status: 'sending' });
    
    // Load sender user and organization
    let senderUser = null;
    let organization = null;
    
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
    
    // ============================================================
    // BUILD CAMPAIGN GROUPS
    // ============================================================
    
    const campaignGroups = new Map();
    const notesByGroupKey = new Map();
    const processingErrors = [];
    
    for (const note of notes) {
      const client = clientMap[note.clientId];
      const cardDesign = cardDesignMap[note.cardDesignId];
      
      if (!client) {
        processingErrors.push({ clientId: note.clientId, error: 'Client not found', timestamp: new Date().toISOString() });
        continue;
      }
      
      if (!cardDesign?.scribeZipUrl) {
        processingErrors.push({ clientId: note.clientId, error: 'Card design missing scribeZipUrl', timestamp: new Date().toISOString() });
        continue;
      }
      
      // CRITICAL: Use messageTemplate if available, otherwise we have a problem
      // messageTemplate should contain Scribe placeholders like {FIRST_NAME}
      // If it's not set, the note.message has already-resolved client names which breaks grouping
      let scribeMessage = note.messageTemplate;
      
      if (!scribeMessage) {
        // Fallback: This won't work perfectly if note.message has resolved placeholders
        // But we try our best - at least resolve sender placeholders and map what we can
        console.warn(`Note ${note.id} missing messageTemplate - using fallback`);
        scribeMessage = mapToScribePlaceholders(resolveSenderPlaceholders(note.message, senderUser, organization));
      }
      
      const returnAddressMode = note.returnAddressMode || batch.returnAddressModeGlobal || 'company';
      const returnAddress = resolveReturnAddress(returnAddressMode, senderUser, organization);
      const groupKey = createCampaignGroupKey(scribeMessage, note.cardDesignId, returnAddress);
      
      if (!campaignGroups.has(groupKey)) {
        campaignGroups.set(groupKey, {
          scribeMessage,
          cardDesignId: note.cardDesignId,
          cardDesign,
          returnAddress,
          returnAddressMode,
          textType: determineTextType(scribeMessage),
          recipients: []
        });
        notesByGroupKey.set(groupKey, []);
      }
      
      campaignGroups.get(groupKey).recipients.push({ clientId: note.clientId, client, noteId: note.id });
      notesByGroupKey.get(groupKey).push(note);
    }
    
    console.log(`Created ${campaignGroups.size} campaign groups from ${notes.length} notes`);
    
    // ============================================================
    // PROCESS EACH CAMPAIGN GROUP
    // ============================================================
    
    const scribeCampaigns = [];
    
    for (const [groupKey, group] of campaignGroups) {
      let scribeCampaignId = null;
      
      try {
        console.log(`Processing group with ${group.recipients.length} recipients`);
        
        // 1. Create draft campaign
        scribeCampaignId = await createScribeDraftCampaign();
        
        // 2. Fetch ZIP
        const zipBuffer = await fetchZipFromStorage(base44, group.cardDesign.scribeZipUrl);
        
        // 3. Add campaign details (message, ZIP, return address) - USES edit-campaign-v2
        await addScribeCampaignDetails(scribeCampaignId, group.scribeMessage, group.textType, zipBuffer, group.returnAddress);
        
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
        
        // 6. Submit campaign
        await submitScribeCampaign(scribeCampaignId);
        
        // 7. Update Notes and Mailings
        for (const note of notesByGroupKey.get(groupKey)) {
          await base44.entities.Note.update(note.id, { scribeCampaignId: String(scribeCampaignId), status: 'sent' });
        }
        
        for (const r of group.recipients) {
          const mailing = mailingMap[r.noteId];
          if (mailing) {
            await base44.entities.Mailing.update(mailing.id, { scribeCampaignId: String(scribeCampaignId), status: 'sent' });
          }
        }
        
        scribeCampaigns.push({
          scribeCampaignId: String(scribeCampaignId),
          campaignGroupKey: groupKey.substring(0, 100),
          cardDesignId: group.cardDesignId,
          returnAddressMode: group.returnAddressMode,
          clientIds: group.recipients.map(r => r.clientId),
          contactCount: contacts.length,
          status: 'submitted',
          scribeStatus: 'pending',
          submittedAt: new Date().toISOString()
        });
        
        console.log(`Campaign ${scribeCampaignId} submitted with ${contacts.length} contacts`);
        
      } catch (error) {
        console.error(`Scribe campaign failed:`, error.message);
        
        for (const note of notesByGroupKey.get(groupKey) || []) {
          await base44.entities.Note.update(note.id, { status: 'failed' });
        }
        
        scribeCampaigns.push({
          scribeCampaignId: scribeCampaignId ? String(scribeCampaignId) : null,
          campaignGroupKey: groupKey.substring(0, 100),
          cardDesignId: group.cardDesignId,
          returnAddressMode: group.returnAddressMode,
          clientIds: group.recipients.map(r => r.clientId),
          contactCount: group.recipients.length,
          status: 'failed',
          errorMessage: error.message,
          submittedAt: new Date().toISOString()
        });
        
        for (const r of group.recipients) {
          processingErrors.push({ clientId: r.clientId, error: `Scribe failed: ${error.message}`, timestamp: new Date().toISOString() });
        }
      }
    }
    
    // ============================================================
    // UPDATE BATCH STATUS
    // ============================================================
    
    const successfulCampaigns = scribeCampaigns.filter(c => c.status === 'submitted').length;
    const failedCampaigns = scribeCampaigns.filter(c => c.status === 'failed').length;
    
    const finalStatus = failedCampaigns > 0 
      ? (successfulCampaigns > 0 ? 'partial' : 'failed')
      : 'completed';
    
    await base44.entities.MailingBatch.update(mailingBatchId, {
      status: finalStatus,
      scribeCampaigns,
      processingErrors: processingErrors.length ? processingErrors : batch.processingErrors
    });
    
    console.log(`Batch completed: ${finalStatus} (${successfulCampaigns} success, ${failedCampaigns} failed)`);
    
    return Response.json({
      success: true,
      status: finalStatus,
      campaignsCreated: successfulCampaigns,
      campaignsFailed: failedCampaigns,
      totalContacts: scribeCampaigns.reduce((sum, c) => sum + c.contactCount, 0),
      scribeCampaigns
    });
    
  } catch (error) {
    console.error('submitBatchToScribe error:', error);
    
    try {
      const base44 = createClientFromRequest(req);
      const body = await req.clone().json();
      if (body?.mailingBatchId) {
        await base44.entities.MailingBatch.update(body.mailingBatchId, {
          status: 'failed',
          processingErrors: [{ error: error.message, timestamp: new Date().toISOString() }]
        });
      }
    } catch (e) { /* ignore */ }
    
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});