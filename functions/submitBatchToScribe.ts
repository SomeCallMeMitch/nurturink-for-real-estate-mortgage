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
    result = result.replace(/\{\{me\.firstName\}\}/g, user.firstName || '');
    result = result.replace(/\{\{me\.lastName\}\}/g, user.lastName || '');
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
 */
function mapToScribePlaceholders(text) {
  if (!text) return '';
  
  let result = text;
  
  result = result.replace(/\{\{client\.firstName\}\}/g, '{FIRST_NAME}');
  result = result.replace(/\{\{client\.lastName\}\}/g, '{LAST_NAME}');
  result = result.replace(/\{\{client\.fullName\}\}/g, '{FIRST_NAME} {LAST_NAME}');
  result = result.replace(/\{\{client\.email\}\}/g, '{EMAIL}');
  result = result.replace(/\{\{client\.phone\}\}/g, '{PHONE}');
  result = result.replace(/\{\{client\.company\}\}/g, '{COMPANY_NAME}');
  result = result.replace(/\{\{client\.street\}\}/g, '{STREET_ADDRESS}');
  result = result.replace(/\{\{client\.address2\}\}/g, '{ADDRESS_2}');
  result = result.replace(/\{\{client\.city\}\}/g, '{CITY}');
  result = result.replace(/\{\{client\.state\}\}/g, '{STATE}');
  result = result.replace(/\{\{client\.zipCode\}\}/g, '{ZIP}');
  
  return result;
}

/**
 * Resolve return address based on mode
 */
function resolveReturnAddress(mode, user, organization) {
  switch (mode) {
    case 'company':
      if (!organization?.companyReturnAddress?.street) return null;
      return {
        name: organization.companyReturnAddress.companyName || organization.name,
        street: organization.companyReturnAddress.street,
        address2: organization.companyReturnAddress.address2 || null,
        city: organization.companyReturnAddress.city,
        state: organization.companyReturnAddress.state,
        zip: organization.companyReturnAddress.zip
      };
      
    case 'rep':
      if (!user?.street) return null;
      return {
        name: user.returnAddressName || user.full_name,
        street: user.street,
        address2: user.address2 || null,
        city: user.city,
        state: user.state,
        zip: user.zipCode
      };
      
    case 'none':
    default:
      return null;
  }
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
  const lineCount = message.split('\n').length;
  
  if (wordCount > 110 || lineCount > 13) {
    return 'Long Text';
  }
  
  return 'Short Text';
}

// ============================================================
// SCRIBE API FUNCTIONS
// ============================================================

/**
 * Create a draft campaign in Scribe
 */
