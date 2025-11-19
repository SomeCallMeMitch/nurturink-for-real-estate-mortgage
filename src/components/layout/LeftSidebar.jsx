import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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

export default function LeftSidebar({ whitelabelSettings, user }) {
  const location = useLocation();

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  // Get brand name and logo from whitelabel settings
  const brandName = whitelabelSettings?.brandName || 'RoofScribe';
  const logoUrl = whitelabelSettings?.logoUrl;

  // Menu items
  // Added 'user' role to all common items to ensure fallback access
  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: 'Home',
      roles: ['sales_rep', 'organization_owner', 'whitelabel_partner', 'super_admin', 'user']
    },
    {
      id: 'send-card',
      label: 'Send a Card',
      icon: Mail,
      path: 'FindClients',
      roles: ['sales_rep', 'organization_owner', 'whitelabel_partner', 'super_admin', 'user']
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      path: 'AdminClients',
      roles: ['sales_rep', 'organization_owner', 'whitelabel_partner', 'super_admin', 'user']
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: FileText,
      path: 'Templates',
      roles: ['sales_rep', 'organization_owner', 'whitelabel_partner', 'super_admin', 'user']
    },
    {
      id: 'credits',
      label: 'Credits',
      icon: DollarSign,
      path: 'Credits',
      roles: ['sales_rep', 'organization_owner', 'whitelabel_partner', 'super_admin', 'user']
    },
    {
      id: 'team',
      label: 'Team',
      icon: UsersRound,
      path: 'TeamManagement',
      roles: ['organization_owner', 'whitelabel_partner', 'super_admin']
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: 'Analytics',
      roles: ['sales_rep', 'organization_owner', 'whitelabel_partner', 'super_admin', 'user']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: 'SettingsProfile',
      roles: ['sales_rep', 'organization_owner', 'whitelabel_partner', 'super_admin', 'user']
    }
  ];

  // Helper function to check if a menu item is active
  const isMenuItemActive = (pageName) => {
    const pageUrl = createPageUrl(pageName);
    return location.pathname === pageUrl ||
           (pageUrl !== "/" && location.pathname.startsWith(pageUrl));
  };

  // Filter menu items based on the user's role
  const visibleMenuItems = menuItems.filter(item => {
    // If no roles defined, show to everyone
    if (!item.roles || item.roles.length === 0) return true;
    
    // If user not logged in (or not loaded), hide items requiring roles
    if (!user) return false;

    // Check specific roles
    if (user.appRole && item.roles.includes(user.appRole)) return true;
    if (user.role && item.roles.includes(user.role)) return true;

    // Fallback: If item allows 'user' role, show it to any logged-in user
    // This ensures users without a specific 'appRole' still see basic items
    if (item.roles.includes('user')) return true;

    return false;
  });

  return (
    // Changed w-64 to w-[16rem] to break any potential CSS selector matches from Landing Page styles
    <aside className="w-[16rem] bg-white border-r border-gray-200 flex flex-col h-full">
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
            <h1 className="text-2xl font-bold text-blue-600" style={{ display: logoUrl ? 'none' : 'block' }}>
              {brandName}
            </h1>
          </div>
        ) : (
          <h1 className="text-2xl font-bold text-blue-600">{brandName}</h1>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isMenuItemActive(item.path);

          return (
            <motion.div
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <Link
                to={createPageUrl(item.path)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActive ? "bg-blue-50 text-blue-600 font-semibold shadow-sm" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-4 flex items-center gap-3 px-4">
             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                 {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
             </div>
             <div className="overflow-hidden">
                 <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
                 <p className="text-xs text-gray-500 truncate">{user?.email}</p>
             </div>
        </div>
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