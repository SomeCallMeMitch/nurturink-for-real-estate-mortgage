import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
// FIX #1: Corrected import path to match NurturInk's base44 client location and export style
import { base44 } from '@/api/base44Client';

/**
 * CampaignTypeSelector Component (Sprint 3 - Data-Driven)
 * Reads campaign types from TriggerType entity instead of a hardcoded array.
 *
 * @param {string|null} selectedType - Currently selected TriggerType key
 * @param {Function} onSelect - Callback: (triggerTypeRecord) => void
 */

// Fallback color palette for trigger types that don't have a color set
const COLOR_PALETTE = [
  { bg: 'bg-pink-100 text-pink-700 border-pink-200', selected: 'bg-pink-50 border-pink-500 ring-2 ring-pink-500' },
  { bg: 'bg-blue-100 text-blue-700 border-blue-200', selected: 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' },
  { bg: 'bg-green-100 text-green-700 border-green-200', selected: 'bg-green-50 border-green-500 ring-2 ring-green-500' },
  { bg: 'bg-purple-100 text-purple-700 border-purple-200', selected: 'bg-purple-50 border-purple-500 ring-2 ring-purple-500' },
  { bg: 'bg-orange-100 text-orange-700 border-orange-200', selected: 'bg-orange-50 border-orange-500 ring-2 ring-orange-500' },
  { bg: 'bg-teal-100 text-teal-700 border-teal-200', selected: 'bg-teal-50 border-teal-500 ring-2 ring-teal-500' },
  { bg: 'bg-red-100 text-red-700 border-red-200', selected: 'bg-red-50 border-red-500 ring-2 ring-red-500' },
  { bg: 'bg-yellow-100 text-yellow-700 border-yellow-200', selected: 'bg-yellow-50 border-yellow-500 ring-2 ring-yellow-500' },
];

function getIcon(iconName) {
  const Icon = LucideIcons[iconName] || LucideIcons.Calendar;
  return Icon;
}

export default function CampaignTypeSelector({ selectedType, onSelect }) {
  const [triggerTypes, setTriggerTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setLoading(true);
        const types = await base44.entities.TriggerType.filter({ isActive: true });
        // Sort by sortOrder if present, then by name
        types.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setTriggerTypes(types);
      } catch (err) {
        console.error('Failed to load trigger types:', err);
        setError('Failed to load campaign types');
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
        <span className="ml-3 text-muted-foreground">Loading campaign types...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (triggerTypes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No campaign types are configured yet.</p>
        <p className="text-sm mt-1">An administrator needs to create trigger types first.</p>
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
      <div className={`grid grid-cols-1 ${triggerTypes.length >= 3 ? 'md:grid-cols-3' : triggerTypes.length === 2 ? 'md:grid-cols-2' : ''} gap-6`}>
        {triggerTypes.map((tt, index) => {
          const Icon = getIcon(tt.icon);
          const isSelected = selectedType === tt.key;
          const colors = COLOR_PALETTE[index % COLOR_PALETTE.length];

          return (
            <button
              key={tt.id}
              onClick={() => onSelect(tt)}
              className={`relative p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                isSelected ? colors.selected : 'border-border bg-card hover:border-muted-foreground/30'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}
              <div className={`inline-flex p-3 rounded-lg mb-4 ${colors.bg}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {tt.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {tt.description || `Automatically send cards based on ${tt.dateField}`}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
