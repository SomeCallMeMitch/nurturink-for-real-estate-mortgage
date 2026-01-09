/**
 * ParallaxSection - Scroll-based parallax effects
 * Creates depth through differential scroll speeds
 */
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ParallaxSection({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
  ...props
}) {
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Calculate parallax offset based on direction and speed
  const offset = direction === 'up' ? -100 * speed : 100 * speed;
  
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={ref}
      style={{ y: smoothY }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Parallax background layer
export function ParallaxBackground({
  children,
  speed = 0.3,
  className = '',
}) {
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div 
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
        style={{ y }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Scale on scroll effect
export function ScaleOnScroll({
  children,
  scaleRange = [0.8, 1],
  opacityRange = [0.5, 1],
  className = '',
}) {
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);
  const opacity = useTransform(scrollYProgress, [0, 1], opacityRange);
  
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 });
  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={ref}
      style={{ scale: smoothScale, opacity: smoothOpacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Horizontal scroll animation
export function HorizontalScroll({
  children,
  direction = 'left',
  speed = 1,
  className = '',
}) {
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const xOffset = direction === 'left' ? -200 * speed : 200 * speed;
  const x = useTransform(scrollYProgress, [0, 1], [xOffset, -xOffset]);
  const smoothX = useSpring(x, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={ref}
      style={{ x: smoothX }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Rotate on scroll
export function RotateOnScroll({
  children,
  rotateRange = [0, 360],
  className = '',
}) {
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], rotateRange);
  const smoothRotate = useSpring(rotate, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={ref}
      style={{ rotate: smoothRotate }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default ParallaxSection;