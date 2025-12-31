import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ============================================================
// SCRIBE RETURN ADDRESS FORMAT TESTER
// ============================================================
// Tests different formats for the return_address field to find
// which one Scribe's PHP backend actually expects.
//
// The issue: return_address causes 500 error with message
// "Cannot access offset of type string on string"
// This means PHP is receiving a string but expects an array.
// ============================================================

const SCRIBE_API_BASE_URL = Deno.env.get('SCRIBE_API_BASE_URL') || 'https://staging.scribenurture.com';
const SCRIBE_API_TOKEN = Deno.env.get('SCRIBE_API_TOKEN');

// Test return address data
const TEST_RETURN_ADDRESS = {
  firstName: 'Test',
  lastName: 'Company',
  first_name: 'Test',
  last_name: 'Company',
  name: 'Test Company',
  street: '123 Test Lane',
  address: '123 Test Lane',
  city: 'Denver',
  state: 'CO',
  zip: '80202'
};

const TEST_MESSAGE = 'Dear {FIRST_NAME},\n\nThis is a test.\n\nSincerely,\nTest';

async function fetchZip(base44, zipFileUri) {
  console.log('[Storage] Fetching ZIP:', zipFileUri);
  const signedUrlResult = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: zipFileUri });
  const response = await fetch(signedUrlResult.signed_url);
  if (!response.ok) throw new Error(`ZIP fetch failed: ${response.status}`);
  return await response.arrayBuffer();
}

// Format 0: No return address (baseline)
function buildFormData0(zipBuffer) {
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  // NO return_address
  return { formData, description: 'No return_address field' };
}

// Format 1: JSON.stringify with camelCase
function buildFormData1(zipBuffer) {
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  formData.append('return_address', JSON.stringify({
    firstName: TEST_RETURN_ADDRESS.firstName,
    lastName: TEST_RETURN_ADDRESS.lastName,
    street: TEST_RETURN_ADDRESS.street,
    city: TEST_RETURN_ADDRESS.city,
    state: TEST_RETURN_ADDRESS.state,
    zip: TEST_RETURN_ADDRESS.zip
  }));
  return { formData, description: 'JSON.stringify camelCase' };
}

// Format 2: Array notation (PHP-style) with camelCase
function buildFormData2(zipBuffer) {
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  formData.append('return_address[firstName]', TEST_RETURN_ADDRESS.firstName);
  formData.append('return_address[lastName]', TEST_RETURN_ADDRESS.lastName);
  formData.append('return_address[street]', TEST_RETURN_ADDRESS.street);
  formData.append('return_address[city]', TEST_RETURN_ADDRESS.city);
  formData.append('return_address[state]', TEST_RETURN_ADDRESS.state);
  formData.append('return_address[zip]', TEST_RETURN_ADDRESS.zip);
  return { formData, description: 'Array notation camelCase' };
}

// Format 3: Dot notation
function buildFormData3(zipBuffer) {
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  formData.append('return_address.firstName', TEST_RETURN_ADDRESS.firstName);
  formData.append('return_address.lastName', TEST_RETURN_ADDRESS.lastName);
  formData.append('return_address.street', TEST_RETURN_ADDRESS.street);
  formData.append('return_address.city', TEST_RETURN_ADDRESS.city);
  formData.append('return_address.state', TEST_RETURN_ADDRESS.state);
  formData.append('return_address.zip', TEST_RETURN_ADDRESS.zip);
  return { formData, description: 'Dot notation' };
}

// Format 4: JSON.stringify with snake_case
function buildFormData4(zipBuffer) {
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  formData.append('return_address', JSON.stringify({
    first_name: TEST_RETURN_ADDRESS.first_name,
    last_name: TEST_RETURN_ADDRESS.last_name,
    street: TEST_RETURN_ADDRESS.street,
    city: TEST_RETURN_ADDRESS.city,
    state: TEST_RETURN_ADDRESS.state,
    zip: TEST_RETURN_ADDRESS.zip
  }));
  return { formData, description: 'JSON.stringify snake_case' };
}

// Format 5: Array notation (PHP-style) with snake_case
function buildFormData5(zipBuffer) {
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  formData.append('return_address[first_name]', TEST_RETURN_ADDRESS.first_name);
  formData.append('return_address[last_name]', TEST_RETURN_ADDRESS.last_name);
  formData.append('return_address[street]', TEST_RETURN_ADDRESS.street);
  formData.append('return_address[city]', TEST_RETURN_ADDRESS.city);
  formData.append('return_address[state]', TEST_RETURN_ADDRESS.state);
  formData.append('return_address[zip]', TEST_RETURN_ADDRESS.zip);
  return { formData, description: 'Array notation snake_case' };
}

