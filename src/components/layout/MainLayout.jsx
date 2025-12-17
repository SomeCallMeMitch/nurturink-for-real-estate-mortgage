import React, { useEffect, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import LeftSidebar from "./LeftSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

export default function MainLayout({ children, whitelabelSettings }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const u = await base44.auth.me();
        console.log("MainLayout: Fetched user:", u);
        setUser(u);
      } catch (e) {
        console.error("MainLayout: Failed to fetch user:", e);
        // Set user to empty object to prevent white screen - layout will still render
        setUser({});
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  // Common style block for whitelabel settings
  const whitelabelStyles = whitelabelSettings && (
    <style>{`
      h1, h2, h3, h4, h5, h6 {
        font-family: '${whitelabelSettings.fontHeadings || "Helvetica Neue"}', sans-serif;
      }
      body, p:not([class*="font-"]), span:not([class*="font-"]), div:not([class*="font-"]) {
        font-family: '${whitelabelSettings.fontBody || "Helvetica Neue"}', sans-serif;
      }
      .font-caveat, .font-caveat * { font-family: 'Caveat', cursive !important; }
      .font-kalam, .font-kalam * { font-family: 'Kalam', cursive !important; }
      .font-patrick, .font-patrick * { font-family: 'Patrick Hand', cursive !important; }

      :root {
        --sidebar-background: #ffffff;
        --sidebar-foreground: #374151;
        --sidebar-primary: var(--primary);
        --sidebar-primary-foreground: #ffffff;
        --sidebar-accent: #f3f4f6;
        --sidebar-accent-foreground: #111827;
        --sidebar-border: #e5e7eb;
        --sidebar-ring: var(--ring);

        /* Brand & CTA Colors */
        --brand-accent: #c87533;
        --brand-accent-foreground: #ffffff;
        --cta-primary: #c87533;
        --cta-primary-foreground: #ffffff;

        /* Surface & Border Colors */
        --surface-0: #ffffff;
        --surface-1: #f9fafb;
        --border-subtle: #e5e7eb;

        /* Text Colors */
        --text-0: #111827;
        --text-1: #4b5563;
        --text-2: #9ca3af;

        /* Navigation Colors */
        --nav-bg: #ffffff;
        --nav-fg: #374151;
        --nav-muted: #9ca3af;
        --nav-border: #e5e7eb;

        /* Keep these for now (we can derive later) */
        --nav-item-hover-bg: #fef3e2;
        --nav-item-active-bg: #fef3e2;

        /* State Colors (defaults; may be overridden below) */
        --focus-ring: #3b82f6;

        /* Status */
        --success: #10b981;
        --success-bg: #d1fae5;
        --warning: #f59e0b;
        --warning-bg: #fef3c7;
        --danger: #ef4444;
        --danger-bg: #fee2e2;
      }

      .dark {
        --sidebar-background: #111827;
        --sidebar-foreground: #f3f4f6;
        --sidebar-primary: var(--primary);
        --sidebar-primary-foreground: #ffffff;
        --sidebar-accent: #1f2937;
        --sidebar-accent-foreground: #f3f4f6;
        --sidebar-border: #374151;
        --sidebar-ring: var(--ring);

        /* Dark mode variants for semantic tokens */
        --brand-accent: #c87533;
        --brand-accent-foreground: #ffffff;
        --cta-primary: #c87533;
        --cta-primary-foreground: #ffffff;

        --surface-0: #111827;
        --surface-1: #1f2937;
        --border-subtle: #374151;

        --text-0: #f3f4f6;
        --text-1: #d1d5db;
        --text-2: #6b7280;

        --nav-bg: #111827;
        --nav-fg: #f3f4f6;
        --nav-muted: #6b7280;
        --nav-border: #374151;

        /* Keep these for now (we can derive later) */
        --nav-item-hover-bg: #1f2937;
        --nav-item-active-bg: #1f2937;

        /* State Colors (defaults; may be overridden below) */
        --focus-ring: #60a5fa;

        /* Status */
        --success: #34d399;
        --success-bg: #064e3b;
        --warning: #fbbf24;
        --warning-bg: #78350f;
        --danger: #f87171;
        --danger-bg: #7f1d1d;
      }

      /* Apply colors dynamically (white-label overrides) */
      :root {
        ${
          whitelabelSettings.primaryColor
            ? `--brand-primary: ${whitelabelSettings.primaryColor};`
            : `--brand-primary: var(--brand-accent);`
        }
        ${
          whitelabelSettings.primaryColor
            ? `--cta-primary: ${whitelabelSettings.primaryColor};`
            : ""
        }

        /* Nav accent is separate, defaults to brand-primary (admin can stay brand-primary) */
        --nav-accent: var(--brand-primary);

        /* Optional existing white-label fields */
        ${
          whitelabelSettings.primaryColor
            ? `--color-primary: ${whitelabelSettings.primaryColor};`
            : ""
        }
        ${
          whitelabelSettings.accentColor
            ? `--color-accent: ${whitelabelSettings.accentColor};`
            : ""
        }
        ${
          whitelabelSettings.backgroundColor
            ? `--color-background: ${whitelabelSettings.backgroundColor};`
            : ""
        }

        /* Make focus ring controllable; default to nav accent */
        --focus-ring: var(--nav-accent);

        /* Nav item active fg should be controlled (was hard-coded orange/blue elsewhere) */
        --nav-item-active-fg: var(--nav-accent);
      }

      .dark {
        /* Keep the same logic in dark mode */
        --nav-accent: var(--brand-primary);
        --focus-ring: var(--nav-accent);
        --nav-item-active-fg: var(--nav-accent);
      }
    `}</style>
  );

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--surface-1)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--nav-accent)]" />
      </div>
    );
  }

  const isSuperAdmin = user?.appRole === "super_admin";

  console.log(
    "MainLayout Render: user:",
    user,
    "isSuperAdmin:",
    isSuperAdmin,
    "role:",
    user?.appRole
  );

  if (isSuperAdmin) {
    console.log("MainLayout: Rendering AppSidebar (Super Admin)");
    return (
      <SidebarProvider>
        <AppSidebar whitelabelSettings={whitelabelSettings} user={user} />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto pt-4">
            {children}
          </div>
        </SidebarInset>
        {whitelabelStyles}
      </SidebarProvider>
    );
  }

  // Regular User Layout - Simple Sidebar
  console.log("MainLayout: Rendering LeftSidebar (Regular User/Not Loaded Yet)");
  return (
    <div className="flex h-screen bg-[var(--surface-1)]">
      <LeftSidebar whitelabelSettings={whitelabelSettings} user={user} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
      {whitelabelStyles}
    </div>
  );
}
