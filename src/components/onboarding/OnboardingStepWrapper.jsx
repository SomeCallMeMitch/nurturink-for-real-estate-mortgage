import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * OnboardingStepWrapper — Phase 3 helper that wraps each step for enter/exit animation.
 * Used in the Onboarding page to provide smooth cross-fade between steps.
 * Props:
 *   stepKey — unique key for the current step (e.g. step number)
 *   children — the step content
 */
const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function OnboardingStepWrapper({ stepKey, children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        variants={stepVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}