import React from 'react';
import { Check } from 'lucide-react';

/**
 * WizardProgressIndicator Component
 * Horizontal stepper showing progress through wizard steps
 * 
 * @param {number} currentStep - Current step number (1-4)
 * @param {Array} steps - Array of step objects: { number, title }
 */

const DEFAULT_STEPS = [
  { number: 1, title: 'Campaign Type' },
  { number: 2, title: 'Enrollment' },
  { number: 3, title: 'Card Setup' },
  { number: 4, title: 'Review' }
];

export default function WizardProgressIndicator({ currentStep, steps = DEFAULT_STEPS }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.number}>
              {/* Step Circle and Label */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground border-2 border-border'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 mx-4 h-1 rounded-full bg-muted -mt-6">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-primary w-full' : 'bg-transparent w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}