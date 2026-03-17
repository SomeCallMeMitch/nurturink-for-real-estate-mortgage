import React from 'react';
import {
  Check, HelpCircle, Cake, Gift, RefreshCw, Calendar, Home,
  Shield, Heart, Star, Clock, AlertCircle, Settings2, Mail,
  Users, Sparkles, PartyPopper, Award, Bell, Zap
} from 'lucide-react';

/**
 * CampaignTypeSelector Component
 * Step 1 of Campaign Setup Wizard - Choose campaign type
 * Now data-driven from CampaignType entity records
 *
 * @param {string|null} selectedType - Currently selected campaign type slug
 * @param {Function} onSelect - Callback when type is selected: (slug: string) => void
 * @param {Array} campaignTypes - Array of CampaignType records from the database
 * @param {boolean} isLoading - Whether campaign types are still loading
 */

// Map of icon name strings to Lucide components
const ICON_MAP = {
  Cake, Gift, RefreshCw, Calendar, Home, Shield, Heart, Star,
  Clock, AlertCircle, Settings2, Mail, Users, Sparkles,
  PartyPopper, Award, Bell, Zap, HelpCircle, Check
};

export default function CampaignTypeSelector({ selectedType, onSelect, campaignTypes = [], isLoading = false }) {

  // Dynamically resolve icon component by name string
  const getIcon = (iconName) => {
    if (!iconName) return HelpCircle;
    return ICON_MAP[iconName] || HelpCircle;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-foreground">What type of campaign do you want to create?</h2>
          <p className="text-muted-foreground mt-2">Choose the trigger that will automatically send cards to your clients</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (campaignTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No campaign types are currently available. Contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground">What type of campaign do you want to create?</h2>
        <p className="text-muted-foreground mt-2">
          Choose the trigger that will automatically send cards to your clients
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {campaignTypes.map((type) => {
          const Icon = getIcon(type.icon);
          const isSelected = selectedType === type.slug;

          return (
            <button
              key={type.slug}
              onClick={() => onSelect(type.slug)}
              className={`relative p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                isSelected
                  ? (type.selectedColor || 'bg-primary/5 border-primary ring-2 ring-primary')
                  : 'border-border bg-card hover:border-muted-foreground/30'
              }`}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-lg mb-4 ${type.color || 'bg-muted text-muted-foreground'}`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-foreground mb-2">{type.name}</h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground">{type.description || ''}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}