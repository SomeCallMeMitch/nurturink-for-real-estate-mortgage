import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ============================================================
// SCRIBE RETURN ADDRESS FORMAT TESTER
// ============================================================
// The return_address is causing 500 errors. This function tests
// different formats to find what Scribe actually expects:
//
// TEST 0: No return address (baseline - should work)
// TEST 1: JSON.stringify (what we've been doing)
// TEST 2: Individual form fields (return_address[firstName], etc.)
// TEST 3: Nested form fields (return_address.firstName, etc.)
// TEST 4: Raw object (no stringify)
// TEST 5: Stringified with different field names (first_name vs firstName)
// TEST 6: Flat fields (return_firstName, return_street, etc.)
// ============================================================

const SCRIBE_API_BASE_URL = Deno.env.get('SCRIBE_API_BASE_URL') || 'https://staging.scribenurture.com';
const SCRIBE_API_TOKEN = Deno.env.get('SCRIBE_API_TOKEN');

const TEST_MESSAGE = 'Dear {FIRST_NAME},\n\nThis is a return address format test.\n\nSincerely,\nTest';
const TEST_CONTACT = { first_name: 'Test', last_name: 'Person', street: '123 Test St', city: 'TestCity', state: 'CA', zip: '90210' };

const RETURN_ADDRESS_DATA = {
  firstName: 'Test Company',
  lastName: '',
  street: '123 Business Lane',
  city: 'Denver',
  state: 'CO',
  zip: '80202'
};

async function fetchZip(base44, zipFileUri) {
  console.log('[Storage] Fetching ZIP:', zipFileUri);
  const signedUrlResult = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: zipFileUri });
  const response = await fetch(signedUrlResult.signed_url);
  if (!response.ok) throw new Error(`ZIP fetch failed: ${response.status}`);
  const buffer = await response.arrayBuffer();
  console.log('[Storage] ZIP size:', buffer.byteLength, 'bytes');
  return buffer;
}

async function addContacts(campaignId) {
  const url = `${SCRIBE_API_BASE_URL}/api/add-contacts-bulk`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SCRIBE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ campaign_id: campaignId, contacts: [TEST_CONTACT] })
  });
  const responseText = await response.text();
  if (!response.ok) throw new Error(`addContacts failed: ${response.status}`);
  return JSON.parse(responseText);
}

async function submitCampaign(campaignId) {
  const url = `${SCRIBE_API_BASE_URL}/api/v1/campaign/send`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${SCRIBE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ campaign_id: campaignId })
  });
  const responseText = await response.text();
  // 402 is expected (no credits)
  if (response.status === 402) {
    return { status: 'needs_credits', code: 402 };
  }
  if (!response.ok) throw new Error(`submit failed: ${response.status} - ${responseText}`);
  return JSON.parse(responseText);
}

// ============================================================
// FORMAT TESTS
// ============================================================

async function testFormat0(zipBuffer) {
  console.log('\n========================================');
  console.log('FORMAT 0: NO RETURN ADDRESS (baseline)');
  console.log('========================================');
  
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  // NO return_address
  
  console.log('[API] FormData fields: message, text_type, campaign_type, attachment');
  console.log('[API] return_address: NONE');
  
  return await sendRequest(formData);
}

async function testFormat1(zipBuffer) {
  console.log('\n========================================');
  console.log('FORMAT 1: JSON.stringify (current approach)');
  console.log('========================================');
  
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  formData.append('return_address', JSON.stringify(RETURN_ADDRESS_DATA));
  
  console.log('[API] return_address:', JSON.stringify(RETURN_ADDRESS_DATA));
  
  return await sendRequest(formData);
}

async function testFormat2(zipBuffer) {
  console.log('\n========================================');
  console.log('FORMAT 2: Array-style form fields');
  console.log('========================================');
  console.log('Using: return_address[firstName], return_address[street], etc.');
  
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  
  // PHP-style array notation
  formData.append('return_address[firstName]', RETURN_ADDRESS_DATA.firstName);
  formData.append('return_address[lastName]', RETURN_ADDRESS_DATA.lastName);
  formData.append('return_address[street]', RETURN_ADDRESS_DATA.street);
  formData.append('return_address[city]', RETURN_ADDRESS_DATA.city);
  formData.append('return_address[state]', RETURN_ADDRESS_DATA.state);
  formData.append('return_address[zip]', RETURN_ADDRESS_DATA.zip);
  
  console.log('[API] return_address[firstName]:', RETURN_ADDRESS_DATA.firstName);
  console.log('[API] return_address[street]:', RETURN_ADDRESS_DATA.street);
  
  return await sendRequest(formData);
}

