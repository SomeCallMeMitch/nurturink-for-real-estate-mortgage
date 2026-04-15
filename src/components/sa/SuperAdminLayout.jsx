import React from "react";
// BATCH4-B2: user now comes from AuthContext — no direct auth.me() call needed here
import { useAuth } from "@/lib/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Settings, LayoutGrid, Mail, Shield, Home, Layout, DollarSign, Tag, Send, RefreshCcw, Inbox } from "lucide-react";

export default function SuperAdminLayout({ children }) {
  // BATCH4-B2: user now sourced from AuthContext — local auth.me() call removed
  const { user, isLoadingAuth } = useAuth();
  const location = useLocation();

  /*
   * PHASE 2 / BATCH 5 / F-07 / M-06:
   * Previously: isSuperAdmin = user?.role === 'super_admin' (wrong field — user.role is Base44 platform field)
   *             isOrgOwner   = user?.role === 'organization_owner' (wrong field + legacy dead code — R-01 decision)
   * Now:        isSuperAdmin = user?.appRole === 'super_admin' (correct canonical field)
   *             isOrgOwner branch REMOVED entirely per R-01 decision:
   *               "Treat as legacy dead code. SuperAdminLayout is gated for super_admin only."
   */
  // BATCH4-B2 cleanup: explicit loading guard while AuthContext resolves
  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isSuperAdmin = user?.appRole === 'super_admin';

  // Build menu only for super admins
  const menuItems = [];
  if (isSuperAdmin) {
    menuItems.push(
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: 'SuperAdminDashboard' },
      { id: 'card-management', label: 'Card Designs', icon: LayoutGrid, path: 'SuperAdminCardManagement' },
      { id: 'sends', label: 'Sent Cards', icon: Send, path: 'AdminSends' },
      { id: 'refunds', label: 'Credit Refunds', icon: RefreshCcw, path: 'AdminRefunds' },
      { id: 'pricing', label: 'Pricing Tiers', icon: DollarSign, path: 'AdminPricing' },
      { id: 'coupons', label: 'Coupons', icon: Tag, path: 'AdminCoupons' },
      { id: 'preview-layout', label: 'Preview Layout', icon: Layout, path: 'AdminCardLayout' },
      { id: 'content-layout', label: 'Content Layout', icon: Layout, path: 'AdminCreateContentLayout' },
      { id: 'envelope-layout', label: 'Envelope Layout', icon: Mail, path: 'AdminEnvelopeLayout' },
      { id: 'sample-requests', label: 'Sample Requests', icon: Inbox, path: 'AdminSampleRequests' }
    );
  }

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Super Admin
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* BATCH4-B2: fullName is the canonical Base44 field; full_name kept as fallback */}
              <span className="text-sm text-gray-600">{user?.fullName || user?.full_name}</span>
              <Link
                to={createPageUrl('Home')}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Exit Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const itemUrl = createPageUrl(item.path);
                const isActive = currentPath === itemUrl;
                
                return (
                  <Link
                    key={item.id}
                    to={itemUrl}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}