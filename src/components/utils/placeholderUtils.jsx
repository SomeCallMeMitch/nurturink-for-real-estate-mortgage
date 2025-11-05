/**
 * Placeholder Replacement Utility
 * Centralized logic for replacing placeholder tokens in text with actual data
 * 
 * Supports both NEW syntax ({{category.field}}) and LEGACY syntax ({{field}})
 * for backward compatibility with existing templates
 */

/**
 * Replace placeholder tokens in text with actual data
 * 
 * @param {string} text - Text containing placeholder tokens
 * @param {Object} client - Client data object
 * @param {Object} user - User data object
 * @param {Object} organization - Organization data object
 * @param {Object} noteStyleProfile - Note style profile (future use)
 * @returns {string} Text with placeholders replaced
 */
export function replacePlaceholders(text, client, user, organization, noteStyleProfile) {
  if (!text) return '';
  
  let result = text;
  
  // ============================================
  // CLIENT PLACEHOLDERS - NEW SYNTAX
  // ============================================
  if (client) {
    // Name placeholders
    result = result.replace(/\{\{client\.firstName\}\}/g, client.firstName || '');
    result = result.replace(/\{\{client\.lastName\}\}/g, client.lastName || '');
    result = result.replace(/\{\{client\.fullName\}\}/g, client.fullName || '');
    
    // Calculate initials from first and last name
    const initials = ((client.firstName?.[0] || '') + (client.lastName?.[0] || '')).toUpperCase();
    result = result.replace(/\{\{client\.initials\}\}/g, initials);
    
    // Contact placeholders
    result = result.replace(/\{\{client\.email\}\}/g, client.email || '');
    result = result.replace(/\{\{client\.phone\}\}/g, client.phone || '');
    
    // Address placeholders
    result = result.replace(/\{\{client\.street\}\}/g, client.street || '');
    result = result.replace(/\{\{client\.city\}\}/g, client.city || '');
    result = result.replace(/\{\{client\.state\}\}/g, client.state || '');
    result = result.replace(/\{\{client\.zipCode\}\}/g, client.zipCode || '');
    
    // Business placeholders
    result = result.replace(/\{\{client\.company\}\}/g, client.company || '');
    
    // LEGACY SUPPORT - Keep old placeholder syntax working
    result = result.replace(/\{\{firstName\}\}/g, client.firstName || '');
    result = result.replace(/\{\{lastName\}\}/g, client.lastName || '');
    result = result.replace(/\{\{fullName\}\}/g, client.fullName || '');
    result = result.replace(/\{\{company\}\}/g, client.company || '');
    result = result.replace(/\{\{address1\}\}/g, client.street || '');
    result = result.replace(/\{\{city\}\}/g, client.city || '');
    result = result.replace(/\{\{state\}\}/g, client.state || '');
    result = result.replace(/\{\{zip\}\}/g, client.zipCode || '');
  }
  
  // ============================================
  // USER/ME PLACEHOLDERS - NEW SYNTAX
  // ============================================
  if (user) {
    // Name placeholders
    result = result.replace(/\{\{me\.firstName\}\}/g, user.firstName || '');
    result = result.replace(/\{\{me\.lastName\}\}/g, user.lastName || '');
    result = result.replace(/\{\{me\.fullName\}\}/g, user.full_name || '');
    
    // Contact placeholders
    result = result.replace(/\{\{me\.email\}\}/g, user.email || '');
    result = result.replace(/\{\{me\.phone\}\}/g, user.phone || '');
    
    // Business placeholders
    result = result.replace(/\{\{me\.title\}\}/g, user.title || '');
    result = result.replace(/\{\{me\.companyName\}\}/g, user.companyName || '');
    
    // Address placeholders
    result = result.replace(/\{\{me\.street\}\}/g, user.street || '');
    result = result.replace(/\{\{me\.city\}\}/g, user.city || '');
    result = result.replace(/\{\{me\.state\}\}/g, user.state || '');
    result = result.replace(/\{\{me\.zipCode\}\}/g, user.zipCode || '');
    
    // LEGACY SUPPORT - Keep old placeholder syntax working
    result = result.replace(/\{\{rep_full_name\}\}/g, user.full_name || '');
    result = result.replace(/\{\{rep_first_name\}\}/g, user.firstName || '');
    result = result.replace(/\{\{rep_last_name\}\}/g, user.lastName || '');
    result = result.replace(/\{\{rep_company_name\}\}/g, user.companyName || '');
    result = result.replace(/\{\{rep_phone\}\}/g, user.phone || '');
  }
  
  // ============================================
  // ORGANIZATION PLACEHOLDERS - NEW SYNTAX
  // ============================================
  if (organization) {
    result = result.replace(/\{\{org\.name\}\}/g, organization.name || '');
    result = result.replace(/\{\{org\.website\}\}/g, organization.website || '');
    result = result.replace(/\{\{org\.email\}\}/g, organization.email || '');
    result = result.replace(/\{\{org\.phone\}\}/g, organization.phone || '');
  }
  
  return result;
}

/**
 * Compose a complete message by combining greeting, body, and signature
 * All parts go through placeholder replacement
 * 
 * @param {string} greeting - Greeting text (optional)
 * @param {string} body - Main message body
 * @param {string} signature - Signature text (optional)
 * @param {Object} client - Client data
 * @param {Object} user - User data
 * @param {Object} organization - Organization data
 * @param {Object} noteStyleProfile - Note style profile
 * @returns {string} Complete composed message
 */
export function composeCompleteMessage(greeting, body, signature, client, user, organization, noteStyleProfile) {
  const parts = [];
  
  if (greeting) {
    parts.push(replacePlaceholders(greeting, client, user, organization, noteStyleProfile));
  }
  
  if (body) {
    parts.push(replacePlaceholders(body, client, user, organization, noteStyleProfile));
  }
  
  if (signature) {
    parts.push(replacePlaceholders(signature, client, user, organization, noteStyleProfile));
  }
  
  return parts.join('\n');
}