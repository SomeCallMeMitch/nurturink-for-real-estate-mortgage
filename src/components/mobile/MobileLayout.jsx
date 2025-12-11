import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Users, Zap, User } from 'lucide-react';

export default function MobileLayout({ children }) {
  const location = useLocation();
  
  const isActive = (pageName) => {
    return location.pathname.toLowerCase().includes(pageName.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center h-16">
          <Link 
            to={createPageUrl('MobileHome')} 
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive('MobileHome') ? 'text-[#c87533]' : 'text-gray-500'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link 
            to={createPageUrl('MobileClients')} 
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive('MobileClients') ? 'text-[#c87533]' : 'text-gray-500'
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">Clients</span>
          </Link>

          <Link 
            to={createPageUrl('MobileSend')} 
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive('MobileSend') ? 'text-[#c87533]' : 'text-gray-500'
            }`}
          >
            <Zap className="w-6 h-6" />
            <span className="text-xs mt-1">QuickCard</span>
          </Link>

          <Link 
            to={createPageUrl('MobileProfile')} 
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive('MobileProfile') ? 'text-[#c87533]' : 'text-gray-500'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}