/**
 * GlassCard - Glassmorphism card component with depth and layering
 * Includes hover effects and premium visual polish
 */
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Glassmorphism intensity presets
const glassPresets = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropBlur: 'blur(8px)',
    border: 'rgba(255, 255, 255, 0.3)',
  },
  medium: {
    background: 'rgba(255, 255, 255, 0.5)',
    backdropBlur: 'blur(12px)',
    border: 'rgba(255, 255, 255, 0.2)',
  },
  strong: {
    background: 'rgba(255, 255, 255, 0.3)',
    backdropBlur: 'blur(20px)',
    border: 'rgba(255, 255, 255, 0.15)',
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropBlur: 'blur(16px)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  gradient: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
    backdropBlur: 'blur(16px)',
    border: 'rgba(255, 255, 255, 0.2)',
  },
};

export function GlassCard({
  children,
  variant = 'medium',
  hover = true,
  className = '',
  glowColor = 'rgba(255, 122, 0, 0.15)',
  ...props
}) {
  const preset = glassPresets[variant] || glassPresets.medium;

  return (
    <motion.div
      initial={hover ? { scale: 1, y: 0 } : false}
      whileHover={hover ? { 
        scale: 1.02, 
        y: -6,
        boxShadow: `0 20px 40px -15px ${glowColor}, 0 0 0 1px ${preset.border}`,
      } : undefined}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      className={cn(
        'relative rounded-2xl overflow-hidden',
        className
      )}
      style={{
        background: preset.background,
        backdropFilter: preset.backdropBlur,
        WebkitBackdropFilter: preset.backdropBlur,
        border: `1px solid ${preset.border}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      }}
      {...props}
    >
      {/* Inner glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

// Depth card with layered shadows
export function DepthCard({
  children,
  depth = 'medium',
  hover = true,
  className = '',
  ...props
}) {
  const shadows = {
    subtle: '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
    medium: '0 4px 12px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.08)',
    deep: '0 8px 24px rgba(0,0,0,0.08), 0 16px 48px rgba(0,0,0,0.12)',
    dramatic: '0 12px 32px rgba(0,0,0,0.12), 0 24px 64px rgba(0,0,0,0.16)',
  };

  const hoverShadows = {
    subtle: '0 4px 12px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)',
    medium: '0 8px 24px rgba(0,0,0,0.08), 0 16px 48px rgba(0,0,0,0.12)',
    deep: '0 16px 40px rgba(0,0,0,0.12), 0 24px 64px rgba(0,0,0,0.18)',
    dramatic: '0 20px 48px rgba(0,0,0,0.16), 0 32px 80px rgba(0,0,0,0.22)',
  };

  return (
    <motion.div
      initial={{ boxShadow: shadows[depth] || shadows.medium }}
      whileHover={hover ? { 
        y: -8,
        boxShadow: hoverShadows[depth] || hoverShadows.medium,
      } : undefined}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      className={cn(
        'bg-white rounded-2xl',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default GlassCard;