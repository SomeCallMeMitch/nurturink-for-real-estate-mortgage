import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Code2, User, Building2, Mail, Phone, MapPin } from 'lucide-react';

/**
 * PlaceholderSelector Component
 * Button that opens a popover with categorized placeholder options
 * 
 * @param {Function} onPlaceholderSelect - Callback when placeholder is selected: (placeholder) => void
 */
export default function PlaceholderSelector({ onPlaceholderSelect }) {
  const [open, setOpen] = useState(false);

  const placeholderCategories = [
    {
      name: 'Client Info',
      icon: User,
      placeholders: [
        { label: 'First Name', value: '{{firstName}}' },
        { label: 'Last Name', value: '{{lastName}}' },
        { label: 'Full Name', value: '{{fullName}}' },
        { label: 'Company Name', value: '{{companyName}}' },
      ]
    },
    {
      name: 'Client Contact',
      icon: Mail,
      placeholders: [
        { label: 'Email', value: '{{client.email}}' },
        { label: 'Phone', value: '{{client.phone}}' },
      ]
    },
    {
      name: 'Client Address',
      icon: MapPin,
      placeholders: [
        { label: 'City', value: '{{client.city}}' },
        { label: 'State', value: '{{client.state}}' },
      ]
    },
    {
      name: 'Your Info (Rep)',
      icon: User,
      placeholders: [
        { label: 'Your Name', value: '{{rep_full_name}}' },
        { label: 'Your Company', value: '{{rep_company_name}}' },
        { label: 'Your Phone', value: '{{rep_phone}}' },
      ]
    }
  ];

  const handleSelect = (placeholder) => {
    onPlaceholderSelect(placeholder);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Code2 className="w-4 h-4" />
          Insert Placeholder
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 border-b border-border bg-muted">
          <h3 className="font-semibold text-sm text-foreground">Dynamic Content</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Insert personalized placeholders that will be replaced with real data for each recipient.
          </p>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {placeholderCategories.map((category, categoryIndex) => {
            const Icon = category.icon;
            
            return (
              <div key={categoryIndex} className="border-b border-border last:border-0">
                <div className="px-4 py-2 bg-muted flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {category.name}
                  </span>
                </div>
                
                <div className="py-1">
                  {category.placeholders.map((placeholder, placeholderIndex) => (
                    <button
                      key={placeholderIndex}
                      onClick={() => handleSelect(placeholder.value)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between group"
                    >
                      <span className="text-foreground">{placeholder.label}</span>
                      <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded group-hover:bg-primary/10 group-hover:text-primary">
                        {placeholder.value}
                      </code>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-muted border-t border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Tip:</strong> Placeholders will be replaced with actual data when the card is sent.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}