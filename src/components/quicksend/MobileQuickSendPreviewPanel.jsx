import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, User, Building2, XCircle } from 'lucide-react';

// Replace placeholders in text with actual values (from CardPreview.jsx)
const replacePlaceholders = (text, client, user, organization) => {
  if (!text) return '';
  
  let result = text;
  
  // Client placeholders
  if (client) {
    result = result.replace(/\{\{client\.firstName\}\}/g, client.firstName || '');
    result = result.replace(/\{\{client\.lastName\}\}/g, client.lastName || '');
    result = result.replace(/\{\{client\.fullName\}\}/g, client.fullName || '');
    result = result.replace(/\{\{client\.initials\}\}/g, 
      client.firstName && client.lastName 
        ? `${client.firstName[0]}${client.lastName[0]}` 
        : ''
    );
    result = result.replace(/\{\{client\.email\}\}/g, client.email || '');
    result = result.replace(/\{\{client\.phone\}\}/g, client.phone || '');
    result = result.replace(/\{\{client\.street\}\}/g, client.street || '');
    result = result.replace(/\{\{client\.city\}\}/g, client.city || '');
    result = result.replace(/\{\{client\.state\}\}/g, client.state || '');
    result = result.replace(/\{\{client\.zipCode\}\}/g, client.zipCode || '');
    result = result.replace(/\{\{client\.company\}\}/g, client.company || '');
  }
  
  // User placeholders
  if (user) {
    result = result.replace(/\{\{user\.firstName\}\}/g, user.firstName || user.full_name?.split(' ')[0] || '');
    result = result.replace(/\{\{user\.lastName\}\}/g, user.lastName || user.full_name?.split(' ').slice(1).join(' ') || '');
    result = result.replace(/\{\{user\.fullName\}\}/g, user.full_name || '');
    result = result.replace(/\{\{user\.email\}\}/g, user.email || '');
    result = result.replace(/\{\{user\.phone\}\}/g, user.phone || '');
    result = result.replace(/\{\{user\.title\}\}/g, user.title || '');
    result = result.replace(/\{\{user\.companyName\}\}/g, user.companyName || '');
    result = result.replace(/\{\{user\.street\}\}/g, user.street || '');
    result = result.replace(/\{\{user\.city\}\}/g, user.city || '');
    result = result.replace(/\{\{user\.state\}\}/g, user.state || '');
    result = result.replace(/\{\{user\.zipCode\}\}/g, user.zipCode || '');
  }
  
  // Organization placeholders
  if (organization) {
    result = result.replace(/\{\{org\.name\}\}/g, organization.name || '');
    result = result.replace(/\{\{org\.website\}\}/g, organization.website || '');
    result = result.replace(/\{\{org\.email\}\}/g, organization.email || '');
    result = result.replace(/\{\{org\.phone\}\}/g, organization.phone || '');
  }
  
  return result;
};

// Compose complete message with greeting, body, and signature
const composeCompleteMessage = (greeting, message, signature, client, user, organization) => {
  const parts = [];
  
  if (greeting) {
    const processedGreeting = replacePlaceholders(greeting, client, user, organization);
    if (processedGreeting) parts.push(processedGreeting);
  }
  
  if (message) {
    const processedMessage = replacePlaceholders(message, client, user, organization);
    if (processedMessage) parts.push(processedMessage);
  }
  
  if (signature) {
    const processedSignature = replacePlaceholders(signature, client, user, organization);
    if (processedSignature) parts.push(processedSignature);
  }
  
  return parts.join('\n\n');
};

/**
 * MobileQuickSendPreviewPanel Component
 * Shows text-based preview of QuickCard with recipient navigation
 * 
 * @param {Object} selectedTemplate - Template object with content
 * @param {Object} selectedNoteStyleProfile - Note style with greeting/signature
 * @param {Object} previewingTemplate - QuickSendTemplate with settings
 * @param {Array} selectedClients - Array of Client objects for navigation
 * @param {Array} allClients - All clients for looking up data
 * @param {Object} user - Current user
 * @param {Object} organization - Current organization
 */
export default function MobileQuickSendPreviewPanel({
  selectedTemplate,
  selectedNoteStyleProfile,
  previewingTemplate,
  selectedClients,
  allClients,
  user,
  organization
}) {
  const [currentClientIndex, setCurrentClientIndex] = useState(0);

  // Get current client for preview
  const currentClient = useMemo(() => {
    if (!selectedClients || selectedClients.length === 0) return null;
    const clientId = selectedClients[currentClientIndex];
    return allClients?.find(c => c.id === clientId);
  }, [selectedClients, currentClientIndex, allClients]);

  // Compose message with placeholders replaced
  const composedMessage = useMemo(() => {
    if (!selectedTemplate || !selectedNoteStyleProfile || !currentClient) return '';
    
    return composeCompleteMessage(
      previewingTemplate?.includeGreeting ? (selectedNoteStyleProfile.defaultGreeting || '') : '',
      selectedTemplate.content || '',
      previewingTemplate?.includeSignature ? (selectedNoteStyleProfile.signatureText || '') : '',
      currentClient,
      user,
      organization
    );
  }, [selectedTemplate, selectedNoteStyleProfile, previewingTemplate, currentClient, user, organization]);

  // Get return address display
  const getReturnAddressDisplay = () => {
    const mode = previewingTemplate?.returnAddressMode || 'company';
    
    switch (mode) {
      case 'rep':
        return { icon: User, label: 'Rep Return Address', color: 'text-blue-600' };
      case 'company':
        return { icon: Building2, label: 'Company Return Address', color: 'text-green-600' };
      case 'none':
        return { icon: XCircle, label: 'No Return Address', color: 'text-gray-500' };
      default:
        return { icon: Building2, label: 'Company Return Address', color: 'text-green-600' };
    }
  };

  const returnAddressInfo = getReturnAddressDisplay();
  const ReturnAddressIcon = returnAddressInfo.icon;

  const handlePrevClient = () => {
    setCurrentClientIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextClient = () => {
    setCurrentClientIndex(prev => Math.min(selectedClients.length - 1, prev + 1));
  };

  if (!selectedTemplate || !selectedNoteStyleProfile || !currentClient) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">Unable to load preview data</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recipient Navigation */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
        <button
          onClick={handlePrevClient}
          disabled={currentClientIndex === 0}
          className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center flex-1">
          <p className="font-semibold text-gray-900">{currentClient.fullName}</p>
          <p className="text-xs text-gray-500">
            {currentClientIndex + 1} of {selectedClients.length}
          </p>
        </div>
        
        <button
          onClick={handleNextClient}
          disabled={currentClientIndex === selectedClients.length - 1}
          className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Message Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Message Content</h4>
        <div className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">
          {composedMessage}
        </div>
      </div>

      {/* Return Address */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Return Address</h4>
        <div className="flex items-center gap-2">
          <ReturnAddressIcon className={`w-5 h-5 ${returnAddressInfo.color}`} />
          <span className={`text-sm font-medium ${returnAddressInfo.color}`}>
            {returnAddressInfo.label}
          </span>
        </div>
      </div>
    </div>
  );
}