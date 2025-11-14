import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home,
  Mail,
  Settings,
  LogOut,
  FileText,
  Shield,
  Users,
  DollarSign,
  BarChart3,
  UsersRound,
  Palette
} from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LeftSidebar({ whitelabelSettings }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      let currentUser = null;
      try {
        currentUser = await base44.auth.me();

        // Mock user data for local development if no real user is found
        if (!currentUser) {
            currentUser = {
                id: 'mock-user-123',
                email: 'test@example.com',
                isOrgOwner: true,
                appRole: 'organization_owner',
                // Uncomment the line below to test 'super_admin' role:
                // appRole: 'super_admin',
            };
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        // Set a default user or null on error
        currentUser = {
            id: 'error-user',
            email: 'error@example.com',
            isOrgOwner: false,
            appRole: 'user',
        };
      } finally {
        setUser(currentUser);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
    setUser(null);
  };

  // Get brand name and logo from whitelabel settings
  const brandName = whitelabelSettings?.brandName || 'RoofScribe';
  const logoUrl = whitelabelSettings?.logoUrl;

  // Menu items - super_admin has access to ALL items
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
      roles: ['sales_rep', 'organization_owner', 'super_admin']
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      path: 'AdminClients',
      roles: ['sales_rep', 'organization_owner', 'super_admin']
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: FileText,
      path: 'Templates',
      roles: ['sales_rep', 'organization_owner', 'super_admin']
    },
    {
      id: 'credits',
      label: 'Credits',
      icon: DollarSign,
      path: 'Credits',
      roles: ['sales_rep', 'organization_owner', 'super_admin']
    },
    {
      id: 'team',
      label: 'Team',
      icon: UsersRound,
      path: 'TeamManagement',
      roles: ['organization_owner', 'super_admin']
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: 'Analytics',
      roles: ['sales_rep', 'organization_owner', 'super_admin']
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
  const whitelabelPageUrl = createPageUrl('SuperAdminWhitelabel');

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

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-300">
      <div className="p-4 border-b border-gray-200">
        {logoUrl ? (
          <div className="flex items-center gap-3">
            <img 
              src={logoUrl} 
              alt={brandName}
              className="h-8 w-auto object-contain"
              onError={(e) => {
                console.error('Logo failed to load:', logoUrl);
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            <h1 className="text-2xl font-bold text-indigo-600" style={{ display: logoUrl ? 'none' : 'block' }}>
              {brandName}
            </h1>
          </div>
        ) : (
          <h1 className="text-2xl font-bold text-indigo-600">{brandName}</h1>
        )}
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

        {/* Super Admin Links - Conditionally rendered only for 'super_admin' role */}
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
            
            <Link
              to={whitelabelPageUrl}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-colors ${
                location.pathname === whitelabelPageUrl ? "bg-purple-50 text-purple-700 font-semibold" : ""
              }`}
            >
              <Palette className="w-5 h-5" />
              <span>Whitelabel</span>
            </Link>
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