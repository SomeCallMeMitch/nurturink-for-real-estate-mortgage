import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SCRIBE_API_BASE_URL = Deno.env.get('SCRIBE_API_BASE_URL') || 'https://staging.scribenurture.com';
const SCRIBE_API_TOKEN = Deno.env.get('SCRIBE_API_TOKEN');

// ============================================================
// DIAGNOSTIC VERSION - SKIP RETURN ADDRESS TO ISOLATE BUG
// Change log:
// - Reverted to /api/add-campaign-v2 (correct per Scribe docs)
// - DISABLED return_address to test if that's causing the 500 error
// - Added extensive logging
// ============================================================

/**
 * Resolve ALL sender/user/organization placeholders
 */
function resolveSenderPlaceholders(text, user, organization) {
  if (!text) return '';
  let result = text;
  
  if (user) {
    const firstName = user.firstName || user.full_name?.split(' ')[0] || '';
    const lastName = user.lastName || user.full_name?.split(' ').slice(1).join(' ') || '';
    const fullName = user.full_name || '';
    
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
    result = result.replace(/\{\{rep_company_name\}\}/g, user.companyName || '');
    result = result.replace(/\{\{rep_phone\}\}/g, user.phone || '');
  }
  
  if (organization) {
    result = result.replace(/\{\{org\.name\}\}/g, organization.name || '');
    result = result.replace(/\{\{org\.phone\}\}/g, organization.phone || '');
  }
  
  return result;
}

/**
 * Map client placeholders to Scribe format
 */
function mapToScribePlaceholders(text) {
  if (!text) return '';
  return text
    .replace(/\{\{client\.firstName\}\}/g, '{FIRST_NAME}')
    .replace(/\{\{client\.lastName\}\}/g, '{LAST_NAME}')
    .replace(/\{\{client\.fullName\}\}/g, '{FIRST_NAME} {LAST_NAME}')
    .replace(/\{\{firstName\}\}/g, '{FIRST_NAME}')
    .replace(/\{\{lastName\}\}/g, '{LAST_NAME}');
}

function createCampaignGroupKey(scribeMessage, cardDesignId) {
  const keyString = `${scribeMessage}|||${cardDesignId}`;
  let hash = 0;
  for (let i = 0; i < keyString.length; i++) {
    hash = ((hash << 5) - hash) + keyString.charCodeAt(i);
    hash = hash & hash;
  }
  return `grp_${Math.abs(hash).toString(36)}`;
}

function determineTextType(message) {
  if (!message) return 'Short Text';
  const wordCount = message.trim().split(/\s+/).length;
  return wordCount > 110 ? 'Long Text' : 'Short Text';
}

// ============================================================
// SCRIBE API FUNCTIONS
// ============================================================

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
  console.log('[Scribe] Create draft response:', response.status, responseText.substring(0, 300));
  
  if (!response.ok) {
    throw new Error(`Scribe draft creation failed: ${response.status} - ${responseText}`);
  }
  
  const result = JSON.parse(responseText);
  const campaignId = result.data?.campaign_id || result.data?.id;
  
  if (!result.success || !campaignId) {
    throw new Error(`Scribe draft creation failed: ${JSON.stringify(result)}`);
  }
  
  console.log('[Scribe] Draft campaign created:', campaignId);
  return campaignId;
}

/**
 * Add campaign details - USING /api/add-campaign-v2 (correct per Scribe workflow docs)
 * DIAGNOSTIC: Skipping return_address to test if that's causing the 500 error
 */
