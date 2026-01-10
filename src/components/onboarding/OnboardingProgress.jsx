import React from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OnboardingProgress({ currentStep, totalSteps, onBack, role }) {
  const steps = [
    { number: 1, label: 'Role' },
    { number: 2, label: 'Industry' },
    { number: 3, label: 'Business' },
    { number: 4, label: 'Preferences' },
  ];

  if (role === 'company') {
    steps.push({ number: 5, label: 'Team' });
  }

  const getStepState = (stepNumber) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'active';
    return 'upcoming';
  };

  return (
    <div className="sticky top-0 z-20 bg-gray-50 py-4 px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-[150px]">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
        </div>

        <div className="flex items-center">
          {steps.map((step, index) => {
            const state = getStepState(step.number);
            return (
              <div key={step.number} className="flex items-center">
                {index > 0 && (
                  <div className={`h-0.5 w-8 md:w-12 mx-2 md:mx-3 ${step.number <= currentStep ? 'bg-[var(--successColor)]' : 'bg-gray-200'}`} />
                )}
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${state === 'completed' ? 'bg-[var(--successColor)] text-white' : state === 'active' ? 'bg-[var(--brand-accent)] text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {state === 'completed' ? <Check className="w-4 h-4" /> : step.number}
                  </div>
                  <span className={`font-medium hidden md:inline-block ${state === 'active' ? 'text-[var(--brand-accent)]' : state === 'completed' ? 'text-[var(--successColor)]' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end min-w-[150px]">
            <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
        </div>
      </div>
    </div>
  );
}