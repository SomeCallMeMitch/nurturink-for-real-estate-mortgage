
import React, { useMemo } from 'react';

/**
 * EnvelopePreview Component
 * Displays a live preview of the envelope with return address and recipient address
 * 
 * @param {Object} envelopeSettings - Settings from InstanceSettings.envelopeLayoutSettings
 * @param {Object} client - Sample client object for recipient address
 * @param {Object} user - Current user object for return address placeholders
 * @param {Object} organization - Organization object for return address placeholders
 * @param {string} returnAddressMode - Determines which return address to display ('company', 'rep', 'none')
 */

// Helper function to replace placeholders in text with actual values
const replacePlaceholders = (text, client, user, organization) => {
  if (!text) return '';
  
  let result = text;
  
  // Client placeholders
  if (client) {
    result = result.replace(/\{\{client\.firstName\}\}/g, client.firstName || '');
    result = result.replace(/\{\{client\.lastName\}\}/g, client.lastName || '');
    result = result.replace(/\{\{client\.fullName\}\}/g, client.fullName || '');
    result = result.replace(/\{\{client\.company\}\}/g, client.company || '');
    result = result.replace(/\{\{client\.street\}\}/g, client.street || '');
    result = result.replace(/\{\{client\.city\}\}/g, client.city || '');
    result = result.replace(/\{\{client\.state\}\}/g, client.state || '');
    result = result.replace(/\{\{client\.zipCode\}\}/g, client.zipCode || '');
  }
  
  // User placeholders
  if (user) {
    result = result.replace(/\{\{me\.firstName\}\}/g, user.firstName || user.full_name?.split(' ')[0] || '');
    result = result.replace(/\{\{me\.lastName\}\}/g, user.lastName || user.full_name?.split(' ').slice(1).join(' ') || '');
    result = result.replace(/\{\{me\.fullName\}\}/g, user.full_name || '');
    result = result.replace(/\{\{me\.email\}\}/g, user.email || '');
    result = result.replace(/\{\{me\.phone\}\}/g, user.phone || '');
    result = result.replace(/\{\{me\.title\}\}/g, user.title || '');
    result = result.replace(/\{\{me\.companyName\}\}/g, user.companyName || '');
    result = result.replace(/\{\{me\.street\}\}/g, user.street || '');
    result = result.replace(/\{\{me\.city\}\}/g, user.city || '');
    result = result.replace(/\{\{me\.state\}\}/g, user.state || '');
    result = result.replace(/\{\{me\.zipCode\}\}/g, user.zipCode || '');
  }
  
  // Organization placeholders
  if (organization) {
    result = result.replace(/\{\{org\.name\}\}/g, organization.name || '');
    result = result.replace(/\{\{org\.street\}\}/g, organization.companyReturnAddress?.street || '');
    result = result.replace(/\{\{org\.city\}\}/g, organization.companyReturnAddress?.city || '');
    result = result.replace(/\{\{org\.state\}\}/g, organization.companyReturnAddress?.state || '');
    result = result.replace(/\{\{org\.zipCode\}\}/g, organization.companyReturnAddress?.zip || '');
    result = result.replace(/\{\{org\.website\}\}/g, organization.website || '');
    result = result.replace(/\{\{org\.email\}\}/g, organization.email || '');
    result = result.replace(/\{\{org\.phone\}\}/g, organization.phone || '');
  }
  
  return result;
};

// Helper function to format client address for recipient
const formatClientAddress = (client) => {
  if (!client) return 'Sample Recipient\n123 Main Street\nCity, ST 12345';
  
  const lines = [];
  
  // Full name
  const fullName = client.fullName || 
    `${client.firstName || ''} ${client.lastName || ''}`.trim() || 
    'Recipient Name';
  lines.push(fullName);
  
  // Street address
  if (client.street) lines.push(client.street);
  if (client.address2) lines.push(client.address2);
  
  // City, State ZIP
  const cityStateZip = [
    client.city,
    client.state,
    client.zipCode || client.zip
  ].filter(Boolean).join(' ');
  
  if (cityStateZip) lines.push(cityStateZip);
  
  // Fallback if no address
  if (lines.length === 1) {
    lines.push('123 Main Street');
    lines.push('City, ST 12345');
  }
  
  return lines.join('\n');
};

// Get font class for the selected font
const getFontClass = (fontName) => {
  const fontMap = {
    'Caveat': 'font-caveat',
    'Kalam': 'font-kalam',
    'Patrick Hand': 'font-patrick'
  };
  return fontMap[fontName] || 'font-caveat';
};