async function addScribeCampaignDetails(campaignId, message, textType, zipBuffer) {
  // Using add-campaign-v2 as shown in Scribe workflow docs
  const url = `${SCRIBE_API_BASE_URL}/api/add-campaign-v2`;
  
  console.log('[Scribe] Adding campaign details to:', campaignId);
  console.log('[Scribe] URL:', url);
  console.log('[Scribe] Message preview:', message?.substring(0, 100));
  console.log('[Scribe] Text type:', textType);
  console.log('[Scribe] ZIP size:', zipBuffer?.byteLength, 'bytes');
  
  const formData = new FormData();
  formData.append('campaign_id', String(campaignId));
  formData.append('message', message);
  formData.append('text_type', textType);
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  
  // DIAGNOSTIC: SKIP return_address to see if that's causing the 500 error
  console.log('[Scribe] DIAGNOSTIC: return_address SKIPPED to isolate bug');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SCRIBE_API_TOKEN}`
    },
    body: formData
  });
  
  const responseText = await response.text();
  console.log('[Scribe] Add campaign response status:', response.status);
  console.log('[Scribe] Add campaign response body:', responseText.substring(0, 500));
  
  if (!response.ok) {
    throw new Error(`Scribe add campaign failed: ${response.status} - ${responseText}`);
  }
  
  const result = JSON.parse(responseText);
  if (!result.success) {
    throw new Error(`Scribe add campaign failed: ${JSON.stringify(result)}`);
  }
  
  console.log('[Scribe] Campaign details added successfully');
  return result;
}

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
    throw new Error(`Scribe add contacts failed: ${JSON.stringify(result)}`);
  }
  
  return result;
}

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
  
  if (!response.ok) {
    throw new Error(`Scribe submit failed: ${response.status} - ${responseText}`);
  }
  
  return JSON.parse(responseText);
}

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
  console.log('=== SUBMIT BATCH TO SCRIBE (DIAGNOSTIC VERSION) ===');
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
    
    if (batch.status !== 'pending_review') {
      return Response.json({ 
        success: false, 
        error: `Batch status is "${batch.status}", expected "pending_review"` 
      }, { status: 400 });
    }
    
    await base44.entities.MailingBatch.update(mailingBatchId, { status: 'sending' });
    
    // Load data
    let senderUser = null, organization = null;
    if (batch.userId) {
      const userList = await base44.entities.User.filter({ id: batch.userId });
      if (userList?.length) senderUser = userList[0];
    }
    if (batch.organizationId) {
      const orgList = await base44.entities.Organization.filter({ id: batch.organizationId });
      if (orgList?.length) organization = orgList[0];
    }
    
    const notes = await base44.entities.Note.filter({ mailingBatchId });
    if (!notes?.length) {
      await base44.entities.MailingBatch.update(mailingBatchId, { status: 'failed' });
      return Response.json({ success: false, error: 'No notes found' }, { status: 400 });
    }
    
    console.log(`Processing ${notes.length} notes`);
    
    const clientIds = [...new Set(notes.map(n => n.clientId).filter(Boolean))];
    const clientList = clientIds.length ? await base44.entities.Client.filter({ id: { $in: clientIds } }) : [];
    const clientMap = Object.fromEntries(clientList.map(c => [c.id, c]));
    
    const designIds = [...new Set(notes.map(n => n.cardDesignId).filter(Boolean))];
    const designList = designIds.length ? await base44.entities.CardDesign.filter({ id: { $in: designIds } }) : [];
    const cardDesignMap = Object.fromEntries(designList.map(d => [d.id, d]));
    
    const mailingList = await base44.entities.Mailing.filter({ mailingBatchId });
    const mailingMap = Object.fromEntries(mailingList.map(m => [m.noteId, m]));
    
    // Build campaign groups
    const campaignGroups = new Map();
    const notesByGroupKey = new Map();
    const processingErrors = [];
    
    for (const note of notes) {
      const client = clientMap[note.clientId];
      const cardDesign = cardDesignMap[note.cardDesignId];
      
      if (!client) {
        processingErrors.push({ clientId: note.clientId, error: 'Client not found' });
        continue;
      }
      
      if (!cardDesign?.scribeZipUrl) {
        processingErrors.push({ clientId: note.clientId, error: 'Card design missing scribeZipUrl' });
        continue;
      }
      
      let scribeMessage = note.messageTemplate;
      if (!scribeMessage) {
        console.warn(`Note ${note.id} missing messageTemplate - rebuilding`);
        const withSenderResolved = resolveSenderPlaceholders(note.message, senderUser, organization);
        scribeMessage = mapToScribePlaceholders(withSenderResolved);
      }
      
      const groupKey = createCampaignGroupKey(scribeMessage, note.cardDesignId);
      
      if (!campaignGroups.has(groupKey)) {
        campaignGroups.set(groupKey, {
          scribeMessage,
          cardDesignId: note.cardDesignId,
          cardDesign,
          textType: determineTextType(scribeMessage),
          recipients: []
        });
        notesByGroupKey.set(groupKey, []);
      }
      
      campaignGroups.get(groupKey).recipients.push({ clientId: note.clientId, client, noteId: note.id });
      notesByGroupKey.get(groupKey).push(note);
    }
    
    console.log(`Created ${campaignGroups.size} campaign groups`);
    
    // Process each group
    const scribeCampaigns = [];
    
    for (const [groupKey, group] of campaignGroups) {
      let scribeCampaignId = null;
      
      try {
        console.log(`\n=== PROCESSING GROUP ===`);
        console.log(`Recipients: ${group.recipients.length}`);
        console.log(`Message preview: ${group.scribeMessage.substring(0, 150)}...`);
        
        // 1. Create draft
        scribeCampaignId = await createScribeDraftCampaign();
        
        // 2. Fetch ZIP
        const zipBuffer = await fetchZipFromStorage(base44, group.cardDesign.scribeZipUrl);
        
        // 3. Add campaign details (NO return_address for diagnostic)
        await addScribeCampaignDetails(scribeCampaignId, group.scribeMessage, group.textType, zipBuffer);
        
        // 4. Build and add contacts
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
        
        await addScribeContacts(scribeCampaignId, contacts);
        
        // 5. Submit
        await submitScribeCampaign(scribeCampaignId);
        
        // 6. Update records
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
          contactCount: contacts.length,
          status: 'submitted',
          submittedAt: new Date().toISOString()
        });
        
        console.log(`SUCCESS: Campaign ${scribeCampaignId} with ${contacts.length} contacts`);
        
      } catch (error) {
        console.error(`FAILED: Campaign error:`, error.message);
        
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
          processingErrors.push({ clientId: r.clientId, error: `Scribe failed: ${error.message}` });
        }
      }
    }
    
    // Update batch
    const successCount = scribeCampaigns.filter(c => c.status === 'submitted').length;
    const failCount = scribeCampaigns.filter(c => c.status === 'failed').length;
    const finalStatus = failCount > 0 ? (successCount > 0 ? 'partial' : 'failed') : 'completed';
    
    await base44.entities.MailingBatch.update(mailingBatchId, {
      status: finalStatus,
      scribeCampaigns,
      processingErrors: processingErrors.length ? processingErrors : batch.processingErrors
    });
    
    console.log(`\n=== BATCH COMPLETE: ${finalStatus} ===`);
    
    return Response.json({
      success: true,
      status: finalStatus,
      campaignsCreated: successCount,
      campaignsFailed: failCount,
      totalContacts: scribeCampaigns.reduce((sum, c) => sum + c.contactCount, 0),
      scribeCampaigns
    });
    
  } catch (error) {
    console.error('submitBatchToScribe error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});