import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ============================================================
// MINIMAL SCRIBE TEST - PROVE THE API WORKS
// ============================================================
// This function uses the SIMPLEST possible workflow:
// 1. POST /api/add-campaign-v2 - Creates campaign WITH message/design in one step
// 2. POST /api/add-contacts-bulk - Adds ONE test contact
// 3. PUT /api/v1/campaign/send - Submits
//
// NO create-campaign-id-v2 (that was causing the split campaign issue)
// NO return_address (eliminate variables)
// ONE hardcoded test contact
// ============================================================

const SCRIBE_API_BASE_URL = Deno.env.get('SCRIBE_API_BASE_URL') || 'https://staging.scribenurture.com';
const SCRIBE_API_TOKEN = Deno.env.get('SCRIBE_API_TOKEN');

Deno.serve(async (req) => {
  console.log('===========================================');
  console.log('=== SCRIBE MINIMAL TEST - SIMPLE WORKFLOW ===');
  console.log('===========================================');
  console.log('SCRIBE_API_BASE_URL:', SCRIBE_API_BASE_URL);
  console.log('SCRIBE_API_TOKEN set:', !!SCRIBE_API_TOKEN);
  
  if (!SCRIBE_API_TOKEN) {
    return Response.json({ success: false, error: 'SCRIBE_API_TOKEN not configured' }, { status: 500 });
  }
  
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    // Get the ZIP file URL from request, or use the one from the last test
    const zipFileUri = body.zipFileUri || 'private/6904f5f71cd5472b438c99c9/6a6a41fd8_card-design-695362e7e1883c5292c02d60.zip';
    
    // Use test contact data or provided data
    const testContact = body.contact || {
      first_name: 'Test',
      last_name: 'Person',
      street: '123 Test Street',
      city: 'TestCity',
      state: 'CA',
      zip: '90210'
    };
    
    const testMessage = body.message || 'Dear {FIRST_NAME},\n\nThis is a minimal test message to verify the Scribe API is working.\n\nSincerely,\nTest';
    
    console.log('\n--- TEST PARAMETERS ---');
    console.log('ZIP URI:', zipFileUri);
    console.log('Contact:', JSON.stringify(testContact));
    console.log('Message:', testMessage.substring(0, 100) + '...');
    
    // ========================================
    // STEP 1: Fetch the ZIP file
    // ========================================
    console.log('\n--- STEP 1: FETCH ZIP ---');
    let zipBuffer;
    try {
      const signedUrlResult = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: zipFileUri });
      console.log('Signed URL obtained');
      
      const zipResponse = await fetch(signedUrlResult.signed_url);
      if (!zipResponse.ok) {
        throw new Error(`ZIP fetch failed: ${zipResponse.status}`);
      }
      zipBuffer = await zipResponse.arrayBuffer();
      console.log('ZIP fetched:', zipBuffer.byteLength, 'bytes');
    } catch (e) {
      console.error('ZIP fetch error:', e.message);
      return Response.json({ success: false, error: `ZIP fetch failed: ${e.message}`, step: 1 }, { status: 500 });
    }
    
    // ========================================
    // STEP 2: Create campaign with add-campaign-v2 (SKIP create-campaign-id-v2)
    // ========================================
    console.log('\n--- STEP 2: CREATE CAMPAIGN (add-campaign-v2) ---');
    let campaignId;
    try {
      const formData = new FormData();
      formData.append('message', testMessage);
      formData.append('text_type', 'Short Text');
      formData.append('campaign_type', 'one-time');
      formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
      // NO return_address - keeping it minimal
      // NO campaign_id - let Scribe create a new one
      
      const url = `${SCRIBE_API_BASE_URL}/api/add-campaign-v2`;
      console.log('URL:', url);
      console.log('FormData fields: message, text_type, campaign_type, attachment');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SCRIBE_API_TOKEN}`
        },
        body: formData
      });
      
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response body:', responseText.substring(0, 500));
      
      if (!response.ok) {
        throw new Error(`add-campaign-v2 failed: ${response.status} - ${responseText}`);
      }
      
      const result = JSON.parse(responseText);
      if (!result.success) {
        throw new Error(`add-campaign-v2 not successful: ${JSON.stringify(result)}`);
      }
      
      // Get the campaign ID from the response
      campaignId = result.data?.campaign_id || result.data?.id;
      if (!campaignId) {
        throw new Error(`No campaign_id in response: ${JSON.stringify(result)}`);
      }
      
      console.log('✅ Campaign created:', campaignId);
      
    } catch (e) {
      console.error('Campaign creation error:', e.message);
      return Response.json({ success: false, error: e.message, step: 2 }, { status: 500 });
    }
    
    // ========================================
    // STEP 3: Add the test contact
    // ========================================
    console.log('\n--- STEP 3: ADD CONTACT ---');
    try {
      const url = `${SCRIBE_API_BASE_URL}/api/add-contacts-bulk`;
      console.log('URL:', url);
      console.log('Campaign ID:', campaignId);
      console.log('Adding 1 contact');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SCRIBE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          contacts: [testContact]
        })
      });
      
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response body:', responseText.substring(0, 500));
      
      if (!response.ok) {
        throw new Error(`add-contacts-bulk failed: ${response.status} - ${responseText}`);
      }
      
      const result = JSON.parse(responseText);
      if (!result.success) {
        throw new Error(`add-contacts-bulk not successful: ${JSON.stringify(result)}`);
      }
      
      console.log('✅ Contact added');
      
    } catch (e) {
      console.error('Add contact error:', e.message);
      return Response.json({ success: false, error: e.message, step: 3, campaignId }, { status: 500 });
    }
    
    // ========================================
    // STEP 4: Submit the campaign
    // ========================================
    console.log('\n--- STEP 4: SUBMIT CAMPAIGN ---');
    try {
      const url = `${SCRIBE_API_BASE_URL}/api/v1/campaign/send`;
      console.log('URL:', url);
      console.log('Campaign ID:', campaignId);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${SCRIBE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ campaign_id: campaignId })
      });
      
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response body:', responseText.substring(0, 500));
      
      if (!response.ok) {
        throw new Error(`campaign/send failed: ${response.status} - ${responseText}`);
      }
      
      const result = JSON.parse(responseText);
      console.log('✅ Campaign submitted!');
      
      // ========================================
      // SUCCESS!
      // ========================================
      console.log('\n===========================================');
      console.log('🎉 SUCCESS! MINIMAL TEST PASSED!');
      console.log('Campaign ID:', campaignId);
      console.log('===========================================');
      
      return Response.json({
        success: true,
        message: 'Minimal test PASSED! The API workflow works.',
        campaignId: campaignId,
        workflow: 'add-campaign-v2 → add-contacts-bulk → campaign/send',
        note: 'Now we know the correct workflow. The issue was using create-campaign-id-v2 first.'
      });
      
    } catch (e) {
      console.error('Submit error:', e.message);
      return Response.json({ success: false, error: e.message, step: 4, campaignId }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});