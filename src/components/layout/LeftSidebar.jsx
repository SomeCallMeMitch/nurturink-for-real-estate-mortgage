import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Home, 
  Mail, 
  Users, 
  FileText, 
  DollarSign,
  BarChart3, 
  Settings,
  Shield
} from "lucide-react";

export default function LeftSidebar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      path: 'Home',
      roles: ['sales_rep', 'organization_owner', 'super_admin']
    },
    { 
      id: 'send-card', 
      label: 'Send a Card', 
      icon: Mail, 
      path: 'FindClients',
      roles: ['sales_rep', 'organization_owner']
    },
    { 
      id: 'clients', 
      label: 'Clients', 
      icon: Users, 
      path: 'AdminClients',
      roles: ['sales_rep', 'organization_owner']
    },
    { 
      id: 'templates', 
      label: 'Templates', 
      icon: FileText, 
      path: 'Templates',
      roles: ['sales_rep', 'organization_owner']
    },
    { 
      id: 'credits', 
      label: 'Credits', 
      icon: DollarSign, 
      path: 'Credits',
      roles: ['sales_rep', 'organization_owner']
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      path: 'Analytics',
      roles: ['sales_rep', 'organization_owner']
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      path: 'SettingsProfile',
      roles: ['sales_rep', 'organization_owner']
    }
  ];

  // Admin menu items (shown at bottom)
  const adminMenuItems = [
    {
      id: 'super-admin',
      label: 'Super Admin',
      icon: Shield,
      path: 'SuperAdminDashboard',
      roles: ['super_admin']
    }
  ];

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.appRole)
  );

  const visibleAdminItems = adminMenuItems.filter(item =>
    user && item.roles.includes(user.appRole)
  );

  const currentPath = location.pathname;

  if (loading) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-600">RoofScribe</h1>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const itemUrl = createPageUrl(item.path);
          const isActive = currentPath === itemUrl;
          
          return (
            <Link
              key={item.id}
              to={itemUrl}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
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
      </nav>

      {/* Admin Section - Only show if there are admin items */}
      {visibleAdminItems.length > 0 && (
        <div className="border-t border-gray-200">
          <nav className="p-4 space-y-1">
            {visibleAdminItems.map((item) => {
              const Icon = item.icon;
              const itemUrl = createPageUrl(item.path);
              const isActive = currentPath === itemUrl;
              
              return (
                <Link
                  key={item.id}
                  to={itemUrl}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}