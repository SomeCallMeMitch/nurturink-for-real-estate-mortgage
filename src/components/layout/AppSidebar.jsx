import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Mail,
  Users,
  FileText,
  DollarSign,
  UsersRound,
  BarChart3,
  Settings,
  LogOut,
  ChevronUp,
  User2,
  Shield,
  Palette,
  Menu,
  ChevronDown,
  Plus,
  UserCircle,
  PenTool,
  MapPin,
  Phone,
  Link as LinkIcon,
  Building,
  Home,
  Zap,
  Send
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

function AvatarCircle({ user }) {
  const initials = user?.full_name 
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="relative rounded-full shrink-0 size-8 bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center overflow-hidden select-none">
        <span className="text-xs font-medium">{initials}</span>
    </div>
  );
}

function CollapsibleMenu({ item, location }) {
  // Persist state in localStorage
  const storageKey = `sidebar_${item.title.toLowerCase().replace(/\s+/g, '_')}_expanded`;
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : false;
  });
  
  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(isOpen));
  }, [isOpen, storageKey]);
  
  // Check if any child is active
  const hasActiveChild = item.items?.some(sub => location.pathname === createPageUrl(sub.url));

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton 
            tooltip={item.title}
            className={`text-[17px] py-1 font-bold ${hasActiveChild ? 'bg-amber-50 text-amber-700' : 'hover:bg-amber-50 hover:text-amber-700'}`}
          >
            <item.icon className={hasActiveChild ? 'text-amber-700' : ''} />
            <span>{item.title}</span>
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton 
                  asChild 
                  isActive={location.pathname === createPageUrl(subItem.url)}
                  className="text-[15px] py-0.5 font-semibold data-[active=true]:font-bold data-[active=true]:bg-amber-50 data-[active=true]:text-amber-700 hover:bg-amber-50 hover:text-amber-700"
                >
                  <a href={createPageUrl(subItem.url)}>
                    {subItem.icon && <subItem.icon className="w-4 h-4 data-[active=true]:text-amber-700" />}
                    <span>{subItem.title}</span>
                  </a>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function AppSidebar({ whitelabelSettings, user }) {
  console.log('AppSidebar: Rendering. User prop:', user);
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const hasRole = (allowedRoles) => {
    const userRole = user?.appRole || user?.role;
    const result = !allowedRoles || (user && allowedRoles.includes(userRole));
    console.log(`AppSidebar: Checking role for [${allowedRoles}] -> ${result} (User role: '${userRole}', appRole: '${user?.appRole}', role: '${user?.role}')`);
    return result;
  };

  const navItems = [
    { title: "Dashboard", url: "Home", icon: Home },
    { title: "Clients", url: "AdminClients", icon: Users },
    { title: "Send a Card", url: "FindClients", icon: Mail },
    { title: "Templates", url: "Templates", icon: FileText },
    { title: "QuickSends", url: "QuickSendTemplates", icon: Zap },
    { title: "Credits", url: "Credits", icon: DollarSign },
    { title: "Team", url: "TeamManagement", icon: UsersRound },
    { title: "Analytics", url: "Analytics", icon: BarChart3 },
  ];

  const settingsItems = [
    { title: "My Profile", url: "SettingsProfile", icon: UserCircle },
    { title: "Writing Style", url: "SettingsWritingStyle", icon: PenTool },
    { title: "Addresses", url: "SettingsAddresses", icon: MapPin },
    { title: "Phone Numbers", url: "SettingsPhones", icon: Phone },
    { title: "Social Links", url: "SettingsUrls", icon: LinkIcon },
    ...(hasRole(['organization_owner', 'super_admin']) ? [{ title: "Company Settings", url: "SettingsOrganization", icon: Building }] : []),
  ];

  const adminItems = [
    { title: "Dashboard", url: "SuperAdminDashboard", icon: LayoutDashboard },
    { title: "All Sends", url: "AdminSends", icon: Send },
    { title: "Card Designs", url: "SuperAdminCardManagement", icon: Palette },
    { title: "Pricing Tiers", url: "AdminPricing", icon: DollarSign },
    { title: "Coupons", url: "AdminCoupons", icon: FileText },
    { title: "Preview Layout", url: "AdminCardLayout", icon: Shield },
    { title: "Content Layout", url: "AdminCreateContentLayout", icon: PenTool },
    { title: "Envelope Layout", url: "AdminEnvelopeLayout", icon: Mail },
    { title: "Email Testing", url: "AdminEmailTesting", icon: Mail },
  ];

  const whitelabelItems = [
    { title: "Whitelabel Settings", url: "SuperAdminWhitelabel", icon: Palette },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
           <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden overflow-hidden">
             {whitelabelSettings?.logoUrl ? (
               <img src={whitelabelSettings.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
             ) : (
               <div className="size-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
                 R
               </div>
             )}
             <span className="font-bold text-lg truncate">
               {whitelabelSettings?.brandName || 'RoofScribe'}
             </span>
           </div>
           
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={toggleSidebar}
             className="shrink-0 ml-auto"
           >
             <Menu className="h-5 w-5" />
             <span className="sr-only">Toggle Sidebar</span>
           </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Main Navigation Items - Non-collapsible */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === createPageUrl(item.url)}
                    className="text-[17px] py-1 font-semibold data-[active=true]:font-extrabold data-[active=true]:bg-amber-50 data-[active=true]:text-amber-700 hover:bg-amber-50 hover:text-amber-700"
                  >
                    <a href={createPageUrl(item.url)}>
                      <item.icon className="data-[active=true]:text-amber-700" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Collapsible Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <CollapsibleMenu 
                item={{
                  title: "Settings",
                  icon: Settings,
                  items: settingsItems
                }}
                location={location}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Portal Collapsible Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <CollapsibleMenu 
                item={{
                  title: "Admin Portal",
                  icon: Shield,
                  items: adminItems
                }}
                location={location}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Whitelabel Collapsible Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <CollapsibleMenu 
                item={{
                  title: "Whitelabel",
                  icon: Building,
                  items: whitelabelItems
                }}
                location={location}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-amber-50 hover:bg-amber-50"
                >
                  <AvatarCircle user={user} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.full_name || 'User'}</span>
                    <span className="truncate text-xs">{user?.email || ''}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width] min-w-56 rounded-lg" align="start">
                <DropdownMenuItem onClick={() => navigate(createPageUrl('SettingsProfile'))}>
                   <User2 className="mr-2 h-4 w-4" />
                   Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(createPageUrl('SettingsOrganization'))}>
                   <Building className="mr-2 h-4 w-4" />
                   Organization
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                   <LogOut className="mr-2 h-4 w-4" />
                   Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;