async function testFormat3(zipBuffer) {
  console.log('\n========================================');
  console.log('FORMAT 3: Dot notation form fields');
  console.log('========================================');
  console.log('Using: return_address.firstName, return_address.street, etc.');
  
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  
  // Dot notation
  formData.append('return_address.firstName', RETURN_ADDRESS_DATA.firstName);
  formData.append('return_address.lastName', RETURN_ADDRESS_DATA.lastName);
  formData.append('return_address.street', RETURN_ADDRESS_DATA.street);
  formData.append('return_address.city', RETURN_ADDRESS_DATA.city);
  formData.append('return_address.state', RETURN_ADDRESS_DATA.state);
  formData.append('return_address.zip', RETURN_ADDRESS_DATA.zip);
  
  return await sendRequest(formData);
}

async function testFormat4(zipBuffer) {
  console.log('\n========================================');
  console.log('FORMAT 4: snake_case field names in JSON');
  console.log('========================================');
  console.log('Using: first_name, last_name instead of firstName, lastName');
  
  const snakeCaseAddress = {
    first_name: RETURN_ADDRESS_DATA.firstName,
    last_name: RETURN_ADDRESS_DATA.lastName,
    street: RETURN_ADDRESS_DATA.street,
    city: RETURN_ADDRESS_DATA.city,
    state: RETURN_ADDRESS_DATA.state,
    zip: RETURN_ADDRESS_DATA.zip
  };
  
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  formData.append('return_address', JSON.stringify(snakeCaseAddress));
  
  console.log('[API] return_address:', JSON.stringify(snakeCaseAddress));
  
  return await sendRequest(formData);
}

async function testFormat5(zipBuffer) {
  console.log('\n========================================');
  console.log('FORMAT 5: snake_case array-style fields');
  console.log('========================================');
  console.log('Using: return_address[first_name], return_address[last_name], etc.');
  
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  
  // PHP-style array notation with snake_case
  formData.append('return_address[first_name]', RETURN_ADDRESS_DATA.firstName);
  formData.append('return_address[last_name]', RETURN_ADDRESS_DATA.lastName);
  formData.append('return_address[street]', RETURN_ADDRESS_DATA.street);
  formData.append('return_address[city]', RETURN_ADDRESS_DATA.city);
  formData.append('return_address[state]', RETURN_ADDRESS_DATA.state);
  formData.append('return_address[zip]', RETURN_ADDRESS_DATA.zip);
  
  return await sendRequest(formData);
}

async function testFormat6(zipBuffer) {
  console.log('\n========================================');
  console.log('FORMAT 6: Flat prefixed fields');
  console.log('========================================');
  console.log('Using: return_first_name, return_street, etc. (no nesting)');
  
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  
  // Flat fields with return_ prefix
  formData.append('return_first_name', RETURN_ADDRESS_DATA.firstName);
  formData.append('return_last_name', RETURN_ADDRESS_DATA.lastName);
  formData.append('return_street', RETURN_ADDRESS_DATA.street);
  formData.append('return_city', RETURN_ADDRESS_DATA.city);
  formData.append('return_state', RETURN_ADDRESS_DATA.state);
  formData.append('return_zip', RETURN_ADDRESS_DATA.zip);
  
  return await sendRequest(formData);
}

async function testFormat7(zipBuffer) {
  console.log('\n========================================');
  console.log('FORMAT 7: "name" field instead of firstName/lastName');
  console.log('========================================');
  console.log('Using: { name, street, city, state, zip }');
  
  const nameAddress = {
    name: RETURN_ADDRESS_DATA.firstName,
    street: RETURN_ADDRESS_DATA.street,
    city: RETURN_ADDRESS_DATA.city,
    state: RETURN_ADDRESS_DATA.state,
    zip: RETURN_ADDRESS_DATA.zip
  };
  
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  formData.append('return_address', JSON.stringify(nameAddress));
  
  console.log('[API] return_address:', JSON.stringify(nameAddress));
  
  return await sendRequest(formData);
}

async function testFormat8(zipBuffer) {
  console.log('\n========================================');
  console.log('FORMAT 8: "address" field instead of "street"');
  console.log('========================================');
  console.log('Using: { firstName, lastName, address, city, state, zip }');
  
  const addressField = {
    firstName: RETURN_ADDRESS_DATA.firstName,
    lastName: RETURN_ADDRESS_DATA.lastName,
    address: RETURN_ADDRESS_DATA.street,  // "address" instead of "street"
    city: RETURN_ADDRESS_DATA.city,
    state: RETURN_ADDRESS_DATA.state,
    zip: RETURN_ADDRESS_DATA.zip
  };
  
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  formData.append('return_address', JSON.stringify(addressField));
  
  console.log('[API] return_address:', JSON.stringify(addressField));
  
  return await sendRequest(formData);
}

