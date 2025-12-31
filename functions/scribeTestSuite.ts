import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ============================================================
// SCRIBE API TEST SUITE
// ============================================================
// Run different test scenarios to verify API behavior:
//
// TEST 1: Single recipient + return address
// TEST 2: Multiple recipients (3), same message/design
// TEST 3: Two separate campaigns (different messages)
// TEST 4: Return address edge cases
//
// Call with: { "test": 1 } through { "test": 4 }
// Or { "test": "custom", ...params } for custom tests
// ============================================================

const SCRIBE_API_BASE_URL = Deno.env.get('SCRIBE_API_BASE_URL') || 'https://staging.scribenurture.com';
const SCRIBE_API_TOKEN = Deno.env.get('SCRIBE_API_TOKEN');

// ============================================================
// TEST DATA
// ============================================================

const TEST_CONTACTS = [
  { first_name: 'Alice', last_name: 'Anderson', street: '100 First Ave', city: 'Austin', state: 'TX', zip: '78701' },
  { first_name: 'Bob', last_name: 'Baker', street: '200 Second St', city: 'Boston', state: 'MA', zip: '02101' },
  { first_name: 'Carol', last_name: 'Chen', street: '300 Third Blvd', city: 'Chicago', state: 'IL', zip: '60601' },
];

const TEST_RETURN_ADDRESSES = {
  simple: {
    firstName: 'Test Company',
    lastName: '',
    street: '123 Business Lane',
    city: 'Denver',
    state: 'CO',
    zip: '80202'
  },
  withSpecialChars: {
    firstName: "Tom's Roofing & Sons",
    lastName: '',
    street: '456 O\'Brien Way',
    city: 'San José',
    state: 'CA',
    zip: '95101'
  },
  full: {
    firstName: 'John',
    lastName: 'Smith',
    street: '789 Complete Address',
    city: 'Seattle',
    state: 'WA',
    zip: '98101'
  }
};

const TEST_MESSAGES = {
  short: 'Dear {FIRST_NAME},\n\nThank you for your business!\n\nSincerely,\nTest Team',
  medium: 'Dear {FIRST_NAME},\n\nThank you for letting us help with your roof after the storm. I know how stressful this process can be, and I am glad we could make it a little easier.\n\nIf you know anyone else going through the same thing, I would be grateful if you mentioned us.\n\nSincerely,\nTest Team',
  withPlaceholders: 'Dear {FIRST_NAME} {LAST_NAME},\n\nWe hope you are enjoying your new roof at {STREET_ADDRESS}, {CITY}, {STATE}.\n\nBest regards,\nTest Team'
};

// ============================================================
// API HELPER FUNCTIONS
// ============================================================

