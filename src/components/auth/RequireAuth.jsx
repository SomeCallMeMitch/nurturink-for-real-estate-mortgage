import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2 } from "lucide-react";

/**
 * RequireAuth wrapper component
 * Redirects unauthenticated users to the landing page
 * Shows loading state while checking authentication
 */
export default function RequireAuth({ children }) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        
        if (!isAuth) {
          navigate(createPageUrl('lp'));
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate(createPageUrl('lp'));
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return isAuthenticated ? children : null;
}