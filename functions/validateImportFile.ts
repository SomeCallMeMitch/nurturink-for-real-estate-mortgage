import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

// Validate a single row
const validateRow = (row, rowIndex, options) => {
  const errors = [];
  const warnings = [];
  
  // Check required fields
  const requiredFields = ['firstName', 'lastName', 'street', 'city', 'state', 'zipCode'];
  for (const field of requiredFields) {
    if (!row[field] || String(row[field]).trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate email format if provided
  if (row.email && row.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email.trim())) {
      warnings.push('Invalid email format');
    }
  }
  
  // Validate state format (2 letters)
  if (row.state && row.state.trim()) {
    const stateVal = row.state.trim().toUpperCase();
    if (stateVal.length !== 2 || !/^[A-Z]{2}$/.test(stateVal)) {
      warnings.push('State should be 2-letter code (e.g., CO)');
    }
  }
  
  // Validate ZIP format
  if (row.zipCode && row.zipCode.trim()) {
    const zipVal = row.zipCode.trim().replace(/[^0-9]/g, '');
    if (zipVal.length !== 5 && zipVal.length !== 9) {
      warnings.push('ZIP code should be 5 or 9 digits');
    }
  }
  
  let status = 'valid';
  if (errors.length > 0) {
    status = 'error';
  } else if (warnings.length > 0) {
    status = 'warning';
  }
  
  return {
    row: rowIndex + 1,
    status,
    errors,
    warnings,
    reason: errors.length > 0 ? errors[0] : (warnings.length > 0 ? warnings[0] : null)
  };
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
      } else {
        mapped[fieldName] = value;
      }
    }
  }
  
  return mapped;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { fileUrl, fileType, fieldMapping = {}, options = {} } = await req.json();
    
    if (!fileUrl) {
      return Response.json({ error: 'fileUrl is required' }, { status: 400 });
    }
    
    // Default options
    const opts = {
      autoCapitalize: options.autoCapitalize !== false,
      trimWhitespace: options.trimWhitespace !== false,
      skipDuplicates: options.skipDuplicates || false,
      skipInvalidRows: options.skipInvalidRows !== false,
      tagsToApply: options.tagsToApply || []
    };
    
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
    
    // Extract column names from first row
    const columns = Object.keys(rawData[0] || {});
    
    // Get sample data (first 3 rows)
    const sampleData = rawData.slice(0, 3);
    
    // If no field mapping provided, return just columns and sample for auto-mapping
    if (Object.keys(fieldMapping).length === 0) {
      return Response.json({
        success: true,
        totalRows: rawData.length,
        columns,
        sampleData,
        validation: null,
        previewRows: []
      });
    }
    
    // Map and validate all rows
    const validationResults = {
      valid: 0,
      warnings: 0,
      errors: 0
    };
    
    const previewRows = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const mappedRow = mapRowToClient(rawData[i], fieldMapping, opts);
      const validation = validateRow(mappedRow, i, opts);
      
      if (validation.status === 'valid') {
        validationResults.valid++;
      } else if (validation.status === 'warning') {
        validationResults.warnings++;
      } else {
        validationResults.errors++;
      }
      
      // Include first 50 rows in preview
      if (i < 50) {
        previewRows.push({
          ...validation,
          data: mappedRow
        });
      }
    }
    
    return Response.json({
      success: true,
      totalRows: rawData.length,
      columns,
      sampleData,
      validation: validationResults,
      previewRows
    });
    
  } catch (error) {
    console.error('Validation error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An error occurred during validation' 
    }, { status: 500 });
  }
});