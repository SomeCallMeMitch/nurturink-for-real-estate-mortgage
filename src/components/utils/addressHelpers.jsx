/**
 * Address Helper Utilities
 * 
 * Shared functions for formatting and processing addresses.
 * Used by ReviewAndSend, MailingConfirmation, and other pages.
 */

/**
 * Replace placeholders in address text with actual values
 * 
 * @param {string} text - Text containing placeholders like {{org.name}}, {{me.fullName}}
 * @param {object} client - Client object (currently unused but available for future)
 * @param {object} user - User object with address fields
 * @param {object} organization - Organization object with companyReturnAddress
 * @returns {string} - Text with placeholders replaced
 */
export function replacePlaceholders(text, client, user, organization) {
  if (!text) return '';
  
  let result = text;
  
  // Organization placeholders
  if (organization) {
    result = result.replace(/\{\{org\.name\}\}/g, organization.name || '');
    result = result.replace(/\{\{org\.street\}\}/g, organization.companyReturnAddress?.street || '');
    result = result.replace(/\{\{org\.city\}\}/g, organization.companyReturnAddress?.city || '');
    result = result.replace(/\{\{org\.state\}\}/g, organization.companyReturnAddress?.state || '');
    result = result.replace(/\{\{org\.zipCode\}\}/g, organization.companyReturnAddress?.zip || '');
  }
  
  // User/Me placeholders
  if (user) {
    result = result.replace(/\{\{me\.fullName\}\}/g, user.full_name || '');
    result = result.replace(/\{\{me\.street\}\}/g, user.street || '');
    result = result.replace(/\{\{me\.city\}\}/g, user.city || '');
    result = result.replace(/\{\{me\.state\}\}/g, user.state || '');
    result = result.replace(/\{\{me\.zipCode\}\}/g, user.zipCode || '');
  }
  
  return result;
}

/**
 * Format company address for display
 * 
 * @param {object} organization - Organization object with companyReturnAddress
 * @returns {string|null} - Formatted address or null if no address
 */
export function formatCompanyAddress(organization) {
  if (!organization?.companyReturnAddress) return null;
  
  const addr = organization.companyReturnAddress;
  const lines = [];
  
  // Add company name first if it exists
  if (addr.companyName) {
    lines.push(addr.companyName);
  } else if (organization.name) {
    lines.push(organization.name);
  }
  
  if (addr.street) lines.push(addr.street);
  if (addr.address2) lines.push(addr.address2);
  
  const cityStateZip = [addr.city, addr.state, addr.zip].filter(Boolean).join(' ');
  if (cityStateZip) lines.push(cityStateZip);
  
  return lines.length > 0 ? lines.join('\n') : null;
}

/**
 * Format rep/user address for display
 * 
 * @param {object} user - User object with address fields
 * @returns {string|null} - Formatted address or null if no address
 */
export function formatRepAddress(user) {
  if (!user?.street) return null;
  
  const lines = [];
  
  // Add name first if it exists
  if (user.returnAddressName) {
    lines.push(user.returnAddressName);
  } else if (user.full_name) {
    lines.push(user.full_name);
  }
  
  if (user.street) lines.push(user.street);
  if (user.address2) lines.push(user.address2);
  
  const cityStateZip = [user.city, user.state, user.zipCode].filter(Boolean).join(' ');
  if (cityStateZip) lines.push(cityStateZip);
  
  return lines.length > 0 ? lines.join('\n') : null;
}

/**
 * Format client mailing address for display
 * 
 * @param {object} client - Client object with address fields
 * @returns {string|null} - Formatted address or null if no address
 */
export function formatClientAddress(client) {
  if (!client) return null;
  
  const lines = [];
  
  if (client.fullName) lines.push(client.fullName);
  if (client.company) lines.push(client.company);
  if (client.street) lines.push(client.street);
  if (client.address2) lines.push(client.address2);
  
  const cityStateZip = [client.city, client.state, client.zipCode].filter(Boolean).join(' ');
  if (cityStateZip) lines.push(cityStateZip);
  
  return lines.length > 0 ? lines.join('\n') : null;
}

/**
 * Check if an address object has required fields
 * 
 * @param {object} address - Address object to validate
 * @returns {boolean} - True if address has street, city, state, zipCode
 */
export function isValidAddress(address) {
  if (!address) return false;
  return !!(address.street && address.city && address.state && (address.zipCode || address.zip));
}

/**
 * Get address preview text for a given mode
 * 
 * @param {string} mode - "company" | "rep" | "none"
 * @param {object} organization - Organization object
 * @param {object} user - User object
 * @returns {string} - Preview text
 */
export function getAddressPreviewText(mode, organization, user) {
  switch (mode) {
    case 'company':
      return formatCompanyAddress(organization) || 'No company address configured';
    case 'rep':
      return formatRepAddress(user) || 'No rep address configured';
    case 'none':
      return 'No return address will be printed on the envelope';
    default:
      return 'Unknown address mode';
  }
}