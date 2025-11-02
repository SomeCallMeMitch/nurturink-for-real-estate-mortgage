/**
 * Utility function to verify super admin access
 * Throws error if user is not authenticated or not a super admin
 * 
 * @param {Object} base44 - Base44 SDK instance
 * @throws {Error} If user is not authenticated or not super admin
 * @returns {Promise<Object>} User object if authorized
 */
export async function requireSuperAdmin(base44) {
  const user = await base44.auth.me();
  
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }
  
  if (user.appRole !== 'super_admin') {
    throw new Error('Unauthorized: Super admin access required');
  }
  
  return user;
}