// Format 6: Flat prefixed fields
function buildFormData6(zipBuffer) {
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  formData.append('return_first_name', TEST_RETURN_ADDRESS.firstName);
  formData.append('return_last_name', TEST_RETURN_ADDRESS.lastName);
  formData.append('return_street', TEST_RETURN_ADDRESS.street);
  formData.append('return_city', TEST_RETURN_ADDRESS.city);
  formData.append('return_state', TEST_RETURN_ADDRESS.state);
  formData.append('return_zip', TEST_RETURN_ADDRESS.zip);
  return { formData, description: 'Flat prefixed fields' };
}

// Format 7: JSON with "name" field
function buildFormData7(zipBuffer) {
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  formData.append('return_address', JSON.stringify({
    name: TEST_RETURN_ADDRESS.name,
    street: TEST_RETURN_ADDRESS.street,
    city: TEST_RETURN_ADDRESS.city,
    state: TEST_RETURN_ADDRESS.state,
    zip: TEST_RETURN_ADDRESS.zip
  }));
  return { formData, description: 'JSON with name field' };
}

// Format 8: JSON with "address" field instead of "street"
function buildFormData8(zipBuffer) {
  const formData = new FormData();
  formData.append('message', TEST_MESSAGE);
  formData.append('text_type', 'Short Text');
  formData.append('campaign_type', 'one-time');
  formData.append('attachment', new Blob([zipBuffer], { type: 'application/zip' }), 'design.zip');
  formData.append('return_address', JSON.stringify({
    firstName: TEST_RETURN_ADDRESS.firstName,
    lastName: TEST_RETURN_ADDRESS.lastName,
    address: TEST_RETURN_ADDRESS.address,
    city: TEST_RETURN_ADDRESS.city,
    state: TEST_RETURN_ADDRESS.state,
    zip: TEST_RETURN_ADDRESS.zip
  }));
  return { formData, description: 'JSON with address field' };
}

const FORMAT_BUILDERS = [
  buildFormData0,
  buildFormData1,
  buildFormData2,
  buildFormData3,
  buildFormData4,
  buildFormData5,
  buildFormData6,
  buildFormData7,
  buildFormData8
];

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
    
    const testId = body.test ?? 0;
    const zipFileUri = body.zipFileUri || 'private/6904f5f71cd5472b438c99c9/6a6a41fd8_card-design-695362e7e1883c5292c02d60.zip';
    
    console.log('\nTest format:', testId);
    
    if (testId < 0 || testId >= FORMAT_BUILDERS.length) {
      return Response.json({ 
        success: false, 
        error: `Invalid test ID: ${testId}. Valid: 0-${FORMAT_BUILDERS.length - 1}` 
      }, { status: 400 });
    }
    
    // Fetch ZIP
    const zipBuffer = await fetchZip(base44, zipFileUri);
    console.log('ZIP loaded:', zipBuffer.byteLength, 'bytes');
    
    // Build form data for this format
    const { formData, description } = FORMAT_BUILDERS[testId](zipBuffer);
    console.log('Testing format:', description);
    
    // Log what we're sending (for debugging)
    const formEntries = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof Blob) {
        formEntries.push({ key, value: `[Blob ${value.size} bytes]` });
      } else {
        formEntries.push({ key, value: value.toString().substring(0, 100) });
      }
    }
    console.log('FormData entries:', JSON.stringify(formEntries, null, 2));
    
    // Make API call
    const url = `${SCRIBE_API_BASE_URL}/api/add-campaign-v2`;
    console.log('POST', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SCRIBE_API_TOKEN}` },
      body: formData
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', responseText.substring(0, 500));
    
    // Parse result
    let campaignId = null;
    let campaignCreated = false;
    let error = null;
    
    if (response.ok) {
      try {
        const result = JSON.parse(responseText);
        if (result.success) {
          campaignId = result.data?.campaign_id || result.data?.id;
          campaignCreated = !!campaignId;
        } else {
          error = result.message || 'API returned success: false';
        }
      } catch (e) {
        error = 'Failed to parse response';
      }
    } else {
      error = `HTTP ${response.status}: ${responseText.substring(0, 200)}`;
    }
    
    const result = {
      testId,
      formatDescription: description,
      httpStatus: response.status,
      campaignCreated,
      campaignId,
      error,
      formDataSent: formEntries.filter(e => e.key !== 'attachment')
    };
    
    console.log('\n=== RESULT ===');
    console.log(JSON.stringify(result, null, 2));
    
    return Response.json(result);
    
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});