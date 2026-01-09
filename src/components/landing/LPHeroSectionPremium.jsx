/**
 * LPHeroSectionPremium - Enhanced hero section with premium animations
 * Features: scroll reveal, magnetic buttons, floating elements, text animations
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, CheckCircle, Star, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { 
  ScrollReveal, 
  MagneticButton,
  WordReveal,
  BlurReveal,
  FloatingOrbs,
  FloatingElement,
  GradientText,
  BouncingIndicator,
  TIMING,
  EASING,
} from '@/components/premium';

const LPHeroSectionPremium = () => {
  const handleGetSample = () => {
    base44.auth.redirectToLogin('/Home');
  };

  const scrollToHowItWorks = () => {
    const element = document.querySelector('#how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-white py-16 lg:py-24 overflow-hidden">
      {/* Animated background elements */}
      <FloatingOrbs 
        count={4} 
        colors={['#FF7A00', '#16a34a', '#3b82f6', '#8b5cf6']} 
        className="opacity-30"
      />
      
      {/* Decorative grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Left Column - Content (3/5) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Animated headline */}
            <ScrollReveal animation="blur" delay={0.1}>
              <h1 className="text-[42px] lg:text-[52px] leading-[1.15] font-bold text-[#1a2332]">
                <WordReveal 
                  text="The Follow-Up System" 
                  delay={0.2}
                  staggerDelay={0.06}
                  className="block"
                />
                <span className="block mt-2">
                  <WordReveal 
                    text="Your Prospects Will" 
                    delay={0.5}
                    staggerDelay={0.06}
                  />
                  {' '}
                  <GradientText 
                    colors={['#FF7A00', '#f59e0b']} 
                    className="font-bold"
                  >
                    <WordReveal 
                      text="Actually Remember" 
                      delay={0.8}
                      staggerDelay={0.06}
                    />
                  </GradientText>
                </span>
              </h1>
            </ScrollReveal>

            {/* Subtitle with blur reveal */}
            <BlurReveal delay={0.6}>
              <p className="text-[20px] leading-[1.7] font-normal text-[#4a5568] max-w-xl">
                Stop losing deals to forgettable emails. Send authentic handwritten notes 
                that get opened, read, and remembered—turning more leads into loyal 
                customers who refer their friends.
              </p>
            </BlurReveal>

            {/* CTA Buttons with magnetic effect */}
            <ScrollReveal animation="fadeUp" delay={0.8}>
              <div className="flex flex-col sm:flex-row gap-4">
                <MagneticButton
                  as="div"
                  strength={0.15}
                  className="inline-block"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleGetSample}
                      data-cursor="action"
                      data-cursor-label="Start Free"
                      className="w-full sm:w-auto bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white text-[18px] font-semibold px-9 py-6 rounded-xl shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300"
                      size="lg"
                    >
                      Get Your Free Sample Note
                      <motion.span
                        className="ml-2"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </Button>
                  </motion.div>
                </MagneticButton>

                <MagneticButton
                  as="div"
                  strength={0.1}
                  className="inline-block"
                >
                  <Button
                    variant="outline"
                    onClick={scrollToHowItWorks}
                    data-cursor="pointer"
                    className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl font-semibold gap-2 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                    size="lg"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Play className="w-5 h-5 text-[#FF7A00]" />
                    </motion.span>
                    See How It Works
                  </Button>
                </MagneticButton>
              </div>
            </ScrollReveal>

            {/* Trust Indicators with stagger */}
            <ScrollReveal animation="fadeUp" delay={1}>
              <motion.div 
                className="flex flex-wrap items-center gap-6 text-[14px] text-[#6b7280]"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.15, delayChildren: 1.2 }
                  }
                }}
              >
                <motion.div 
                  className="flex items-center gap-2"
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 }
                  }}
                >
                  <CheckCircle className="w-5 h-5 text-[#16a34a]" />
                  <span>No credit card required</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2"
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 }
                  }}
                >
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span>5-star rated by 500+ sales pros</span>
                </motion.div>
              </motion.div>
            </ScrollReveal>
          </div>

          {/* Right Column - Video/Image (2/5) */}
          <div className="lg:col-span-2">
            <ScrollReveal animation="scaleUp" delay={0.4}>
              <FloatingElement duration={6} yRange={15}>
                <motion.div 
                  className="relative rounded-2xl overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  {/* Gradient border effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-green-500/20 pointer-events-none" />
                  
                  {/* Card content */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="aspect-[4/3] flex items-center justify-center p-8">
                      <div className="text-center">
                        {/* Animated play button */}
                        <motion.div 
                          className="relative mx-auto mb-6"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {/* Pulsing rings */}
                          <motion.div
                            className="absolute inset-0 w-24 h-24 rounded-full border-2 border-orange-500/30"
                            animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <motion.div
                            className="absolute inset-0 w-24 h-24 rounded-full border-2 border-orange-500/30"
                            animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                          />
                          
                          <div 
                            className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl cursor-pointer"
                            data-cursor="action"
                            data-cursor-label="Play"
                          >
                            <Play className="w-10 h-10 text-[#FF7A00] ml-1" />
                          </div>
                        </motion.div>
                        
                        <p className="text-gray-600 font-medium">Watch the Demo</p>
                        <p className="text-sm text-gray-400 mt-1">See how it works in 60 seconds</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </FloatingElement>
            </ScrollReveal>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hidden lg:flex justify-center mt-16">
          <BouncingIndicator>
            <motion.button
              onClick={scrollToHowItWorks}
              className="flex flex-col items-center text-gray-400 hover:text-gray-600 transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-xs font-medium mb-2">Scroll to explore</span>
              <ChevronDown className="w-5 h-5" />
            </motion.button>
          </BouncingIndicator>
        </div>
      </div>
    </section>
  );
};

export default LPHeroSectionPremium;