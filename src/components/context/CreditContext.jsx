import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { calculateTotalAvailableCredits, getCreditBreakdown } from '@/components/utils/creditHelpers';
// BATCH4-B3: AuthContext used for initial hydration only — refreshCredits() still does its own fresh reads
import { useAuth } from '@/lib/AuthContext';

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
  // BATCH4-B3: AuthContext provides initial user/org for hydration.
  // This avoids a redundant auth.me() call on mount.
  const { user: authUser, organization: authOrg, isLoadingAuth } = useAuth();

  // Core state — seeded from AuthContext on first render
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  // Start loading=true; flip to false once AuthContext has finished its own load
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  /**
   * BATCH4-B3: Hydrate from AuthContext once it has finished loading.
   * This replaces the former init() useEffect that called auth.me() directly.
   * refreshCredits() still does its own fresh reads — see below.
   */
  useEffect(() => {
    if (isLoadingAuth) return; // Wait for AuthContext to finish

    // AuthContext is done — seed our local state from it
    setUser(authUser ?? null);
    setOrganization(authOrg ?? null);
    setLoading(false);
    if (authUser) {
      setLastRefreshed(new Date());
    }
  }, [isLoadingAuth, authUser, authOrg]);

  /**
   * refreshCredits — INTENTIONALLY does its own fresh reads via auth.me() +
   * Organization.filter(). This is the guaranteed-fresh path after any
   * credit-mutating action (send, purchase, allocation, refund, etc.).
   * Do NOT replace these calls with AuthContext.refreshUser() — keeping them
   * separate prevents re-render cascades and ensures CreditContext owns its
   * own credit freshness after mutations.
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