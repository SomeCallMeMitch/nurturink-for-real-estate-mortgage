/**
 * FloatingElements - Ambient floating animations for visual interest
 * Creates depth with gentle floating movements
 */
import React from 'react';
import { motion } from 'framer-motion';

// Single floating element
export function FloatingElement({
  children,
  duration = 6,
  delay = 0,
  yRange = 20,
  xRange = 0,
  rotateRange = 0,
  className = '',
}) {
  return (
    <motion.div
      animate={{
        y: [-yRange / 2, yRange / 2, -yRange / 2],
        x: xRange ? [-xRange / 2, xRange / 2, -xRange / 2] : 0,
        rotate: rotateRange ? [-rotateRange / 2, rotateRange / 2, -rotateRange / 2] : 0,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Floating gradient orbs for backgrounds
export function FloatingOrbs({
  count = 3,
  colors = ['#FF7A00', '#16a34a', '#3b82f6'],
  className = '',
}) {
  const orbs = Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    size: 200 + Math.random() * 300,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 15 + Math.random() * 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full opacity-20 blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Floating particles
export function FloatingParticles({
  count = 20,
  color = '#FF7A00',
  minSize = 2,
  maxSize = 6,
  className = '',
}) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: minSize + Math.random() * (maxSize - minSize),
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 10 + Math.random() * 20,
    delay: Math.random() * 10,
    opacity: 0.2 + Math.random() * 0.4,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            background: color,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [particle.opacity, particle.opacity * 0.5, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Pulsing ring effect
export function PulsingRings({
  color = '#FF7A00',
  count = 3,
  size = 200,
  className = '',
}) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: color }}
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{
            scale: [0.8, 1.5],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 2,
            delay: i * (2 / count),
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// Rotating decorative element
export function RotatingDecor({
  children,
  duration = 20,
  direction = 'clockwise',
  className = '',
}) {
  const rotation = direction === 'clockwise' ? 360 : -360;

  return (
    <motion.div
      animate={{ rotate: rotation }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Bouncing indicator
export function BouncingIndicator({
  children,
  className = '',
}) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default FloatingElement;