async function createScribeDraftCampaign() {
  const url = `${SCRIBE_API_BASE_URL}/api/create-campaign-id-v2`;
  
  console.log('=== CREATE DRAFT CAMPAIGN ===');
  console.log('URL:', url);
  console.log('Method: POST');
  
  const requestBody = { status: 'draft' };
  console.log('Body:', JSON.stringify(requestBody));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SCRIBE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));
    
    const responseText = await response.text();
    console.log('Response body (first 500 chars):', responseText.substring(0, 500));
    
    if (!response.ok) {
      throw new Error(`Scribe API error: ${response.status} - ${responseText.substring(0, 200)}`);
    }
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Scribe returned non-JSON response: ${responseText.substring(0, 200)}`);
    }
    
    if (!result.success || !result.data?.id) {
      throw new Error(`Scribe create campaign failed: ${JSON.stringify(result)}`);
    }
    
    console.log('Campaign ID created:', result.data.id);
    return result.data.id;
    
  } catch (error) {
    console.error('createScribeDraftCampaign error:', error.message);
    throw error;
  }
}

/**
 * Add campaign details (message, ZIP, return address) to Scribe
 */
async function addScribeCampaignDetails(campaignId, message, textType, zipBuffer, returnAddress) {
  const url = `${SCRIBE_API_BASE_URL}/api/add-campaign-v2`;
  
  console.log('=== ADD CAMPAIGN DETAILS ===');
  console.log('URL:', url);
  console.log('Campaign ID:', campaignId);
  console.log('Message length:', message?.length);
  console.log('Text type:', textType);
  console.log('ZIP size:', zipBuffer?.byteLength);
  console.log('Return address:', returnAddress ? JSON.stringify(returnAddress) : 'none');
  
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
    console.log('Scribe return address:', JSON.stringify(scribeReturnAddress));
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SCRIBE_API_TOKEN}`
      },
      body: formData
    });
    
    console.log('Response status:', response.status);
    
    const responseText = await response.text();
    console.log('Response body (first 500 chars):', responseText.substring(0, 500));
    
    if (!response.ok) {
      throw new Error(`Scribe add details error: ${response.status} - ${responseText.substring(0, 200)}`);
    }
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Scribe returned non-JSON: ${responseText.substring(0, 200)}`);
    }
    
    if (!result.success) {
      throw new Error(`Scribe add details failed: ${JSON.stringify(result)}`);
    }
    
    console.log('Campaign details added successfully');
    return result;
    
  } catch (error) {
    console.error('addScribeCampaignDetails error:', error.message);
    throw error;
  }
}

/**
 * Add contacts to a Scribe campaign in bulk
 */
async function addScribeContacts(campaignId, contacts) {
  const url = `${SCRIBE_API_BASE_URL}/api/add-contacts-bulk`;
  
  console.log('=== ADD SCRIBE CONTACTS ===');
  console.log('URL:', url);
  console.log('Campaign ID:', campaignId);
  console.log('Contact count:', contacts.length);
  
  try {
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
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body (first 500 chars):', responseText.substring(0, 500));
    
    if (!response.ok) {
      throw new Error(`Scribe add contacts error: ${response.status} - ${responseText.substring(0, 200)}`);
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
    
    console.log('Contacts added successfully');
    return result;
    
  } catch (error) {
    console.error('addScribeContacts error:', error.message);
    throw error;
  }
}

/**
 * Submit a Scribe campaign for processing
 */
async function submitScribeCampaign(campaignId) {
  const url = `${SCRIBE_API_BASE_URL}/api/v1/campaign/send`;
  
  console.log('=== SUBMIT SCRIBE CAMPAIGN ===');
  console.log('URL:', url);
  console.log('Campaign ID:', campaignId);
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${SCRIBE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ campaign_id: campaignId })
    });
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body (first 500 chars):', responseText.substring(0, 500));
    
    if (!response.ok) {
      throw new Error(`Scribe submit error: ${response.status} - ${responseText.substring(0, 200)}`);
    }
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Scribe returned non-JSON: ${responseText.substring(0, 200)}`);
    }
    
    console.log('Campaign submitted successfully');
    return result;
    
  } catch (error) {
    console.error('submitScribeCampaign error:', error.message);
    throw error;
  }
}

/**
 * Fetch ZIP file from private storage
 */
async function fetchZipFromStorage(base44, fileUri) {
  console.log('=== FETCH ZIP FROM STORAGE ===');
  console.log('File URI:', fileUri);
  
  try {
    const signedUrlResult = await base44.integrations.Core.CreateFileSignedUrl({
      file_uri: fileUri
    });
    console.log('Signed URL generated');
    
    const response = await fetch(signedUrlResult.signed_url);
    console.log('ZIP fetch response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ZIP: ${response.status} - ${await response.text()}`);
    }
    
    const buffer = await response.arrayBuffer();
    console.log(`ZIP fetched successfully, size: ${buffer.byteLength} bytes`);
    return buffer;
    
  } catch (error) {
    console.error('fetchZipFromStorage error:', error.message);
    throw error;
  }
}

// ============================================================
// MAIN HANDLER
// ============================================================

