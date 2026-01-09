/**
 * LoadingExperience - Premium loading screen with animation
 * Creates an engaging initial load experience
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LoadingExperience({ 
  children, 
  minDuration = 1500,
  brandName = 'NurturInk',
  brandColor = '#FF7A00',
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Ease out progress
        const remaining = 100 - prev;
        return prev + remaining * 0.15;
      });
    }, 50);

    // Minimum loading duration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [minDuration]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.6, ease: [0.83, 0, 0.17, 1] }
            }}
            className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-white"
          >
            {/* Brand logo animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
              className="relative mb-8"
            >
              {/* Animated ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `3px solid ${brandColor}` }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              {/* Logo container */}
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)` }}
              >
                <motion.span
                  className="text-white text-3xl font-bold"
                  animate={{ 
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  N
                </motion.span>
              </div>
            </motion.div>

            {/* Brand name */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl font-bold mb-6"
              style={{ color: '#1a2332' }}
            >
              {brandName}
            </motion.h1>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 200 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="relative h-1 bg-gray-200 rounded-full overflow-hidden"
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: brandColor }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </motion.div>

            {/* Loading text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-sm text-gray-500"
            >
              Loading experience...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content with entrance animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </>
  );
}

// Simple loading spinner for inline use
export function LoadingSpinner({ size = 24, color = '#FF7A00' }) {
  return (
    <motion.div
      className="rounded-full border-2 border-transparent"
      style={{ 
        width: size, 
        height: size,
        borderTopColor: color,
        borderRightColor: color,
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

export default LoadingExperience;