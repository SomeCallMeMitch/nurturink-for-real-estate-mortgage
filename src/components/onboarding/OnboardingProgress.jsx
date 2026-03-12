import React from 'react';
import { Check } from 'lucide-react';

/**
 * OnboardingProgress — Horizontal stepper bar for the 5-step onboarding flow.
 * Redesigned: sticky white top bar, orange active state, responsive labels.
 * Back button removed — now lives in each step's footer via onBack prop.
 * Uses --onboarding-primary CSS variable from globals.css.
 */
export default function OnboardingProgress({ currentStep, totalSteps }) {
  const steps = [
    { number: 1, label: 'Industry' },
    { number: 2, label: 'Business' },
    { number: 3, label: 'Address' },
    { number: 4, label: 'Preferences' },
    { number: 5, label: 'Team' },
  ];

  const getStepState = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'active';
    return 'upcoming';
  };

  const primaryColor = 'var(--onboarding-primary)';

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 py-3 px-6">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const state = getStepState(step.number);
          const isFilledLine = step.number <= currentStep;
          const isActiveOrDone = state === 'completed' || state === 'active';

          return (
            <div key={step.number} className="flex items-center">
              {/* Connector line between steps */}
              {index > 0 && (
                <div
                  className="h-0.5 w-8 md:w-16 mx-1 md:mx-2 transition-colors"
                  style={{ backgroundColor: isFilledLine ? primaryColor : '#e5e7eb' }}
                />
              )}

              {/* Step circle + label */}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  style={{
                    backgroundColor: isActiveOrDone ? primaryColor : '#e5e7eb',
                    color: isActiveOrDone ? '#fff' : '#9ca3af',
                  }}
                >
                  {state === 'completed' ? <Check className="w-3.5 h-3.5" /> : step.number}
                </div>
                <span
                  className="text-sm font-medium hidden md:inline-block transition-colors"
                  style={{
                    color: state === 'active'
                      ? primaryColor
                      : state === 'completed'
                      ? '#4b5563'
                      : '#9ca3af',
                  }}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}