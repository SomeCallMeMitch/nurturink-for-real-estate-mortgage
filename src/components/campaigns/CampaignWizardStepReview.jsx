import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill } from '@/components/ui/Pill';
import {
  Cake,
  UserPlus,
  CalendarClock,
  Users,
  Shield,
  Check,
  Image as ImageIcon,
  FileText,
  Clock,
} from 'lucide-react';

// Campaign type configuration
const CAMPAIGN_TYPES = {
  birthday: { label: 'Birthday', icon: Cake },
  welcome: { label: 'Welcome', icon: UserPlus },
  renewal: { label: 'Renewal', icon: CalendarClock },
};

/**
 * CampaignWizardStepReview - Step 3 of the Campaign Wizard
 * Displays a summary of the campaign configuration before saving
 */
export default function CampaignWizardStepReview({
  campaignData,
  campaignSteps,
  cardDesigns,
  templates,
  isEditing,
}) {
  // Get design by ID
  const getDesignById = (id) => cardDesigns.find((d) => d.id === id);

  // Get template by ID
  const getTemplateById = (id) => templates.find((t) => t.id === id);

  // Get campaign type config
  const typeConfig = CAMPAIGN_TYPES[campaignData.type] || { label: campaignData.type, icon: Clock };
  const TypeIcon = typeConfig.icon;

  // Format timing description
  const formatTiming = (step, index) => {
    const days = step.timingDays;
    const reference = step.timingReference === 'previous_step' ? 'previous step' : 'trigger date';

    if (days === 0) {
      return `On ${reference}`;
    } else if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} after ${reference}`;
    } else {
      return `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} before ${reference}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">Review Campaign</h3>
        <p className="text-sm text-muted-foreground">
          Please review your campaign settings before saving.
        </p>
      </div>

      {/* Campaign Info Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            Campaign Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{campaignData.name || 'Untitled Campaign'}</p>
            </div>

            {/* Type */}
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <div className="flex items-center gap-2">
                <TypeIcon className="w-4 h-4 text-primary" />
                <span className="font-medium">{typeConfig.label}</span>
              </div>
            </div>

            {/* Enrollment Mode */}
            <div>
              <p className="text-sm text-muted-foreground">Enrollment</p>
              <Pill variant={campaignData.enrollmentMode === 'opt_out' ? 'color1' : 'muted'}>
                {campaignData.enrollmentMode === 'opt_out' ? 'Auto-enroll' : 'Manual'}
              </Pill>
            </div>

            {/* Approval */}
            <div>
              <p className="text-sm text-muted-foreground">Approval Required</p>
              <div className="flex items-center gap-2">
                {campaignData.requiresApproval ? (
                  <>
                    <Shield className="w-4 h-4 text-warning" />
                    <span className="font-medium">Yes</span>
                  </>
                ) : (
                  <span className="font-medium text-muted-foreground">No</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {campaignData.description && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{campaignData.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Steps Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            Card Sequence ({campaignSteps.length} step{campaignSteps.length !== 1 ? 's' : ''})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaignSteps.map((step, index) => {
            const design = getDesignById(step.cardDesignId);
            const template = getTemplateById(step.templateId);

            return (
              <div
                key={index}
                className={`flex gap-4 p-3 border rounded-lg ${
                  !step.isEnabled ? 'opacity-50 bg-muted/30' : ''
                }`}
              >
                {/* Step Number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                  {step.stepOrder}
                </div>

                {/* Card Design Preview */}
                <div className="flex-shrink-0">
                  {design ? (
                    <img
                      src={design.outsideImageUrl || design.imageUrl}
                      alt={design.name}
                      className="w-20 h-14 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-20 h-14 bg-muted rounded border flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Step Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {design?.name || 'No design selected'}
                    </p>
                    {!step.isEnabled && (
                      <Pill variant="muted" size="sm">
                        Disabled
                      </Pill>
                    )}
                  </div>

                  {/* Message */}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                    <FileText className="w-3 h-3" />
                    {template ? (
                      <span className="truncate">{template.name}</span>
                    ) : step.messageText ? (
                      <span className="truncate">{step.messageText.substring(0, 50)}...</span>
                    ) : (
                      <span className="italic">No message</span>
                    )}
                  </div>

                  {/* Timing */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatTiming(step, index)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Save Instructions */}
      <div className="bg-muted/30 border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          {isEditing ? (
            <>
              Click <strong>"Save as Draft"</strong> to save changes without activating, or{' '}
              <strong>"Save & Activate"</strong> to save and start the campaign immediately.
            </>
          ) : (
            <>
              Click <strong>"Save as Draft"</strong> to create the campaign without activating it, or{' '}
              <strong>"Save & Activate"</strong> to create and start the campaign immediately.
            </>
          )}
        </p>
      </div>
    </div>
  );
}