async function sendRequest(formData) {
  const url = `${SCRIBE_API_BASE_URL}/api/add-campaign-v2`;
  console.log('[API] POST', url);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SCRIBE_API_TOKEN}` },
    body: formData
  });
  
  const responseText = await response.text();
  console.log('[API] Response status:', response.status);
  console.log('[API] Response body:', responseText.substring(0, 400));
  
  return {
    status: response.status,
    ok: response.ok,
    body: responseText,
    parsed: tryParse(responseText)
  };
}

function tryParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ============================================================
// MAIN HANDLER
// ============================================================

Deno.serve(async (req) => {
  console.log('===========================================');
  console.log('=== RETURN ADDRESS FORMAT TESTER ===');
  console.log('===========================================');
  
  if (!SCRIBE_API_TOKEN) {
    return Response.json({ success: false, error: 'SCRIBE_API_TOKEN not configured' }, { status: 500 });
  }
  
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const testNumber = body.test ?? 0;
    const zipFileUri = body.zipFileUri || 'private/6904f5f71cd5472b438c99c9/6a6a41fd8_card-design-695362e7e1883c5292c02d60.zip';
    const fullTest = body.fullTest || false; // If true, also add contacts and submit
    
    console.log('Test requested:', testNumber);
    console.log('Full test (add contacts + submit):', fullTest);
    
    const zipBuffer = await fetchZip(base44, zipFileUri);
    
    let result;
    switch (testNumber) {
      case 0: result = await testFormat0(zipBuffer); break;
      case 1: result = await testFormat1(zipBuffer); break;
      case 2: result = await testFormat2(zipBuffer); break;
      case 3: result = await testFormat3(zipBuffer); break;
      case 4: result = await testFormat4(zipBuffer); break;
      case 5: result = await testFormat5(zipBuffer); break;
      case 6: result = await testFormat6(zipBuffer); break;
      case 7: result = await testFormat7(zipBuffer); break;
      case 8: result = await testFormat8(zipBuffer); break;
      default:
        return Response.json({ 
          success: false, 
          error: `Unknown test: ${testNumber}`,
          availableTests: {
            0: 'No return address (baseline)',
            1: 'JSON.stringify with camelCase',
            2: 'Array notation: return_address[firstName]',
            3: 'Dot notation: return_address.firstName',
            4: 'JSON.stringify with snake_case',
            5: 'Array notation with snake_case: return_address[first_name]',
            6: 'Flat fields: return_first_name, return_street',
            7: 'JSON with "name" instead of firstName/lastName',
            8: 'JSON with "address" instead of "street"'
          }
        }, { status: 400 });
    }
    
    // Determine success
    const campaignCreated = result.ok && result.parsed?.success;
    const campaignId = result.parsed?.data?.campaign_id || result.parsed?.data?.id;
    
    let contactsAdded = false;
    let submitResult = null;
    
    // If campaign created successfully and fullTest requested, continue
    if (campaignCreated && campaignId && fullTest) {
      console.log('\n--- Adding contact ---');
      try {
        await addContacts(campaignId);
        contactsAdded = true;
        console.log('✅ Contact added');
        
        console.log('\n--- Submitting ---');
        submitResult = await submitCampaign(campaignId);
        console.log('✅ Submit result:', submitResult.status || 'submitted');
      } catch (e) {
        console.error('Post-creation error:', e.message);
      }
    }
    
    console.log('\n===========================================');
    console.log('TEST COMPLETE');
    console.log('===========================================');
    
    return Response.json({
      test: testNumber,
      formatDescription: getFormatDescription(testNumber),
      campaignCreated,
      campaignId: campaignId || null,
      httpStatus: result.status,
      error: !result.ok ? result.parsed?.message || result.body.substring(0, 200) : null,
      fullTest: fullTest ? { contactsAdded, submitResult } : null,
      rawResponse: result.parsed
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});

function getFormatDescription(test) {
  const descriptions = {
    0: 'No return address (baseline)',
    1: 'JSON.stringify with camelCase (firstName, lastName, street)',
    2: 'Array notation: return_address[firstName], return_address[street]',
    3: 'Dot notation: return_address.firstName, return_address.street',
    4: 'JSON.stringify with snake_case (first_name, last_name)',
    5: 'Array notation with snake_case: return_address[first_name]',
    6: 'Flat fields: return_first_name, return_street',
    7: 'JSON with "name" field instead of firstName/lastName',
    8: 'JSON with "address" field instead of "street"'
  };
  return descriptions[test] || 'Unknown';
}