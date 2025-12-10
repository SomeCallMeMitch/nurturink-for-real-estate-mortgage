import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Palette,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  CreditCard,
  MapPin,
  Phone as PhoneIcon,
  Link as LinkIcon,
  PenTool,
  Briefcase,
  Ticket,
  Zap
} from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LeftSidebar({ whitelabelSettings, user }) {
  console.log('LeftSidebar: Rendering. User prop:', user);
  const location = useLocation();

  // State persistence for collapsible sections
  const [settingsExpanded, setSettingsExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebar_settings_expanded');
    return saved ? JSON.parse(saved) : false;
  });
  const [adminExpanded, setAdminExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebar_admin_expanded');
    return saved ? JSON.parse(saved) : false;
  });
  const [whitelabelExpanded, setWhitelabelExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebar_whitelabel_expanded');
    return saved ? JSON.parse(saved) : false;
  });

  // Save state to localStorage when changed
  useEffect(() => {
    localStorage.setItem('sidebar_settings_expanded', JSON.stringify(settingsExpanded));
  }, [settingsExpanded]);

  useEffect(() => {
    localStorage.setItem('sidebar_admin_expanded', JSON.stringify(adminExpanded));
  }, [adminExpanded]);

  useEffect(() => {
    localStorage.setItem('sidebar_whitelabel_expanded', JSON.stringify(whitelabelExpanded));
  }, [whitelabelExpanded]);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  // Get brand name and logo from whitelabel settings
  const brandName = whitelabelSettings?.brandName || 'RoofScribe';
  const logoUrl = whitelabelSettings?.logoUrl;

  // Main navigation items (static, non-collapsible)
  const mainMenuItems = [
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
      id: 'quick-send-templates',
      label: 'Quick Send Templates',
      icon: Zap,
      path: 'QuickSendTemplates',
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
    }
  ];

  // Settings submenu items
  const settingsMenuItems = [
    {
      id: 'settings-profile',
      label: 'Profile',
      icon: Users,
      path: 'SettingsProfile',
      roles: ['sales_rep', 'organization_owner', 'whitelabel_partner', 'super_admin', 'user']
    },
    {
      id: 'settings-organization',
      label: 'Organization',
      icon: Briefcase,
      path: 'SettingsOrganization',
      roles: ['organization_owner', 'whitelabel_partner', 'super_admin']
    },
    {
      id: 'settings-writing-style',
      label: 'Writing Style',
      icon: PenTool,
      path: 'SettingsWritingStyle',
      roles: ['sales_rep', 'organization_owner', 'whitelabel_partner', 'super_admin', 'user']
    },
    {
      id: 'settings-addresses',
      label: 'Addresses',
      icon: MapPin,
      path: 'SettingsAddresses',
      roles: ['sales_rep', 'organization_owner', 'whitelabel_partner', 'super_admin', 'user']
    },
    {
      id: 'settings-phones',
      label: 'Phones',
      icon: PhoneIcon,
      path: 'SettingsPhones',
      roles: ['sales_rep', 'organization_owner', 'whitelabel_partner', 'super_admin', 'user']
    },
    {
      id: 'settings-urls',
      label: 'URLs',
      icon: LinkIcon,
      path: 'SettingsUrls',
      roles: ['sales_rep', 'organization_owner', 'whitelabel_partner', 'super_admin', 'user']
    }
  ];

  // Admin Portal submenu items
  const adminMenuItems = [
    {
      id: 'admin-card-management',
      label: 'Card Management',
      icon: LayoutDashboard,
      path: 'SuperAdminCardManagement',
      roles: ['organization_owner', 'whitelabel_partner', 'super_admin']
    },
    {
      id: 'admin-envelope-layout',
      label: 'Envelope Layout',
      icon: Mail,
      path: 'AdminEnvelopeLayout',
      roles: ['organization_owner', 'whitelabel_partner', 'super_admin']
    },
    {
      id: 'admin-content-layout',
      label: 'Content Layout',
      icon: Palette,
      path: 'AdminCreateContentLayout',
      roles: ['organization_owner', 'whitelabel_partner', 'super_admin']
    },
    {
      id: 'admin-card-layout',
      label: 'Card Layout',
      icon: CreditCard,
      path: 'AdminCardLayout',
      roles: ['organization_owner', 'whitelabel_partner', 'super_admin']
    },
    {
      id: 'admin-pricing',
      label: 'Pricing',
      icon: DollarSign,
      path: 'AdminPricing',
      roles: ['organization_owner', 'whitelabel_partner', 'super_admin']
    },
    {
      id: 'admin-coupons',
      label: 'Coupons',
      icon: Ticket,
      path: 'AdminCoupons',
      roles: ['organization_owner', 'whitelabel_partner', 'super_admin']
    }
  ];

  // Whitelabel submenu items
  const whitelabelMenuItems = [
    {
      id: 'whitelabel-settings',
      label: 'Whitelabel Settings',
      icon: Shield,
      path: 'SuperAdminWhitelabel',
      roles: ['super_admin']
    }
  ];

  // Helper function to check if a menu item is active
  const isMenuItemActive = (pageName) => {
    const pageUrl = createPageUrl(pageName);
    return location.pathname === pageUrl ||
           (pageUrl !== "/" && location.pathname.startsWith(pageUrl));
  };

  // Helper function to check if any submenu item is active
  const isAnySubmenuActive = (submenuItems) => {
    return submenuItems.some(item => isMenuItemActive(item.path));
  };

  // Filter menu items based on the user's role
  const visibleMainMenuItems = mainMenuItems.filter(item => {
    console.log(`\n=== LeftSidebar Filter Check for "${item.label}" ===`);
    console.log(`- Item roles:`, item.roles);
    console.log(`- User object:`, user);
    console.log(`- User appRole:`, user?.appRole);
    console.log(`- User role:`, user?.role);
    
    // If no roles defined, show to everyone
    if (!item.roles || item.roles.length === 0) {
      console.log(`✅ Item '${item.label}' has no roles, showing to everyone`);
      return true;
    }
    
    // If user not logged in (or not loaded), hide items requiring roles
    if (!user) {
      console.log(`❌ Item '${item.label}' hidden - no user logged in`);
      return false;
    }

    const userRole = user?.appRole || user?.role;
    console.log(`- Computed userRole:`, userRole);
    
    // Check specific roles
    if (userRole && item.roles.includes(userRole)) {
      console.log(`✅ Item '${item.label}' visible - user role '${userRole}' matches allowed roles [${item.roles.join(', ')}]`);
      return true;
    }

    // Fallback: If item allows 'user' role, show it to any logged-in user
    if (item.roles.includes('user') && user) {
      console.log(`✅ Item '${item.label}' visible - fallback 'user' role matched`);
      return true;
    }

    console.log(`❌ Item '${item.label}' hidden - user role '${userRole}' NOT in allowed roles [${item.roles.join(', ')}]`);
    return false;
  });

  // Filter submenu items based on user role
  const visibleSettingsItems = settingsMenuItems.filter(item => {
    if (!item.roles || item.roles.length === 0) return true;
    if (!user) return false;
    const userRole = user?.appRole || user?.role;
    if (userRole && item.roles.includes(userRole)) return true;
    if (item.roles.includes('user') && user) return true;
    return false;
  });

  const visibleAdminItems = adminMenuItems.filter(item => {
    if (!item.roles || item.roles.length === 0) return true;
    if (!user) return false;
    const userRole = user?.appRole || user?.role;
    if (userRole && item.roles.includes(userRole)) return true;
    return false;
  });

  const visibleWhitelabelItems = whitelabelMenuItems.filter(item => {
    if (!item.roles || item.roles.length === 0) return true;
    if (!user) return false;
    const userRole = user?.appRole || user?.role;
    if (userRole && item.roles.includes(userRole)) return true;
    return false;
  });

  // Check if Settings section should be visible
  const showSettingsSection = visibleSettingsItems.length > 0;
  const showAdminSection = visibleAdminItems.length > 0;
  const showWhitelabelSection = visibleWhitelabelItems.length > 0;

  // Debug logging
  const userRole = user?.appRole || user?.role;
  console.log('LeftSidebar: Full user object:', user);
  console.log('LeftSidebar: User role (appRole):', user?.appRole);
  console.log('LeftSidebar: User role (role):', user?.role);
  console.log('LeftSidebar: Computed user role:', userRole);
  console.log('LeftSidebar: Visible main items count:', visibleMainMenuItems.length);
  console.log('LeftSidebar: Visible main items list:', visibleMainMenuItems.map(i => i.label));

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

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Main Navigation Items (Static) */}
        {visibleMainMenuItems.map((item) => {
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
                className={`flex items-center gap-3 px-4 py-1 rounded-lg transition-colors text-[17px] ${
                  isActive 
                    ? "bg-amber-50 text-amber-700 font-extrabold" 
                    : "text-gray-600 font-semibold hover:bg-amber-50 hover:text-amber-700"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-700' : ''}`} />
                <span>{item.label}</span>
              </Link>
            </motion.div>
          );
        })}

        {/* Settings Collapsible Section */}
        {showSettingsSection && (
          <div className="mt-2">
            <button
              onClick={() => setSettingsExpanded(!settingsExpanded)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-1 rounded-lg transition-colors text-[17px] font-bold ${
                isAnySubmenuActive(visibleSettingsItems)
                  ? "bg-amber-50 text-amber-700"
                  : "text-gray-700 hover:bg-amber-50 hover:text-amber-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`w-5 h-5 ${isAnySubmenuActive(visibleSettingsItems) ? 'text-amber-700' : ''}`} />
                <span>Settings</span>
              </div>
              {settingsExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            <AnimatePresence>
              {settingsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 mt-1 space-y-0.5">
                    {visibleSettingsItems.map((item) => {
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
                            className={`flex items-center gap-3 px-4 py-0.5 rounded-lg transition-colors text-[15px] ${
                              isActive
                                ? "bg-amber-50 text-amber-700 font-bold"
                                : "text-gray-600 font-semibold hover:bg-amber-50 hover:text-amber-700"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-amber-700' : ''}`} />
                            <span>{item.label}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Admin Portal Collapsible Section */}
        {showAdminSection && (
          <div className="mt-2">
            <button
              onClick={() => setAdminExpanded(!adminExpanded)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-1 rounded-lg transition-colors text-[17px] font-bold ${
                isAnySubmenuActive(visibleAdminItems)
                  ? "bg-amber-50 text-amber-700"
                  : "text-gray-700 hover:bg-amber-50 hover:text-amber-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className={`w-5 h-5 ${isAnySubmenuActive(visibleAdminItems) ? 'text-amber-700' : ''}`} />
                <span>Admin Portal</span>
              </div>
              {adminExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            <AnimatePresence>
              {adminExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 mt-1 space-y-0.5">
                    {visibleAdminItems.map((item) => {
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
                            className={`flex items-center gap-3 px-4 py-0.5 rounded-lg transition-colors text-[15px] ${
                              isActive
                                ? "bg-amber-50 text-amber-700 font-bold"
                                : "text-gray-600 font-semibold hover:bg-amber-50 hover:text-amber-700"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-amber-700' : ''}`} />
                            <span>{item.label}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Whitelabel Collapsible Section */}
        {showWhitelabelSection && (
          <div className="mt-2">
            <button
              onClick={() => setWhitelabelExpanded(!whitelabelExpanded)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-1 rounded-lg transition-colors text-[17px] font-bold ${
                isAnySubmenuActive(visibleWhitelabelItems)
                  ? "bg-amber-50 text-amber-700"
                  : "text-gray-700 hover:bg-amber-50 hover:text-amber-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <Palette className={`w-5 h-5 ${isAnySubmenuActive(visibleWhitelabelItems) ? 'text-amber-700' : ''}`} />
                <span>Whitelabel</span>
              </div>
              {whitelabelExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            <AnimatePresence>
              {whitelabelExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 mt-1 space-y-0.5">
                    {visibleWhitelabelItems.map((item) => {
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
                            className={`flex items-center gap-3 px-4 py-0.5 rounded-lg transition-colors text-[15px] ${
                              isActive
                                ? "bg-amber-50 text-amber-700 font-bold"
                                : "text-gray-600 font-semibold hover:bg-amber-50 hover:text-amber-700"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-amber-700' : ''}`} />
                            <span>{item.label}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button className="mb-4 flex items-center gap-3 px-4 w-full rounded-lg hover:bg-amber-50 transition-colors py-2">
             <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold text-sm">
                 {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
             </div>
             <div className="overflow-hidden text-left">
                 <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
                 <p className="text-xs text-gray-500 truncate">{user?.email}</p>
             </div>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-amber-50 hover:text-amber-700 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}