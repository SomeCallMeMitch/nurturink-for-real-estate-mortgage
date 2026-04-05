// ─────────────────────────────────────────────────────────────────────────────
// CampaignCardSetupPanel.jsx  — Column 2
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Plus, X, AlertTriangle, ZoomIn, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function CampaignCardSetupPanel({
  steps,
  activeStepIndex,
  setActiveStepIndex,
  selectedType,
  updateStep,
  addStep,
  removeStep,
  timingDisplayValue,
  timingLabel,
  cardDesigns,
  selectedDesign,
  openDesignPicker,
  openTemplatePicker,
  messageMode,
  onMessageModeChange,
  selectedTemplate,
  currentStep,
  requiresApproval,
  setRequiresApproval,
  onOpenCustomModal,
  setCardEnlargeOpen,
  setCardEnlargeFace,
}) {
  return (
    <div
      className="flex-1 overflow-y-auto border-r border-border"
      style={{ padding: '16px 28px' }}
    >
      {/* ── Step tabs ─────────────────────────────────────────────────────── */}
      {steps.length > 1 && (
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveStepIndex(i)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                activeStepIndex === i
                  ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                  : 'border-border text-gray-500 hover:bg-gray-50'
              }`}
            >
              Card {i + 1}
              {i > 0 && (
                <span
                  role="button"
                  onClick={e => { e.stopPropagation(); removeStep(i); }}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </span>
              )}
            </button>
          ))}
          {selectedType && steps.length < (selectedType.maxSteps || 2) && (
            <button
              onClick={addStep}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border-2 border-dashed border-border text-sm font-medium text-gray-500 hover:border-brand-accent hover:text-brand-accent transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add card
            </button>
          )}
        </div>
      )}

      {/* ── Timing ────────────────────────────────────────────────────────── */}
      {selectedType && selectedType.timingDirection !== 'on' && (
        <div className="mb-7">
          <p className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
            Timing
          </p>
          <div className="flex items-center gap-3">
            <Input
              type="number" min={0} max={365}
              value={timingDisplayValue}
              onChange={e => {
                const val = parseInt(e.target.value) || 0;
                const isBefore = selectedType.timingDirection === 'before';
                updateStep(activeStepIndex, { timingDays: isBefore ? -val : val });
              }}
              className="w-24 text-center text-base font-semibold"
            />
            <span className="text-sm text-foreground">{timingLabel}</span>
          </div>
        </div>
      )}

      {/* ── Card design ───────────────────────────────────────────────────── */}
      <div className="mb-7">
        <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
          Card design
        </p>
        <div className="flex items-start gap-5">
          {/* Thumbnail — click to enlarge */}
          <div
            className={`flex-shrink-0 rounded-xl border-2 overflow-hidden relative group ${
              selectedDesign
                ? 'border-border cursor-zoom-in hover:border-brand-accent'
                : 'border-dashed border-border cursor-pointer'
            }`}
            style={{ width: '200px', aspectRatio: '11/8' }}
            onClick={() => {
              if (selectedDesign) {
                setCardEnlargeFace('front');
                setCardEnlargeOpen(true);
              } else {
                openDesignPicker(activeStepIndex);
              }
            }}
          >
            {selectedDesign?.frontImageUrl || selectedDesign?.outsideImageUrl ? (
              <>
                <img
                  src={selectedDesign.frontImageUrl || selectedDesign.outsideImageUrl}
                  alt={selectedDesign.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-xs text-gray-400 text-center px-2 leading-snug">
                  {cardDesigns.length === 0 ? 'No designs\nloaded' : 'No design\nselected'}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            {cardDesigns.length === 0 ? (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800 leading-snug">
                  No card designs loaded. Add designs via Admin Portal &gt; Card Designs.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">
                  {selectedDesign ? selectedDesign.name : 'No card selected'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDesignPicker(activeStepIndex)}
                  className="gap-2 w-full justify-center font-medium"
                >
                  {selectedDesign ? 'Change card design' : 'Select card design'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
                {selectedDesign && (
                  <p className="text-xs text-gray-500">
                    Click the image to preview larger
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Message ───────────────────────────────────────────────────────── */}
      <div className="mb-7">
        <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
          Message
        </p>
        <RadioGroup
          value={messageMode}
          onValueChange={onMessageModeChange}
          className="flex gap-6 mb-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="template" id="msg-tmpl" />
            <Label htmlFor="msg-tmpl" className="text-sm cursor-pointer text-foreground font-normal">
              Use a saved template
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="custom" id="msg-custom" />
            <Label htmlFor="msg-custom" className="text-sm cursor-pointer text-foreground font-normal">
              Write a custom message
            </Label>
          </div>
        </RadioGroup>

        {messageMode === 'template' ? (
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => openTemplatePicker(activeStepIndex)}
              className={`w-full justify-between text-sm font-medium ${
                !selectedTemplate ? 'border-dashed text-gray-500' : 'text-foreground'
              }`}
            >
              <span className="truncate">
                {selectedTemplate ? selectedTemplate.name : 'Select a message template…'}
              </span>
              <span className="text-xs text-gray-400 ml-2 flex-shrink-0">Browse</span>
            </Button>
            {selectedTemplate && (
              <p className="text-sm text-gray-500 italic leading-relaxed line-clamp-2 px-1">
                {selectedTemplate.content?.substring(0, 160)}…
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-gray-50 border border-border">
              <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3 mb-2">
                {currentStep.messageText || '(No message written yet)'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenCustomModal}
                className="gap-2"
              >
                Edit message
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Require approval ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 border-2 border-border rounded-xl mb-6">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Require approval before sending
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            Cards go to your approval queue — you review before anything is sent
          </p>
        </div>
        <Switch checked={requiresApproval} onCheckedChange={setRequiresApproval} />
      </div>

      {/* ── Add second card prompt ────────────────────────────────────────── */}
      {steps.length === 1 && selectedType && (selectedType.maxSteps || 2) > 1 && (
        <button
          onClick={addStep}
          className="w-full py-4 border-2 border-dashed border-border rounded-xl text-sm font-medium text-gray-500 hover:border-brand-accent hover:text-brand-accent transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add a second card to this campaign
        </button>
      )}
    </div>
  );
}