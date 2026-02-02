import React from 'react';
import { Users, UserPlus, Check, ShieldCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

/**
 * EnrollmentModeSelector Component
 * Step 2 of Campaign Setup Wizard - Choose enrollment mode and approval setting
 * 
 * @param {string} enrollmentMode - Current enrollment mode ('opt_in' | 'opt_out')
 * @param {boolean} requiresApproval - Whether approval is required before sending
 * @param {number} eligibleClientCount - Number of eligible clients (based on campaign type)
 * @param {Function} onModeChange - Callback when mode changes: (mode: string) => void
 * @param {Function} onApprovalChange - Callback when approval setting changes: (requires: boolean) => void
 */

const ENROLLMENT_MODES = [
  {
    id: 'opt_out',
    title: 'Opt-Out (Recommended)',
    description: 'All eligible clients are automatically enrolled. You can exclude specific clients later.',
    icon: Users,
    recommended: true
  },
  {
    id: 'opt_in',
    title: 'Opt-In',
    description: 'No clients enrolled by default. You manually add clients to this campaign.',
    icon: UserPlus,
    recommended: false
  }
];

export default function EnrollmentModeSelector({ 
  enrollmentMode, 
  requiresApproval, 
  eligibleClientCount,
  onModeChange, 
  onApprovalChange 
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground">How should clients be enrolled?</h2>
        <p className="text-muted-foreground mt-2">
          Choose how clients are added to this campaign
        </p>
      </div>

      {/* Enrollment Mode Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ENROLLMENT_MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = enrollmentMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`relative p-6 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                isSelected 
                  ? 'border-primary bg-primary/5 ring-2 ring-primary' 
                  : 'border-border bg-card hover:border-muted-foreground/30'
              }`}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}

              {/* Recommended Badge */}
              {mode.recommended && (
                <span className="absolute top-3 left-3 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                  Recommended
                </span>
              )}

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-lg mb-4 mt-4 ${
                isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {mode.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-3">
                {mode.description}
              </p>

              {/* Client Count (only for opt_out) */}
              {mode.id === 'opt_out' && isSelected && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground">
                    <span className="text-primary">{eligibleClientCount}</span> clients will be enrolled
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Approval Toggle */}
      <div className="bg-muted/50 rounded-xl p-6 border border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <Label htmlFor="approval-toggle" className="text-base font-semibold text-foreground cursor-pointer">
                Require approval before sending
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Cards will go to your approval queue before being sent. Recommended for high-value clients.
              </p>
            </div>
          </div>
          <Switch
            id="approval-toggle"
            checked={requiresApproval}
            onCheckedChange={onApprovalChange}
          />
        </div>
      </div>
    </div>
  );
}