
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Home, 
  Send,        // Changed from Mail for "Send a Note"
  Settings, 
  LogOut, 
  FileText, 
  Shield, 
  ChevronDown, // New icon for dropdown
  ChevronUp    // New icon for dropdown
} from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LeftSidebar() {
  const location = useLocation();
  const [user, setUser] = useState(null); // State to hold user data
  const [openSettings, setOpenSettings] = useState(false); // State to manage settings submenu visibility

  // Effect to load user data when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      let currentUser = null;
      try {
        // Attempt to get the current user from base44 client.
        // Assuming base44.auth.getCurrentUser() is an async function or a direct property.
        if (typeof base44.auth.getCurrentUser === 'function') {
            currentUser = await base44.auth.getCurrentUser();
        } else if (base44.auth.currentUser) { // Fallback if it's a direct property
            currentUser = base44.auth.currentUser;
        }
        
        // Mock user data for local development if no real user is found
        if (!currentUser) {
            console.warn("No user found from base44.auth. Using mock user for development purposes.");
            currentUser = {
                id: 'mock-user-123',
                email: 'test@example.com',
                isOrgOwner: true, // Example: this user is an org owner
                appRole: 'organization_owner', // Example: this user has this app role
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
            appRole: 'user', // Default role
        };
      } finally {
        setUser(currentUser);
      }
    };
    fetchUser();
  }, []); // Empty dependency array ensures this runs once on mount

  const handleLogout = async () => {
    await base44.auth.logout();
    // Optionally redirect user to login page or clear local state
    setUser(null);
  };
  
  // Updated menu items with nested sub-items for Settings
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, page: 'Home' },
    { id: 'send-note', label: 'Send a Note', icon: Send, page: 'FindClients' },
    { id: 'templates', label: 'Templates', icon: FileText, page: 'Templates' },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      subItems: [
        { id: 'profile', label: 'Profile', page: 'SettingsProfile' },
        { 
          id: 'organization', 
          label: 'Organization', 
          page: 'SettingsOrganization',
          // Show for org owners AND super admins. 'user' state is required here.
          visible: user?.isOrgOwner || user?.appRole === 'organization_owner' || user?.appRole === 'super_admin'
        },
        { id: 'writing-style', label: 'Writing Style', page: 'SettingsWritingStyle' },
        { id: 'addresses', label: 'Addresses', page: 'SettingsAddresses' },
        { id: 'phone-numbers', label: 'Phone Numbers', page: 'SettingsPhones' },
        { id: 'websites-urls', label: 'Websites & URLs', page: 'SettingsUrls' }
      ]
    }
  ];

  const superAdminPageUrl = createPageUrl('SuperAdminDashboard');

  // Helper function to check if a menu item (or sub-item) is active
  const isMenuItemActive = (pageName) => {
    const pageUrl = createPageUrl(pageName);
    // Checks for exact match or startsWith for nested routes, avoiding '/' for root if not exact
    return location.pathname === pageUrl || 
           (pageUrl !== "/" && location.pathname.startsWith(pageUrl));
  };

  // Effect to automatically open the Settings submenu if any of its sub-items are active
  useEffect(() => {
    const settingsItem = menuItems.find(item => item.id === 'settings');
    if (settingsItem && settingsItem.subItems) {
      const anySubItemActive = settingsItem.subItems.some(subItem => 
        (subItem.visible === undefined || subItem.visible) && isMenuItemActive(subItem.page)
      );
      if (anySubItemActive) {
        setOpenSettings(true);
      }
    }
  }, [location.pathname, user, menuItems]); // Re-run if path, user, or menuItems (due to user) changes

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-600">RoofScribe</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          if (item.subItems) {
            // Render a collapsible section for items with subItems (e.g., "Settings")
            const Icon = item.icon;
            const hasActiveSubItem = item.subItems.some(subItem => 
              (subItem.visible === undefined || subItem.visible) && isMenuItemActive(subItem.page)
            );
            
            return (
              <div key={item.id}>
                <button
                  onClick={() => setOpenSettings(!openSettings)}
                  className={`flex items-center justify-between w-full px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
                    openSettings || hasActiveSubItem ? "bg-indigo-50 text-indigo-600 font-semibold" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {openSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSettings && (
                  <div className="ml-6 mt-1 space-y-1"> {/* Indent sub-items */}
                    {item.subItems.map((subItem) => {
                      // Only render sub-item if its 'visible' condition is true or not specified
                      if (subItem.visible === false) return null;

                      const subItemPageUrl = createPageUrl(subItem.page);
                      const isSubActive = isMenuItemActive(subItem.page);

                      return (
                        <Link
                          key={subItem.id}
                          to={subItemPageUrl}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
                            isSubActive ? "bg-indigo-50 text-indigo-600 font-semibold" : ""
                          }`}
                        >
                          <span className="text-sm">{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          } else {
            // Render regular top-level menu item
            const Icon = item.icon;
            const isActive = isMenuItemActive(item.page);
            
            return (
              <Link
                key={item.id}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
                  isActive ? "bg-indigo-50 text-indigo-600 font-semibold" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          }
        })}

        {/* Super Admin Link - This section was part of the original code and kept as per instructions.
            It's not part of the 'menuItems' array. */}
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
