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
  Zap,
  Send,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function LeftSidebar({ whitelabelSettings, user }) {
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const [settingsExpanded, setSettingsExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebar_settings_expanded");
    return saved ? JSON.parse(saved) : false;
  });

  const [adminExpanded, setAdminExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebar_admin_expanded");
    return saved ? JSON.parse(saved) : false;
  });

  const [whitelabelExpanded, setWhitelabelExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebar_whitelabel_expanded");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem("sidebar_settings_expanded", JSON.stringify(settingsExpanded));
  }, [settingsExpanded]);

  useEffect(() => {
    localStorage.setItem("sidebar_admin_expanded", JSON.stringify(adminExpanded));
  }, [adminExpanded]);

  useEffect(() => {
    localStorage.setItem("sidebar_whitelabel_expanded", JSON.stringify(whitelabelExpanded));
  }, [whitelabelExpanded]);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const brandName = whitelabelSettings?.brandName || "NurturInk";
  const logoUrl = whitelabelSettings?.logoUrl;

  const mainMenuItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "Home",
      roles: ["sales_rep", "organization_owner", "whitelabel_partner", "super_admin", "user"],
    },
    {
      id: "send-card",
      label: "Send a Card",
      icon: Mail,
      path: "FindClients",
      roles: ["sales_rep", "organization_owner", "whitelabel_partner", "super_admin", "user"],
    },
    {
      id: "clients",
      label: "Clients",
      icon: Users,
      path: "AdminClients",
      roles: ["sales_rep", "organization_owner", "whitelabel_partner", "super_admin", "user"],
    },
    {
      id: "templates",
      label: "Templates",
      icon: FileText,
      path: "Templates",
      roles: ["sales_rep", "organization_owner", "whitelabel_partner", "super_admin", "user"],
    },
    {
      id: "quick-send-templates",
      label: "QuickSends",
      icon: Zap,
      path: "QuickSendTemplates",
      roles: ["sales_rep", "organization_owner", "whitelabel_partner", "super_admin", "user"],
    },
    {
      id: "credits",
      label: "Credits",
      icon: DollarSign,
      path: "Credits",
      roles: ["sales_rep", "organization_owner", "whitelabel_partner", "super_admin", "user"],
    },
    {
      id: "team",
      label: "Team",
      icon: UsersRound,
      path: "TeamManagement",
      roles: ["organization_owner", "organization_manager", "whitelabel_partner", "super_admin"],
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      path: "Analytics",
      roles: ["sales_rep", "organization_owner", "whitelabel_partner", "super_admin", "user"],
    },
  ];

  const settingsMenuItems = [
    {
      id: "settings-profile",
      label: "Profile",
      icon: Users,
      path: "SettingsProfile",
      roles: ["sales_rep", "organization_owner", "whitelabel_partner", "super_admin", "user"],
    },
    {
      id: "settings-organization",
      label: "Organization",
      icon: Briefcase,
      path: "SettingsOrganization",
      roles: ["organization_owner", "whitelabel_partner", "super_admin"],
    },
    {
      id: "settings-writing-style",
      label: "Writing Style",
      icon: PenTool,
      path: "SettingsWritingStyle",
      roles: ["sales_rep", "organization_owner", "whitelabel_partner", "super_admin", "user"],
    },
    {
      id: "settings-addresses",
      label: "Addresses",
      icon: MapPin,
      path: "SettingsAddresses",
      roles: ["sales_rep", "organization_owner", "whitelabel_partner", "super_admin", "user"],
    },
    {
      id: "settings-phones",
      label: "Phones",
      icon: PhoneIcon,
      path: "SettingsPhones",
      roles: ["sales_rep", "organization_owner", "whitelabel_partner", "super_admin", "user"],
    },
    {
      id: "settings-urls",
      label: "URLs",
      icon: LinkIcon,
      path: "SettingsUrls",
      roles: ["sales_rep", "organization_owner", "whitelabel_partner", "super_admin", "user"],
    },
  ];

  const adminMenuItems = [
    {
      id: "admin-sends",
      label: "All Sends",
      icon: Send,
      path: "AdminSends",
      roles: ["organization_owner", "whitelabel_partner", "super_admin"],
    },
    {
      id: "admin-card-management",
      label: "Card Management",
      icon: LayoutDashboard,
      path: "SuperAdminCardManagement",
      roles: ["organization_owner", "whitelabel_partner", "super_admin"],
    },
    {
      id: "admin-envelope-layout",
      label: "Envelope Layout",
      icon: Mail,
      path: "AdminEnvelopeLayout",
      roles: ["organization_owner", "whitelabel_partner", "super_admin"],
    },
    {
      id: "admin-content-layout",
      label: "Content Layout",
      icon: Palette,
      path: "AdminCreateContentLayout",
      roles: ["organization_owner", "whitelabel_partner", "super_admin"],
    },
    {
      id: "admin-card-layout",
      label: "Card Layout",
      icon: CreditCard,
      path: "AdminCardLayout",
      roles: ["organization_owner", "whitelabel_partner", "super_admin"],
    },
    {
      id: "admin-pricing",
      label: "Pricing",
      icon: DollarSign,
      path: "AdminPricing",
      roles: ["organization_owner", "whitelabel_partner", "super_admin"],
    },
    {
      id: "admin-coupons",
      label: "Coupons",
      icon: Ticket,
      path: "AdminCoupons",
      roles: ["organization_owner", "whitelabel_partner", "super_admin"],
    },
  ];

  const whitelabelMenuItems = [
    {
      id: "whitelabel-settings",
      label: "Whitelabel Settings",
      icon: Shield,
      path: "SuperAdminWhitelabel",
      roles: ["super_admin"],
    },
  ];

  const isMenuItemActive = (pageName) => {
    const pageUrl = createPageUrl(pageName);
    return location.pathname === pageUrl || (pageUrl !== "/" && location.pathname.startsWith(pageUrl));
  };

  const isAnySubmenuActive = (submenuItems) => {
    return submenuItems.some((item) => isMenuItemActive(item.path));
  };

  const visibleMainMenuItems = mainMenuItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    if (!user) return false;
    const userRole = user?.appRole || user?.role;
    if (userRole && item.roles.includes(userRole)) return true;
    if (item.roles.includes("user") && user) return true;
    return false;
  });

  const visibleSettingsItems = settingsMenuItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    if (!user) return false;
    const userRole = user?.appRole || user?.role;
    if (userRole && item.roles.includes(userRole)) return true;
    if (item.roles.includes("user") && user) return true;
    return false;
  });

  const visibleAdminItems = adminMenuItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    if (!user) return false;
    const userRole = user?.appRole || user?.role;
    if (userRole && item.roles.includes(userRole)) return true;
    return false;
  });

  const visibleWhitelabelItems = whitelabelMenuItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    if (!user) return false;
    const userRole = user?.appRole || user?.role;
    if (userRole && item.roles.includes(userRole)) return true;
    return false;
  });

  const showSettingsSection = visibleSettingsItems.length > 0;
  const showAdminSection = visibleAdminItems.length > 0;
  const showWhitelabelSection = visibleWhitelabelItems.length > 0;

  const renderMenuItem = (item, isSubmenu = false) => {
    const Icon = item.icon;
    const isActive = isMenuItemActive(item.path);
    const itemClasses = isSubmenu
      ? `flex items-center gap-3 px-4 py-0.5 rounded-lg transition-colors text-[15px] ${
          isActive
            ? "bg-[var(--navItemActiveBg)] text-[var(--navItemActiveFg)] font-bold"
            : "text-gray-600 font-semibold hover:bg-[var(--navItemHoverBg)] hover:text-[var(--navItemActiveFg)]"
        }`
      : `flex items-center gap-3 px-4 py-1 rounded-lg transition-colors text-[17px] ${
          isActive
            ? "bg-[var(--navItemActiveBg)] text-[var(--navItemActiveFg)] font-extrabold"
            : "text-gray-600 font-semibold hover:bg-[var(--navItemHoverBg)] hover:text-[var(--navItemActiveFg)]"
        }`;

    const iconSize = isSubmenu ? "w-4 h-4" : "w-5 h-5";

    if (isCollapsed) {
      return (
        <TooltipProvider key={item.id} delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.15 }}>
                <Link
                  to={createPageUrl(item.path)}
                  className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[var(--navItemActiveBg)] text-[var(--navItemActiveFg)]"
                      : "text-gray-600 hover:bg-[var(--navItemHoverBg)] hover:text-[var(--navItemActiveFg)]"
                  }`}
                >
                  <Icon className={iconSize} />
                </Link>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <motion.div
        key={item.id}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        <Link to={createPageUrl(item.path)} className={itemClasses}>
          <Icon className={`${iconSize} ${isActive ? "text-[var(--navItemActiveFg)]" : ""}`} />
          <span>{item.label}</span>
        </Link>
      </motion.div>
    );
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-[16rem]"
      } bg-[var(--sidebarBackground)] border-r border-[var(--sidebarBorder)] flex flex-col h-full transition-all duration-300`}
    >
      <div className="p-4 border-b border-[var(--sidebarBorder)] flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={brandName}
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <h1 className="text-2xl font-bold text-blue-600">{brandName}</h1>
            )}
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleMainMenuItems.map((item) => renderMenuItem(item))}

        {showSettingsSection && (
          <div className="mt-2">
            {isCollapsed ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSettingsExpanded(!settingsExpanded)}
                      className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
                        isAnySubmenuActive(visibleSettingsItems)
                          ? "bg-[var(--navItemActiveBg)] text-[var(--navItemActiveFg)]"
                          : "text-gray-700 hover:bg-[var(--navItemHoverBg)] hover:text-[var(--navItemActiveFg)]"
                      }`}
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <button
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-1 rounded-lg transition-colors text-[17px] font-bold ${
                  isAnySubmenuActive(visibleSettingsItems)
                    ? "bg-[var(--navItemActiveBg)] text-[var(--navItemActiveFg)]"
                    : "text-gray-700 hover:bg-[var(--navItemHoverBg)] hover:text-[var(--navItemActiveFg)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className={`w-5 h-5 ${isAnySubmenuActive(visibleSettingsItems) ? "text-[var(--navItemActiveFg)]" : ""}`} />
                  <span>Settings</span>
                </div>
                {settingsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}

            <AnimatePresence>
              {settingsExpanded && !isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 mt-1 space-y-0.5">
                    {visibleSettingsItems.map((item) => renderMenuItem(item, true))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {showAdminSection && (
          <div className="mt-2">
            {isCollapsed ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setAdminExpanded(!adminExpanded)}
                      className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
                        isAnySubmenuActive(visibleAdminItems)
                          ? "bg-[var(--navItemActiveBg)] text-[var(--navItemActiveFg)]"
                          : "text-gray-700 hover:bg-[var(--navItemHoverBg)] hover:text-[var(--navItemActiveFg)]"
                      }`}
                    >
                      <Shield className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Admin Portal</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <button
                onClick={() => setAdminExpanded(!adminExpanded)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-1 rounded-lg transition-colors text-[17px] font-bold ${
                  isAnySubmenuActive(visibleAdminItems)
                    ? "bg-[var(--navItemActiveBg)] text-[var(--navItemActiveFg)]"
                    : "text-gray-700 hover:bg-[var(--navItemHoverBg)] hover:text-[var(--navItemActiveFg)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield className={`w-5 h-5 ${isAnySubmenuActive(visibleAdminItems) ? "text-[var(--navItemActiveFg)]" : ""}`} />
                  <span>Admin Portal</span>
                </div>
                {adminExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}

            <AnimatePresence>
              {adminExpanded && !isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 mt-1 space-y-0.5">
                    {visibleAdminItems.map((item) => renderMenuItem(item, true))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {showWhitelabelSection && (
          <div className="mt-2">
            {isCollapsed ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setWhitelabelExpanded(!whitelabelExpanded)}
                      className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
                        isAnySubmenuActive(visibleWhitelabelItems)
                          ? "bg-[var(--navItemActiveBg)] text-[var(--navItemActiveFg)]"
                          : "text-gray-700 hover:bg-[var(--navItemHoverBg)] hover:text-[var(--navItemActiveFg)]"
                      }`}
                    >
                      <Palette className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Whitelabel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <button
                onClick={() => setWhitelabelExpanded(!whitelabelExpanded)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-1 rounded-lg transition-colors text-[17px] font-bold ${
                  isAnySubmenuActive(visibleWhitelabelItems)
                    ? "bg-[var(--navItemActiveBg)] text-[var(--navItemActiveFg)]"
                    : "text-gray-700 hover:bg-[var(--navItemHoverBg)] hover:text-[var(--navItemActiveFg)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Palette className={`w-5 h-5 ${isAnySubmenuActive(visibleWhitelabelItems) ? "text-[var(--navItemActiveFg)]" : ""}`} />
                  <span>Whitelabel</span>
                </div>
                {whitelabelExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}

            <AnimatePresence>
              {whitelabelExpanded && !isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 mt-1 space-y-0.5">
                    {visibleWhitelabelItems.map((item) => renderMenuItem(item, true))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-[var(--sidebarBorder)]">
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold text-sm">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-gray-600 hover:bg-[var(--navItemHoverBg)] hover:text-[var(--navItemActiveFg)] transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{user?.full_name || "User"}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <>
            <button className="mb-2 flex items-center gap-3 px-2 w-full rounded-lg hover:bg-[var(--navItemHoverBg)] transition-colors py-1.5">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="overflow-hidden text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-[var(--navItemHoverBg)] hover:text-[var(--navItemActiveFg)] transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}