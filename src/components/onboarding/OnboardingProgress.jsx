import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * OnboardingProgress — Horizontal stepper bar for the 5-step onboarding flow.
 * Phase 3: Added animated step circles, progress bar fill, and percentage label.
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
  const progressPercent = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 py-3 px-6">
      {/* Phase 3: Step circles row */}
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const state = getStepState(step.number);
          const isFilledLine = step.number <= currentStep;
          const isActiveOrDone = state === 'completed' || state === 'active';

          return (
            <div key={step.number} className="flex items-center">
              {/* Connector line — Phase 3: animated width via motion */}
              {index > 0 && (
                <div className="h-0.5 w-8 md:w-16 mx-1 md:mx-2 bg-gray-200 relative overflow-hidden rounded-full">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                    initial={{ width: '0%' }}
                    animate={{ width: isFilledLine ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  />
                </div>
              )}

              {/* Step circle + label — Phase 3: animated scale on active */}
              <div className="flex items-center gap-1.5">
                <motion.div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: isActiveOrDone ? primaryColor : '#e5e7eb',
                    color: isActiveOrDone ? '#fff' : '#9ca3af',
                  }}
                  initial={false}
                  animate={{
                    scale: state === 'active' ? 1.15 : 1,
                    boxShadow: state === 'active' ? '0 0 0 4px rgba(224, 123, 57, 0.2)' : '0 0 0 0px rgba(224, 123, 57, 0)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {state === 'completed' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </motion.div>
                  ) : (
                    step.number
                  )}
                </motion.div>
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

      {/* Phase 3: Thin progress bar below stepper */}
      <div className="mt-2 h-1 bg-gray-100 rounded-full max-w-md mx-auto overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: primaryColor }}
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}