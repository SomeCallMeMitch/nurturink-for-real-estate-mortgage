import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Building2, Loader2, LogOut } from "lucide-react";

export default function AcceptInvitation() {
  const [state, setState] = useState('loading'); // loading | error | invitation | success
  const [invitationData, setInvitationData] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [accepting, setAccepting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  // Role display names mapping
  const roleNames = {
    sales_rep: 'Sales Rep',
    organization_owner: 'Organization Admin'
  };

  // Initialize: validate token and check auth status
  useEffect(() => {
    const init = async () => {
      // No token = immediate error
      if (!token) {
        setError({ 
          errorType: 'invalid', 
          errorMessage: 'No invitation token provided.' 
        });
        setState('error');
        return;
      }

      try {
        // Check auth status
        const authStatus = await base44.auth.isAuthenticated();
        setIsAuthenticated(authStatus);
        
        let user = null;
        if (authStatus) {
          user = await base44.auth.me();
          setCurrentUser(user);
        }

        // Validate the invitation token
        const result = await base44.functions.invoke('processInvitation', { token });

        if (result.data?.isValid) {
          setInvitationData(result.data);
          
          // AUTO-ACCEPT: If user is authenticated and email matches, automatically accept
          if (authStatus && user && user.email?.toLowerCase() === result.data.invitation?.email?.toLowerCase()) {
            console.log('Auto-accepting invitation - user authenticated with matching email');
            setAccepting(true);
            try {
              const acceptResult = await base44.functions.invoke('acceptInvitation', { token });
              
              if (acceptResult.data?.success) {
                setInvitationData(prev => ({
                  ...prev,
                  organizationName: acceptResult.data.organizationName
                }));
                setState('success');
                // Redirect to SettingsProfile instead of Home
                setTimeout(() => navigate('/SettingsProfile'), 2000);
              } else {
                setError(acceptResult.data);
                setState('error');
              }
            } catch (acceptErr) {
              console.error('Auto-acceptance error:', acceptErr);
              setError({ 
                errorType: 'network', 
                errorMessage: 'Failed to complete invitation acceptance. Please try again.' 
              });
              setState('error');
            } finally {
              setAccepting(false);
            }
          } else {
            // User not authenticated or email mismatch - show invitation screen
            setState('invitation');
          }
        } else {
          setError(result.data);
          setState('error');
        }
      } catch (err) {
        console.error('Invitation processing error:', err);
        setError({ 
          errorType: 'network', 
          errorMessage: 'Unable to verify invitation. Please try again.' 
        });
        setState('error');
      }
    };

    init();
  }, [token, navigate]);

  // Handle Accept button click
  const handleAcceptClick = async () => {
    if (!isAuthenticated) {
      // Send to Base44 login, return here after
      // FIXED: Pass nextUrl as string parameter, not object
      await base44.auth.redirectToLogin(`/AcceptInvitation?token=${token}`);
      return;
    }

    // Check email match
    if (currentUser?.email?.toLowerCase() !== invitationData?.invitation?.email?.toLowerCase()) {
      setError({
        errorType: 'email_mismatch',
        errorMessage: `This invitation was sent to ${invitationData.invitation.email}, but you're logged in as ${currentUser.email}.`,
        expectedEmail: invitationData.invitation.email,
        currentEmail: currentUser.email
      });
      setState('error');
      return;
    }

    // Accept the invitation
    setAccepting(true);
    try {
      const result = await base44.functions.invoke('acceptInvitation', { token });
      
      if (result.data?.success) {
        setInvitationData(prev => ({
          ...prev,
          organizationName: result.data.organizationName
        }));
        setState('success');
        // Redirect to SettingsProfile to complete account details
        setTimeout(() => navigate('/SettingsProfile'), 2000);
      } else {
        setError(result.data);
        setState('error');
      }
    } catch (err) {
      console.error('Acceptance error:', err);
      setError({ 
        errorType: 'network', 
        errorMessage: 'Failed to complete invitation acceptance. Please try again.' 
      });
      setState('error');
    } finally {
      setAccepting(false);
    }
  };

  // Handle logout for email mismatch case
  const handleLogout = async () => {
    await base44.auth.logout();
    // Reload the page to restart the flow
    window.location.reload();
  };

  // Get error title based on error type
  const getErrorTitle = (errorType) => {
    switch (errorType) {
      case 'invalid':
        return 'Invitation Not Found';
      case 'expired':
        return 'Invitation Expired';
      case 'already_accepted':
        return 'Already Accepted';
      case 'email_mismatch':
        return 'Wrong Account';
      case 'not_authenticated':
        return 'Login Required';
      default:
        return 'Something Went Wrong';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        {/* Logo Header */}
        <CardHeader className="text-center pb-2">
          <img 
            src="/logo.png"
            alt="RoofScribe" 
            className="h-12 mx-auto"
            onError={(e) => {
              // Fallback if logo doesn't load
              e.target.style.display = 'none';
            }}
          />
        </CardHeader>

        <CardContent className="pt-4">
          {/* Loading State */}
          {state === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-orange-500" />
              <p className="mt-4 text-gray-600 text-lg">Verifying your invitation...</p>
            </div>
          )}

          {/* Error State */}
          {state === 'error' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                {getErrorTitle(error?.errorType)}
              </h2>
              <p className="mt-2 text-gray-600 px-4">{error?.errorMessage}</p>
              
              {error?.errorType === 'email_mismatch' ? (
                <div className="mt-6 space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out & Try Again
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full text-gray-600"
                    onClick={() => navigate('/Home')}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              ) : error?.errorType === 'already_accepted' ? (
                <Button 
                  className="mt-6 bg-orange-500 hover:bg-orange-600"
                  onClick={() => navigate('/Home')}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <Button 
                  className="mt-6 bg-orange-500 hover:bg-orange-600"
                  onClick={() => navigate('/')}
                >
                  Go to Login
                </Button>
              )}
            </div>
          )}

          {/* Invitation State */}
          {state === 'invitation' && invitationData && (
            <div className="text-center py-4">
              <h1 className="text-xl font-semibold text-gray-900">
                You're invited to join
              </h1>
              
              {/* Organization Card */}
              <div className="mt-4 p-5 bg-orange-50 rounded-xl border border-orange-100">
                <div className="w-12 h-12 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-orange-600" />
                </div>
                <p className="mt-3 text-xl font-semibold text-gray-900">
                  {invitationData.invitation.organizationName}
                </p>
              </div>

              {/* Inviter Info */}
              <p className="mt-4 text-gray-600">
                <span className="font-medium text-gray-900">{invitationData.invitation.invitedByName}</span>
                {' '}invited you as a{' '}
                <span className="font-medium text-gray-900">
                  {invitationData.invitation.roleName || roleNames[invitationData.invitation.role] || invitationData.invitation.role}
                </span>
              </p>

              {/* Benefits Box */}
              <div className="mt-6 text-left bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-900 font-medium mb-3">What this means:</p>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Access your team's shared credits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Send handwritten cards to your clients</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Your personal account stays separate</span>
                  </li>
                </ul>
              </div>

              {/* Accept Button */}
              <Button 
                className="w-full mt-6 h-12 text-base bg-orange-500 hover:bg-orange-600" 
                size="lg"
                onClick={handleAcceptClick}
                disabled={accepting}
              >
                {accepting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  'Accept & Continue'
                )}
              </Button>

              {/* Email Note */}
              <p className="mt-4 text-xs text-gray-500">
                Invitation sent to {invitationData.invitation.email}
              </p>
            </div>
          )}

          {/* Success State */}
          {state === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                You're all set!
              </h2>
              <p className="mt-2 text-gray-600">
                Welcome to {invitationData?.invitation?.organizationName || invitationData?.organizationName}
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Redirecting to your dashboard...
              </p>
              <Loader2 className="h-5 w-5 animate-spin mx-auto mt-4 text-gray-400" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}