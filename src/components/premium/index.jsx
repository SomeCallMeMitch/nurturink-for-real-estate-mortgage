/**
 * Premium Animation Components - Export Index
 * Central export for all premium animation and effect components
 */

// Core animation provider and utilities
export { 
  AnimationProvider, 
  useAnimationContext,
  TIMING,
  EASING,
  STAGGER,
  variants,
} from './AnimationProvider';

// Scroll-triggered animations
export { 
  ScrollReveal, 
  StaggerContainer, 
  StaggerItem,
} from './ScrollReveal';

// Magnetic effects
export { 
  MagneticButton, 
  MagneticWrapper,
} from './MagneticButton';

// Glass and depth effects
export { 
  GlassCard, 
  DepthCard,
} from './GlassCard';

// Custom cursor
export { CustomCursor } from './CustomCursor';

// Loading experience
export { 
  LoadingExperience, 
  LoadingSpinner,
} from './LoadingExperience';

// Parallax effects
export { 
  ParallaxSection, 
  ParallaxBackground,
  ScaleOnScroll,
  HorizontalScroll,
  RotateOnScroll,
} from './ParallaxSection';

// Text animations
export { 
  CharacterReveal, 
  WordReveal, 
  LineReveal,
  BlurReveal,
  Typewriter,
  HighlightText,
} from './TextReveal';

// Floating elements
export { 
  FloatingElement, 
  FloatingOrbs,
  FloatingParticles,
  PulsingRings,
  RotatingDecor,
  BouncingIndicator,
} from './FloatingElements';

// Animated counters
export { 
  CountUp, 
  CircularProgress,
  StatCounter,
} from './CountUp';

// Gradient effects
export { 
  MeshGradient, 
  GradientSpotlight,
  GradientBorder,
  GradientText,
  DarkGradient,
  NoiseOverlay,
} from './GradientBackground';