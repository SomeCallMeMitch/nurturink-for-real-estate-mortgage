import React from 'react';
import { Check } from 'lucide-react';

/**
 * OnboardingProgress — Horizontal stepper bar for the 5-step onboarding flow.
 * Redesigned: sticky top bar, orange active state, responsive labels.
 * Props: currentStep, totalSteps (both unused in stepper but kept for API compat)
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

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 py-3 px-6">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const state = getStepState(step.number);
          return (
            <div key={step.number} className="flex items-center">
              {/* Connector line between steps */}
              {index > 0 && (
                <div
                  className={`h-0.5 w-8 md:w-16 mx-1 md:mx-2 transition-colors ${
                    step.number <= currentStep ? 'bg-onboarding-primary' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Step circle + label */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    state === 'completed'
                      ? 'bg-onboarding-primary text-white'
                      : state === 'active'
                      ? 'bg-onboarding-primary text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {state === 'completed' ? <Check className="w-3.5 h-3.5" /> : step.number}
                </div>
                <span
                  className={`text-sm font-medium hidden md:inline-block transition-colors ${
                    state === 'active'
                      ? 'text-onboarding-primary'
                      : state === 'completed'
                      ? 'text-gray-600'
                      : 'text-gray-400'
                  }`}
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