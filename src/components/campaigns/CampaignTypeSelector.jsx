import React from 'react';
import { Cake, Gift, RefreshCw, Check } from 'lucide-react';

/**
 * CampaignTypeSelector Component
 * Step 1 of Campaign Setup Wizard - Choose campaign type
 * 
 * @param {string|null} selectedType - Currently selected campaign type
 * @param {Function} onSelect - Callback when type is selected: (type: string) => void
 */

const CAMPAIGN_TYPES = [
  {
    id: 'birthday',
    title: 'Birthday',
    description: 'Send cards automatically before each client\'s birthday',
    icon: Cake,
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    selectedColor: 'bg-pink-50 border-pink-500 ring-2 ring-pink-500'
  },
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Send a welcome sequence when clients join (1-2 cards)',
    icon: Gift,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    selectedColor: 'bg-blue-50 border-blue-500 ring-2 ring-blue-500'
  },
  {
    id: 'renewal',
    title: 'Renewal',
    description: 'Send reminders before policy renewal dates',
    icon: RefreshCw,
    color: 'bg-green-100 text-green-700 border-green-200',
    selectedColor: 'bg-green-50 border-green-500 ring-2 ring-green-500'
  }
];

export default function CampaignTypeSelector({ selectedType, onSelect }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground">What type of campaign do you want to create?</h2>
        <p className="text-muted-foreground mt-2">
          Choose the trigger that will automatically send cards to your clients
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CAMPAIGN_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;

          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`relative p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                isSelected ? type.selectedColor : 'border-border bg-card hover:border-muted-foreground/30'
              }`}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-lg mb-4 ${type.color}`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {type.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground">
                {type.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}