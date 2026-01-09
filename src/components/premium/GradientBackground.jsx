/**
 * GradientBackground - Animated gradient backgrounds
 * Creates premium visual atmosphere
 */
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Animated mesh gradient background
export function MeshGradient({
  colors = ['#FF7A00', '#16a34a', '#3b82f6', '#8b5cf6'],
  className = '',
  animate = true,
}) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(at 40% 20%, ${colors[0]}30 0px, transparent 50%),
            radial-gradient(at 80% 0%, ${colors[1]}25 0px, transparent 50%),
            radial-gradient(at 0% 50%, ${colors[2]}20 0px, transparent 50%),
            radial-gradient(at 80% 50%, ${colors[3]}25 0px, transparent 50%),
            radial-gradient(at 0% 100%, ${colors[0]}20 0px, transparent 50%),
            radial-gradient(at 80% 100%, ${colors[1]}25 0px, transparent 50%)
          `,
        }}
        animate={animate ? {
          scale: [1, 1.1, 1],
          opacity: [1, 0.8, 1],
        } : undefined}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

// Gradient spotlight effect
export function GradientSpotlight({
  color = '#FF7A00',
  size = 600,
  className = '',
}) {
  return (
    <motion.div
      className={cn('absolute pointer-events-none', className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        borderRadius: '50%',
      }}
      animate={{
        x: [0, 100, -50, 0],
        y: [0, -50, 100, 0],
        scale: [1, 1.2, 0.9, 1],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Animated gradient border
export function GradientBorder({
  children,
  colors = ['#FF7A00', '#16a34a', '#3b82f6'],
  borderWidth = 2,
  borderRadius = 16,
  className = '',
  animate = true,
}) {
  const gradient = `linear-gradient(90deg, ${colors.join(', ')}, ${colors[0]})`;

  return (
    <div
      className={cn('relative', className)}
      style={{ padding: borderWidth, borderRadius }}
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: gradient,
          borderRadius,
          backgroundSize: '200% 100%',
        }}
        animate={animate ? {
          backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
        } : undefined}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Content container */}
      <div
        className="relative bg-white"
        style={{ borderRadius: borderRadius - borderWidth }}
      >
        {children}
      </div>
    </div>
  );
}

// Gradient text
export function GradientText({
  children,
  colors = ['#FF7A00', '#16a34a'],
  angle = 90,
  animate = false,
  className = '',
}) {
  const gradient = `linear-gradient(${angle}deg, ${colors.join(', ')})`;

  return (
    <motion.span
      className={cn('bg-clip-text text-transparent', className)}
      style={{
        backgroundImage: gradient,
        backgroundSize: animate ? '200% 100%' : '100% 100%',
      }}
      animate={animate ? {
        backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
      } : undefined}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  );
}

// Dark mode gradient background
export function DarkGradient({
  className = '',
  intensity = 'medium',
}) {
  const intensityMap = {
    light: {
      from: '#1a1a2e',
      via: '#16213e',
      to: '#0f0f23',
    },
    medium: {
      from: '#0a0a0f',
      via: '#111827',
      to: '#030712',
    },
    strong: {
      from: '#000000',
      via: '#0a0a0a',
      to: '#000000',
    },
  };

  const colors = intensityMap[intensity] || intensityMap.medium;

  return (
    <div
      className={cn('absolute inset-0', className)}
      style={{
        background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.via} 50%, ${colors.to} 100%)`,
      }}
    />
  );
}

// Noise texture overlay
export function NoiseOverlay({
  opacity = 0.03,
  className = '',
}) {
  return (
    <div
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

export default MeshGradient;