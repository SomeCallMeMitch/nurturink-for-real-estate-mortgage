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
    if (creditsLeft < 10) return 'bg-red-500';
    if (creditsLeft < 50) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Left: Back Button + Page Title */}
        <div className="flex items-center gap-4 min-w-[200px]">
          {onBackClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackClick}
              className="gap-2 text-gray-600 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          {pageTitle && (
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
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
                    step.number <= currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}

                {/* Step indicator - Completed State */}
                {state === 'completed' && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full pl-1 pr-4 py-1">
                    <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-green-700 whitespace-nowrap">{step.label}</span>
                  </div>
                )}

                {/* Step indicator - Active State */}
                {state === 'active' && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-600 rounded-full pl-1 pr-4 py-1">
                    <div className="w-7 h-7 rounded-full bg-amber-600 text-white text-sm font-semibold flex items-center justify-center">
                      {step.number}
                    </div>
                    <span className="font-semibold text-amber-600 whitespace-nowrap">{step.label}</span>
                  </div>
                )}

                {/* Step indicator - Upcoming State */}
                {state === 'upcoming' && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 text-sm font-medium flex items-center justify-center">
                      {step.number}
                    </div>
                    <span className="font-medium text-gray-400 whitespace-nowrap">{step.label}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Credits Display */}
        <div className="flex items-center justify-end min-w-[200px]">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <div className={`w-2.5 h-2.5 rounded-full ${getCreditDotColor()}`} />
            <span className="font-semibold text-gray-900">{creditsLeft.toLocaleString()}</span>
            <span className="text-gray-500">credits left</span>
          </div>
        </div>
      </div>
    </div>
  );
}