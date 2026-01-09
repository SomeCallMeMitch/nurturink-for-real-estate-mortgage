/**
 * CustomCursor - Morphing cursor that responds to hover states
 * Follows mouse with smooth spring animation
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

// Cursor states
const CURSOR_STATES = {
  default: {
    size: 12,
    background: 'rgba(255, 122, 0, 0.8)',
    border: 'none',
    mixBlendMode: 'normal',
    scale: 1,
  },
  pointer: {
    size: 40,
    background: 'rgba(255, 122, 0, 0.15)',
    border: '2px solid rgba(255, 122, 0, 0.6)',
    mixBlendMode: 'normal',
    scale: 1,
  },
  text: {
    size: 4,
    background: '#FF7A00',
    border: 'none',
    mixBlendMode: 'difference',
    scale: 1,
  },
  action: {
    size: 60,
    background: 'rgba(22, 163, 74, 0.15)',
    border: '2px solid rgba(22, 163, 74, 0.6)',
    mixBlendMode: 'normal',
    scale: 1,
  },
  hidden: {
    size: 0,
    background: 'transparent',
    border: 'none',
    mixBlendMode: 'normal',
    scale: 0,
  },
};

export function CustomCursor({ enabled = true }) {
  const [cursorState, setCursorState] = useState('default');
  const [cursorLabel, setCursorLabel] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Motion values for smooth cursor following
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Spring physics for smooth following
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
    if (!isVisible) setIsVisible(true);
  }, [cursorX, cursorY, isVisible]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    setIsVisible(true);
  }, []);

  // Check for hover targets
  const handleElementHover = useCallback((e) => {
    const target = e.target;
    
    // Check for custom cursor attributes
    const cursorType = target.closest('[data-cursor]')?.getAttribute('data-cursor');
    const label = target.closest('[data-cursor-label]')?.getAttribute('data-cursor-label');
    
    if (cursorType) {
      setCursorState(cursorType);
      setCursorLabel(label || '');
      return;
    }

    // Check for interactive elements
    if (target.closest('button, a, [role="button"]')) {
      setCursorState('pointer');
      setCursorLabel('');
      return;
    }

    // Check for text inputs
    if (target.closest('input, textarea, [contenteditable]')) {
      setCursorState('text');
      setCursorLabel('');
      return;
    }

    // Default state
    setCursorState('default');
    setCursorLabel('');
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleElementHover);

    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleElementHover);
      document.body.style.cursor = 'auto';
    };
  }, [enabled, handleMouseMove, handleMouseLeave, handleMouseEnter, handleElementHover]);

  if (!enabled) return null;

  const state = CURSOR_STATES[cursorState] || CURSOR_STATES.default;

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: state.size,
          height: state.size,
          background: state.background,
          border: state.border,
          scale: isVisible ? state.scale : 0,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
        initial={{ scale: 0, opacity: 0 }}
      >
        {/* Cursor label */}
        {cursorLabel && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-xs font-medium text-white whitespace-nowrap"
          >
            {cursorLabel}
          </motion.span>
        )}
      </motion.div>

      {/* Cursor trail dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] w-1 h-1 rounded-full bg-orange-500/50"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: isVisible && cursorState !== 'hidden' ? 0.5 : 0,
        }}
      />

      {/* Global style to hide cursor on interactive elements */}
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>
    </>
  );
}

export default CustomCursor;