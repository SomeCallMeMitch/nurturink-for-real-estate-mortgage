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

  return (
    <div className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Left: Back Button + Page Title */}
        <div className="flex items-center gap-4 min-w-[200px]">
          {onBackClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackClick}
              className="gap-2"
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
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            const isUpcoming = step.number > currentStep;

            return (
              <React.Fragment key={step.number}>
                {/* Step Circle */}
                <div className="flex items-center gap-3">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm
                    ${isActive ? 'bg-orange-500 text-white' : ''}
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isUpcoming ? 'bg-gray-200 text-gray-500' : ''}
                  `}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <span className={`
                    text-sm font-medium whitespace-nowrap
                    ${isActive ? 'text-gray-900' : ''}
                    ${isCompleted ? 'text-gray-700' : ''}
                    ${isUpcoming ? 'text-gray-400' : ''}
                  `}>
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`
                    h-0.5 w-12 mx-2
                    ${step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Credits */}
        <div className="flex items-center gap-2 text-sm min-w-[200px] justify-end">
          <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-medium text-gray-900">{creditsLeft} Credits Left</span>
        </div>
      </div>
    </div>
  );
}