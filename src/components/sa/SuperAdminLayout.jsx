
import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Settings, LayoutGrid, Mail, Shield, Home, Layout } from "lucide-react"; // Added Home and Layout

export default function SuperAdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      // Check if user is super admin
      if (currentUser.appRole !== 'super_admin') {
        // Redirect to home if not super admin
        window.location.href = createPageUrl('Home');
        return;
      }
      
      setUser(currentUser);
      setLoading(false);
    } catch (error) {
      console.error('Access check failed:', error);
      window.location.href = createPageUrl('Home');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: 'SuperAdminDashboard' },
    { id: 'card-management', label: 'Card Designs', icon: LayoutGrid, path: 'SuperAdminCardManagement' },
    { id: 'preview-layout', label: 'Preview Layout', icon: Layout, path: 'AdminCardLayout' },
    { id: 'content-layout', label: 'Content Layout', icon: Layout, path: 'AdminCreateContentLayout' },
    { id: 'envelope-layout', label: 'Envelope Layout', icon: Mail, path: 'AdminEnvelopeLayout' },
  ];

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">Super Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.full_name}</span>
              <Link
                to={createPageUrl('Home')}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Exit Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(10vh-73px)]">
          <nav className="p-4">
            <div className="space-y-1">
              {menuItems.map((item) => { // Changed navItems to menuItems
                const Icon = item.icon;
                const itemUrl = createPageUrl(item.path); // Changed item.pageName to item.path
                const isActive = currentPath === itemUrl;
                
                return (
                  <Link
                    key={item.id} // Changed item.pageName to item.id
                    to={itemUrl}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
