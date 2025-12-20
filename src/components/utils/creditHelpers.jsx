/**
 * Credit Helpers Utility Module
 * 
 * Centralized credit calculation and helper functions for the RoofScribe credit system.
 * This module ensures consistent credit handling across all pages.
 * 
 * Credit Consumption Priority:
 * 1. Company Allocated (user.companyAllocatedCredits) - Used first
 * 2. Company Pool (organization.creditBalance) - Used second (if canAccessCompanyPool !== false)
 * 3. Personal Purchased (user.personalPurchasedCredits) - Used last
 */

/**
 * Calculate total available credits for a user
 * This is the STANDARD calculation that should be used everywhere.
 * 
 * @param {Object} user - User object with credit fields
 * @param {number} [user.companyAllocatedCredits] - Credits allocated by org owner
 * @param {number} [user.personalPurchasedCredits] - Credits purchased personally
 * @param {boolean} [user.canAccessCompanyPool] - Whether user can draw from org pool
 * @param {Object} organization - Organization object
 * @param {number} [organization.creditBalance] - Company pool credits
 * @returns {number} Total available credits
 */
export function calculateTotalAvailableCredits(user, organization) {
  if (!user) return 0;
  
  const companyAllocated = user.companyAllocatedCredits || 0;
  const personalPurchased = user.personalPurchasedCredits || 0;
  
  // Only include company pool if user has access (default to true if undefined)
  const canAccessPool = user.canAccessCompanyPool !== false;
  const companyCredits = canAccessPool ? (organization?.creditBalance || 0) : 0;
  
  return companyAllocated + companyCredits + personalPurchased;
}

/**
 * Get a detailed breakdown of credit sources
 * 
 * @param {Object} user - User object with credit fields
 * @param {Object} organization - Organization object
 * @returns {Object} Detailed credit breakdown
 */
export function getCreditBreakdown(user, organization) {
  if (!user) {
    return {
      companyAllocated: 0,
      personalPurchased: 0,
      companyPool: 0,
      canAccessPool: false,
      total: 0
    };
  }
  
  const companyAllocated = user.companyAllocatedCredits || 0;
  const personalPurchased = user.personalPurchasedCredits || 0;
  const canAccessPool = user.canAccessCompanyPool !== false;
  const companyPool = canAccessPool ? (organization?.creditBalance || 0) : 0;
  
  return {
    companyAllocated,
    personalPurchased,
    companyPool,
    canAccessPool,
    total: companyAllocated + companyPool + personalPurchased
  };
}

/**
 * Check if user has sufficient credits for a transaction
 * 
 * @param {Object} user - User object with credit fields
 * @param {Object} organization - Organization object
 * @param {number} creditsNeeded - Number of credits required
 * @returns {Object} Sufficiency check result
 */
export function checkCreditSufficiency(user, organization, creditsNeeded) {
  const totalAvailable = calculateTotalAvailableCredits(user, organization);
  const sufficient = totalAvailable >= creditsNeeded;
  const shortfall = sufficient ? 0 : creditsNeeded - totalAvailable;
  
  return {
    sufficient,
    totalAvailable,
    creditsNeeded,
    shortfall,
    remaining: sufficient ? totalAvailable - creditsNeeded : 0
  };
}

/**
 * Calculate credits remaining after a deduction
 * 
 * @param {Object} user - User object with credit fields
 * @param {Object} organization - Organization object
 * @param {number} deductionAmount - Number of credits to deduct
 * @returns {number} Credits remaining after deduction (never negative)
 */
export function calculateCreditsAfterDeduction(user, organization, deductionAmount) {
  const totalAvailable = calculateTotalAvailableCredits(user, organization);
  return Math.max(0, totalAvailable - deductionAmount);
}

/**
 * Format credit number for display with optional label
 * 
 * @param {number} credits - Number of credits
 * @param {boolean} [includeLabel=true] - Whether to include "credit(s)" label
 * @returns {string} Formatted credit string
 */
export function formatCredits(credits, includeLabel = true) {
  const num = credits || 0;
  if (!includeLabel) return num.toLocaleString();
  
  const label = num === 1 ? 'credit' : 'credits';
  return `${num.toLocaleString()} ${label}`;
}

/**
 * Check if user can allocate credits to team members
 * Only organization_owner and super_admin can allocate credits
 * 
 * @param {Object} user - User object with role information
 * @returns {boolean} Whether user can allocate credits
 */
export function canAllocateCredits(user) {
  if (!user) return false;
  const role = user.appRole || user.role;
  return role === 'organization_owner' || role === 'super_admin';
}

/**
 * Check if user is a super admin
 * 
 * @param {Object} user - User object with role information
 * @returns {boolean} Whether user is super admin
 */
export function isSuperAdmin(user) {
  if (!user) return false;
  const role = user.appRole || user.role;
  return role === 'super_admin';
}

/**
 * Check if user is an organization owner
 * 
 * @param {Object} user - User object with role information
 * @returns {boolean} Whether user is organization owner
 */
export function isOrganizationOwner(user) {
  if (!user) return false;
  const role = user.appRole || user.role;
  return role === 'organization_owner';
}

/**
 * Check if user can view organization credit pool
 * 
 * @param {Object} user - User object with role information
 * @returns {boolean} Whether user can view org pool
 */
export function canViewOrgPool(user) {
  if (!user) return false;
  const role = user.appRole || user.role;
  return role === 'organization_owner' || role === 'super_admin';
}

/**
 * Get credit status color based on remaining credits and threshold
 * 
 * @param {number} remainingCredits - Credits remaining
 * @param {number} [warningThreshold=10] - Threshold for warning color
 * @param {number} [dangerThreshold=3] - Threshold for danger color
 * @returns {string} Color indicator: 'green', 'amber', or 'red'
 */
export function getCreditStatusColor(remainingCredits, warningThreshold = 10, dangerThreshold = 3) {
  if (remainingCredits <= dangerThreshold) return 'red';
  if (remainingCredits <= warningThreshold) return 'amber';
  return 'green';
}