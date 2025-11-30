import React, { useEffect, useState } from "react";
import MainLayout from "./components/layout/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import { base44 } from "@/api/base44Client";
import { useLocation, useNavigate } from "react-router-dom";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  
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
        const isWelcomePage = normalizedPath === '/' || normalizedPath === '/welcome';

        // Redirect logged-in users away from Welcome page to Home
        if (authenticated && isWelcomePage) {
          navigate('/Home', { replace: true });
        }

        // Redirect non-logged-in users to Welcome page if they try to access other pages
        if (!authenticated && !isWelcomePage) {
          navigate('/Welcome', { replace: true });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthChecked(true);
        setIsAuthenticated(false);
      }
    };
    
    checkAuthAndRedirect();
  }, [location.pathname, navigate]);

  // Load whitelabel settings for favicon
  useEffect(() => {
    const loadWhitelabelSettings = async () => {
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
  }, []);

  // Show loading state while checking auth
  if (!isAuthChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check actual path - Welcome page should never show sidebar
  const normalizedPath = location.pathname.toLowerCase();
  const isWelcomePage = normalizedPath === '/' || normalizedPath === '/welcome';
  
  return (
    <>
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

          {isWelcomePage ? (
          // Welcome page renders directly without sidebar (unauthenticated users only)
          children
          ) : (
          // All other pages get MainLayout with sidebar (authenticated users only)
          <MainLayout whitelabelSettings={whitelabelSettings}>{children}</MainLayout>
          )}
      
      {/* Global Toaster - will auto-dismiss after 3 seconds */}
      <Toaster />
    </>
  );
}