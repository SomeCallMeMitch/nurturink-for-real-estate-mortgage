"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard as Dashboard,
  Mail,
  Users,
  FileText,
  DollarSign,
  UsersRound,
  BarChart3 as Analytics,
  Settings as SettingsIcon,
  Search as SearchIcon,
  ChevronDown as ChevronDownIcon,
  LogOut,
  Shield,
  Palette,
  Plus,
  CreditCard,
  UserCircle
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

// Softer spring animation curve
const softSpringEasing = "cubic-bezier(0.25, 1.1, 0.4, 1)";

/* ----------------------------- Brand / Logos ----------------------------- */

function BrandBadge({ whitelabelSettings, isCollapsed }) {
  const logoUrl = whitelabelSettings?.logoUrl;
  const brandName = whitelabelSettings?.brandName || 'RoofScribe';

  if (isCollapsed) return null;

  return (
    <div className="relative shrink-0 w-full">
      <div className="flex items-center p-1 w-full h-12">
        {logoUrl ? (
          <div className="flex items-center gap-3 px-2">
            <img 
              src={logoUrl} 
              alt={brandName}
              className="h-8 w-auto object-contain"
            />
            {/* Hide text if logo is present, or show it? Usually hide if logo has text. 
                Let's show text only if no logo, or side-by-side if fitting. */}
          </div>
        ) : (
          <div className="px-4 py-1">
            <div className="font-semibold text-lg text-blue-600 truncate">
              {brandName}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniLogo({ whitelabelSettings }) {
  const logoUrl = whitelabelSettings?.logoUrl;
  
  return (
    <div className="size-10 flex items-center justify-center">
      {logoUrl ? (
        <img src={logoUrl} alt="Logo" className="h-6 w-6 object-contain" />
      ) : (
        <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          R
        </div>
      )}
    </div>
  );
}

/* --------------------------------- Avatar -------------------------------- */

function AvatarCircle({ user }) {
  const initials = user?.full_name 
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="relative rounded-full shrink-0 size-8 bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center overflow-hidden select-none">
        <span className="text-xs font-medium">{initials}</span>
    </div>
  );
}

/* --------------------------- Types / Content Map -------------------------- */

function getSidebarContent(activeSection, user, role) {
  const navigate = (path) => {
    // Helper for content definition, though we can't easily pass function in static object without context.
    // We'll stick to defining 'path' property and handling click in MenuItem.
  };

  // Define visibility based on roles
  const hasRole = (allowedRoles) => !allowedRoles || (user && allowedRoles.includes(user.appRole));

  const contentMap = {
    dashboard: {
      title: "Dashboard",
      sections: [
        {
          title: "Overview",
          items: [
            { icon: <Dashboard size={16} />, label: "Home", path: "Home", isActive: true },
          ],
        },
        {
          title: "Quick Actions",
          items: [
            { icon: <Plus size={16} />, label: "Send a Card", path: "FindClients" },
          ],
        }
      ],
    },
    mailing: {
      title: "Mailing",
      sections: [
        {
          title: "Actions",
          items: [
            { icon: <Mail size={16} />, label: "Send a Card", path: "FindClients" },
          ],
        },
        // Add History or Campaigns here if available
      ],
    },
    contacts: {
      title: "Contacts",
      sections: [
        {
          title: "Management",
          items: [
            { icon: <Users size={16} />, label: "All Clients", path: "AdminClients" },
          ],
        },
      ],
    },
    templates: {
      title: "Templates",
      sections: [
        {
          title: "Library",
          items: [
            { icon: <FileText size={16} />, label: "My Templates", path: "Templates" },
          ],
        },
      ],
    },
    credits: {
      title: "Credits",
      sections: [
        {
          title: "Finance",
          items: [
            { icon: <DollarSign size={16} />, label: "Credit Balance", path: "Credits" },
            { icon: <CreditCard size={16} />, label: "Purchase Credits", path: "Order" },
          ],
        },
      ],
    },
    team: {
      title: "Team",
      sections: [
        {
          title: "Organization",
          items: [
            { icon: <UsersRound size={16} />, label: "Team Management", path: "TeamManagement" },
          ],
        },
      ],
    },
    analytics: {
      title: "Analytics",
      sections: [
        {
          title: "Reports",
          items: [
            { icon: <Analytics size={16} />, label: "Overview", path: "Analytics" },
          ],
        },
      ],
    },
    settings: {
      title: "Settings",
      sections: [
        {
          title: "Account",
          items: [
            { icon: <UserCircle size={16} />, label: "Profile", path: "SettingsProfile" },
          ],
        },
        ...(hasRole(['super_admin']) ? [{
          title: "Administration",
          items: [
            { icon: <Shield size={16} />, label: "Super Admin", path: "SuperAdminDashboard" },
            { icon: <Palette size={16} />, label: "Whitelabel", path: "SuperAdminWhitelabel" },
          ]
        }] : [])
      ],
    },
  };

  // Filter out sections that might be empty or restricted? 
  // For now, we assume the IconNavigation handles high-level permission visibility.
  
  return contentMap[activeSection] || contentMap.dashboard;
}

/* ---------------------------- Left Icon Nav Rail -------------------------- */

function IconNavButton({
  children,
  isActive = false,
  onClick,
  tooltip
}) {
  return (
    <button
      type="button"
      className={`group flex items-center justify-center rounded-lg size-10 min-w-10 transition-colors duration-300 relative
        ${isActive ? "bg-blue-600 text-white shadow-md" : "hover:bg-blue-50 text-gray-500 hover:text-blue-600"}`}
      style={{ transitionTimingFunction: softSpringEasing }}
      onClick={onClick}
      title={tooltip}
    >
      {children}
    </button>
  );
}

function IconNavigation({
  activeSection,
  onSectionChange,
  whitelabelSettings,
  user
}) {
  // Define nav items with permissions
  const allNavItems = [
    { id: "dashboard", icon: <Dashboard size={20} />, label: "Dashboard", roles: ['sales_rep', 'organization_owner', 'super_admin'] },
    { id: "mailing", icon: <Mail size={20} />, label: "Mailing", roles: ['sales_rep', 'organization_owner', 'super_admin'] },
    { id: "contacts", icon: <Users size={20} />, label: "Contacts", roles: ['sales_rep', 'organization_owner', 'super_admin'] },
    { id: "templates", icon: <FileText size={20} />, label: "Templates", roles: ['sales_rep', 'organization_owner', 'super_admin'] },
    { id: "credits", icon: <DollarSign size={20} />, label: "Credits", roles: ['sales_rep', 'organization_owner', 'super_admin'] },
    { id: "team", icon: <UsersRound size={20} />, label: "Team", roles: ['organization_owner', 'super_admin'] },
    { id: "analytics", icon: <Analytics size={20} />, label: "Analytics", roles: ['sales_rep', 'organization_owner', 'super_admin'] },
  ];

  const visibleItems = user ? allNavItems.filter(item => item.roles.includes(user.appRole)) : [];

  return (
    <aside className="bg-white flex flex-col gap-2 items-center p-3 w-16 h-full border-r border-gray-200 z-20 shadow-sm">
      {/* Logo */}
      <div className="mb-4 mt-2">
        <MiniLogo whitelabelSettings={whitelabelSettings} />
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col gap-3 w-full items-center">
        {visibleItems.map((item) => (
          <IconNavButton
            key={item.id}
            isActive={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
            tooltip={item.label}
          >
            {item.icon}
          </IconNavButton>
        ))}
      </div>

      <div className="flex-1" />

      {/* Bottom section */}
      <div className="flex flex-col gap-3 w-full items-center mb-4">
        <IconNavButton 
          isActive={activeSection === "settings"} 
          onClick={() => onSectionChange("settings")}
          tooltip="Settings"
        >
          <SettingsIcon size={20} />
        </IconNavButton>
        
        <div className="cursor-pointer" onClick={() => onSectionChange("settings")}>
          <AvatarCircle user={user} />
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------ Right Sidebar ----------------------------- */

function SectionTitle({
  title,
  onToggleCollapse,
  isCollapsed,
}) {
  return (
    <div className={`w-full overflow-hidden transition-all duration-500 ${isCollapsed ? "px-0" : "px-2"}`} style={{ transitionTimingFunction: softSpringEasing }}>
      <div className="flex items-center justify-between h-10">
        {!isCollapsed && (
          <div className="font-semibold text-lg text-gray-800 leading-tight ml-2">
            {title}
          </div>
        )}
        <div className={`flex justify-center ${isCollapsed ? "w-full" : ""}`}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center justify-center rounded-lg size-8 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronDownIcon size={16} className={`transition-transform duration-500 ${isCollapsed ? "rotate-90" : "-rotate-90"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailSidebar({ activeSection, whitelabelSettings, user, onLogout }) {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const content = getSidebarContent(activeSection, user);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleExpanded = (itemKey) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  };

  const toggleCollapse = () => setIsCollapsed((s) => !s);

  const handleItemClick = (item) => {
    if (item.path) {
      navigate(createPageUrl(item.path));
    }
  };

  return (
    <aside
      className={`bg-gray-50/50 flex flex-col gap-4 items-start py-4 border-r border-gray-200 transition-all duration-500 h-full ${
        isCollapsed ? "w-12 min-w-12 items-center" : "w-64"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      {!isCollapsed && <BrandBadge whitelabelSettings={whitelabelSettings} isCollapsed={isCollapsed} />}

      <SectionTitle title={content.title} onToggleCollapse={toggleCollapse} isCollapsed={isCollapsed} />

      <div
        className={`flex flex-col w-full overflow-y-auto px-2 transition-all duration-500 ${
          isCollapsed ? "gap-2 items-center" : "gap-2 items-start"
        }`}
        style={{ transitionTimingFunction: softSpringEasing }}
      >
        {content.sections.map((section, index) => (
          <MenuSection
            key={`${activeSection}-${index}`}
            section={section}
            expandedItems={expandedItems}
            onToggleExpanded={toggleExpanded}
            isCollapsed={isCollapsed}
            onItemClick={handleItemClick}
            currentPath={location.pathname}
          />
        ))}
      </div>

      {!isCollapsed && (
        <div className="w-full mt-auto pt-4 px-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-sm"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
}

/* ------------------------------ Menu Elements ---------------------------- */

function MenuItem({
  item,
  isExpanded,
  onToggle,
  onItemClick,
  isCollapsed,
  isActive
}) {
  const handleClick = () => {
    if (item.hasDropdown && onToggle) onToggle();
    else onItemClick?.(item);
  };

  return (
    <div
      className={`relative shrink-0 transition-all duration-500 ${
        isCollapsed ? "w-full flex justify-center" : "w-full"
      }`}
      style={{ transitionTimingFunction: softSpringEasing }}
    >
      <div
        className={`rounded-lg cursor-pointer transition-all duration-200 flex items-center relative ${
          isActive 
            ? "bg-white text-blue-600 shadow-sm border border-gray-100" 
            : "hover:bg-white hover:shadow-sm text-gray-600 hover:text-gray-900"
        } ${isCollapsed ? "w-10 h-10 justify-center p-0" : "w-full px-3 py-2.5"}`}
        onClick={handleClick}
        title={isCollapsed ? item.label : undefined}
      >
        <div className={`flex items-center justify-center shrink-0 ${isActive ? "text-blue-600" : "text-gray-500"}`}>
          {item.icon}
        </div>

        <div
          className={`flex-1 relative transition-all duration-500 overflow-hidden ${
            isCollapsed ? "opacity-0 w-0" : "opacity-100 ml-3"
          }`}
        >
          <div className="text-sm font-medium truncate">
            {item.label}
          </div>
        </div>

        {item.hasDropdown && !isCollapsed && (
          <div className="flex items-center justify-center shrink-0 ml-2">
            <ChevronDownIcon
              size={14}
              className="text-gray-400 transition-transform duration-300"
              style={{
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MenuSection({
  section,
  expandedItems,
  onToggleExpanded,
  isCollapsed,
  onItemClick,
  currentPath
}) {
  return (
    <div className="flex flex-col w-full mb-2">
      {!isCollapsed && section.title && (
        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {section.title}
        </div>
      )}

      {section.items.map((item, index) => {
        const itemKey = `${section.title}-${index}`;
        const isExpanded = expandedItems.has(itemKey);
        
        // Check active state
        const itemUrl = item.path ? createPageUrl(item.path) : null;
        const isActive = itemUrl && (currentPath === itemUrl || (itemUrl !== "/" && currentPath.startsWith(itemUrl)));

        return (
          <div key={itemKey} className="w-full flex flex-col gap-1">
            <MenuItem
              item={item}
              isExpanded={isExpanded}
              onToggle={() => onToggleExpanded(itemKey)}
              onItemClick={() => onItemClick(item)}
              isCollapsed={isCollapsed}
              isActive={isActive}
            />
            {isExpanded && item.children && !isCollapsed && (
              <div className="flex flex-col gap-1 mb-2 ml-4 border-l border-gray-200 pl-2">
                {/* Submenu items logic would go here if we had any deeper nesting */}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------- Layout -------------------------------- */

export default function TwoLevelSidebar({ whitelabelSettings }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Sync active section with current route on mount/update
  useEffect(() => {
    const path = location.pathname;
    // Simple heuristic to set active section based on path
    if (path.includes("FindClients")) setActiveSection("mailing");
    else if (path.includes("Clients")) setActiveSection("contacts");
    else if (path.includes("Template")) setActiveSection("templates");
    else if (path.includes("Credits") || path.includes("Order")) setActiveSection("credits");
    else if (path.includes("Team")) setActiveSection("team");
    else if (path.includes("Analytics")) setActiveSection("analytics");
    else if (path.includes("Settings") || path.includes("Admin") || path.includes("Whitelabel")) setActiveSection("settings");
    else setActiveSection("dashboard");
  }, [location.pathname]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser) setUser(currentUser);
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="flex flex-row h-full">
      <IconNavigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
        whitelabelSettings={whitelabelSettings}
        user={user}
      />
      <DetailSidebar 
        activeSection={activeSection} 
        whitelabelSettings={whitelabelSettings}
        user={user}
        onLogout={handleLogout}
      />
    </div>
  );
}