export default function EnvelopePreview({ 
  envelopeSettings, 
  client, 
  user, 
  organization,
  returnAddressMode = 'company' // NEW: Add returnAddressMode prop
}) {
  // Memoize processed return address based on mode
  const returnAddressText = useMemo(() => {
    // If mode is 'none', return empty string
    if (returnAddressMode === 'none') {
      return '';
    }
    
    // If mode is 'rep', format user's address
    if (returnAddressMode === 'rep') {
      if (!user?.street) return ''; // Changed condition to only check for street
      
      const lines = [];
      
      // Add name first
      if (user.returnAddressName) {
        lines.push(user.returnAddressName);
      } else if (user.full_name) {
        lines.push(user.full_name);
      }
      
      if (user.street) lines.push(user.street);
      if (user.address2) lines.push(user.address2);
      
      const cityStateZip = [user.city, user.state, user.zipCode].filter(Boolean).join(' ');
      if (cityStateZip) lines.push(cityStateZip);
      
      return lines.join('\n');
    }
    
    // If mode is 'company', format organization's companyReturnAddress
    if (returnAddressMode === 'company') {
      if (!organization?.companyReturnAddress?.street) return '';
      
      const addr = organization.companyReturnAddress;
      const lines = [];
      
      // Add company name first
      if (addr.companyName) {
        lines.push(addr.companyName);
      } else if (organization.name) {
        lines.push(organization.name);
      }
      
      if (addr.street) lines.push(addr.street);
      if (addr.address2) lines.push(addr.address2);
      
      const cityStateZip = [addr.city, addr.state, addr.zip].filter(Boolean).join(' ');
      if (cityStateZip) lines.push(cityStateZip);
      
      return lines.join('\n');
    }
    
    return ''; // Fallback for any other mode or if no conditions met
  }, [returnAddressMode, client, user, organization]);

  // Memoize formatted recipient address
  const recipientAddressText = useMemo(() => {
    return formatClientAddress(client);
  }, [client]);

  // Extract settings with defaults
  const {
    envelopeImageUrl = '',
    envelopeFontFamily = 'Caveat',
    envelopeFontSize = 18,
    envelopeLineHeight = 1.2,
    envelopeTextColor = '#000000',
    returnAddressLeftOffset = 20,
    returnAddressTopOffset = 20,
    recipientAddressLeftOffset = 250,
    recipientAddressTopOffset = 150,
    envelopePreviewWidth = 500,
    envelopePreviewHeight = 300
  } = envelopeSettings || {};

  const fontClass = getFontClass(envelopeFontFamily);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Envelope Preview Container */}
      <div
        className="relative rounded-lg shadow-lg overflow-hidden"
        style={{
          width: `${envelopePreviewWidth}px`,
          height: `${envelopePreviewHeight}px`,
          backgroundColor: '#f5f5dc' // Fallback beige/envelope color
        }}
      >
        {/* Background Image */}
        {envelopeImageUrl ? (
          <img
            src={envelopeImageUrl}
            alt="Envelope template"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f5f5dc] to-[#e8e8d0]">
            <div className="text-center text-gray-400 px-4">
              <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">No envelope image uploaded</p>
            </div>
          </div>
        )}

        {/* Return Address Block - Only show if returnAddressText is not empty */}
        {returnAddressText && (
          <div
            className={`absolute ${fontClass} whitespace-pre-line`}
            style={{
              left: `${returnAddressLeftOffset}px`,
              top: `${returnAddressTopOffset}px`,
              fontSize: `${envelopeFontSize}px`,
              lineHeight: envelopeLineHeight,
              color: envelopeTextColor,
              maxWidth: '200px'
            }}
          >
            {returnAddressText}
          </div>
        )}

        {/* Recipient Address Block */}
        <div
          className={`absolute ${fontClass} whitespace-pre-line`}
          style={{
            left: `${recipientAddressLeftOffset}px`,
            top: `${recipientAddressTopOffset}px`,
            fontSize: `${envelopeFontSize}px`,
            lineHeight: envelopeLineHeight,
            color: envelopeTextColor,
            maxWidth: '250px'
          }}
        >
          {recipientAddressText}
        </div>

        {/* Visual Position Indicators (optional - for debugging) */}
        {/* Uncomment these during development to see exact positioning */}
        {/*
        <div
          className="absolute w-2 h-2 bg-orange-500 rounded-full"
          style={{
            left: `${returnAddressLeftOffset - 4}px`,
            top: `${returnAddressTopOffset - 4}px`
          }}
          title="Return Address Position"
        />
        <div
          className="absolute w-2 h-2 bg-blue-500 rounded-full"
          style={{
            left: `${recipientAddressLeftOffset - 4}px`,
            top: `${recipientAddressTopOffset - 4}px`
          }}
          title="Recipient Address Position"
        />
        */}
      </div>

      {/* Preview Info */}
      <div className="text-sm text-gray-600 text-center">
        <p>
          Envelope Preview ({envelopePreviewWidth}×{envelopePreviewHeight}px)
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Font: {envelopeFontFamily} • Size: {envelopeFontSize}px
        </p>
      </div>
    </div>
  );
}
