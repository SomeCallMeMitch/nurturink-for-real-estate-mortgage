import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Generate import batch ID in format: YYYYMMDD-HHMMSS-XXXX
const generateImportBatchId = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timePart = now.toISOString().slice(11, 19).replace(/:/g, '');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${datePart}-${timePart}-${randomPart}`;
};

// Normalize tag to Title Case
const normalizeTag = (tag) => {
  if (!tag || typeof tag !== 'string') return '';
  return tag
    .toLowerCase()
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Apply field transformations based on options
const transformValue = (value, options) => {
  if (value === null || value === undefined) return '';
  let result = String(value);
  if (options.trimWhitespace) {
    result = result.trim();
  }
  return result;
};

// Apply name capitalization
const capitalizeName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Validate date format (YYYY-MM-DD)
const isValidDateFormat = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

// Parse date to YYYY-MM-DD format
const parseDateToYYYYMMDD = (value) => {
  if (!value) return null;
  const str = String(value).trim();
  if (!str) return null;
  
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return isValidDateFormat(str) ? str : null;
  }
  
  // Try MM/DD/YYYY format
  const mmddyyyy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyy) {
    const [, month, day, year] = mmddyyyy;
    const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    return isValidDateFormat(formatted) ? formatted : null;
  }
  
  // Try to parse as date
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  return null;
};

// Map raw data row to client fields using field mapping
const mapRowToClient = (rawRow, fieldMapping, options) => {
  const mapped = {};
  
  for (const [columnName, fieldName] of Object.entries(fieldMapping)) {
    if (fieldName && fieldName !== 'skip' && rawRow[columnName] !== undefined) {
      let value = transformValue(rawRow[columnName], options);
      
      // Apply auto-capitalize to name fields
      if (options.autoCapitalize && ['firstName', 'lastName', 'city'].includes(fieldName)) {
        value = capitalizeName(value);
      }
      
      // Handle tags specially
      if (fieldName === 'tags') {
        const tagValues = value.split(',').map(t => normalizeTag(t.trim())).filter(t => t);
        mapped[fieldName] = tagValues;
      } else if (fieldName === 'state') {
        mapped[fieldName] = value.toUpperCase();
      } else if (fieldName === 'notes') {
        // Notes field - preserve as-is but trim
        mapped[fieldName] = value;
      } else if (['birthday', 'policy_start_date', 'renewal_date'].includes(fieldName)) {
        // Date fields - parse and validate
        const parsedDate = parseDateToYYYYMMDD(value);
        if (parsedDate) {
          mapped[fieldName] = parsedDate;
        }
      } else {
        mapped[fieldName] = value;
      }
    }
  }
  
  return mapped;
};

// Validate required fields
const validateRequired = (row) => {
  const requiredFields = ['firstName', 'lastName', 'street', 'city', 'state', 'zipCode'];
  const missing = [];
  
  for (const field of requiredFields) {
    if (!row[field] || String(row[field]).trim() === '') {
      missing.push(field);
    }
  }
  
  return missing;
};

// Check for duplicate by email or address
const isDuplicate = (client, existingClients) => {
  // Check email match
  if (client.email && client.email.trim()) {
    const emailMatch = existingClients.find(
      ec => ec.email && ec.email.toLowerCase() === client.email.toLowerCase()
    );
    if (emailMatch) return { isDupe: true, reason: 'Duplicate email' };
  }
  
  // Check address match
  const addressKey = `${client.street}|${client.city}|${client.state}|${client.zipCode}`.toLowerCase();
  const addressMatch = existingClients.find(ec => {
    const ecKey = `${ec.street}|${ec.city}|${ec.state}|${ec.zipCode}`.toLowerCase();
    return ecKey === addressKey;
  });
  
  if (addressMatch) return { isDupe: true, reason: 'Duplicate address' };
  
  return { isDupe: false };
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { fileUrl, fileType, fieldMapping, options = {} } = await req.json();
    
    if (!fileUrl) {
      return Response.json({ error: 'fileUrl is required' }, { status: 400 });
    }
    
    if (!fieldMapping || Object.keys(fieldMapping).length === 0) {
      return Response.json({ error: 'fieldMapping is required' }, { status: 400 });
    }
    
    // Default options
    const opts = {
      autoCapitalize: options.autoCapitalize !== false,
      trimWhitespace: options.trimWhitespace !== false,
      skipDuplicates: options.skipDuplicates || false,
      skipInvalidRows: options.skipInvalidRows !== false,
      tagsToApply: (options.tagsToApply || []).map(t => normalizeTag(t))
    };
    
    // Get user's orgId
    const orgId = user.orgId;
    if (!orgId) {
      return Response.json({ error: 'User organization not found' }, { status: 400 });
    }
    
    // Generate batch ID
    const importBatchId = generateImportBatchId();
    const uploadedAt = new Date().toISOString();
    
    // Define the JSON schema for extraction
    const extractionSchema = {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: true
      }
    };
    
    // Extract data from file
    const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url: fileUrl,
      json_schema: extractionSchema
    });
    
    if (extractResult.status === 'error') {
      return Response.json({ 
        success: false, 
        error: extractResult.details || 'Failed to parse file' 
      }, { status: 400 });
    }
    
    const rawData = extractResult.output || [];
    
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'No data rows found in file' 
      }, { status: 400 });
    }
    
    // Get existing clients for duplicate checking if needed
    let existingClients = [];
    if (opts.skipDuplicates) {
      existingClients = await base44.entities.Client.filter({ orgId });
    }
    
    // Process results tracking
    const summary = {
      totalRows: rawData.length,
      imported: 0,
      skippedErrors: 0,
      skippedDuplicates: 0,
      warnings: 0
    };
    
    const errors = [];
    const warnings = [];
    const clientsToCreate = [];
    
    // Process each row
    for (let i = 0; i < rawData.length; i++) {
      const mappedRow = mapRowToClient(rawData[i], fieldMapping, opts);
      
      // Validate required fields
      const missingFields = validateRequired(mappedRow);
      
      if (missingFields.length > 0) {
        if (opts.skipInvalidRows) {
          summary.skippedErrors++;
          errors.push({
            row: i + 1,
            reason: `Missing required fields: ${missingFields.join(', ')}`,
            data: mappedRow
          });
          continue;
        } else {
          return Response.json({
            success: false,
            error: `Row ${i + 1}: Missing required fields: ${missingFields.join(', ')}`
          }, { status: 400 });
        }
      }
      
      // Check for duplicates
      if (opts.skipDuplicates) {
        const dupeCheck = isDuplicate(mappedRow, existingClients);
        if (dupeCheck.isDupe) {
          summary.skippedDuplicates++;
          warnings.push({
            row: i + 1,
            reason: dupeCheck.reason,
            data: mappedRow
          });
          continue;
        }
      }
      
      // Build full client object
      const clientData = {
        ...mappedRow,
        orgId,
        ownerId: user.id,
        fullName: `${mappedRow.firstName} ${mappedRow.lastName}`.trim(),
        source: 'file_upload',
        uploadedAt,
        importBatchId,
        createdAt: uploadedAt,
        updatedAt: uploadedAt,
        tags: [...(mappedRow.tags || []), ...opts.tagsToApply],
        totalNotesSent: 0,
        addressValidationStatus: 'not_validated',
        addressRiskFlags: []
      };
      
      clientsToCreate.push(clientData);
      
      // Add to existing clients list to catch duplicates within the same import
      if (opts.skipDuplicates) {
        existingClients.push(clientData);
      }
    }
    
    // Bulk create clients
    if (clientsToCreate.length > 0) {
      // Create in batches of 50 to avoid timeouts
      const batchSize = 50;
      for (let i = 0; i < clientsToCreate.length; i += batchSize) {
        const batch = clientsToCreate.slice(i, i + batchSize);
        await base44.entities.Client.bulkCreate(batch);
      }
      summary.imported = clientsToCreate.length;
    }
    
    return Response.json({
      success: true,
      importBatchId,
      summary,
      errors,
      warnings
    });
    
  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An error occurred during import' 
    }, { status: 500 });
  }
});