import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // BATCH4-A: canonical organization state — populated when user has orgId
  const [organization, setOrganization] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }
  // BATCH4-A: isRefreshing is true ONLY during a manual refreshUser() call, never during initial load
  const [isRefreshing, setIsRefreshing] = useState(false);

  // BATCH4-A: Helper to fetch and store the organization for a given user.
  // Silently fails — a failed org fetch must never block auth from completing.
  const fetchOrganization = useCallback(async (currentUser) => {
    if (!currentUser?.orgId) {
      setOrganization(null);
      return;
    }
    try {
      const orgs = await base44.entities.Organization.filter({ id: currentUser.orgId });
      setOrganization(orgs?.[0] ?? null);
    } catch (err) {
      console.error('AuthContext: organization fetch failed (non-blocking):', err);
      setOrganization(null);
    }
  }, []);

  // BATCH4-A: checkUserAuth wrapped in useCallback so checkAppState (also useCallback) can
  // safely list it as a stable dependency without triggering re-runs.
  const checkUserAuth = useCallback(async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      // Fetch org after confirming auth — failure here must not affect isLoadingAuth
      await fetchOrganization(currentUser);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setUser(null);
      setOrganization(null);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      }
    }
  }, [fetchOrganization]);

  // BATCH4-A: checkAppState converted to useCallback — previously a plain function referenced
  // in a useEffect([]) which is safe, but useCallback makes it stable for any future consumer
  // that places it in a dependency array. Behavior is identical to before.
  const checkAppState = useCallback(async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      // First, check app public settings (with token if available)
      // This will tell us if auth is required, user not registered, etc.
      const appClient = createAxiosClient({
        baseURL: `${appParams.serverUrl}/api/apps/public`,
        headers: {
          'X-App-Id': appParams.appId
        },
        token: appParams.token, // Include token if available
        interceptResponses: true
      });

      try {
        const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
        setAppPublicSettings(publicSettings);

        // If we got the app public settings successfully, check if user is authenticated
        if (appParams.token) {
          await checkUserAuth();
        } else {
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
        }
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        console.error('App state check failed:', appError);

        // Handle app-level errors
        if (appError.status === 403 && appError.data?.extra_data?.reason) {
          const reason = appError.data.extra_data.reason;
          if (reason === 'auth_required') {
            setAuthError({
              type: 'auth_required',
              message: 'Authentication required'
            });
          } else if (reason === 'user_not_registered') {
            setAuthError({
              type: 'user_not_registered',
              message: 'User not registered for this app'
            });
          } else {
            setAuthError({
              type: reason,
              message: appError.message
            });
          }
        } else {
          setAuthError({
            type: 'unknown',
            message: appError.message || 'Failed to load app'
          });
        }
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  }, [checkUserAuth]);

  useEffect(() => {
    checkAppState();
  }, [checkAppState]);

  // BATCH4-A: refreshUser — manual re-fetch of user + org for use after profile saves,
  // onboarding completion, etc. Controlled by isRefreshing, not isLoadingAuth.
  const refreshUser = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      await fetchOrganization(currentUser);
    } catch (err) {
      console.error('AuthContext: refreshUser failed:', err);
      // Do not clear user/org on refresh failure — stale data is better than blank UI
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchOrganization]);

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setOrganization(null);
    setIsAuthenticated(false);

    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    // Use the SDK's redirectToLogin method
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{
      // --- existing values (unchanged) ---
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState,
      // --- BATCH4-A additions ---
      organization,
      refreshUser,
      isRefreshing,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};