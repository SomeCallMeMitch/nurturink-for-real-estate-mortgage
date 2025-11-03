import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Send, Settings, BarChart2, Users, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Send a Card", path: "/findclients", icon: Send },
  { name: "Analytics", path: "/analytics", icon: BarChart2 },
  { name: "Clients", path: "/clients", icon: Users },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function LeftSidebar() {
  const location = useLocation();
  
  const handleLogout = async () => {
    await base44.auth.logout();
  };
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-600">RoofScribe</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path !== "/" && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.name}
              to={item.path}
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