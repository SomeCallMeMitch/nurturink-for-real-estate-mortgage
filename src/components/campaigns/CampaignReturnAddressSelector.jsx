import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Building2, User, X } from 'lucide-react';

/**
 * CampaignReturnAddressSelector Component
 * Allows selection of return address mode for campaign cards
 * 
 * @param {string} returnAddressMode - Current return address mode ('company', 'rep', 'none')
 * @param {Function} onChange - Callback when mode changes: (value) => void
 * @param {Object} companyAddress - Organization's return address object
 * @param {Object} repAddress - Current user's return address object
 */
export default function CampaignReturnAddressSelector({ 
  returnAddressMode, 
  onChange,
  companyAddress,
  repAddress
}) {
  // Format address for display
  const formatAddress = (addr) => {
    if (!addr) return null;
    const parts = [];
    if (addr.companyName) parts.push(addr.companyName);
    if (addr.street) parts.push(addr.street);
    if (addr.address2) parts.push(addr.address2);
    if (addr.city && addr.state && addr.zip) {
      parts.push(`${addr.city}, ${addr.state} ${addr.zip}`);
    }
    return parts.length > 0 ? parts : null;
  };

  const companyAddressLines = formatAddress(companyAddress);
  const repAddressLines = formatAddress(repAddress);

  // Return address options with dynamic address data
  const options = [
    { 
      value: 'company', 
      label: 'Company Address', 
      description: 'Use your organization\'s return address',
      icon: Building2,
      addressLines: companyAddressLines
    },
    { 
      value: 'rep', 
      label: 'Sales Rep Address', 
      description: 'Use the assigned rep\'s personal address',
      icon: User,
      addressLines: repAddressLines
    },
    { 
      value: 'none', 
      label: 'No Return Address', 
      description: 'Send cards without a return address',
      icon: X,
      addressLines: null
    }
  ];

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
        {options.map((option) => {
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
                  {/* Left column: label and description */}
                  <div className="flex-1 min-w-0">
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
                  {/* Right column: actual address */}
                  {option.addressLines && (
                    <div className="text-right text-sm text-muted-foreground min-w-[180px]">
                      {option.addressLines.map((line, idx) => (
                        <div key={idx} className="truncate">{line}</div>
                      ))}
                    </div>
                  )}
                  {option.value !== 'none' && !option.addressLines && (
                    <div className="text-right text-sm text-muted-foreground italic min-w-[180px]">
                      Not configured
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </RadioGroup>
    </div>
  );
}