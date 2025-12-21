import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { calculateTotalAvailableCredits, getCreditBreakdown } from '@/components/utils/creditHelpers';

/**
 * CreditContext
 * 
 * Global state management for user credits across the application.
 * Provides centralized credit data, loading states, and refresh capabilities.
 * 
 * PHASE 2: React Context Implementation
 */

const CreditContext = createContext(null);

export function CreditProvider({ children }) {
  // Core state
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  /**
   * Fetch fresh credit data from the API
   */
  const refreshCredits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Fetch organization if user has orgId
      if (currentUser?.orgId) {
        const orgList = await base44.entities.Organization.filter({ id: currentUser.orgId });
        if (orgList && orgList.length > 0) {
          setOrganization(orgList[0]);
        }
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.error('CreditContext: Failed to refresh credits:', err);
      setError(err.message || 'Failed to load credit data');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initialize credit data on mount
   */
  useEffect(() => {
    const init = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          await refreshCredits();
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('CreditContext: Init failed:', err);
        setLoading(false);
      }
    };
    init();
  }, [refreshCredits]);

  /**
   * Calculate total available credits using centralized helper
   */
  const totalCredits = calculateTotalAvailableCredits(user, organization);

  /**
   * Get detailed credit breakdown
   */
  const creditBreakdown = getCreditBreakdown(user, organization);

  /**
   * Check if user has sufficient credits for a transaction
   */
  const hasSufficientCredits = useCallback((amount) => {
    return totalCredits >= amount;
  }, [totalCredits]);

  /**
   * Get credits remaining after a potential transaction
   */
  const creditsAfterTransaction = useCallback((amount) => {
    return Math.max(0, totalCredits - amount);
  }, [totalCredits]);

  // Context value
  const value = {
    // Data
    user,
    organization,
    totalCredits,
    creditBreakdown,
    
    // State
    loading,
    error,
    lastRefreshed,
    
    // Actions
    refreshCredits,
    hasSufficientCredits,
    creditsAfterTransaction,
    
    // Direct setters for optimistic updates
    setUser,
    setOrganization,
  };

  return (
    <CreditContext.Provider value={value}>
      {children}
    </CreditContext.Provider>
  );
}

/**
 * Hook to access credit context
 * @returns {object} Credit context value
 * @throws {Error} If used outside of CreditProvider
 */
export function useCredits() {
  const context = useContext(CreditContext);
  
  if (!context) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  
  return context;
}

/**
 * Hook for components that may be outside provider (returns null-safe defaults)
 * @returns {object} Credit context value or safe defaults
 */
export function useCreditsOptional() {
  const context = useContext(CreditContext);
  
  if (!context) {
    return {
      user: null,
      organization: null,
      totalCredits: 0,
      creditBreakdown: { companyAllocated: 0, personalPurchased: 0, companyPool: 0, canAccessPool: false, total: 0 },
      loading: false,
      error: null,
      lastRefreshed: null,
      refreshCredits: async () => {},
      hasSufficientCredits: () => false,
      creditsAfterTransaction: () => 0,
      setUser: () => {},
      setOrganization: () => {},
    };
  }
  
  return context;
}

export default CreditContext;