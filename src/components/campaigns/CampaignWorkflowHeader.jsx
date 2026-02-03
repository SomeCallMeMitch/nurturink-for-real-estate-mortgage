import React from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * CampaignWorkflowHeader Component
 * Horizontal step indicator for campaign setup wizard - mirrors WorkflowSteps design
 * 
 * @param {number} currentStep - Current step number (1-5)
 * @param {string} pageTitle - Title of the current step
 * @param {function} onBackClick - Callback for back button (within wizard)
 * @param {boolean} isFirstStep - If true, back button links to Campaigns page
 * @param {Array} steps - Array of step objects: { number, title }
 */

const DEFAULT_STEPS = [
  { number: 1, title: 'Campaign Type' },
  { number: 2, title: 'Enrollment' },
  { number: 3, title: 'Cards' },
  { number: 4, title: 'Return Address' },
  { number: 5, title: 'Review' }
];

export default function CampaignWorkflowHeader({ 
  currentStep, 
  pageTitle = 'Create Campaign',
  onBackClick = null,
  isFirstStep = false,
  steps = DEFAULT_STEPS
}) {
  // Determine step state
  const getStepState = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'active';
    return 'upcoming';
  };

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 py-2 px-6 shadow-sm">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Left: Back Button + Page Title */}
        <div className="flex items-center gap-4 min-w-[200px]">
          {isFirstStep ? (
            <Link to={createPageUrl('Campaigns')}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-gray-600 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          ) : onBackClick ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackClick}
              className="gap-2 text-gray-600 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          ) : null}
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        </div>

        {/* Center: Steps */}
        <div className="flex items-center">
          {steps.map((step, index) => {
            const state = getStepState(step.number);

            return (
              <div key={step.number} className="flex items-center">
                {/* Connector Line (before step, except first) */}
                {index > 0 && (
                  <div className={`h-0.5 w-8 mx-2 ${
                    step.number <= currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}

                {/* Step indicator - Completed State */}
                {state === 'completed' && (
                  <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full pl-1 pr-3 py-1">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-green-700 text-sm whitespace-nowrap">{step.title}</span>
                  </div>
                )}

                {/* Step indicator - Active State */}
                {state === 'active' && (
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-600 rounded-full pl-1 pr-3 py-1">
                    <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-semibold flex items-center justify-center">
                      {step.number}
                    </div>
                    <span className="font-semibold text-amber-600 text-sm whitespace-nowrap">{step.title}</span>
                  </div>
                )}

                {/* Step indicator - Upcoming State */}
                {state === 'upcoming' && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs font-medium flex items-center justify-center">
                      {step.number}
                    </div>
                    <span className="font-medium text-gray-400 text-sm whitespace-nowrap">{step.title}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Placeholder for balance (campaigns don't need credits display, but keep space for alignment) */}
        <div className="min-w-[200px]" />
      </div>
    </div>
  );
}