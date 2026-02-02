import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Building2, User, X } from 'lucide-react';

// Return address mode options for campaigns
const RETURN_ADDRESS_OPTIONS = [
  { 
    value: 'company', 
    label: 'Company Address', 
    description: 'Use your organization\'s return address',
    icon: Building2
  },
  { 
    value: 'rep', 
    label: 'Sales Rep Address', 
    description: 'Use the assigned rep\'s personal address',
    icon: User
  },
  { 
    value: 'none', 
    label: 'No Return Address', 
    description: 'Send cards without a return address',
    icon: X
  }
];

/**
 * CampaignReturnAddressSelector Component
 * Allows selection of return address mode for campaign cards
 * 
 * @param {string} returnAddressMode - Current return address mode ('company', 'rep', 'none')
 * @param {Function} onChange - Callback when mode changes: (value) => void
 */
export default function CampaignReturnAddressSelector({ returnAddressMode, onChange }) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">Return Address</h2>
        <p className="text-muted-foreground mt-2">
          Choose which return address to print on campaign cards
        </p>
      </div>

      {/* Options */}
      <RadioGroup
        value={returnAddressMode}
        onValueChange={onChange}
        className="grid gap-4"
      >
        {RETURN_ADDRESS_OPTIONS.map((option) => {
          const IconComponent = option.icon;
          const isSelected = returnAddressMode === option.value;

          return (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'hover:border-muted-foreground/50'
              }`}
              onClick={() => onChange(option.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <RadioGroupItem 
                    value={option.value} 
                    id={`return-${option.value}`}
                    className="mt-1"
                  />
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <Label 
                      htmlFor={`return-${option.value}`}
                      className="text-base font-medium cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </RadioGroup>
    </div>
  );
}