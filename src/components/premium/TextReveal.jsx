/**
 * TextReveal - Animated text reveal effects
 * Character-by-character, word-by-word, and line reveals
 */
import React from 'react';
import { motion } from 'framer-motion';
import { TIMING, EASING } from './AnimationProvider';

// Character-by-character reveal
export function CharacterReveal({
  text,
  delay = 0,
  staggerDelay = 0.03,
  className = '',
  charClassName = '',
  once = true,
  threshold = 0.5,
}) {
  const characters = text.split('');

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      className={className}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: TIMING.fast,
                delay: delay + index * staggerDelay,
                ease: EASING.smooth,
              },
            },
          }}
          className={`inline-block ${char === ' ' ? 'w-[0.3em]' : ''} ${charClassName}`}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Word-by-word reveal
export function WordReveal({
  text,
  delay = 0,
  staggerDelay = 0.08,
  className = '',
  wordClassName = '',
  once = true,
  threshold = 0.3,
}) {
  const words = text.split(' ');

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      className={className}
    >
      {words.map((word, index) => (
        <span key={index} className="inline-block overflow-hidden mr-[0.3em]">
          <motion.span
            variants={{
              hidden: { y: '100%', opacity: 0 },
              visible: {
                y: '0%',
                opacity: 1,
                transition: {
                  duration: TIMING.normal,
                  delay: delay + index * staggerDelay,
                  ease: EASING.cinematic,
                },
              },
            }}
            className={`inline-block ${wordClassName}`}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

// Line reveal with mask
export function LineReveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  once = true,
}) {
  const yStart = direction === 'up' ? '100%' : '-100%';

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: 0.5 }}
        variants={{
          hidden: { y: yStart, opacity: 0 },
          visible: {
            y: '0%',
            opacity: 1,
            transition: {
              duration: TIMING.slow,
              delay,
              ease: EASING.cinematic,
            },
          },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Blur reveal effect
export function BlurReveal({
  children,
  delay = 0,
  className = '',
  once = true,
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.5 }}
      variants={{
        hidden: { 
          opacity: 0, 
          filter: 'blur(20px)',
          y: 20,
        },
        visible: {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          transition: {
            duration: TIMING.cinematic,
            delay,
            ease: EASING.cinematic,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Typewriter effect
export function Typewriter({
  text,
  speed = 50,
  delay = 0,
  className = '',
  cursorColor = '#FF7A00',
  showCursor = true,
}) {
  const [displayedText, setDisplayedText] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);

  React.useEffect(() => {
    const startDelay = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => clearTimeout(startDelay);
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && (
        <motion.span
          animate={{ opacity: isTyping ? 1 : [1, 0] }}
          transition={{ 
            duration: isTyping ? 0 : 0.5, 
            repeat: isTyping ? 0 : Infinity,
            repeatType: 'reverse',
          }}
          style={{ color: cursorColor }}
        >
          |
        </motion.span>
      )}
    </span>
  );
}

// Highlight text animation
export function HighlightText({
  children,
  highlightColor = '#FF7A00',
  delay = 0,
  className = '',
  once = true,
}) {
  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.5 }}
      className={`relative inline-block ${className}`}
    >
      {/* Highlight background */}
      <motion.span
        variants={{
          hidden: { scaleX: 0 },
          visible: {
            scaleX: 1,
            transition: {
              duration: TIMING.slow,
              delay,
              ease: EASING.cinematic,
            },
          },
        }}
        className="absolute inset-0 origin-left"
        style={{ 
          background: `${highlightColor}20`,
          borderRadius: '0.2em',
        }}
      />
      
      {/* Text */}
      <motion.span
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              duration: TIMING.fast,
              delay: delay + 0.2,
            },
          },
        }}
        className="relative z-10"
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

export default CharacterReveal;