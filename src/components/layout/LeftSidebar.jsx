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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

// Helper to get user initials
function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export default function LeftSidebar({ whitelabelSettings, user }) {
  const location = useLocation();

  // State for sidebar collapse
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  // State for collapsible menu sections
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);
  const [whitelabelExpanded, setWhitelabelExpanded] = useState(false);

  // Save collapse state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const brandName = whitelabelSettings?.brandName || "NurturInk";
  const logoUrl = whitelabelSettings?.logoUrl;

  // --- MENU ITEMS DEFINITION ---
  const mainMenuItems = [
    { id: "home", label: "Home", icon: Home, path: "Home" },
    { id: "send-card", label: "Send a Card", icon: Mail, path: "FindClients" },
    { id: "clients", label: "Clients", icon: Users, path: "AdminClients" },
    { id: "templates", label: "Templates", icon: FileText, path: "Templates" },
    { id: "quick-sends", label: "QuickSends", icon: Zap, path: "QuickSendTemplates" },
    { id: "credits", label: "Credits", icon: DollarSign, path: "Credits" },
    { id: "team", label: "Team", icon: UsersRound, path: "TeamManagement", roles: ["organization_owner"] },
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "Analytics" },
  ];

  const settingsMenuItems = [
    { id: "settings-profile", label: "Profile", icon: UsersRound, path: "SettingsProfile" },
    { id: "settings-organization", label: "Organization", icon: Briefcase, path: "SettingsOrganization", roles: ["organization_owner"] },
    { id: "settings-writing-style", label: "Writing Style", icon: PenTool, path: "SettingsWritingStyle" },
    { id: "settings-addresses", label: "Addresses", icon: MapPin, path: "SettingsAddresses" },
    { id: "settings-phones", label: "Phones", icon: PhoneIcon, path: "SettingsPhones" },
    { id: "settings-urls", label: "URLs", icon: LinkIcon, path: "SettingsUrls" },
  ];

  const adminMenuItems = [
    { id: "admin-sends", label: "All Sends", icon: Mail, path: "AdminSends" },
    { id: "admin-card-management", label: "Card Management", icon: FileText, path: "SuperAdminCardManagement" },
  ];

  const whitelabelMenuItems = [
    { id: "whitelabel-settings", label: "Whitelabel Settings", icon: Palette, path: "SuperAdminWhitelabel", roles: ["super_admin"] },
  ];

  // --- ROLE-BASED FILTERING ---
  const userRole = user?.appRole || user?.role;
  const filterByRole = (items) => {
    if (!items) return [];
    return items.filter(item => !item.roles || (userRole && item.roles.includes(userRole)));
  };

  const visibleMainMenuItems = filterByRole(mainMenuItems);
  const visibleSettingsItems = filterByRole(settingsMenuItems);
  const visibleAdminItems = filterByRole(adminMenuItems);
  const visibleWhitelabelItems = filterByRole(whitelabelMenuItems);

  const showSettingsSection = visibleSettingsItems.length > 0;
  const showAdminSection = visibleAdminItems.length > 0;
  const showWhitelabelSection = visibleWhitelabelItems.length > 0;

  // --- RENDER HELPERS ---
  const isMenuItemActive = (pageName) => location.pathname === createPageUrl(pageName);
  const isAnySubmenuActive = (submenuItems) => submenuItems.some(item => isMenuItemActive(item.path));

  const NavItem = ({ item, isCollapsed }) => {
    const Icon = item.icon;
    const isActive = isMenuItemActive(item.path);
    return (
      <Link
        to={createPageUrl(item.path)}
        title={isCollapsed ? item.label : ""}
        className={`flex items-center gap-3 px-3 py-1 rounded-lg transition-colors text-[17px] font-semibold ${
          isActive
            ? "bg-[var(--navItemActiveBg)] text-[var(--navItemActiveFg)] font-extrabold"
            : "text-[var(--navForeground)] hover:bg-[var(--navItemHoverBg)] hover:text-[var(--navItemActiveFg)]"
        }`}
      >
        <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[var(--navItemActiveFg)]" : ""}`} />
        {!isCollapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  const CollapsibleSection = ({ title, icon: Icon, items, expanded, setExpanded, isCollapsed }) => {
    const isActive = isAnySubmenuActive(items);
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          title={isCollapsed ? title : ""}
          className={`w-full flex items-center gap-3 px-3 py-1 rounded-lg transition-colors text-[17px] font-semibold ${
            isActive
              ? "bg-[var(--navItemActiveBg)] text-[var(--navItemActiveFg)] font-extrabold"
              : "text-[var(--navForeground)] hover:bg-[var(--navItemHoverBg)] hover:text-[var(--navItemActiveFg)]"
          }`}
        >
          <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[var(--navItemActiveFg)]" : ""}`} />
          {!isCollapsed && <span>{title}</span>}
          {!isCollapsed && (expanded ? <ChevronDown className="w-4 h-4 ml-auto" /> : <ChevronRight className="w-4 h-4 ml-auto" />)}
        </button>
        <AnimatePresence>
          {!isCollapsed && expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pl-5 mt-1"
            >
              <div className="space-y-1 border-l-2 border-gray-200/50 dark:border-gray-700/50 ml-1.5 pl-2.5">
                {items.map(item => <NavItem key={item.id} item={item} isCollapsed={isCollapsed} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header with Logo and Collapse Toggle */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between h-[68px]">
        {!isCollapsed && (
          <Link to={createPageUrl("Home")} className="flex items-center gap-2 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} className="h-16 w-auto object-contain" />
            ) : (
              <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                {getInitials(brandName)}
              </div>
            )}
          </Link>
        )}
        {isCollapsed && logoUrl && (
          <img src={logoUrl} alt={brandName} className="h-16 w-auto object-contain mx-auto" />
        )}
        {isCollapsed && !logoUrl && (
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto">
            {getInitials(brandName)}
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="shrink-0">
          {isCollapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {visibleMainMenuItems.map(item => <NavItem key={item.id} item={item} isCollapsed={isCollapsed} />)}
        {showSettingsSection && <CollapsibleSection title="Settings" icon={Settings} items={visibleSettingsItems} expanded={settingsExpanded} setExpanded={setSettingsExpanded} isCollapsed={isCollapsed} />}
        {showAdminSection && <CollapsibleSection title="Admin Portal" icon={Shield} items={visibleAdminItems} expanded={adminExpanded} setExpanded={setAdminExpanded} isCollapsed={isCollapsed} />}
        {showWhitelabelSection && <CollapsibleSection title="Whitelabel" icon={Palette} items={visibleWhitelabelItems} expanded={whitelabelExpanded} setExpanded={setWhitelabelExpanded} isCollapsed={isCollapsed} />}
      </nav>

      {/* Footer with User Menu */}
      <div className="p-2 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start text-left h-auto py-2 px-3">
              <div className="flex items-center gap-3 w-full">
                <div className="relative rounded-full shrink-0 size-9 bg-[var(--pillColor1Bg)] text-[var(--pillColor1Fg)] border border-current/20 flex items-center justify-center overflow-hidden select-none">
                  <span className="text-sm font-medium">{getInitials(user?.full_name)}</span>
                </div>
                {!isCollapsed && (
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-[var(--sidebarForeground)] truncate">{user?.full_name || "User"}</p>
                    <p className="text-xs text-[var(--navMuted)] truncate">{user?.email || ""}</p>
                  </div>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-[calc(var(--radix-popper-anchor-width)-16px)] mb-1">
            <DropdownMenuItem>
              <Users className="w-4 h-4 mr-2" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:bg-red-50 focus:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
