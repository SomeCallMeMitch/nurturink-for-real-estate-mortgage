/**
 * ScrollReveal - Scroll-triggered animation wrapper
 * Uses framer-motion's whileInView for performance
 */
import React from 'react';
import { motion } from 'framer-motion';
import { variants, TIMING, EASING } from './AnimationProvider';

// Preset animation types
const presets = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
  },
  slideUp: {
    hidden: { opacity: 0, y: 60, rotateX: 10 },
    visible: { opacity: 1, y: 0, rotateX: 0 },
  },
};

export function ScrollReveal({
  children,
  animation = 'fadeUp',
  delay = 0,
  duration = TIMING.slow,
  threshold = 0.2,
  once = true,
  className = '',
  style = {},
  ...props
}) {
  const animationVariants = presets[animation] || presets.fadeUp;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={{
        hidden: animationVariants.hidden,
        visible: {
          ...animationVariants.visible,
          transition: {
            duration,
            delay,
            ease: EASING.cinematic,
          },
        },
      }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stagger container for lists
export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  delayChildren = 0.1,
  threshold = 0.1,
  once = true,
  className = '',
  ...props
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stagger item for use inside StaggerContainer
export function StaggerItem({
  children,
  animation = 'fadeUp',
  duration = TIMING.normal,
  className = '',
  ...props
}) {
  const animationVariants = presets[animation] || presets.fadeUp;

  return (
    <motion.div
      variants={{
        hidden: animationVariants.hidden,
        visible: {
          ...animationVariants.visible,
          transition: {
            duration,
            ease: EASING.smooth,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default ScrollReveal;