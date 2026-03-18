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
    envelopePreviewHeight: 300,
    defaultReturnAddressMode: "company"
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated (settings are read-only for all users)
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    
    // Query for existing settings (singleton pattern)
    const settings = await base44.asServiceRole.entities.InstanceSettings.list();
    
    // If no settings exist, create with defaults
    if (settings.length === 0) {
      const newSettings = await base44.asServiceRole.entities.InstanceSettings.create(DEFAULT_SETTINGS);
      return Response.json(newSettings);
    }
    
    // Return the single settings record
    return Response.json(settings[0]);
    
  } catch (error) {
    console.error('Error in getInstanceSettings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});