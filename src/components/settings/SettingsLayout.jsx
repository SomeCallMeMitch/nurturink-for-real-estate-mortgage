
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, MessageSquare, MapPin, Phone, Globe, Users } from "lucide-react";

export default function SettingsLayout({ children }) {
  const location = useLocation();

  const navItems = [
    { name: 'Profile', icon: User, path: 'SettingsProfile' },
    { name: 'Organization', icon: Users, path: 'SettingsOrganization' },
    { name: 'Writing Style', icon: MessageSquare, path: 'SettingsWritingStyle' },
    { name: 'Addresses', icon: MapPin, path: 'SettingsAddresses' },
    { name: 'Phone Numbers', icon: Phone, path: 'SettingsPhones' },
    { name: 'Websites & URLs', icon: Globe, path: 'SettingsUrls' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and information</p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Navigation */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
              <nav className="p-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const pageUrl = createPageUrl(item.path);
                  const isActive = location.pathname === pageUrl;

                  return (
                    <Link
                      key={item.name}
                      to={pageUrl}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
