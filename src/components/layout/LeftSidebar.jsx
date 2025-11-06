import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home,
  Mail,        // Changed from Send to Mail for "Send a Card"
  Settings,
  LogOut,
  FileText,
  Shield,
  Users,       // New icon for Clients
  DollarSign,  // New icon for Credits
  BarChart3    // New icon for Analytics
} from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LeftSidebar() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Effect to load user data when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      let currentUser = null;
      try {
        console.log('🔍 [LeftSidebar] Fetching user data...');
        
        // Attempt to get the current user from base44 client
        currentUser = await base44.auth.me();
        
        console.log('✅ [LeftSidebar] User fetched successfully:', currentUser);
        console.log('👤 [LeftSidebar] User appRole:', currentUser?.appRole);
        console.log('🔐 [LeftSidebar] User full object:', JSON.stringify(currentUser, null, 2));

        // Mock user data for local development if no real user is found
        if (!currentUser) {
            console.warn("⚠️ [LeftSidebar] No user found from base44.auth.me(). Using mock user for development purposes.");
            currentUser = {
                id: 'mock-user-123',
                email: 'test@example.com',
                isOrgOwner: true,
                appRole: 'organization_owner',
                // Uncomment the line below to test 'super_admin' role:
                // appRole: 'super_admin',
            };
            console.log('🧪 [LeftSidebar] Using mock user:', currentUser);
        }
      } catch (error) {
        console.error("❌ [LeftSidebar] Failed to fetch current user:", error);
        // Set a default user or null on error
        currentUser = {
            id: 'error-user',
            email: 'error@example.com',
            isOrgOwner: false,
            appRole: 'user',
        };
        console.log('⚠️ [LeftSidebar] Using error fallback user:', currentUser);
      } finally {
        setUser(currentUser);
        console.log('📝 [LeftSidebar] Final user state set to:', currentUser);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
    setUser(null);
  };

  // Updated menu items with roles and flat structure
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
      roles: ['sales_rep', 'organization_owner', 'super_admin']
    }
  ];

  const superAdminPageUrl = createPageUrl('SuperAdminDashboard');

  // Helper function to check if a menu item is active
  const isMenuItemActive = (pageName) => {
    const pageUrl = createPageUrl(pageName);
    return location.pathname === pageUrl ||
           (pageUrl !== "/" && location.pathname.startsWith(pageUrl));
  };

  // Filter menu items based on the user's role
  const visibleMenuItems = user ? menuItems.filter(item =>
    item.roles && item.roles.includes(user.appRole)
  ) : [];

  console.log('🎯 [LeftSidebar] Visible menu items count:', visibleMenuItems.length);
  console.log('🔍 [LeftSidebar] Checking super admin condition:');
  console.log('   - user exists:', !!user);
  console.log('   - user.appRole:', user?.appRole);
  console.log('   - appRole === "super_admin":', user?.appRole === 'super_admin');
  console.log('   - Should show super admin link:', !!(user && user.appRole === 'super_admin'));

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-600">RoofScribe</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isMenuItemActive(item.path);

          return (
            <Link
              key={item.id}
              to={createPageUrl(item.path)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
                isActive ? "bg-indigo-50 text-indigo-600 font-semibold" : ""
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Super Admin Link - Conditionally rendered only for 'super_admin' role */}
        {user && user.appRole === 'super_admin' && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <Link
              to={superAdminPageUrl}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-colors ${
                location.pathname === superAdminPageUrl ? "bg-purple-50 text-purple-700 font-semibold" : ""
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Super Admin</span>
            </Link>
          </div>
        )}
        
        {user && user.appRole !== 'super_admin' && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="px-4 py-2 text-xs text-gray-400">
              ℹ️ Super Admin link hidden (appRole: {user.appRole})
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}