import React, { useEffect, useState } from "react";
import MainLayout from "./components/layout/MainLayout";
import MobileLayout from "./components/mobile/MobileLayout";
import { Toaster } from "@/components/ui/toaster";
import { base44 } from "@/api/base44Client";
import { useLocation, useNavigate } from "react-router-dom";
import AcceptInvitation from "./pages/AcceptInvitation";
import { useIsMobile } from "./components/hooks/use-mobile";
import { CreditProvider } from "./components/context/CreditContext";
import WhitelabelThemeProvider from "./components/whitelabel/WhitelabelThemeProvider";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [whitelabelSettings, setWhitelabelSettings] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication and handle redirects
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuthenticated(authenticated);
        setIsAuthChecked(true);
        
        const normalizedPath = location.pathname.toLowerCase();
        const isWelcomePage = normalizedPath === '/' || normalizedPath === '/welcome' || normalizedPath === '/landing' || normalizedPath === '/home';
        const isPublicLandingPage = normalizedPath === '/solar' || normalizedPath === '/roofing' || normalizedPath === '/insurance' || normalizedPath === '/realestate';
        
        // Check if user is on AcceptInvitation page (handle ?page= query param)
        const searchParams = new URLSearchParams(location.search);
        const pageName = searchParams.get('page');
        const isAcceptInvitationPage = pageName?.toLowerCase() === 'acceptinvitation';
        
        // Skip redirects for AcceptInvitation page - it handles its own auth flow
        if (isAcceptInvitationPage) {
          return;
        }

        // Skip redirects for public landing pages (e.g. /Solar)
        if (isPublicLandingPage) {
          return;
        }

        // Redirect logged-in users away from Welcome page to Dashboard (mobile or desktop)
                      if (authenticated && isWelcomePage) {
                        if (isMobile) {
                          navigate('/MobileHome', { replace: true });
                        } else {
                          navigate('/Dashboard', { replace: true });
                        }
                      }

        // Redirect non-logged-in users to Welcome page if they try to access other pages
        // (but NOT public landing pages like /solar)
        if (!authenticated && !isWelcomePage && !isPublicLandingPage) {
          navigate('/Welcome', { replace: true });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthChecked(true);
        setIsAuthenticated(false);
      }
    };
    
    checkAuthAndRedirect();
  }, [location.pathname, location.search, navigate, isMobile]);

  // Load whitelabel settings for favicon (only after auth is confirmed)
  useEffect(() => {
    const loadWhitelabelSettings = async () => {
      // Only load whitelabel settings if user is authenticated
      if (!isAuthenticated) {
        return;
      }
      
      try {
        const response = await base44.functions.invoke('getWhitelabelSettings');
        setWhitelabelSettings(response.data.settings);
        
        // Update favicon if it exists
        if (response.data.settings.faviconUrl) {
          const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
          link.type = 'image/x-icon';
          link.rel = 'shortcut icon';
          link.href = response.data.settings.faviconUrl;
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        
        // Update page title if brand name exists
        if (response.data.settings.brandName) {
          document.title = response.data.settings.brandName;
        }
      } catch (error) {
        console.error('Failed to load whitelabel settings:', error);
      }
    };
    
    loadWhitelabelSettings();
  }, [isAuthenticated]);

  // Public landing pages can render immediately without auth/whitelabel
  const earlyPublicPath = location.pathname.toLowerCase();
  const isEarlyPublicPage = earlyPublicPath === '/solar' || earlyPublicPath === '/roofing' || earlyPublicPath === '/insurance' || earlyPublicPath === '/realestate';

  // Show loading state while checking auth AND waiting for whitelabel settings
  // This prevents the logo flicker by ensuring branding is loaded before rendering MainLayout
  if (!isEarlyPublicPage && (!isAuthChecked || (isAuthenticated && whitelabelSettings === null))) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check actual path - Welcome page should never show sidebar
  const normalizedPath = location.pathname.toLowerCase();
  const searchParams = new URLSearchParams(location.search);
  const pageParam = searchParams.get('page');
  
  // Check if this is AcceptInvitation page via query param
  const isAcceptInvitationPageCheck = pageParam?.toLowerCase() === 'acceptinvitation';
  
  // Check if this is Welcome/Landing page (root path without AcceptInvitation query param)
  const isWelcomePage = (normalizedPath === '/' || normalizedPath === '/welcome' || normalizedPath === '/landing' || normalizedPath === '/home') && !isAcceptInvitationPageCheck;
  
  // Public industry landing pages — render without sidebar/auth chrome
  const isPublicLandingPage = normalizedPath === '/solar' || normalizedPath === '/roofing' || normalizedPath === '/insurance';
  
  return (
    <WhitelabelThemeProvider>
      {/* Google Fonts for handwritten card preview */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Kalam:wght@400;700&family=Patrick+Hand&display=swap" 
        rel="stylesheet" 
      />
      
      {/* Custom font classes mapped to Google Fonts */}
      <style>{`
        .font-caveat {
          font-family: 'Caveat', cursive;
        }
        .font-kalam {
          font-family: 'Kalam', cursive;
        }
        .font-patrick {
          font-family: 'Patrick Hand', cursive;
          }
          `}</style>

          {isAcceptInvitationPageCheck ? (
          // WORKAROUND: Explicitly render AcceptInvitation when ?page=AcceptInvitation
          // This bypasses the Base44 router's default behavior of rendering the landing page for "/"
          <AcceptInvitation />
          ) : isWelcomePage || isPublicLandingPage ? (
          // Welcome page and public landing pages render directly without sidebar
          children
          ) : (
          // PHASE 2: Wrap authenticated pages in CreditProvider for global credit state
          <CreditProvider>
            {isMobile ? (
              // Mobile users get MobileLayout with bottom navigation
              <MobileLayout>{children}</MobileLayout>
            ) : (
              // Desktop users get MainLayout with sidebar
              <MainLayout whitelabelSettings={whitelabelSettings}>{children}</MainLayout>
            )}
          </CreditProvider>
          )}
      
      {/* Global Toaster - will auto-dismiss after 3 seconds */}
      <Toaster />
    </WhitelabelThemeProvider>
  );
}