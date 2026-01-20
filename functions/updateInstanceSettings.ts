import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Default settings to initialize if no record exists
const DEFAULT_SETTINGS = {
  cardPreviewSettings: {
    fontSize: 22,
    lineHeight: 1,
    baseTextWidth: 360,
    baseMarginLeft: 40,
    shortCardMaxLines: 13,
    maxPreviewLines: 19,
    topHalfPaddingTop: 345,
    longCardTopPadding: 110,
    gapAboveFold: 14,
    gapBelowFold: 14,
    maxIndent: 16,
    indentAmplitude: 6,
    indentNoise: 2,
    indentFrequency: 0.35,
    frameWidth: 412,
    frameHeight: 600
  },
  envelopeLayoutSettings: {
    recipientAddressTop: 180,
    recipientAddressLeft: 200,
    returnAddressTop: 20,
    returnAddressLeft: 20,
    envelopeImageUrl: "",
    envelopeFontFamily: "Caveat",
    envelopeFontSize: 18,
    envelopeLineHeight: 1.2,
    envelopeTextColor: "#000000",
    returnAddressText: "{{org.name}}\n{{org.street}}\n{{org.city}}, {{org.state}} {{org.zipCode}}",
    returnAddressLeftOffset: 20,
    returnAddressTopOffset: 20,
    recipientAddressLeftOffset: 250,
    recipientAddressTopOffset: 150,
    envelopePreviewWidth: 500,
    envelopePreviewHeight: 300
  }
};

// Validation helper for envelope settings
const validateEnvelopeSettings = (envelopeSettings) => {
  const errors = [];
  
  if (envelopeSettings) {
    // Validate font size
    if (envelopeSettings.envelopeFontSize !== undefined) {
      if (envelopeSettings.envelopeFontSize < 8 || envelopeSettings.envelopeFontSize > 72) {
        errors.push('envelopeFontSize must be between 8 and 72 pixels');
      }
    }
    
    // Validate line height
    if (envelopeSettings.envelopeLineHeight !== undefined) {
      if (envelopeSettings.envelopeLineHeight < 0.5 || envelopeSettings.envelopeLineHeight > 3) {
        errors.push('envelopeLineHeight must be between 0.5 and 3');
      }
    }
    
    // Validate offsets (must be non-negative)
    const offsetFields = [
      'returnAddressLeftOffset',
      'returnAddressTopOffset',
      'recipientAddressLeftOffset',
      'recipientAddressTopOffset'
    ];
    
    offsetFields.forEach(field => {
      if (envelopeSettings[field] !== undefined && envelopeSettings[field] < 0) {
        errors.push(`${field} must be non-negative`);
      }
    });
    
    // Validate preview dimensions
    if (envelopeSettings.envelopePreviewWidth !== undefined) {
      if (envelopeSettings.envelopePreviewWidth < 100 || envelopeSettings.envelopePreviewWidth > 2000) {
        errors.push('envelopePreviewWidth must be between 100 and 2000 pixels');
      }
    }
    
    if (envelopeSettings.envelopePreviewHeight !== undefined) {
      if (envelopeSettings.envelopePreviewHeight < 100 || envelopeSettings.envelopePreviewHeight > 2000) {
        errors.push('envelopePreviewHeight must be between 100 and 2000 pixels');
      }
    }
    
    // Validate font family
    if (envelopeSettings.envelopeFontFamily !== undefined) {
      const validFonts = ['Caveat', 'Kalam', 'Patrick Hand'];
      if (!validFonts.includes(envelopeSettings.envelopeFontFamily)) {
        errors.push(`envelopeFontFamily must be one of: ${validFonts.join(', ')}`);
      }
    }
    
    // Validate text color (basic hex format check)
    if (envelopeSettings.envelopeTextColor !== undefined) {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexColorRegex.test(envelopeSettings.envelopeTextColor)) {
        errors.push('envelopeTextColor must be a valid hex color (e.g., #000000)');
      }
    }
  }
  
  return errors;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated and is super admin
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    
    if (user.appRole !== 'super_admin') {
      return Response.json({ error: 'Unauthorized: Super admin access required' }, { status: 403 });
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate envelope settings if provided
    if (body.envelopeLayoutSettings) {
      const validationErrors = validateEnvelopeSettings(body.envelopeLayoutSettings);
      if (validationErrors.length > 0) {
        return Response.json({ 
          error: 'Validation failed', 
          details: validationErrors 
        }, { status: 400 });
      }
    }
    
    // Query for existing settings (singleton pattern)
    const settings = await base44.asServiceRole.entities.InstanceSettings.list();
    
    // If no settings exist, create with provided data (or defaults)
    if (settings.length === 0) {
      const newSettings = await base44.asServiceRole.entities.InstanceSettings.create({
        ...DEFAULT_SETTINGS,
        ...body
      });
      return Response.json(newSettings);
    }
    
    // Update existing record
    const updatedSettings = await base44.asServiceRole.entities.InstanceSettings.update(
      settings[0].id,
      body
    );
    
    return Response.json(updatedSettings);
    
  } catch (error) {
    console.error('Error in updateInstanceSettings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});