import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// Return address options
const RETURN_ADDRESS_OPTIONS = [
  { value: 'company', label: 'Company' },
  { value: 'rep', label: 'Rep' },
  { value: 'None', label: 'None' }
];

/**
 * ReturnAddressSelector Component
 * Button group for selecting return address mode
 * 
 * @param {string} returnAddressMode - Current return address mode
 * @param {Function} onChange - Callback when return address mode changes: (value) => void
 */
export default function ReturnAddressSelector({ returnAddressMode, onChange }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div>
          <Label>Return Address</Label>
          <div className="flex gap-2 mt-1">
            {RETURN_ADDRESS_OPTIONS.map(opt => (
              <Button
                key={opt.value}
                type="button"
                variant={returnAddressMode === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => onChange(opt.value)}
                className="flex-1"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}