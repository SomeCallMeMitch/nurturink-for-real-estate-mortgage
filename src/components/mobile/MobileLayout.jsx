import React from 'react';
import { useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Users, Zap, User } from 'lucide-react';

/**
 * MobileLayout Component
 * 
 * Core layout wrapper for all mobile pages.
 * Includes:
 * - Bottom tab navigation (4 tabs)
 * - Content area with proper spacing for bottom nav
 * - Active tab indicator with burnt orange highlight
 * 
 * Pages:
 * MobileHome - Home tab
 * MobileClients - Clients tab
 * MobileSend - QuickCard send flow
 * MobileProfile - Profile tab
 */

const NAV_ITEMS = [
  { page: 'MobileHome', label: 'Home', icon: Home },
  { page: 'MobileClients', label: 'Clients', icon: Users },
  { page: 'MobileSend', label: 'QuickCard', icon: Zap, highlight: true },
  { page: 'MobileProfile', label: 'Profile', icon: User },
];

export default function MobileLayout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
        <div className="flex items-stretch h-16">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            const isHighlight = item.highlight;

            return (
              <a
                key={item.page}
                href={createPageUrl(item.page)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? isHighlight
                      ? 'text-[#c87533]'
                      : 'text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {isHighlight ? (
                  // Special highlighted "QuickCard" button - raised circle with label below
                  <>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center -mt-4 shadow-lg ${
                      isActive ? 'bg-[#c87533]' : 'bg-orange-400'
                    }`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-xs -mt-1 ${isActive ? 'font-semibold text-[#c87533]' : 'font-medium text-gray-600'}`}>
                      {item.label}
                    </span>
                  </>
                ) : (
                  <>
                    <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                    <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}