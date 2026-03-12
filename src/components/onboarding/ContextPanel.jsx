import React from 'react';
import { motion } from 'framer-motion';

/**
 * ContextPanel — Reusable left-column panel for onboarding steps.
 * Phase 3: Added staggered fade-in animation for bullets and panel entrance.
 */

const panelVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function ContextPanel({ icon: Icon, heading, bullets = [], note }) {
  return (
    <aside className="hidden lg:block w-80 flex-shrink-0">
      <motion.div
        className="rounded-2xl p-6 sticky top-20 border-2"
        style={{
          backgroundColor: 'var(--onboarding-bg)',
          borderColor: 'var(--onboarding-border)',
        }}
        variants={panelVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Icon */}
        {Icon && (
          <motion.div
            className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'rgba(224, 123, 57, 0.1)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
          >
            <Icon className="w-5 h-5" style={{ color: 'var(--onboarding-primary)' }} />
          </motion.div>
        )}

        {/* Heading */}
        <h3
          className="text-base font-semibold mb-4"
          style={{ color: 'var(--onboarding-primary)' }}
        >
          {heading}
        </h3>

        {/* Bullet list — Phase 3: staggered entrance */}
        {bullets.length > 0 && (
          <motion.ul
            className="space-y-3"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {bullets.map((bullet, idx) => (
              <motion.li
                key={idx}
                className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed"
                variants={itemVariants}
              >
                <span
                  className="mt-0.5 flex-shrink-0 font-bold"
                  style={{ color: 'var(--onboarding-primary)' }}
                >
                  &#10003;
                </span>
                <span>{bullet}</span>
              </motion.li>
            ))}
          </motion.ul>
        )}

        {/* Optional note */}
        {note && (
          <motion.p
            className="mt-5 text-xs italic leading-relaxed"
            style={{ color: 'var(--onboarding-primary)', opacity: 0.7 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.5 }}
          >
            {note}
          </motion.p>
        )}
      </motion.div>
    </aside>
  );
}