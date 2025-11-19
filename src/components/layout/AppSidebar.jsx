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
  Home
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
    <div className="relative rounded-full shrink-0 size-8 bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center overflow-hidden select-none">
        <span className="text-xs font-medium">{initials}</span>
    </div>
  );
}

function CollapsibleMenu({ item, location }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Auto expand if child is active
  useEffect(() => {
    if (item.items?.some(sub => location.pathname === createPageUrl(sub.url))) {
      setIsOpen(true);
    }
  }, [location.pathname, item.items]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            <item.icon />
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
                >
                  <a href={createPageUrl(subItem.url)}>
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
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const hasRole = (allowedRoles) => !allowedRoles || (user && allowedRoles.includes(user.appRole));

  const navItems = [
    // Generic User Items - kept for Super Admin to access user features if needed
    { 
      title: "App Home", 
      url: "Home", 
      icon: Home,
      roles: ['sales_rep', 'organization_owner', 'whitelabel_partner', 'super_admin']
    }
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
    { title: "Card Designs", url: "SuperAdminCardManagement", icon: Palette },
    { title: "Pricing Tiers", url: "AdminPricing", icon: DollarSign },
    { title: "Coupons", url: "AdminCoupons", icon: FileText },
    { title: "Preview Layout", url: "AdminCardLayout", icon: Shield },
    { title: "Content Layout", url: "AdminCreateContentLayout", icon: PenTool },
    { title: "Envelope Layout", url: "AdminEnvelopeLayout", icon: Mail },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
           <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden overflow-hidden">
             {whitelabelSettings?.logoUrl ? (
               <img src={whitelabelSettings.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
             ) : (
               <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">
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
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.filter(item => hasRole(item.roles)).map((item) => (
                 <SidebarMenuItem key={item.title}>
                   {item.items ? (
                     <CollapsibleMenu item={item} location={location} />
                   ) : (
                     <SidebarMenuButton 
                       asChild 
                       isActive={location.pathname === createPageUrl(item.url)}
                       tooltip={item.title}
                     >
                       <a href={createPageUrl(item.url)} onClick={(e) => { e.preventDefault(); navigate(createPageUrl(item.url)); }}>
                         <item.icon />
                         <span>{item.title}</span>
                       </a>
                     </SidebarMenuButton>
                   )}
                 </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
             <SidebarMenu>
               {settingsItems.map((item) => (
                 <SidebarMenuItem key={item.title}>
                   <SidebarMenuButton 
                     asChild 
                     isActive={location.pathname === createPageUrl(item.url)}
                     tooltip={item.title}
                   >
                     <a href={createPageUrl(item.url)} onClick={(e) => { e.preventDefault(); navigate(createPageUrl(item.url)); }}>
                       <item.icon />
                       <span>{item.title}</span>
                     </a>
                   </SidebarMenuButton>
                 </SidebarMenuItem>
               ))}
             </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Always show Admin items in this specific Sidebar since it's now Super Admin specific */}
        <SidebarGroup>
          <SidebarGroupLabel>Super Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                 <SidebarMenuItem key={item.title}>
                   <SidebarMenuButton 
                     asChild 
                     isActive={location.pathname === createPageUrl(item.url)}
                     tooltip={item.title}
                   >
                     <a href={createPageUrl(item.url)} onClick={(e) => { e.preventDefault(); navigate(createPageUrl(item.url)); }}>
                       <item.icon />
                       <span>{item.title}</span>
                     </a>
                   </SidebarMenuButton>
                 </SidebarMenuItem>
              ))}
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
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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