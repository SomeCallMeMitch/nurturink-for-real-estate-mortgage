import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import CardDesignPickerModal from '@/components/quicksend/CardDesignPickerModal';
import TemplatePickerModal from '@/components/quicksend/TemplatePickerModal';

// Timing reference options
const TIMING_REFERENCE_OPTIONS = [
  { value: 'trigger_date', label: 'From trigger date' },
  { value: 'previous_step', label: 'From previous step' },
];

/**
 * CampaignWizardStepSequence - Step 2 of the Campaign Wizard
 * Allows adding, editing, and removing campaign steps (card sequence)
 */
export default function CampaignWizardStepSequence({
  campaignData,
  campaignSteps,
  setCampaignSteps,
  cardDesigns,
  templates,
  cardDesignCategories,
  user,
}) {
  // Modal states
  const [designPickerOpen, setDesignPickerOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(null);

  // Collapsed state for each step
  const [collapsedSteps, setCollapsedSteps] = useState({});

  // Get trigger field description based on campaign type
  const getTriggerDescription = () => {
    switch (campaignData.type) {
      case 'birthday':
        return "client's birthday";
      case 'welcome':
        return "client's policy start date";
      case 'renewal':
        return "client's renewal date";
      default:
        return 'trigger date';
    }
  };

  // Add a new step
  const handleAddStep = () => {
    const newStep = {
      stepOrder: campaignSteps.length + 1,
      cardDesignId: '',
      templateId: '',
      messageText: '',
      timingDays: campaignSteps.length === 0 ? 0 : 7,
      timingReference: campaignSteps.length === 0 ? 'trigger_date' : 'previous_step',
      isEnabled: true,
    };
    setCampaignSteps((prev) => [...prev, newStep]);
  };

  // Remove a step
  const handleRemoveStep = (index) => {
    setCampaignSteps((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Re-number step orders
      return updated.map((step, i) => ({ ...step, stepOrder: i + 1 }));
    });
  };

  // Update a specific step field
  const handleStepChange = (index, field, value) => {
    setCampaignSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, [field]: value } : step))
    );
  };

  // Open design picker for a specific step
  const handleOpenDesignPicker = (index) => {
    setActiveStepIndex(index);
    setDesignPickerOpen(true);
  };

  // Open template picker for a specific step
  const handleOpenTemplatePicker = (index) => {
    setActiveStepIndex(index);
    setTemplatePickerOpen(true);
  };

  // Handle design selection
  const handleDesignSelect = (design) => {
    if (activeStepIndex !== null) {
      handleStepChange(activeStepIndex, 'cardDesignId', design.id);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    if (activeStepIndex !== null) {
      handleStepChange(activeStepIndex, 'templateId', template.id);
      handleStepChange(activeStepIndex, 'messageText', ''); // Clear custom message when template selected
    }
  };

  // Toggle step collapsed state
  const toggleCollapsed = (index) => {
    setCollapsedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Get design by ID
  const getDesignById = (id) => cardDesigns.find((d) => d.id === id);

  // Get template by ID
  const getTemplateById = (id) => templates.find((t) => t.id === id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">Card Sequence</h3>
        <p className="text-sm text-muted-foreground">
          Define the sequence of cards to send. Each step represents one card in the campaign.
          Timing is relative to the {getTriggerDescription()}.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {campaignSteps.map((step, index) => {
          const isCollapsed = collapsedSteps[index];
          const selectedDesign = getDesignById(step.cardDesignId);
          const selectedTemplate = getTemplateById(step.templateId);

          return (
            <Card key={index} className={!step.isEnabled ? 'opacity-60' : ''}>
              <CardHeader className="py-3 cursor-pointer" onClick={() => toggleCollapsed(index)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                    <CardTitle className="text-base">
                      Step {step.stepOrder}
                      {selectedDesign && (
                        <span className="font-normal text-muted-foreground ml-2">
                          - {selectedDesign.name}
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Timing Badge */}
                    <span className="text-sm text-muted-foreground">
                      {step.timingDays === 0
                        ? 'On trigger date'
                        : step.timingDays > 0
                        ? `${step.timingDays} days after`
                        : `${Math.abs(step.timingDays)} days before`}
                    </span>
                    {isCollapsed ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {!isCollapsed && (
                <CardContent className="pt-0 space-y-4">
                  {/* Card Design Selection */}
                  <div className="space-y-2">
                    <Label>
                      Card Design <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center gap-3">
                      {selectedDesign ? (
                        <div className="flex items-center gap-3 p-2 border rounded-lg flex-1">
                          <img
                            src={selectedDesign.outsideImageUrl || selectedDesign.imageUrl}
                            alt={selectedDesign.name}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{selectedDesign.name}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDesignPicker(index)}
                          >
                            Change
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="flex-1 h-16 justify-start gap-3"
                          onClick={() => handleOpenDesignPicker(index)}
                        >
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          Select Card Design
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Message Template or Custom Message */}
                  <div className="space-y-2">
                    <Label>
                      Message <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center gap-3">
                      {selectedTemplate ? (
                        <div className="flex items-center gap-3 p-2 border rounded-lg flex-1">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{selectedTemplate.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {selectedTemplate.content}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenTemplatePicker(index)}
                          >
                            Change
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleStepChange(index, 'templateId', '');
                            }}
                          >
                            Clear
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="h-12 justify-start gap-3"
                          onClick={() => handleOpenTemplatePicker(index)}
                        >
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          Select Template
                        </Button>
                      )}
                    </div>

                    {/* Custom message fallback */}
                    {!step.templateId && (
                      <div className="mt-2">
                        <Label className="text-sm text-muted-foreground">Or write a custom message:</Label>
                        <Textarea
                          value={step.messageText}
                          onChange={(e) => handleStepChange(index, 'messageText', e.target.value)}
                          placeholder="Enter your custom message here..."
                          className="mt-1 h-24"
                        />
                      </div>
                    )}
                  </div>

                  {/* Timing Configuration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Days Offset</Label>
                      <Input
                        type="number"
                        value={step.timingDays}
                        onChange={(e) =>
                          handleStepChange(index, 'timingDays', parseInt(e.target.value) || 0)
                        }
                        placeholder="0"
                      />
                      <p className="text-xs text-muted-foreground">
                        Negative = before, 0 = on, Positive = after
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Relative To</Label>
                      <Select
                        value={step.timingReference}
                        onValueChange={(value) => handleStepChange(index, 'timingReference', value)}
                        disabled={index === 0} // First step must be relative to trigger
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMING_REFERENCE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Step Controls */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={step.isEnabled}
                        onCheckedChange={(checked) => handleStepChange(index, 'isEnabled', checked)}
                      />
                      <Label className="text-sm text-muted-foreground">
                        {step.isEnabled ? 'Enabled' : 'Disabled'}
                      </Label>
                    </div>

                    {campaignSteps.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStep(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Step Button */}
      <Button variant="outline" onClick={handleAddStep} className="w-full gap-2">
        <Plus className="w-4 h-4" />
        Add Another Step
      </Button>

      {/* Card Design Picker Modal */}
      <CardDesignPickerModal
        open={designPickerOpen}
        onOpenChange={setDesignPickerOpen}
        designs={cardDesigns}
        categories={cardDesignCategories}
        selectedId={activeStepIndex !== null ? campaignSteps[activeStepIndex]?.cardDesignId : null}
        onSelect={handleDesignSelect}
      />

      {/* Template Picker Modal */}
      <TemplatePickerModal
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        templates={templates}
        selectedId={activeStepIndex !== null ? campaignSteps[activeStepIndex]?.templateId : null}
        onSelect={handleTemplateSelect}
        user={user}
      />
    </div>
  );
}