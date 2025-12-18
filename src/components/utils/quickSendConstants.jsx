import { 
  ThumbsUp, 
  Users, 
  Star, 
  MessageSquare, 
  Gift, 
  Heart, 
  Sparkles, 
  Calendar, 
  HelpCircle 
} from 'lucide-react';

/**
 * Quick Send Template Purpose Configuration
 * 
 * UPDATED: Now uses CSS variable-based classes for whitelabel theming.
 * Colors are controlled via globals.css variables like --pill-purpose-thank-you-bg
 * 
 * Used across QuickSendPickerModal, QuickSendTemplateCard, TemplatePickerModal
 */
export const PURPOSE_CONFIG = {
  thank_you: { 
    label: 'Thank You', 
    icon: ThumbsUp, 
    pillClass: 'pill-purpose-thank-you',
    // Legacy properties for backwards compatibility during migration
    bgColor: 'bg-[var(--pill-purpose-thank-you-bg)]', 
    textColor: 'text-[var(--pill-purpose-thank-you-fg)]',
  },
  referral_request: { 
    label: 'Referral Request', 
    icon: Users, 
    pillClass: 'pill-purpose-referral',
    bgColor: 'bg-[var(--pill-purpose-referral-bg)]', 
    textColor: 'text-[var(--pill-purpose-referral-fg)]',
  },
  review_request: { 
    label: 'Review Request', 
    icon: Star, 
    pillClass: 'pill-purpose-review',
    bgColor: 'bg-[var(--pill-purpose-review-bg)]', 
    textColor: 'text-[var(--pill-purpose-review-fg)]',
  },
  review_and_referral: { 
    label: 'Review & Referral', 
    icon: MessageSquare, 
    pillClass: 'pill-purpose-review-referral',
    bgColor: 'bg-[var(--pill-purpose-review-referral-bg)]', 
    textColor: 'text-[var(--pill-purpose-review-referral-fg)]',
  },
  birthday: { 
    label: 'Birthday', 
    icon: Gift, 
    pillClass: 'pill-purpose-birthday',
    bgColor: 'bg-[var(--pill-purpose-birthday-bg)]', 
    textColor: 'text-[var(--pill-purpose-birthday-fg)]',
  },
  anniversary: { 
    label: 'Anniversary', 
    icon: Heart, 
    pillClass: 'pill-purpose-anniversary',
    bgColor: 'bg-[var(--pill-purpose-anniversary-bg)]', 
    textColor: 'text-[var(--pill-purpose-anniversary-fg)]',
  },
  holiday: { 
    label: 'Holiday', 
    icon: Sparkles, 
    pillClass: 'pill-purpose-holiday',
    bgColor: 'bg-[var(--pill-purpose-holiday-bg)]', 
    textColor: 'text-[var(--pill-purpose-holiday-fg)]',
  },
  just_because: { 
    label: 'Just Because', 
    icon: Calendar, 
    pillClass: 'pill-purpose-just-because',
    bgColor: 'bg-[var(--pill-purpose-just-because-bg)]', 
    textColor: 'text-[var(--pill-purpose-just-because-fg)]',
  },
  custom: { 
    label: 'Custom', 
    icon: HelpCircle, 
    pillClass: 'pill-purpose-custom',
    bgColor: 'bg-[var(--pill-purpose-custom-bg)]', 
    textColor: 'text-[var(--pill-purpose-custom-fg)]',
  }
};

/**
 * Purpose options array for Select dropdowns
 * Derived from PURPOSE_CONFIG
 */
export const PURPOSE_OPTIONS = Object.entries(PURPOSE_CONFIG).map(([value, config]) => ({
  value,
  label: config.label
}));

/**
 * Template Type Configuration
 * 
 * UPDATED: Now uses CSS variable-based classes for whitelabel theming.
 * Used for Quick Send Template visibility badges
 */
export const TYPE_CONFIG = {
  personal: { 
    label: 'Personal', 
    pillClass: 'pill-personal',
    bgColor: 'bg-[var(--pill-personal-bg)]', 
    textColor: 'text-[var(--pill-personal-fg)]',
  },
  organization: { 
    label: 'Organization', 
    pillClass: 'pill-organization',
    bgColor: 'bg-[var(--pill-organization-bg)]', 
    textColor: 'text-[var(--pill-organization-fg)]',
  },
  platform: { 
    label: 'Platform', 
    pillClass: 'pill-platform',
    bgColor: 'bg-[var(--pill-platform-bg)]', 
    textColor: 'text-[var(--pill-platform-fg)]',
  }
};

/**
 * Status Configuration
 * For order statuses, mailing statuses, etc.
 */
export const STATUS_CONFIG = {
  // Success states
  active: { label: 'Active', pillClass: 'pill-success' },
  sent: { label: 'Sent', pillClass: 'pill-success' },
  delivered: { label: 'Delivered', pillClass: 'pill-success' },
  completed: { label: 'Completed', pillClass: 'pill-success' },
  paid: { label: 'Paid', pillClass: 'pill-success' },
  
  // Warning states
  pending: { label: 'Pending', pillClass: 'pill-warning' },
  processing: { label: 'Processing', pillClass: 'pill-warning' },
  scheduled: { label: 'Scheduled', pillClass: 'pill-warning' },
  in_progress: { label: 'In Progress', pillClass: 'pill-warning' },
  
  // Danger states
  failed: { label: 'Failed', pillClass: 'pill-danger' },
  cancelled: { label: 'Cancelled', pillClass: 'pill-danger' },
  rejected: { label: 'Rejected', pillClass: 'pill-danger' },
  expired: { label: 'Expired', pillClass: 'pill-danger' },
  
  // Muted states
  draft: { label: 'Draft', pillClass: 'pill-muted' },
  inactive: { label: 'Inactive', pillClass: 'pill-muted' },
};

/**
 * Helper to get pill class from status
 * @param {string} status - Status string (case insensitive)
 * @returns {string} - CSS class name
 */
export function getStatusPillClass(status) {
  const statusLower = (status || '').toLowerCase().replace(/\s+/g, '_');
  return STATUS_CONFIG[statusLower]?.pillClass || 'pill-muted';
}

/**
 * Helper to get pill class from purpose
 * @param {string} purpose - Purpose key
 * @returns {string} - CSS class name
 */
export function getPurposePillClass(purpose) {
  return PURPOSE_CONFIG[purpose]?.pillClass || 'pill-purpose-custom';
}

/**
 * Helper to get pill class from type
 * @param {string} type - Type key (personal, organization, platform)
 * @returns {string} - CSS class name
 */
export function getTypePillClass(type) {
  return TYPE_CONFIG[type]?.pillClass || 'pill-muted';
}