async function createCampaign(message, textType, zipBuffer, returnAddress = null) {
  const url = `${SCRIBE_API_BASE_URL}/api/add-campaign-v2`;
  
  const formData = new FormData();
  formData.append('message', message);
  formData.append('text_type', textType);
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  
  if (returnAddress) {
    formData.append('return_address', JSON.stringify(returnAddress));
    console.log('[API] Including return_address:', JSON.stringify(returnAddress));
  } else {
    console.log('[API] No return_address');
  }
  
  console.log('[API] POST', url);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SCRIBE_API_TOKEN}` },
    body: formData
  });
  
  const responseText = await response.text();
  console.log('[API] Response:', response.status, responseText.substring(0, 300));
  
  if (!response.ok) {
    throw new Error(`createCampaign failed: ${response.status} - ${responseText}`);
  }
  
  const result = JSON.parse(responseText);
  if (!result.success) {
    throw new Error(`createCampaign unsuccessful: ${JSON.stringify(result)}`);
  }
  
  return result.data?.campaign_id || result.data?.id;
}

async function addContacts(campaignId, contacts) {
  const url = `${SCRIBE_API_BASE_URL}/api/add-contacts-bulk`;
  
  console.log('[API] POST', url);
  console.log('[API] Campaign:', campaignId, '| Contacts:', contacts.length);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SCRIBE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ campaign_id: campaignId, contacts })
  });
  
  const responseText = await response.text();
  console.log('[API] Response:', response.status, responseText.substring(0, 300));
  
  if (!response.ok) {
    throw new Error(`addContacts failed: ${response.status} - ${responseText}`);
  }
  
  const result = JSON.parse(responseText);
  if (!result.success) {
    throw new Error(`addContacts unsuccessful: ${JSON.stringify(result)}`);
  }
  
  return result;
}

async function submitCampaign(campaignId) {
  const url = `${SCRIBE_API_BASE_URL}/api/v1/campaign/send`;
  
  console.log('[API] PUT', url);
  console.log('[API] Campaign:', campaignId);
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${SCRIBE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ campaign_id: campaignId })
  });
  
  const responseText = await response.text();
  console.log('[API] Response:', response.status, responseText.substring(0, 300));
  
  // 402 = insufficient funds (expected on staging without credits)
  if (response.status === 402) {
    console.log('[API] ⚠️ 402 Insufficient funds - this is expected on staging without credits');
    return { success: true, status: 'needs_credits', message: responseText };
  }
  
  if (!response.ok) {
    throw new Error(`submitCampaign failed: ${response.status} - ${responseText}`);
  }
  
  return JSON.parse(responseText);
}

async function fetchZip(base44, zipFileUri) {
  console.log('[Storage] Fetching ZIP:', zipFileUri);
  const signedUrlResult = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: zipFileUri });
  const response = await fetch(signedUrlResult.signed_url);
  if (!response.ok) throw new Error(`ZIP fetch failed: ${response.status}`);
  const buffer = await response.arrayBuffer();
  console.log('[Storage] ZIP size:', buffer.byteLength, 'bytes');
  return buffer;
}

// ============================================================
// TEST SCENARIOS
// ============================================================

async function runTest1(base44, zipBuffer) {
  console.log('\n========================================');
  console.log('TEST 1: Single recipient WITH return address');
  console.log('========================================');
  console.log('Purpose: Verify return_address works (this was causing 500 errors before)');
  
  const campaignId = await createCampaign(
    TEST_MESSAGES.short,
    'Short Text',
    zipBuffer,
    TEST_RETURN_ADDRESSES.simple  // <-- Testing return address
  );
  console.log('✅ Campaign created:', campaignId);
  
  await addContacts(campaignId, [TEST_CONTACTS[0]]);
  console.log('✅ Contact added');
  
  const submitResult = await submitCampaign(campaignId);
  console.log('✅ Submit attempted:', submitResult.status || 'submitted');
  
  return { 
    test: 1, 
    success: true, 
    campaignId,
    description: 'Single recipient + return address',
    returnAddressUsed: TEST_RETURN_ADDRESSES.simple
  };
}

async function runTest2(base44, zipBuffer) {
  console.log('\n========================================');
  console.log('TEST 2: Multiple recipients (3), same message');
  console.log('========================================');
  console.log('Purpose: Verify bulk contacts work in one campaign');
  
  const campaignId = await createCampaign(
    TEST_MESSAGES.medium,
    'Short Text',
    zipBuffer,
    TEST_RETURN_ADDRESSES.simple
  );
  console.log('✅ Campaign created:', campaignId);
  
  // Add all 3 contacts at once
  await addContacts(campaignId, TEST_CONTACTS);
  console.log('✅ All 3 contacts added');
  
  const submitResult = await submitCampaign(campaignId);
  console.log('✅ Submit attempted:', submitResult.status || 'submitted');
  
  return { 
    test: 2, 
    success: true, 
    campaignId,
    description: '3 recipients, same message/design',
    contactCount: 3
  };
}

async function runTest3(base44, zipBuffer) {
  console.log('\n========================================');
  console.log('TEST 3: Two separate campaigns (different messages)');
  console.log('========================================');
  console.log('Purpose: Verify we can create multiple campaigns correctly');
  
  // Campaign A: Short message, 1 contact
  console.log('\n--- Campaign A ---');
  const campaignIdA = await createCampaign(
    TEST_MESSAGES.short,
    'Short Text',
    zipBuffer,
    TEST_RETURN_ADDRESSES.simple
  );
  console.log('✅ Campaign A created:', campaignIdA);
  
  await addContacts(campaignIdA, [TEST_CONTACTS[0]]);
  console.log('✅ Contact added to Campaign A');
  
  // Campaign B: Medium message, 2 contacts
  console.log('\n--- Campaign B ---');
  const campaignIdB = await createCampaign(
    TEST_MESSAGES.medium,
    'Short Text',
    zipBuffer,
    TEST_RETURN_ADDRESSES.simple
  );
  console.log('✅ Campaign B created:', campaignIdB);
  
  await addContacts(campaignIdB, [TEST_CONTACTS[1], TEST_CONTACTS[2]]);
  console.log('✅ 2 contacts added to Campaign B');
  
  // Submit both
  console.log('\n--- Submitting both ---');
  const submitA = await submitCampaign(campaignIdA);
  console.log('✅ Campaign A submit attempted');
  
  const submitB = await submitCampaign(campaignIdB);
  console.log('✅ Campaign B submit attempted');
  
  return { 
    test: 3, 
    success: true, 
    campaigns: [
      { id: campaignIdA, contacts: 1, message: 'short' },
      { id: campaignIdB, contacts: 2, message: 'medium' }
    ],
    description: 'Two separate campaigns with different messages'
  };
}

async function runTest4(base44, zipBuffer) {
  console.log('\n========================================');
  console.log('TEST 4: Return address edge cases');
  console.log('========================================');
  console.log('Purpose: Test return addresses with special characters');
  
  // Test with special characters (apostrophes, accents, ampersand)
  console.log('\n--- Testing special characters in return address ---');
  console.log('Return address:', JSON.stringify(TEST_RETURN_ADDRESSES.withSpecialChars));
  
  const campaignId = await createCampaign(
    TEST_MESSAGES.short,
    'Short Text',
    zipBuffer,
    TEST_RETURN_ADDRESSES.withSpecialChars  // Has apostrophe, ampersand, accented char
  );
  console.log('✅ Campaign created with special chars:', campaignId);
  
  await addContacts(campaignId, [TEST_CONTACTS[0]]);
  console.log('✅ Contact added');
  
  const submitResult = await submitCampaign(campaignId);
  console.log('✅ Submit attempted');
  
  return { 
    test: 4, 
    success: true, 
    campaignId,
    description: 'Return address with special characters (apostrophe, ampersand, accent)',
    returnAddressUsed: TEST_RETURN_ADDRESSES.withSpecialChars
  };
}

async function runTestCustom(base44, zipBuffer, params) {
  console.log('\n========================================');
  console.log('TEST CUSTOM: User-defined parameters');
  console.log('========================================');
  
  const message = params.message || TEST_MESSAGES.short;
  const contacts = params.contacts || [TEST_CONTACTS[0]];
  const returnAddress = params.returnAddress || null;
  const textType = params.textType || 'Short Text';
  
  console.log('Message:', message.substring(0, 100) + '...');
  console.log('Contacts:', contacts.length);
  console.log('Return address:', returnAddress ? 'Yes' : 'No');
  console.log('Text type:', textType);
  
  const campaignId = await createCampaign(message, textType, zipBuffer, returnAddress);
  console.log('✅ Campaign created:', campaignId);
  
  await addContacts(campaignId, contacts);
  console.log('✅ Contacts added');
  
  const submitResult = await submitCampaign(campaignId);
  console.log('✅ Submit attempted');
  
  return { 
    test: 'custom', 
    success: true, 
    campaignId,
    contactCount: contacts.length,
    hasReturnAddress: !!returnAddress
  };
}

// ============================================================
// MAIN HANDLER
// ============================================================

Deno.serve(async (req) => {
  console.log('===========================================');
  console.log('=== SCRIBE API TEST SUITE ===');
  console.log('===========================================');
  console.log('SCRIBE_API_BASE_URL:', SCRIBE_API_BASE_URL);
  console.log('SCRIBE_API_TOKEN set:', !!SCRIBE_API_TOKEN);
  
  if (!SCRIBE_API_TOKEN) {
    return Response.json({ success: false, error: 'SCRIBE_API_TOKEN not configured' }, { status: 500 });
  }
  
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const testNumber = body.test || 1;
    const zipFileUri = body.zipFileUri || 'private/6904f5f71cd5472b438c99c9/6a6a41fd8_card-design-695362e7e1883c5292c02d60.zip';
    
    console.log('\nTest requested:', testNumber);
    console.log('ZIP file:', zipFileUri);
    
    // Fetch ZIP once for all tests
    const zipBuffer = await fetchZip(base44, zipFileUri);
    
    let result;
    
    switch (testNumber) {
      case 1:
        result = await runTest1(base44, zipBuffer);
        break;
      case 2:
        result = await runTest2(base44, zipBuffer);
        break;
      case 3:
        result = await runTest3(base44, zipBuffer);
        break;
      case 4:
        result = await runTest4(base44, zipBuffer);
        break;
      case 'custom':
        result = await runTestCustom(base44, zipBuffer, body);
        break;
      default:
        return Response.json({ 
          success: false, 
          error: `Unknown test: ${testNumber}`,
          availableTests: [1, 2, 3, 4, 'custom']
        }, { status: 400 });
    }
    
    console.log('\n===========================================');
    console.log('TEST COMPLETE');
    console.log('===========================================');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    return Response.json(result);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
    
    return Response.json({ 
      success: false, 
      error: error.message,
      hint: getErrorHint(error.message)
    }, { status: 500 });
  }
});

// ============================================================
// ERROR HINTS
// ============================================================

function getErrorHint(errorMessage) {
  if (errorMessage.includes('500')) {
    if (errorMessage.includes('Cannot access offset')) {
      return 'This is usually caused by malformed return_address. Try without return_address or check the format.';
    }
    return 'Server error on Scribe side. Check if the ZIP file is valid (1375x2000 px images).';
  }
  if (errorMessage.includes('402')) {
    return 'Insufficient credits on Scribe staging account. Contact Scribe to add test credits.';
  }
  if (errorMessage.includes('422')) {
    if (errorMessage.includes('message')) {
      return 'Message field issue. The campaign may not have received the message properly.';
    }
    return 'Validation error. Check that all required fields are present.';
  }
  if (errorMessage.includes('401')) {
    return 'Authentication failed. Check SCRIBE_API_TOKEN is correct.';
  }
  if (errorMessage.includes('404')) {
    return 'Campaign or endpoint not found. Check campaign_id is valid.';
  }
  return 'Unknown error. Check the full error message in logs.';
}