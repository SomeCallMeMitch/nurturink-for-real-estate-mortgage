/**
 * AnimationProvider - Global animation context and utilities
 * Provides consistent animation settings across the app
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Animation context for global settings
const AnimationContext = createContext({
  prefersReducedMotion: false,
  isLoaded: false,
});

export const useAnimationContext = () => useContext(AnimationContext);

// Cinematic timing presets
export const TIMING = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  cinematic: 0.8,
  dramatic: 1.2,
};

// Premium easing curves
export const EASING = {
  smooth: [0.25, 0.1, 0.25, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.175, 0.885, 0.32, 1.275],
  snappy: [0.77, 0, 0.175, 1],
  cinematic: [0.83, 0, 0.17, 1],
};

// Stagger presets for lists
export const STAGGER = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.15,
  dramatic: 0.2,
};

// Animation variants library
export const variants = {
  // Fade animations
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: TIMING.normal, ease: EASING.smooth } },
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: TIMING.slow, ease: EASING.cinematic } },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: TIMING.slow, ease: EASING.cinematic } },
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: TIMING.slow, ease: EASING.cinematic } },
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: TIMING.slow, ease: EASING.cinematic } },
  },
  
  // Scale animations
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: TIMING.slow, ease: EASING.elastic } },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: TIMING.normal, ease: EASING.smooth } },
  },
  
  // Stagger container
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: STAGGER.normal,
        delayChildren: 0.1,
      },
    },
  },
  staggerContainerFast: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: STAGGER.fast,
        delayChildren: 0.05,
      },
    },
  },
  
  // Stagger items
  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: TIMING.normal, ease: EASING.smooth } },
  },
  
  // Hero animations
  heroTitle: {
    hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { duration: TIMING.cinematic, ease: EASING.cinematic } 
    },
  },
  heroSubtitle: {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: TIMING.slow, ease: EASING.cinematic, delay: 0.2 } 
    },
  },
  
  // Card animations
  cardHover: {
    rest: { scale: 1, y: 0 },
    hover: { 
      scale: 1.02, 
      y: -8,
      transition: { duration: TIMING.fast, ease: EASING.smooth } 
    },
  },
  
  // Button animations
  buttonPulse: {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.98 },
  },
};

// Provider component
export function AnimationProvider({ children }) {
  const prefersReducedMotion = useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth initial load
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimationContext.Provider value={{ prefersReducedMotion, isLoaded }}>
      {children}
    </AnimationContext.Provider>
  );
}

export default AnimationProvider;