Deno.serve(async (req) => {
  console.log('=== SCRIBE CONFIG ===');
  console.log('SCRIBE_API_BASE_URL:', SCRIBE_API_BASE_URL);
  console.log('SCRIBE_API_TOKEN set:', !!SCRIBE_API_TOKEN);
  console.log('Token preview:', SCRIBE_API_TOKEN ? SCRIBE_API_TOKEN.substring(0, 8) + '...' : 'NOT SET');
  
  try {
    const base44 = createClientFromRequest(req);
    
    // Parse request body
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
    
    // Check if user has admin privileges (super_admin role OR organization_owner/admin appRole)
    const isAdmin = adminUser.role === 'admin' || 
                    ['super_admin', 'organization_admin', 'organization_owner'].includes(adminUser.appRole);
    
    if (!isAdmin) {
      return Response.json({ success: false, error: 'Unauthorized - admin access required' }, { status: 403 });
    }
    
    console.log(`Admin ${adminUser.email} approving batch ${mailingBatchId}`);
    
    // Load batch
    const batchList = await base44.entities.MailingBatch.filter({ id: mailingBatchId });
    if (!batchList || batchList.length === 0) {
      return Response.json({ success: false, error: 'Batch not found' }, { status: 404 });
    }
    
    const batch = batchList[0];
    
    // Verify status
    if (batch.status !== 'pending_review') {
      return Response.json({ 
        success: false, 
        error: `Batch status is "${batch.status}", expected "pending_review"` 
      }, { status: 400 });
    }
    
    // Update status to show we're processing
    await base44.entities.MailingBatch.update(mailingBatchId, {
      status: 'sending'
    });
    
    // Load the sender user (who created the batch)
    let senderUser = null;
    if (batch.userId) {
      const userList = await base44.entities.User.filter({ id: batch.userId });
      if (userList?.length > 0) senderUser = userList[0];
    }
    
    // Load organization
    let organization = null;
    if (batch.organizationId) {
      const orgList = await base44.entities.Organization.filter({ id: batch.organizationId });
      if (orgList?.length > 0) organization = orgList[0];
    }
    
    // Load all notes for this batch
    const notes = await base44.entities.Note.filter({ mailingBatchId });
    
    if (!notes || notes.length === 0) {
      await base44.entities.MailingBatch.update(mailingBatchId, { status: 'failed' });
      return Response.json({ success: false, error: 'No notes found for this batch' }, { status: 400 });
    }
    
    console.log(`Processing ${notes.length} notes`);
    
    // Load clients
    const clientIds = [...new Set(notes.map(n => n.clientId).filter(Boolean))];
    const clientList = clientIds.length > 0 
      ? await base44.entities.Client.filter({ id: { $in: clientIds } })
      : [];
    const clientMap = {};
    clientList.forEach(c => { clientMap[c.id] = c; });
    
    // Load card designs
    const designIds = [...new Set(notes.map(n => n.cardDesignId).filter(Boolean))];
    const designList = designIds.length > 0
      ? await base44.entities.CardDesign.filter({ id: { $in: designIds } })
      : [];
    const cardDesignMap = {};
    designList.forEach(d => { cardDesignMap[d.id] = d; });
    
    // Load mailings
    const mailingList = await base44.entities.Mailing.filter({ mailingBatchId });
    const mailingMap = {};
    mailingList.forEach(m => { mailingMap[m.noteId] = m; });
    
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
        processingErrors.push({
          clientId: note.clientId,
          error: 'Client not found',
          timestamp: new Date().toISOString()
        });
        continue;
      }
      
      if (!cardDesign?.scribeZipUrl) {
        processingErrors.push({
          clientId: note.clientId,
          error: 'Card design missing scribeZipUrl',
          timestamp: new Date().toISOString()
        });
        continue;
      }
      
      // Get the Scribe-formatted message
      const scribeMessage = note.messageTemplate || mapToScribePlaceholders(
        resolveSenderPlaceholders(note.message, senderUser, organization)
      );
      
      // Get return address
      const returnAddressMode = note.returnAddressMode || batch.returnAddressModeGlobal || 'company';
      const returnAddress = resolveReturnAddress(returnAddressMode, senderUser, organization);
      
      // Create group key
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
      
      campaignGroups.get(groupKey).recipients.push({
        clientId: note.clientId,
        client,
        noteId: note.id
      });
      notesByGroupKey.get(groupKey).push(note);
    }
    
    console.log(`Created ${campaignGroups.size} campaign groups`);
    
    // ============================================================
    // PROCESS EACH CAMPAIGN GROUP
    // ============================================================
    
    const scribeCampaigns = [];
    
    for (const [groupKey, group] of campaignGroups) {
      let scribeCampaignId = null;
      
      try {
        console.log(`Creating Scribe campaign for group ${groupKey} with ${group.recipients.length} recipients`);
        
        // 1. Create draft campaign
        scribeCampaignId = await createScribeDraftCampaign();
        console.log(`Created draft campaign: ${scribeCampaignId}`);
        
        // 2. Fetch ZIP from storage
        const zipBuffer = await fetchZipFromStorage(base44, group.cardDesign.scribeZipUrl);
        console.log(`Fetched ZIP: ${zipBuffer.byteLength} bytes`);
        
        // 3. Add campaign details with ZIP
        await addScribeCampaignDetails(
          scribeCampaignId,
          group.scribeMessage,
          group.textType,
          zipBuffer,
          group.returnAddress
        );
        console.log(`Added campaign details`);
        
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
        console.log(`Added ${contacts.length} contacts`);
        
        // 6. Submit campaign
        await submitScribeCampaign(scribeCampaignId);
        console.log(`Submitted campaign ${scribeCampaignId}`);
        
        // 7. Update Notes with scribeCampaignId
        for (const note of notesByGroupKey.get(groupKey)) {
          await base44.entities.Note.update(note.id, { 
            scribeCampaignId: String(scribeCampaignId),
            status: 'sent'
          });
        }
        
        // 8. Update Mailings with scribeCampaignId
        for (const r of group.recipients) {
          const mailing = mailingMap[r.noteId];
          if (mailing) {
            await base44.entities.Mailing.update(mailing.id, { 
              scribeCampaignId: String(scribeCampaignId),
              status: 'sent'
            });
          }
        }
        
        // Track successful campaign
        scribeCampaigns.push({
          scribeCampaignId: String(scribeCampaignId),
          campaignGroupKey: groupKey,
          cardDesignId: group.cardDesignId,
          returnAddressMode: group.returnAddressMode,
          clientIds: group.recipients.map(r => r.clientId),
          contactCount: contacts.length,
          status: 'submitted',
          scribeStatus: 'pending',
          submittedAt: new Date().toISOString()
        });
        
      } catch (error) {
        console.error(`Scribe campaign failed for group ${groupKey}:`, error);
        
        // Mark notes as failed
        for (const note of notesByGroupKey.get(groupKey) || []) {
          await base44.entities.Note.update(note.id, { status: 'failed' });
        }
        
        // Track failed campaign
        scribeCampaigns.push({
          scribeCampaignId: scribeCampaignId ? String(scribeCampaignId) : null,
          campaignGroupKey: groupKey,
          cardDesignId: group.cardDesignId,
          returnAddressMode: group.returnAddressMode,
          clientIds: group.recipients.map(r => r.clientId),
          contactCount: group.recipients.length,
          status: 'failed',
          errorMessage: error.message || 'Unknown error',
          submittedAt: new Date().toISOString()
        });
        
        // Add to processing errors
        for (const r of group.recipients) {
          processingErrors.push({
            clientId: r.clientId,
            error: `Scribe campaign failed: ${error.message}`,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    // ============================================================
    // UPDATE BATCH STATUS
    // ============================================================
    
    const successfulCampaigns = scribeCampaigns.filter(c => c.status === 'submitted').length;
    const failedCampaigns = scribeCampaigns.filter(c => c.status === 'failed').length;
    const totalContacts = scribeCampaigns.reduce((sum, c) => sum + c.contactCount, 0);
    
    const finalStatus = failedCampaigns > 0 
      ? (successfulCampaigns > 0 ? 'partial' : 'failed')
      : 'completed';
    
    await base44.entities.MailingBatch.update(mailingBatchId, {
      status: finalStatus,
      scribeCampaigns: scribeCampaigns,
      processingErrors: processingErrors.length > 0 ? processingErrors : batch.processingErrors
    });
    
    console.log(`Batch ${mailingBatchId} completed with status: ${finalStatus}`);
    
    return Response.json({
      success: true,
      status: finalStatus,
      campaignsCreated: successfulCampaigns,
      campaignsFailed: failedCampaigns,
      totalContacts: totalContacts,
      scribeCampaigns: scribeCampaigns
    });
    
  } catch (error) {
    console.error('submitBatchToScribe error:', error);
    
    // Try to update batch status to failed
    try {
      const base44 = createClientFromRequest(req);
      const body = await req.clone().json();
      if (body?.mailingBatchId) {
        await base44.entities.MailingBatch.update(body.mailingBatchId, {
          status: 'failed',
          processingErrors: [{
            error: error.message || 'Unknown error',
            timestamp: new Date().toISOString()
          }]
        });
      }
    } catch (e) {
      console.error('Failed to update batch status:', e);
    }
    
    return Response.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
});