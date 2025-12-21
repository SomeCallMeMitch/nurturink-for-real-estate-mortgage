import React from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * WorkflowSteps Component
 * Horizontal step indicator for the mailing workflow with integrated back button and page title
 * 
 * @param {number} currentStep - Current step number (1-4)
 * @param {number} creditsLeft - Number of credits remaining
 * @param {string} pageTitle - Title of the current page (e.g., "Find Clients", "Create Content")
 * @param {function} onBackClick - Callback function for back button click
 */
export default function WorkflowSteps({ currentStep, creditsLeft = 0, pageTitle = '', onBackClick = null }) {
  const steps = [
    { number: 1, label: 'Find Clients' },
    { number: 2, label: 'Create Content' },
    { number: 3, label: 'Select Design' },
    { number: 4, label: 'Review & Send' }
  ];

  // Determine step state
  const getStepState = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'active';
    return 'upcoming';
  };

  // Determine credit indicator color based on amount
  const getCreditDotColor = () => {
    if (creditsLeft < 10) return 'bg-status-danger';
    if (creditsLeft < 50) return 'bg-status-warning';
    return 'bg-status-success';
  };

  return (
    <div className="sticky top-0 z-20 bg-card border-b border-border py-4 px-6 shadow-sm">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Left: Back Button + Page Title */}
        <div className="flex items-center gap-4 min-w-[200px]">
          {onBackClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackClick}
              className="gap-2 text-muted-foreground hover:text-brand-accent hover:border-border hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          {pageTitle && (
            <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
          )}
        </div>

        {/* Center: Steps */}
        <div className="flex items-center">
          {steps.map((step, index) => {
            const state = getStepState(step.number);

            return (
              <div key={step.number} className="flex items-center">
                {/* Connector Line (before step, except first) */}
                {index > 0 && (
                  <div className={`h-0.5 w-12 mx-3 ${
                    step.number <= currentStep ? 'bg-status-success' : 'bg-muted'
                  }`} />
                )}

                {/* Step indicator - Completed State */}
                {state === 'completed' && (
                  <div className="flex items-center gap-2 bg-pill-success border border-border rounded-full pl-1 pr-4 py-1">
                    <div className="w-7 h-7 rounded-full bg-status-success text-primary-foreground flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-pill-success whitespace-nowrap">{step.label}</span>
                  </div>
                )}

                {/* Step indicator - Active State */}
                {state === 'active' && (
                  <div className="flex items-center gap-2 bg-muted border border-brand-accent rounded-full pl-1 pr-4 py-1">
                    <div className="w-7 h-7 rounded-full bg-brand-accent text-brand-accent-foreground text-sm font-semibold flex items-center justify-center">
                      {step.number}
                    </div>
                    <span className="font-semibold text-brand-accent whitespace-nowrap">{step.label}</span>
                  </div>
                )}

                {/* Step indicator - Upcoming State */}
                {state === 'upcoming' && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground text-sm font-medium flex items-center justify-center">
                      {step.number}
                    </div>
                    <span className="font-medium text-muted-foreground whitespace-nowrap">{step.label}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Credits Display - PHASE 3: Clearer verbiage */}
        <div className="flex items-center justify-end min-w-[200px]">
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
            <div className={`w-2.5 h-2.5 rounded-full ${getCreditDotColor()}`} />
            <span className="font-semibold text-foreground">{creditsLeft.toLocaleString()}</span>
            <span className="text-muted-foreground">{creditsLeft === 1 ? 'credit' : 'credits'} available</span>
          </div>
        </div>
      </div>
    </div>
  );
}