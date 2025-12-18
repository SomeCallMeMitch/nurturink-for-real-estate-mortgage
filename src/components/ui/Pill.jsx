import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Pill Component
 * 
 * A unified pill/badge component that uses CSS variables for consistent
 * theming across the app. Supports semantic, purpose, and utility variants.
 * 
 * Usage:
 *   <Pill variant="success">Active</Pill>
 *   <Pill variant="warning">Pending</Pill>
 *   <Pill variant="purpose-thank_you" icon={ThumbsUp}>Thank You</Pill>
 *   <Pill variant="tag">Category Name</Pill>
 */

const pillVariants = cva(
  // Base styles - consistent across all variants
  "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        // Semantic variants - use CSS variables from whitelabel
        success: "pill-success",
        warning: "pill-warning", 
        danger: "pill-danger",
        muted: "pill-muted",
        
        // Utility color variants
        color1: "pill-color1",
        color2: "pill-color2",
        color3: "pill-color3",
        
        // Tag/Category variant (uses accent color)
        tag: "pill-tag",
        
        // Type variants (for templates, quicksend)
        personal: "pill-personal",
        organization: "pill-organization",
        platform: "pill-platform",
        
        // Purpose variants (for QuickSend templates)
        "purpose-thank_you": "pill-purpose-thank-you",
        "purpose-referral_request": "pill-purpose-referral",
        "purpose-review_request": "pill-purpose-review",
        "purpose-review_and_referral": "pill-purpose-review-referral",
        "purpose-birthday": "pill-purpose-birthday",
        "purpose-anniversary": "pill-purpose-anniversary",
        "purpose-holiday": "pill-purpose-holiday",
        "purpose-just_because": "pill-purpose-just-because",
        "purpose-custom": "pill-purpose-custom",
        
        // Status variants (for orders, mailings)
        "status-active": "pill-success",
        "status-pending": "pill-warning",
        "status-failed": "pill-danger",
        "status-draft": "pill-muted",
        "status-sent": "pill-success",
        "status-processing": "pill-color1",
        
        // Special variants
        default: "pill-muted",
        outline: "border border-current bg-transparent",
        custom: "pill-custom", // For "has custom overrides" indicator
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        default: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Pill = React.forwardRef(({ 
  className, 
  variant, 
  size,
  icon: Icon,
  children, 
  ...props 
}, ref) => {
  return (
    <span
      ref={ref}
      className={cn(pillVariants({ variant, size }), className)}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
});

Pill.displayName = "Pill";

/**
 * Helper to get pill variant from a purpose string
 * @param {string} purpose - QuickSend purpose key
 * @returns {string} - Pill variant name
 */
export function getPurposeVariant(purpose) {
  const purposeMap = {
    thank_you: "purpose-thank_you",
    referral_request: "purpose-referral_request",
    review_request: "purpose-review_request",
    review_and_referral: "purpose-review_and_referral",
    birthday: "purpose-birthday",
    anniversary: "purpose-anniversary",
    holiday: "purpose-holiday",
    just_because: "purpose-just_because",
    custom: "purpose-custom",
  };
  return purposeMap[purpose] || "purpose-custom";
}

/**
 * Helper to get pill variant from a template type
 * @param {string} type - Template type (personal, organization, platform)
 * @returns {string} - Pill variant name
 */
export function getTypeVariant(type) {
  const typeMap = {
    personal: "personal",
    organization: "organization",
    platform: "platform",
  };
  return typeMap[type] || "muted";
}

/**
 * Helper to get pill variant from a status
 * @param {string} status - Status string
 * @returns {string} - Pill variant name
 */
export function getStatusVariant(status) {
  const statusLower = (status || "").toLowerCase();
  
  // Success states
  if (["active", "sent", "delivered", "complete", "completed", "success", "paid"].includes(statusLower)) {
    return "success";
  }
  
  // Warning states
  if (["pending", "processing", "in_progress", "waiting", "scheduled"].includes(statusLower)) {
    return "warning";
  }
  
  // Danger states
  if (["failed", "error", "cancelled", "rejected", "expired", "overdue"].includes(statusLower)) {
    return "danger";
  }
  
  // Default to muted
  return "muted";
}

export { Pill, pillVariants };