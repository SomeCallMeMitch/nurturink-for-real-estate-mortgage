
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Send, Settings, BarChart2, Users, LogOut, FileText, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LeftSidebar() {
  const location = useLocation();
  
  const handleLogout = async () => {
    await base44.auth.logout();
  };
  
  const menuItems = [
    { name: 'Home', icon: Home, path: 'Home' },
    { name: 'Send a Card', icon: Mail, path: 'FindClients' },
    { name: 'Templates', icon: FileText, path: 'Templates' },
    { name: 'Clients', icon: Users, path: 'AdminClients' },
    { name: 'Settings', icon: Settings, path: 'SettingsProfile' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-600">RoofScribe</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const pageUrl = createPageUrl(item.path); // Use createPageUrl to get the actual URL
          const isActive = location.pathname === pageUrl || 
                          (pageUrl !== "/" && location.pathname.startsWith(pageUrl));
          
          return (
            <Link
              key={item.name}
              to={pageUrl} // Use the generated URL for the Link
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
                isActive ? "bg-indigo-50 text-indigo-600 font-semibold" : ""
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
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
