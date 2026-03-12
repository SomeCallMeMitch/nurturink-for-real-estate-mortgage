import React from 'react';
import { Check } from 'lucide-react';

export default function OnboardingProgress({ currentStep, totalSteps, onBack }) {
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
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 py-3 px-10">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const state = getStepState(step.number);
          return (
            <div key={step.number} className="flex items-center">
              {index > 0 && (
                <div
                  className={`h-0.5 w-10 mx-2 ${
                    step.number <= currentStep ? 'bg-gray-400' : 'bg-gray-200'
                  }`}
                />
              )}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    state === 'completed'
                      ? 'bg-gray-500 text-white'
                      : state === 'active'
                      ? 'bg-[#e07b39] text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {state === 'completed' ? <Check className="w-3 h-3" /> : step.number}
                </div>
                <span
                  className={`text-sm font-medium hidden md:inline-block ${
                    state === 'active'
                      ? 'text-[#e07b39]'
                      : state === 'completed'
                      ? 'text-gray-500'
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