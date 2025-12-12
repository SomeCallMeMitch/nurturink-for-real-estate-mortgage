import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Users, Zap, User } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/MobileHome', label: 'Home', icon: Home },
  { path: '/MobileClients', label: 'Clients', icon: Users },
  { path: '/MobileSend', label: 'QuickCard', icon: Zap, highlight: true },
  { path: '/MobileProfile', label: 'Profile', icon: User },
];

export default function MobileLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-stretch h-16">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            const isHighlight = item.highlight;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? isHighlight
                      ? 'text-[#c87533]'
                      : 'text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {isHighlight ? (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center -mt-4 shadow-lg ${
                    isActive ? 'bg-[#c87533]' : 'bg-orange-400'
                  }`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <>
                    <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                    <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </>
                )}
                {isHighlight && (
                  <span className={`text-xs -mt-1 ${isActive ? 'font-semibold text-[#c87533]' : 'font-medium text-gray-600'}`}>
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}