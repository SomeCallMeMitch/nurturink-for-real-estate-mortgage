import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Pill Component
 * 
 * A unified pill/badge component that uses CSS variables for consistent
 * theming across the app. Uses inline styles to avoid Tailwind purging issues.
 * 
 * Usage:
 *   <Pill variant="success">Active</Pill>
 *   <Pill variant="warning">Pending</Pill>
 *   <Pill variant="purpose-thank_you" icon={ThumbsUp}>Thank You</Pill>
 *   <Pill variant="tag">Category Name</Pill>
 */

// Variant style mappings using CSS variables
const variantStyles = {
  // Semantic variants
  success: { backgroundColor: 'var(--pill-success-bg)', color: 'var(--pill-success-fg)' },
  warning: { backgroundColor: 'var(--pill-warning-bg)', color: 'var(--pill-warning-fg)' },
  danger: { backgroundColor: 'var(--pill-danger-bg)', color: 'var(--pill-danger-fg)' },
  muted: { backgroundColor: 'var(--pill-muted-bg)', color: 'var(--pill-muted-fg)' },
  
  // Utility color variants
  color1: { backgroundColor: 'var(--pill-color1-bg)', color: 'var(--pill-color1-fg)' },
  color2: { backgroundColor: 'var(--pill-color2-bg)', color: 'var(--pill-color2-fg)' },
  color3: { backgroundColor: 'var(--pill-color3-bg)', color: 'var(--pill-color3-fg)' },
  
  // Tag/Category variant
  tag: { backgroundColor: 'var(--pill-tag-bg)', color: 'var(--pill-tag-fg)' },
  
  // Custom indicator
  custom: { backgroundColor: 'var(--pill-custom-bg)', color: 'var(--pill-custom-fg)' },
  
  // Type variants (for templates, quicksend)
  personal: { backgroundColor: 'var(--pill-personal-bg)', color: 'var(--pill-personal-fg)' },
  organization: { backgroundColor: 'var(--pill-organization-bg)', color: 'var(--pill-organization-fg)' },
  platform: { backgroundColor: 'var(--pill-platform-bg)', color: 'var(--pill-platform-fg)' },
  
  // Purpose variants (for QuickSend templates)
  "purpose-thank_you": { backgroundColor: 'var(--pill-purpose-thank-you-bg)', color: 'var(--pill-purpose-thank-you-fg)' },
  "purpose-referral_request": { backgroundColor: 'var(--pill-purpose-referral-bg)', color: 'var(--pill-purpose-referral-fg)' },
  "purpose-review_request": { backgroundColor: 'var(--pill-purpose-review-bg)', color: 'var(--pill-purpose-review-fg)' },
  "purpose-review_and_referral": { backgroundColor: 'var(--pill-purpose-review-referral-bg)', color: 'var(--pill-purpose-review-referral-fg)' },
  "purpose-birthday": { backgroundColor: 'var(--pill-purpose-birthday-bg)', color: 'var(--pill-purpose-birthday-fg)' },
  "purpose-anniversary": { backgroundColor: 'var(--pill-purpose-anniversary-bg)', color: 'var(--pill-purpose-anniversary-fg)' },
  "purpose-holiday": { backgroundColor: 'var(--pill-purpose-holiday-bg)', color: 'var(--pill-purpose-holiday-fg)' },
  "purpose-just_because": { backgroundColor: 'var(--pill-purpose-just-because-bg)', color: 'var(--pill-purpose-just-because-fg)' },
  "purpose-custom": { backgroundColor: 'var(--pill-purpose-custom-bg)', color: 'var(--pill-purpose-custom-fg)' },
  
  // Status variants (map to semantic)
  "status-active": { backgroundColor: 'var(--pill-success-bg)', color: 'var(--pill-success-fg)' },
  "status-pending": { backgroundColor: 'var(--pill-warning-bg)', color: 'var(--pill-warning-fg)' },
  "status-failed": { backgroundColor: 'var(--pill-danger-bg)', color: 'var(--pill-danger-fg)' },
  "status-draft": { backgroundColor: 'var(--pill-muted-bg)', color: 'var(--pill-muted-fg)' },
  "status-sent": { backgroundColor: 'var(--pill-success-bg)', color: 'var(--pill-success-fg)' },
  "status-processing": { backgroundColor: 'var(--pill-color1-bg)', color: 'var(--pill-color1-fg)' },
  
  // Default
  default: { backgroundColor: 'var(--pill-muted-bg)', color: 'var(--pill-muted-fg)' },
  
  // Outline (special case - no background)
  outline: { backgroundColor: 'transparent', border: '1px solid currentColor' },
};

// Size style mappings - updated for better readability
const sizeStyles = {
  sm: { padding: '2px 6px', fontSize: '12px' }, // Reduced padding from 4px 10px
  default: { padding: '3px 8px', fontSize: '13px' }, // Reduced padding from 5px 12px
  lg: { padding: '4px 10px', fontSize: '14px' }, // Reduced padding from 6px 14px
};
 
const Pill = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default",
  icon: Icon,
  children, 
  style,
  ...props 
}, ref) => {
  const variantStyle = variantStyles[variant] || variantStyles.default;
  const sizeStyle = sizeStyles[size] || sizeStyles.default;
  
  const combinedStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    borderRadius: '6px', // Changed from '9999px' to '6px' for slightly more square corners
    fontWeight: 700, // semibold for better readability
    transition: 'colors 0.2s',
    ...variantStyle,
    ...sizeStyle,
    ...style,
  };

  return (
    <span
      ref__={ref}
      className={cn("whitespace-nowrap", className)}
      style={combinedStyle}
      {...props}
    >
      {Icon && <Icon style={{ width: '12px', height: '12px' }} />}
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

export { Pill };