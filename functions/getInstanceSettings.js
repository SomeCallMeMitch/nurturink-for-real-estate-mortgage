import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { requireSuperAdmin } from '../utils/requireSuperAdmin.js';

// Default settings to initialize if no record exists
const DEFAULT_SETTINGS = {
  cardPreviewSettings: {
    fontSize: 18,
    lineHeight: 1.1,
    baseTextWidth: 355,
    baseMarginLeft: 48,
    shortCardMaxLines: 13,
    maxPreviewLines: 19,
    topHalfPaddingTop: 125,
    gapAboveFold: 14,
    gapBelowFold: 14,
    shortBelowFold: 14,
    maxIndent: 16,
    indentAmplitude: 6,
    indentNoise: 2,
    indentFrequency: 0.35,
    shiftRight: 0,
    rightPadding: 12,
    frameWidth: 412,
    frameHeight: 600
  },
  envelopeLayoutSettings: {
    recipientAddressTop: 180,
    recipientAddressLeft: 200,
    returnAddressTop: 20,
    returnAddressLeft: 20
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify super admin access
    await requireSuperAdmin(base44);
    
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
    
    if (error.message.includes('Unauthorized')) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    
    return Response.json({ error: error.message }, { status: 500 });
  }
});