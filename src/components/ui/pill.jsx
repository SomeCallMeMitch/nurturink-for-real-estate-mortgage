import * as React from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  default: "bg-slate-100 text-slate-700 border-slate-200",
  outline: "bg-white text-slate-700 border-slate-300",
  muted: "bg-slate-50 text-slate-500 border-slate-200",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  color1: "bg-[var(--pill-color-1-bg,#eef2ff)] text-[var(--pill-color-1-text,#3730a3)] border-[var(--pill-color-1-border,#c7d2fe)]",
  color2: "bg-[var(--pill-color-2-bg,#ecfeff)] text-[var(--pill-color-2-text,#155e75)] border-[var(--pill-color-2-border,#a5f3fc)]",
  color3: "bg-[var(--pill-color-3-bg,#f0fdf4)] text-[var(--pill-color-3-text,#166534)] border-[var(--pill-color-3-border,#bbf7d0)]",
  tag: "bg-purple-50 text-purple-700 border-purple-200",
  custom: "bg-pink-50 text-pink-700 border-pink-200",
  personal: "bg-blue-50 text-blue-700 border-blue-200",
  organization: "bg-indigo-50 text-indigo-700 border-indigo-200",
  platform: "bg-teal-50 text-teal-700 border-teal-200",
  "purpose-prospecting": "bg-blue-50 text-blue-700 border-blue-200",
  "purpose-follow-up": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "purpose-nurture": "bg-violet-50 text-violet-700 border-violet-200",
  "purpose-past-client": "bg-orange-50 text-orange-700 border-orange-200",
  "purpose-other": "bg-slate-50 text-slate-600 border-slate-200",
  "status-active": "bg-green-50 text-green-700 border-green-200",
  "status-inactive": "bg-slate-50 text-slate-500 border-slate-200",
  "status-draft": "bg-amber-50 text-amber-700 border-amber-200",
  "status-completed": "bg-green-50 text-green-700 border-green-200",
  "status-ready": "bg-blue-50 text-blue-700 border-blue-200",
  "status-failed": "bg-red-50 text-red-700 border-red-200"
};

const sizeStyles = {
  sm: "h-6 px-2 text-xs",
  default: "h-7 px-2.5 text-xs",
  md: "h-7 px-2.5 text-xs",
  lg: "h-8 px-3 text-sm"
};

const iconSizeStyles = {
  sm: "w-3 h-3",
  default: "w-3.5 h-3.5",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4"
};

const Pill = React.forwardRef(
  ({ className, variant = "default", size = "default", icon: Icon, children, style, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium leading-none whitespace-nowrap",
        variantStyles[variant] || variantStyles.default,
        sizeStyles[size] || sizeStyles.default,
        className
      )}
      style={style}
      {...props}
    >
      {Icon ? <Icon className={cn("shrink-0", iconSizeStyles[size] || iconSizeStyles.default)} /> : null}
      {children}
    </span>
  )
);

Pill.displayName = "Pill";

function getPurposeVariant(purpose) {
  const normalized = String(purpose || "").toLowerCase().replace(/[_\s]+/g, "-");
  return variantStyles[`purpose-${normalized}`] ? `purpose-${normalized}` : "purpose-other";
}

function getTypeVariant(type) {
  const normalized = String(type || "").toLowerCase();
  if (normalized.includes("custom")) return "custom";
  if (normalized.includes("personal")) return "personal";
  if (normalized.includes("organization")) return "organization";
  if (normalized.includes("platform")) return "platform";
  return "default";
}

function getStatusVariant(status) {
  const normalized = String(status || "").toLowerCase().replace(/[_\s]+/g, "-");

  if (["active", "approved", "sent", "completed"].includes(normalized)) return "success";
  if (["ready", "ready-to-send", "pending-review", "queued", "queued-for-sending"].includes(normalized)) return "status-ready";
  if (["pending", "draft", "pending-credits"].includes(normalized)) return "warning";
  if (["failed", "error", "cancelled", "rejected"].includes(normalized)) return "danger";
  if (["inactive", "archived"].includes(normalized)) return "muted";

  return variantStyles[`status-${normalized}`] ? `status-${normalized}` : "default";
}

export { Pill, getPurposeVariant, getTypeVariant, getStatusVariant };
