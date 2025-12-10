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
 * Centralized configuration for purpose icons, labels, and colors
 * Used across QuickSendPickerModal, QuickSendTemplateCard, TemplatePickerModal
 */
export const PURPOSE_CONFIG = {
  thank_you: { 
    label: 'Thank You', 
    icon: ThumbsUp, 
    bgColor: 'bg-green-100', 
    textColor: 'text-green-700',
    color: 'bg-green-100 text-green-700' // Shorthand for some components
  },
  referral_request: { 
    label: 'Referral Request', 
    icon: Users, 
    bgColor: 'bg-blue-100', 
    textColor: 'text-blue-700',
    color: 'bg-blue-100 text-blue-700'
  },
  review_request: { 
    label: 'Review Request', 
    icon: Star, 
    bgColor: 'bg-yellow-100', 
    textColor: 'text-yellow-700',
    color: 'bg-yellow-100 text-yellow-700'
  },
  review_and_referral: { 
    label: 'Review & Referral', 
    icon: MessageSquare, 
    bgColor: 'bg-purple-100', 
    textColor: 'text-purple-700',
    color: 'bg-purple-100 text-purple-700'
  },
  birthday: { 
    label: 'Birthday', 
    icon: Gift, 
    bgColor: 'bg-pink-100', 
    textColor: 'text-pink-700',
    color: 'bg-pink-100 text-pink-700'
  },
  anniversary: { 
    label: 'Anniversary', 
    icon: Heart, 
    bgColor: 'bg-red-100', 
    textColor: 'text-red-700',
    color: 'bg-red-100 text-red-700'
  },
  holiday: { 
    label: 'Holiday', 
    icon: Sparkles, 
    bgColor: 'bg-indigo-100', 
    textColor: 'text-indigo-700',
    color: 'bg-indigo-100 text-indigo-700'
  },
  just_because: { 
    label: 'Just Because', 
    icon: Calendar, 
    bgColor: 'bg-teal-100', 
    textColor: 'text-teal-700',
    color: 'bg-teal-100 text-teal-700'
  },
  custom: { 
    label: 'Custom', 
    icon: HelpCircle, 
    bgColor: 'bg-gray-100', 
    textColor: 'text-gray-700',
    color: 'bg-gray-100 text-gray-700'
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
 * Used for Quick Send Template visibility badges
 */
export const TYPE_CONFIG = {
  personal: { 
    label: 'Personal', 
    bgColor: 'bg-purple-100', 
    textColor: 'text-purple-700' 
  },
  organization: { 
    label: 'Organization', 
    bgColor: 'bg-blue-100', 
    textColor: 'text-blue-700' 
  },
  platform: { 
    label: 'Platform', 
    bgColor: 'bg-green-100', 
    textColor: 'text-green-700' 
  }
};