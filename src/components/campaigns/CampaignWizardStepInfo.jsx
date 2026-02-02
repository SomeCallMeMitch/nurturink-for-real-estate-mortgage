import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cake, UserPlus, CalendarClock, Users, Shield } from 'lucide-react';

// Campaign type options with descriptions
const CAMPAIGN_TYPE_OPTIONS = [
  {
    value: 'birthday',
    label: 'Birthday',
    icon: Cake,
    description: 'Send cards on client birthdays',
    triggerField: 'birthday',
  },
  {
    value: 'welcome',
    label: 'Welcome',
    icon: UserPlus,
    description: 'Send cards when clients sign up or start a policy',
    triggerField: 'policy_start_date',
  },
  {
    value: 'renewal',
    label: 'Renewal',
    icon: CalendarClock,
    description: 'Send cards before policy renewal dates',
    triggerField: 'renewal_date',
  },
];

// Enrollment mode options
const ENROLLMENT_MODE_OPTIONS = [
  {
    value: 'opt_out',
    label: 'Auto-Enroll (Opt-Out)',
    description: 'All eligible clients are automatically enrolled. They can be excluded manually.',
  },
  {
    value: 'opt_in',
    label: 'Manual Enroll (Opt-In)',
    description: 'Clients must be manually enrolled in this campaign.',
  },
];

/**
 * CampaignWizardStepInfo - Step 1 of the Campaign Wizard
 * Collects basic campaign information: name, type, enrollment mode, approval settings
 */
export default function CampaignWizardStepInfo({ campaignData, setCampaignData }) {
  const handleChange = (field, value) => {
    setCampaignData((prev) => ({ ...prev, [field]: value }));
  };

  const selectedType = CAMPAIGN_TYPE_OPTIONS.find((t) => t.value === campaignData.type);

  return (
    <div className="space-y-6">
      {/* Campaign Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Campaign Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={campaignData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Birthday Wishes 2024"
          className="max-w-md"
        />
        <p className="text-sm text-muted-foreground">
          A descriptive name to identify this campaign.
        </p>
      </div>

      {/* Campaign Type */}
      <div className="space-y-3">
        <Label>
          Campaign Type <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CAMPAIGN_TYPE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = campaignData.type === option.value;

            return (
              <Card
                key={option.value}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleChange('type', option.value)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {selectedType && (
          <p className="text-sm text-muted-foreground">
            This campaign will trigger based on the client's <strong>{selectedType.triggerField.replace('_', ' ')}</strong> field.
          </p>
        )}
      </div>

      {/* Enrollment Mode */}
      <div className="space-y-3">
        <Label>
          Enrollment Mode <span className="text-destructive">*</span>
        </Label>
        <div className="space-y-3">
          {ENROLLMENT_MODE_OPTIONS.map((option) => {
            const isSelected = campaignData.enrollmentMode === option.value;

            return (
              <Card
                key={option.value}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleChange('enrollmentMode', option.value)}
              >
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-primary' : 'border-muted-foreground'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Approval Requirement */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Require Approval</p>
            <p className="text-sm text-muted-foreground">
              Cards will be queued for review before sending
            </p>
          </div>
        </div>
        <Switch
          checked={campaignData.requiresApproval}
          onCheckedChange={(checked) => handleChange('requiresApproval', checked)}
        />
      </div>

      {/* Description (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={campaignData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Add notes about this campaign..."
          className="max-w-md h-24"
        />
      </div>
    </div>
  );
}