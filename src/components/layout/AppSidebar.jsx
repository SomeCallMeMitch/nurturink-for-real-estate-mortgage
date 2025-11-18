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
  Building
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

export function AppSidebar({ whitelabelSettings }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
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

  const hasRole = (allowedRoles) => !allowedRoles || (user && allowedRoles.includes(user.appRole));

  const navItems = [
    { 
      title: "Dashboard", 
      url: "Home", 
      icon: LayoutDashboard,
      roles: ['sales_rep', 'organization_owner', 'super_admin']
    },
    {
      title: "Send a Card",
      icon: Mail,
      roles: ['sales_rep', 'organization_owner', 'super_admin'],
      items: [
        { title: "1. Find Clients", url: "FindClients" },
        { title: "2. Create Content", url: "CreateContent" },
        { title: "3. Select Design", url: "SelectDesign" },
        { title: "4. Review & Send", url: "ReviewAndSend" },
      ]
    },
    {
      title: "Contacts",
      url: "AdminClients",
      icon: Users,
      roles: ['sales_rep', 'organization_owner', 'super_admin']
    },
    {
      title: "Templates",
      url: "Templates",
      icon: FileText,
      roles: ['sales_rep', 'organization_owner', 'super_admin']
    },
    {
      title: "Credits",
      url: "Credits",
      icon: DollarSign,
      roles: ['sales_rep', 'organization_owner', 'super_admin']
    },
    {
      title: "Team",
      url: "TeamManagement",
      icon: UsersRound,
      roles: ['organization_owner', 'super_admin']
    },
    {
      title: "Analytics",
      url: "Analytics",
      icon: BarChart3,
      roles: ['sales_rep', 'organization_owner', 'super_admin']
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
    { title: "Super Admin", url: "SuperAdminDashboard", icon: Shield },
    { title: "Whitelabel", url: "SuperAdminWhitelabel", icon: Palette },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
           {whitelabelSettings?.logoUrl ? (
             <img src={whitelabelSettings.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
           ) : (
             <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">
               R
             </div>
           )}
           <span className="font-bold text-lg truncate group-data-[collapsible=icon]:hidden">
             {whitelabelSettings?.brandName || 'RoofScribe'}
           </span>
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

        {hasRole(['super_admin']) && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
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
        )}

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