import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Image, FileText, Clock, Trash2 } from 'lucide-react';
import PlaceholderModal from './PlaceholderModal';

/**
 * CardStepConfigurator Component (Sprint 3 - Data-Driven)
 *
 * @param {Object} step - Step data: { stepOrder, cardDesignId, templateId, messageText, timingDays, timingReference }
 * @param {Object} triggerType - The TriggerType record: { key, name, dateField, defaultDaysBefore, defaultDaysAfter }
 * @param {Function} onUpdate - Callback: (updates) => void
 * @param {Function} onRemove - Callback to remove this step (optional)
 * @param {Object|null} selectedDesign - Currently selected card design object
 * @param {Object|null} selectedTemplate - Currently selected template object
 * @param {Function} onOpenDesignPicker - Opens the card design picker modal
 * @param {Function} onOpenTemplatePicker - Opens the template picker modal
 * @param {boolean} canRemove - Whether this step can be removed
 *
 * NOTE: This component imports PlaceholderModal from './PlaceholderModal'.
 * Verify that src/components/campaigns/PlaceholderModal.jsx exists (it should
 * have been created in Sprint 1 or 2). If missing, this file will fail to load.
 */
export default function CardStepConfigurator({
  step,
  triggerType,
  onUpdate,
  onRemove,
  selectedDesign,
  selectedTemplate,
  onOpenDesignPicker,
  onOpenTemplatePicker,
  canRemove = false
}) {
  // Derive messageMode from step prop on every render
  const messageMode = step.templateId ? 'template' : (step.messageText ? 'custom' : 'template');

  const handleMessageModeChange = (mode) => {
    if (mode === 'template') {
      onUpdate({ messageText: '', templateId: step.templateId || null });
    } else {
      onUpdate({ templateId: null, messageText: step.messageText || '' });
    }
  };

  const handleInsertPlaceholder = (placeholder) => {
    const currentText = step.messageText || '';
    onUpdate({ messageText: currentText + placeholder });
  };

  // Data-driven timing label based on TriggerType defaults
  const getTimingLabel = () => {
    if (!triggerType) return 'days';
    const hasBefore = (triggerType.defaultDaysBefore || 0) > 0;
    const hasAfter = (triggerType.defaultDaysAfter || 0) > 0;

    if (hasBefore && !hasAfter) {
      return `days before their ${triggerType.name.toLowerCase()} date`;
    } else if (hasAfter && !hasBefore) {
      return `days after their ${triggerType.name.toLowerCase()} date`;
    } else {
      const direction = (step.timingDays || 0) < 0 ? 'before' : 'after';
      return `days ${direction} their ${triggerType.name.toLowerCase()} date`;
    }
  };

  // Handle timing input — enforces sign convention based on TriggerType direction
  const handleTimingChange = (value) => {
    const days = parseInt(value) || 0;
    const isBefore = (triggerType?.defaultDaysBefore || 0) > 0 && !(triggerType?.defaultDaysAfter > 0);
    if (isBefore) {
      onUpdate({ timingDays: -Math.abs(days) });
    } else {
      onUpdate({ timingDays: Math.abs(days) });
    }
  };

  const getTimingDisplayValue = () => {
    return Math.abs(step.timingDays || 0);
  };

  return (
    <div className="space-y-6 p-4 border border-border rounded-lg bg-card">
      {/* Step Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
            {step.stepOrder}
          </span>
          Card {step.stepOrder}
        </h3>
        {canRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Timing Section */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Timing
        </Label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min="0"
            max="365"
            value={getTimingDisplayValue()}
            onChange={(e) => handleTimingChange(e.target.value)}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">
            {getTimingLabel()}
          </span>
        </div>
      </div>

      {/* Card Design Section */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Image className="w-4 h-4 text-muted-foreground" />
          Card Design
        </Label>
        <div>
          {selectedDesign ? (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
              {selectedDesign.front_image_url && (
                <img
                  src={selectedDesign.front_image_url}
                  alt={selectedDesign.name}
                  className="w-16 h-12 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{selectedDesign.name}</p>
              </div>
              <Button variant="outline" size="sm" onClick={onOpenDesignPicker}>
                Change
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={onOpenDesignPicker}
              className="w-full justify-start h-auto py-4"
            >
              <div className="w-12 h-8 bg-muted rounded mr-3 flex items-center justify-center">
                <Image className="w-5 h-5 text-muted-foreground" />
              </div>
              <span>Select Card Design</span>
            </Button>
          )}
        </div>
      </div>

      {/* Message Section */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <FileText className="w-4 h-4 text-muted-foreground" />
          Message
        </Label>
        <RadioGroup
          value={messageMode}
          onValueChange={handleMessageModeChange}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="template" id={`template-${step.stepOrder}`} />
            <Label htmlFor={`template-${step.stepOrder}`} className="cursor-pointer">
              Use a template
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id={`custom-${step.stepOrder}`} />
            <Label htmlFor={`custom-${step.stepOrder}`} className="cursor-pointer">
              Write custom message
            </Label>
          </div>
        </RadioGroup>

        {messageMode === 'template' && (
          <div className="mt-3">
            {selectedTemplate ? (
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{selectedTemplate.name}</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {selectedTemplate.content}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={onOpenTemplatePicker}>
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={onOpenTemplatePicker}
                className="w-full justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Select Message Template
              </Button>
            )}
          </div>
        )}

        {messageMode === 'custom' && (
          <div className="mt-3 space-y-2">
            <div className="flex justify-end mb-2">
              <PlaceholderModal onPlaceholderSelect={handleInsertPlaceholder} />
            </div>
            <Textarea
              placeholder="Write your personalized message here..."
              value={step.messageText || ''}
              onChange={(e) => onUpdate({ messageText: e.target.value })}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {(step.messageText || '').length}/500 characters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
