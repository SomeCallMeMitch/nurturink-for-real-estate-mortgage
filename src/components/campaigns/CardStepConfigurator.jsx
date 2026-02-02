import React, { useState } from 'react';
import { Image, FileText, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import PlaceholderSelector from '@/components/mailing/PlaceholderSelector';

/**
 * CardStepConfigurator Component
 * Configure a single card step (design, message, timing)
 * 
 * @param {Object} step - Step data: { stepOrder, cardDesignId, templateId, messageText, timingDays, timingReference }
 * @param {string} campaignType - Campaign type: 'birthday' | 'welcome' | 'renewal'
 * @param {boolean} isFirstStep - Whether this is the first step in the sequence
 * @param {Function} onUpdate - Callback to update step: (updates: object) => void
 * @param {Function} onRemove - Callback to remove step (only if not first step)
 * @param {Function} onOpenDesignPicker - Callback to open card design picker modal
 * @param {Function} onOpenTemplatePicker - Callback to open template picker modal
 * @param {Object} selectedDesign - Currently selected card design object (for display)
 * @param {Object} selectedTemplate - Currently selected template object (for display)
 */
export default function CardStepConfigurator({
  step,
  campaignType,
  isFirstStep,
  onUpdate,
  onRemove,
  onOpenDesignPicker,
  onOpenTemplatePicker,
  selectedDesign,
  selectedTemplate
}) {
  const [messageMode, setMessageMode] = useState(step.templateId ? 'template' : 'custom');

  // Determine timing label based on campaign type and step order
  const getTimingLabel = () => {
    if (campaignType === 'birthday') {
      return 'days before their birthday';
    } else if (campaignType === 'renewal') {
      return 'days before their renewal date';
    } else if (campaignType === 'welcome') {
      if (isFirstStep) {
        return 'days after policy start date';
      } else {
        return 'days after the previous card';
      }
    }
    return 'days';
  };

  // Handle timing change - convert to negative for before dates
  const handleTimingChange = (value) => {
    const days = parseInt(value) || 0;
    // For birthday/renewal, timing is negative (before the date)
    // For welcome, timing is positive (after the date)
    if (campaignType === 'birthday' || campaignType === 'renewal') {
      onUpdate({ timingDays: -Math.abs(days) });
    } else {
      onUpdate({ timingDays: Math.abs(days) });
    }
  };

  // Get display value for timing input (always positive for UI)
  const getTimingDisplayValue = () => {
    return Math.abs(step.timingDays || 0);
  };

  // Handle message mode change
  const handleMessageModeChange = (mode) => {
    setMessageMode(mode);
    if (mode === 'template') {
      onUpdate({ messageText: '' });
    } else {
      onUpdate({ templateId: null });
    }
  };

  // Handle inserting placeholder into custom message
  const handleInsertPlaceholder = (placeholder) => {
    onUpdate({ messageText: (step.messageText || '') + ' ' + placeholder });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Card {step.stepOrder}
        </h3>
        {!isFirstStep && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {/* Timing Section */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Timing
        </Label>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Send</span>
          <Input
            type="number"
            min="0"
            max="365"
            value={getTimingDisplayValue()}
            onChange={(e) => handleTimingChange(e.target.value)}
            className="w-20 text-center"
          />
          <span className="text-sm text-muted-foreground">{getTimingLabel()}</span>
        </div>
      </div>

      {/* Card Design Section */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Image className="w-4 h-4 text-muted-foreground" />
          Card Design
        </Label>
        <div className="flex items-center gap-4">
          {selectedDesign ? (
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border border-border flex-1">
              <img
                src={selectedDesign.frontImageUrl || selectedDesign.outsideImageUrl || selectedDesign.imageUrl}
                alt={selectedDesign.name}
                className="w-16 h-12 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{selectedDesign.name}</p>
                <p className="text-xs text-muted-foreground">Card design selected</p>
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

        {/* Message Mode Toggle */}
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

        {/* Template Selection */}
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

        {/* Custom Message Textarea */}
        {messageMode === 'custom' && (
          <div className="mt-3 space-y-2">
            <div className="flex justify-end mb-2">
              <PlaceholderSelector onPlaceholderSelect={handleInsertPlaceholder} />
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